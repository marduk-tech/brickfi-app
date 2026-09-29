"use client";

import { Flex, Typography } from "antd";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  BrickChatCore,
  ProjectResult,
} from "../app/app/brickchat/brickchat-client";
import { useUser } from "../hooks/use-user";
import { useUpdateUserMutation } from "../hooks/user-hooks";
import { captureAnalyticsEvent, mapLvnzyProjectToResult } from "../libs/lvnzy-helper";
import { LvnzyProject } from "../types/LvnzyProject";
import { SavedLvnzyProjectCollection } from "../types/User";
import { Loader } from "./common/loader";

// These routes serve a curated, non-personal project list (see brickfi-home.tsx) -
// there's no real savedLvnzyProjects collection to attach a compare thread to.
const CURATED_COLLECTION_IDS = new Set(["inv-friendly", "yellow-line"]);

const projectIdsKey = (results: ProjectResult[]) =>
  [...results.map((p) => p.lvnzyProjectId || p.projectId)].sort().join(",");

const buildCompareQuestion = (results: ProjectResult[]) => {
  const names = results.map((p) => p.projectName).filter(Boolean);
  return `Compare my saved projects — ${names.join(", ")} — across location, pricing, developer track record, and construction quality, and tell me which one stands out and why.`;
};

export function UserProjects({
  lvnzyProjects,
}: {
  lvnzyProjects: LvnzyProject[];
}) {
  const { user, refetch } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ collectionId?: string }>();
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });

  useEffect(() => {
    if (user && user.mobile) {
      captureAnalyticsEvent("account-view", {});
    }
  }, [user]);

  const projectResults = useMemo<ProjectResult[]>(() => {
    return (lvnzyProjects || [])
      .map((lp, i) => mapLvnzyProjectToResult(lp, lvnzyProjects.length - i))
      .filter((p): p is ProjectResult => !!p);
  }, [lvnzyProjects]);

  const isCuratedCollection =
    !!params?.collectionId && CURATED_COLLECTION_IDS.has(params.collectionId);

  // The genuine saved collection this comparison thread should persist against -
  // undefined for the hardcoded curated routes above.
  const collection: SavedLvnzyProjectCollection | undefined = isCuratedCollection
    ? undefined
    : (user?.savedLvnzyProjects || [])[0];

  const currentIdsKey = useMemo(
    () => projectIdsKey(projectResults),
    [projectResults],
  );

  // A stored thread is only reused if it still covers exactly today's saved set -
  // otherwise it's stale (a project was added/removed since) and we regenerate.
  const storedThreadIsFresh =
    !!collection?.compareThreadId &&
    [...(collection.compareThreadProjectIds || [])].sort().join(",") ===
      currentIdsKey;

  // Thread ids BrickChatCore has told us failed to load (e.g. expired
  // server-side) - never re-synced back into the URL, otherwise this effect
  // and BrickChatCore's own "clear the url on load failure" logic fight
  // forever: we set ?threadId=, it fails to load and strips it, we set it
  // right back.
  const failedThreadIdsRef = useRef<Set<string>>(new Set());

  // Reopen a fresh stored thread by putting its id in the URL - BrickChatCore
  // picks up ?threadId= itself and fetches history instead of starting fresh.
  useEffect(() => {
    if (!storedThreadIsFresh || !collection?.compareThreadId) return;
    if (failedThreadIdsRef.current.has(collection.compareThreadId)) return;
    if (searchParams.get("threadId") === collection.compareThreadId) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("threadId", collection.compareThreadId);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [storedThreadIsFresh, collection?.compareThreadId, pathname, router, searchParams]);

  const clearedStaleThreadRef = useRef(false);

  // The stored compareThreadId turned out to be dead (deleted/expired
  // server-side) - stop retrying it and drop it from the saved collection so
  // a fresh compare thread gets created instead of failing forever.
  const handleThreadLoadError = (threadId: string) => {
    failedThreadIdsRef.current.add(threadId);

    if (
      clearedStaleThreadRef.current ||
      !collection ||
      collection.compareThreadId !== threadId ||
      !user
    ) {
      return;
    }
    clearedStaleThreadRef.current = true;

    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];
    if (savedLvnzyProjects[0]) {
      savedLvnzyProjects[0] = {
        ...savedLvnzyProjects[0],
        compareThreadId: undefined,
        compareThreadProjectIds: undefined,
      };
    }
    updateUser
      .mutateAsync({ userData: { savedLvnzyProjects } })
      .then(() => refetch())
      .catch((err) =>
        console.error("Failed to clear stale compare thread id:", err),
      );
  };

  const persistedRef = useRef(false);

  const handleThreadCreated = async (threadId: string) => {
    if (!collection || persistedRef.current || !user) return;
    persistedRef.current = true;

    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];
    if (savedLvnzyProjects[0]) {
      savedLvnzyProjects[0] = {
        ...savedLvnzyProjects[0],
        compareThreadId: threadId,
        compareThreadProjectIds: projectResults.map(
          (p) => p.lvnzyProjectId || p.projectId,
        ),
      };
    }

    try {
      // POST /user/:id replaces top-level fields wholesale (see
      // updateUser in user.controller.js) rather than deep-merging, so we
      // always send the full array with only this collection's entry
      // touched - same pattern brick-chat-results.tsx already uses for
      // save/unsave.
      await updateUser.mutateAsync({ userData: { savedLvnzyProjects } });
      refetch();
    } catch (err) {
      console.error("Failed to persist compare thread id:", err);
      persistedRef.current = false;
    }
  };

  if (!user) {
    return <Loader></Loader>;
  }

  if (!lvnzyProjects || !lvnzyProjects.length) {
    return (
      <Flex
        style={{ width: "100%", padding: 16 }}
        justify="center"
        align="center"
      >
        <Typography.Text>No saved projects found</Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex style={{ width: "100%" }} vertical>
      <BrickChatCore
        defaultProjectResults={projectResults}
        autoStartQuestion={
          storedThreadIsFresh ? undefined : buildCompareQuestion(projectResults)
        }
        seedProjectIds={projectResults.map((p) => p.lvnzyProjectId || p.projectId)}
        onThreadCreated={handleThreadCreated}
        onThreadLoadError={handleThreadLoadError}
        hideFirstQuestion
      />
    </Flex>
  );
}
