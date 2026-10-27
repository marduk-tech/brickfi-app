"use client";

import BrickChatResults, {
  BrickChatResultsSkeleton,
} from "@/app/app/brickchat/brick-chat-results";
import ChatTimeline, { TimelineStep } from "@/app/app/brickchat/chat-timeline";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
import { LoginForm } from "@/components/login-forms";
import { useDevice } from "@/hooks/use-device";
import {
  useFetchAllLivindexPlaces,
  useFetchLvnzyProjectDrivers,
} from "@/hooks/use-livindex-places";
import { useFetchLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import { usePinnedProjects } from "@/hooks/use-pinned-projects";
import { useUser } from "@/hooks/use-user";
import { useUpdateUserMutation } from "@/hooks/user-hooks";
import { safeStorage } from "@/libs/browser-utils";
import {
  apiKey,
  baseApiUrl,
  LocalStorageKeys,
  queryKeys,
} from "@/libs/constants";
import { addProjectToDefaultCollection } from "@/libs/lvnzy-helper";
import { getLvnzyProjectDisplayCard } from "@/queries/lvnzy-projects";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Drawer,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  message,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidV4 } from "uuid";
import styles from "./brick-chat-results.module.css";
import { BrickMapChat } from "./brick-map-chat";
import { Brick360Inline } from "./brick360/brick360-inline";
import { PillarMapConfig } from "./brick360/tabs";
import { useBrick360FontSize } from "./brick360/use-font-size";
import BookmarkThreadButton from "./bookmark-thread-button";
import BrickchatFeedback from "./brickchat-feedback";
import CollapsibleAnswer from "./collapsible-answer";
import PinnedProjectResults from "./pinned-project-results";
import ReferredLocationChips, {
  ReferredLocationChipItem,
  ReferredLocationType,
} from "./referred-location-chips";
import ThreadLinksButton from "./thread-links-button";
import StaticQueries from "./static-queries";
import {
  ActiveOfferingFlow,
  FollowupOffering,
  OfferingCtaButtons,
  OfferingFlowContext,
  OfferingFlowDialog,
  OfferingTicket,
  threadTicketsQueryKey,
  useThreadTickets,
} from "./offering-flows";

export interface ProjectResult {
  projectId: string;
  projectName: string;
  oneLiner: string;
  projectSlug?: string;
  projectStatus?: string;
  projectImage?: string;
  projectImages?: string[];
  lvnzyProjectId?: string;
  projectUnitTypes?: Array<number>;
  projectAvgSquareFootPrice?: number;
  projectCorridor?: string;
  projectHomeTypes?: Array<string>;
  sizeBuiltupMin?: number;
  rankScore: number;
  isDeveloperPartner?: boolean;
  projectLocation: {
    lat: number;
    lng: number;
  };
}

interface ExploreImageItem {
  url: string;
  caption?: string | null;
  tags?: string[];
}

interface ExploreImagesGroup {
  projectName: string;
  projectId: string;
  images: ExploreImageItem[];
}

interface ResolvedLocation {
  name: string;
  /** locality/corridor/micropocket/driver id - empty for a direct-maps-geocoded landmark with no catalog/driver match. */
  id: string;
  lat: number;
  lng: number;
  /** empty for a direct-maps-geocoded landmark - see summarizeResolvedLocation in shared.js. */
  type: "driver" | "locality" | "corridor" | "micropocket" | "";
}

interface ExploreAnswer {
  projectsList: ProjectResult[];
  summary: string;
  directAnswer: boolean;
  nextSetCount?: number;
  /** Project-list answers: how many projects match the search's criteria outright - can be more than the list shows, or fewer when relaxed criteria filled it out. Null when unknown. See searchMeta in brick-explore-agent.js. */
  totalCount?: number | null;
  images?: ExploreImagesGroup[];
  /** brickfiId(s) of driver/infra records (schools, transit, tech parks etc) the answer discussed - see synthesize.js. */
  brickfiDriverIds?: string[];
  /** LLM-suggested next step/question for this turn, e.g. "Want me to compare these?" - see synthesize.js. Empty when there's no sensible follow-up. */
  followupPrompt?: string;
  /** A Brickfi offering whose CTA buttons go under this answer - followupPrompt is then its pitch, or the answer is about the offering itself. See resolveFollowupOffering in synthesize.js. */
  followupOffering?: FollowupOffering | null;
  /** Set on old "[Submitted: ...]" request records the backend used to add to threads - not shown any more (requests show as a card where their offering's buttons were, see useThreadTickets). */
  offeringTicket?: unknown;
  /** Named place(s)/area(s) resolved this turn (project-distance.js's targetPlaces, location-analysis.js's locationNames) - see summarizeResolvedLocation in shared.js. */
  resolvedLocations?: ResolvedLocation[];
  /** This turn's id in the backend's turn log - sent with feedback on this answer (see tagAnswerWithTurnId). Absent on answers saved before turns were tagged. */
  turnId?: string;
}

interface ChatMessage {
  question: string;
  answer: ExploreAnswer;
  steps?: TimelineStep[];
  durationMs?: number;
}

// Combines a chat answer's brickfiDriverIds (raw LivIndexPlace ids, no label
// of their own - resolved via useFetchAllLivindexPlaces inside
// ReferredLocationChips) with its resolvedLocations (driver/locality/
// corridor/micropocket/landmark hits, already labeled - see
// summarizeResolvedLocation in shared.js) into one deduped chip list.
// resolvedLocations takes priority on a shared id (e.g. "distance to Sampige
// Line" both names the driver in the answer AND resolves it as a
// targetPlace) since it already carries a name for free, no fetch needed.
const getReferredLocationItems = (
  answer: ExploreAnswer,
): ReferredLocationChipItem[] => {
  const items: ReferredLocationChipItem[] = [];
  const seenKeys = new Set<string>();

  (answer.resolvedLocations || []).forEach((loc) => {
    const key = loc.id
      ? `${loc.type || "landmark"}:${loc.id}`
      : `landmark:${loc.name}:${loc.lat}:${loc.lng}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    items.push({ key, id: loc.id, type: loc.type, name: loc.name });
  });

  (answer.brickfiDriverIds || []).forEach((id) => {
    const key = `driver:${id}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    items.push({ key, id, type: "driver" });
  });

  return items;
};

// An answer's chips start out with the first few selected (and the reset
// icon goes back to this) - landmarks have no id and can't be focused, so
// they're skipped rather than counted.
const DEFAULT_SELECTED_CHIP_COUNT = 3;
const getDefaultReferredLocations = (answer: ExploreAnswer) =>
  getReferredLocationItems(answer)
    .filter((i) => !!i.id)
    .slice(0, DEFAULT_SELECTED_CHIP_COUNT);

// The summary cites places inline as "[<24-hex id>]" or "[<id>, <id>]" -
// a brickfiDriverId or a resolvedLocation id (see synthesize.js).
const LOCATION_REF_REGEX =
  /\s*\[\s*([0-9a-f]{24}(?:\s*,\s*[0-9a-f]{24})*)\s*\]/gi;
// a ref still streaming in, e.g. a trailing "[67e3b78a"
const PARTIAL_LOCATION_REF_REGEX = /\s*\[[0-9a-f,\s]*$/i;
const LOCATION_REF_HREF_PREFIX = "#loc-";

// While streaming: hide refs entirely (they turn into chips once the answer
// is final - see linkLocationRefs).
const stripLocationRefs = (text: string) =>
  text.replace(LOCATION_REF_REGEX, "").replace(PARTIAL_LOCATION_REF_REGEX, "");

// Final answer: turn each ref into an empty markdown link with a "#loc-<id>"
// href, which the summary's `a` renderer swaps for an inline chip. A fragment
// href survives react-markdown's default urlTransform; a custom scheme wouldn't.
const linkLocationRefs = (text: string) =>
  text.replace(
    LOCATION_REF_REGEX,
    (_, ids: string) =>
      " " +
      ids
        .split(",")
        .map((id) => `[](${LOCATION_REF_HREF_PREFIX}${id.trim()})`)
        .join(" "),
  );

// owner is either the signed-in user or, before sign in, the guest who
// started the thread
const fetchThreadHistory = async (
  owner: { userId: string } | { guestId: string },
  threadId: string,
): Promise<ChatMessage[]> => {
  const res = await fetch(`${baseApiUrl}ai/explore-projects/history`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ ...owner, threadId }),
  });
  if (!res.ok) throw new Error(`history ${res.status}`);
  const json = await res.json();
  return json?.data || [];
};

// Flag a thread shareable
const shareThread = async (userId: string, threadId: string): Promise<void> => {
  const res = await fetch(`${baseApiUrl}ai/explore-projects/share`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ userId, threadId }),
  });
  if (!res.ok) throw new Error(`share ${res.status}`);
};

const openSharedThread = async (
  userId: string,
  sharedBy: string,
  threadId: string,
): Promise<{ history: ChatMessage[]; threadId?: string }> => {
  const res = await fetch(`${baseApiUrl}ai/explore-projects/open-shared`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ userId, sharedBy, threadId }),
  });
  if (!res.ok) throw new Error(`open-shared ${res.status}`);
  const json = await res.json();
  return { history: json?.data || [], threadId: json?.meta?.threadId };
};

const claimGuestThread = async (
  userId: string,
  guestId: string,
  threadId: string,
): Promise<void> => {
  const res = await fetch(`${baseApiUrl}ai/explore-projects/claim-guest`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ userId, guestId, threadId }),
  });
  if (!res.ok) throw new Error(`claim-guest ${res.status}`);
};

interface GuestChatEntry {
  guestId: string;
  threadId?: string;
}

const readGuestEntry = (): GuestChatEntry | null => {
  try {
    const raw = safeStorage.getItem(LocalStorageKeys.brickchatGuest);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeGuestEntry = (entry: GuestChatEntry | null) => {
  try {
    if (entry) {
      safeStorage.setItem(
        LocalStorageKeys.brickchatGuest,
        JSON.stringify(entry),
      );
    } else {
      safeStorage.removeItem(LocalStorageKeys.brickchatGuest);
    }
  } catch {}
};

const getOrCreateGuestId = () => {
  const existing = readGuestEntry();
  if (existing?.guestId) return existing.guestId;
  const guestId = uuidV4();
  writeGuestEntry({ guestId });
  return guestId;
};

const hasStoredUser = () => {
  try {
    return !!safeStorage.getItem(LocalStorageKeys.user);
  } catch {
    return false;
  }
};

const INTERNAL_ROLES = ["admin", "member"];

const GUEST_LOGIN_PROMPT_DELAY_MS = 10000;

// Streamed step ids that only occur when the answer will be a project list
// (directAnswer false) - a discover search (vectorSearch) or paging through
// one's results (formatResults, also "show me more"). See STEPS in the
// backend's brickchat-v2/progress.js.
const PROJECT_LIST_STEP_IDS = ["vectorSearch", "formatResults"];

// Threads open at /app/brickchat/<threadId> (see the [threadId] route).
export const BRICKCHAT_THREAD_PATH_BASE = "/app/brickchat";

interface BrickChatCoreProps {
  /**
   * Keeps the open thread in the URL as `${threadPathBase}/<threadId>` (e.g.
   * "/app/brickchat") and reads it back from there.
   */
  threadPathBase?: string;
  /**
   * When set and there's no thread already open (no thread id, no history),
   * automatically submits this question on mount instead of waiting for the
   * user to type - e.g. the landing page's ?q= search.
   */
  autoStartQuestion?: string;
  /**
   * A project to open in the inline 360 view on load (the /app/<projectRef>
   * route) - an lvnzyProjectId, slug or originalProjectId. Opened straight
   * from the user's pinned projects when it's one of them; otherwise fetched
   * by id/slug and added to their default saved collection.
   */
  projectRef?: string;
}

export function BrickChatCore({
  threadPathBase,
  autoStartQuestion,
  projectRef,
}: BrickChatCoreProps) {
  const fs = useBrick360FontSize();

  const [form] = Form.useForm();
  const { user, isLoading: userLoading, refetch: refetchUser } = useUser();
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useDevice();
  const queryClient = useQueryClient();

  // the current user's own pinned/saved projects - shown in
  // PinnedProjectResults and sent with every turn as userPinnedProjects
  const {
    defaultProjectResults: pinnedProjectResults,
    defaultProjectsDescription: pinnedProjectsDescription,
    isLoading: pinnedProjectsLoading,
  } = usePinnedProjects();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>();
  const [currentQuestion, setCurrentQuestion] = useState<string>();
  const [chatLoading, setChatLoading] = useState(false);
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [streamingSummary, setStreamingSummary] = useState<string>();
  const [threadyHistoryLoading, setThreadyHistoryLoading] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [claimingGuestThread, setClaimingGuestThread] = useState(false);

  const isGuest = !user?._id && !hasStoredUser();
  const isInternalUser = !!user?.role && INTERNAL_ROLES.includes(user.role);

  const loginPromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const clearLoginPromptTimer = () => {
    if (loginPromptTimerRef.current) clearTimeout(loginPromptTimerRef.current);
    loginPromptTimerRef.current = null;
  };
  const openLoginPrompt = () => {
    clearLoginPromptTimer();
    setLoginModalOpen(true);
  };

  const scheduleLoginPrompt = () => {
    clearLoginPromptTimer();
    loginPromptTimerRef.current = setTimeout(
      () => setLoginModalOpen(true),
      GUEST_LOGIN_PROMPT_DELAY_MS,
    );
  };
  useEffect(() => clearLoginPromptTimer, []);

  const getMobileMapDrawerWidth = () =>
    typeof window !== "undefined" ? Math.round(window.innerWidth * 0.85) : 320;

  const [projectResults, setProjectResults] = useState<
    ProjectResult[] | undefined
  >();
  const [mapResultsIndex, setMapResultsIndex] = useState<number | undefined>();
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  // Once projectsList is populated, fetch the deduped neighborhood/
  // connectivity drivers across all of them in one batched call, so the map
  // can plot everything relevant to the current results (tech parks, metro
  // stations, etc) without waiting on a brickfiDriverIds chip click.
  const resultsLvnzyProjectIds = useMemo(
    () =>
      Array.from(
        new Set(
          (projectResults || [])
            .map((p) => p.lvnzyProjectId)
            .filter((id): id is string => !!id),
        ),
      ),
    [projectResults],
  );
  const { data: projectResultsDrivers } = useFetchLvnzyProjectDrivers(
    resultsLvnzyProjectIds,
  );

  // historyIndex is the chatHistory index the clicked project card belongs
  // to (undefined for a PinnedProjectResults card,
  // which isn't part of chatHistory) - activates that message's own results
  // list as the active one on the map first (same reasoning as the "N
  // Projects" button fix: a fresh projectResults array reference so
  // MapCenterer's re-centering effect fires even when re-selecting an
  // already-active list), so the focused project is guaranteed to actually
  // be among what's currently plotted rather than possibly belonging to a
  // list that isn't the one currently shown on the map.
  const handleLocateProject = (projectId: string, historyIndex?: number) => {
    setFocusedReferredLocations([]);
    setMapResultsIndex(historyIndex);
    setProjectResults(
      historyIndex !== undefined
        ? [...(chatHistory[historyIndex]?.answer.projectsList || [])]
        : [...(pinnedProjectResults || [])],
    );
    if (isMobile) setShowMobileMap(true);
    setTimeout(
      () => {
        setFocusedProjectId(projectId);
      },
      isMobile ? 300 : 10,
    );
  };

  // A chat answer's referred-location chips, clicked (see
  // ReferredLocationChips/getReferredLocationItems) - narrows the map to
  // just the selected records (drivers, localities, corridors,
  // micropockets; a landmark with no id is a no-op - see
  // ReferredLocationChips's `clickable` check). Multi-select: each click
  // toggles that chip in/out, and deselecting the last one falls back to
  // the default view.
  const [focusedReferredLocations, setFocusedReferredLocations] = useState<
    ReferredLocationChipItem[]
  >([]);
  const hasFocusedReferredLocations = focusedReferredLocations.length > 0;
  const handleToggleReferredLocation = (item: ReferredLocationChipItem) => {
    setFocusedReferredLocations((prev) => {
      const next = prev.some((i) => i.key === item.key)
        ? prev.filter((i) => i.key !== item.key)
        : [...prev, item];
      if (isMobile) setShowMobileMap(next.length > 0);
      return next;
    });
  };
  // the "See on map" reset icon - drops every other selection and goes back
  // to the answer's default selection (see getDefaultReferredLocations)
  const handleResetReferredLocations = (answer: ExploreAnswer) => {
    setFocusedReferredLocations(getDefaultReferredLocations(answer));
    if (isMobile) setShowMobileMap(true);
  };
  const focusedReferredLocationKeys = focusedReferredLocations.map(
    (i) => i.key,
  );
  const focusedIdsOfType = (type: ReferredLocationType) =>
    focusedReferredLocations.filter((i) => i.type === type).map((i) => i.id);

  const focusedDriverIds = focusedIdsOfType("driver");
  const { data: focusedDrivers } = useFetchAllLivindexPlaces(
    focusedDriverIds.length ? focusedDriverIds : undefined,
    undefined,
    !!focusedDriverIds.length,
  );
  const focusedLocalityIds = focusedIdsOfType("locality");
  const focusedCorridorIds = focusedIdsOfType("corridor");
  const focusedMicroPocketIds = focusedIdsOfType("micropocket");

  // Default to the drivers relevant to the current results list; once any
  // chip is selected the map shows only the selected drivers (none if only
  // locality/corridor/micropocket chips are selected - those layers plot
  // their own thing via focusedLocalityIds/focusedCorridorIds/
  // focusedMicroPocketIds below, no reason to also clutter the map with
  // every result's drivers). Deselecting every chip falls back to the full
  // results-driven set again.
  const mapDisplayDrivers = !hasFocusedReferredLocations
    ? projectResultsDrivers
    : focusedDriverIds.length
      ? focusedDrivers
      : undefined;

  // Set by the "project-details" button on a project card (see
  // brick-chat-results.tsx) - swaps the chat panel for Brick360Inline and
  // switches the already-mounted map to that project's detail view instead
  // of the multi-project search-results view.
  const [selectedProject, setSelectedProject] = useState<ProjectResult | null>(
    null,
  );
  const { data: selectedLvnzyProject, isLoading: selectedLvnzyProjectLoading } =
    useFetchLvnzyProjectBySlug(
      selectedProject?.projectSlug || "",
      !!selectedProject?.projectSlug,
    );
  const handleSelectProject = (project: ProjectResult) => {
    setSelectedProject(project);
    setPillarMapConfig(null);
  };

  // /app/<projectRef>: open that project once pinned projects have loaded -
  // straight from the pinned list when it's already there, otherwise fetch
  // it by id/slug, open it, and save it to the user's default collection
  // (refetching the user re-derives the pinned list with it included).
  const handledProjectRefRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!projectRef || !user?._id || pinnedProjectsLoading) return;
    if (handledProjectRefRef.current === projectRef) return;
    handledProjectRefRef.current = projectRef;

    const pinned = (pinnedProjectResults || []).find(
      (p) =>
        p.lvnzyProjectId === projectRef ||
        p.projectSlug === projectRef ||
        p.projectId === projectRef,
    );
    if (pinned) {
      handleSelectProject(pinned);
      return;
    }

    const openAndSaveProject = async () => {
      const project = await getLvnzyProjectDisplayCard(projectRef);
      if (!project) {
        message.error("Project not found.");
        return;
      }
      handleSelectProject(project);

      if (!project.lvnzyProjectId) return;
      try {
        await updateUser.mutateAsync({
          userData: {
            savedLvnzyProjects: addProjectToDefaultCollection(
              user.savedLvnzyProjects,
              project.lvnzyProjectId,
            ),
          },
        });
        // same cache-bust BrickChatResults' save toggle does, so useUser
        // actually refetches rather than serving the localStorage copy
        const cached = safeStorage.getItem(LocalStorageKeys.user);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.updated = new Date(0).toString();
          safeStorage.setItem(LocalStorageKeys.user, JSON.stringify(parsed));
        }
        refetchUser();
      } catch {
        // update failures are already toasted by useUpdateUserMutation
      }
    };

    void openAndSaveProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectRef, user?._id, pinnedProjectsLoading, pinnedProjectResults]);

  // Reported by Brick360Pillar (via Brick360Inline) when a data-point panel
  // is expanded/collapsed - narrows the primary map to just that pillar's
  // relevant drivers/surroundings/nearby-pricing instead of the whole
  // project's connectivity. See brick-map-chat.tsx.
  const [pillarMapConfig, setPillarMapConfig] =
    useState<PillarMapConfig | null>(null);

  // Keeps the conversation panel pinned to its latest content - new Q&A
  // pairs and in-flight streaming tokens land at the bottom of this list, so
  // scroll there whenever they change instead of requiring the user to
  // scroll down manually. Skipped entirely while a project is selected (its
  // Brick360Inline view shouldn't yank the panel to the bottom); closing it
  // re-runs this and scrolls back to the latest content. A new turn clears
  // the selection first (see handleSearch), so streaming still auto-scrolls.
  // Debounced because streamingSummary updates on every token - calling
  // scrollIntoView("smooth") that often restarts the animation each time and
  // looks like stutter rather than a scroll.
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    if (selectedProject) return;
    scrollDebounceRef.current = setTimeout(() => {
      scrollBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 80);
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, [
    chatHistory.length,
    currentQuestion,
    chatLoading,
    streamingSummary,
    selectedProject,
    selectedLvnzyProjectLoading,
    selectedLvnzyProject,
  ]);

  // When a project is selected, bring its Brick360Inline view's top into view
  // - first the loader while it loads, then the view once loaded. It renders
  // below the chat history, so without this the user may land mid-history or
  // at the view's bottom. The ref sits on whichever of the two is rendered.
  const brick360InlineTopRef = useRef<HTMLDivElement | null>(null);
  const brick360InlineShown =
    !!selectedProject &&
    (selectedLvnzyProjectLoading || !!selectedLvnzyProject);
  useEffect(() => {
    if (!brick360InlineShown) return;
    brick360InlineTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [
    brick360InlineShown,
    selectedLvnzyProjectLoading,
    selectedProject?.projectId,
  ]);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>();
  const [sharePreparing, setSharePreparing] = useState(false);

  const autoStartFiredRef = useRef(false);

  // With threadPathBase, the open thread lives in the path
  // (/app/brickchat/<threadId>) - read from usePathname rather than the
  // route's params, so URL updates made via history.replaceState (see
  // syncThreadUrl) are picked up without a route change/remount.
  const pathThreadId =
    threadPathBase && pathname.startsWith(`${threadPathBase}/`)
      ? decodeURIComponent(
          pathname.slice(threadPathBase.length + 1).split("/")[0],
        ).trim()
      : undefined;
  const selectedThreadId = pathThreadId || undefined;
  const sharedBy = searchParams.get("sharedBy")?.trim() || undefined;
  // Independent of PinnedProjectResults (always rendered above this, see
  // the JSX below) - shows whenever there's no conversation actually in
  // progress, regardless of whether a pinned/default project list exists.
  const showWelcome =
    !selectedThreadId &&
    !activeThreadId &&
    !chatHistory.length &&
    !threadyHistoryLoading &&
    !chatLoading &&
    !selectedProject;

  // Auto-submit autoStartQuestion once, only when landing fresh (no thread
  // selected/active/loading and no history yet).
  useEffect(() => {
    if (autoStartFiredRef.current) return;
    if (!autoStartQuestion || (!user?._id && !isGuest)) return;
    if (
      selectedThreadId ||
      activeThreadId ||
      chatHistory.length ||
      threadyHistoryLoading
    ) {
      return;
    }

    autoStartFiredRef.current = true;
    form.setFieldsValue({ question: autoStartQuestion });
    form.submit();
  }, [
    autoStartQuestion,
    user?._id,
    isGuest,
    selectedThreadId,
    activeThreadId,
    chatHistory.length,
    threadyHistoryLoading,
    form,
  ]);

  // Points the URL at `${threadPathBase}/<threadId>` (or the bare base with no
  // thread). history.replaceState rather than router.replace: going from
  // /app/brickchat to /app/brickchat/<id> crosses into the [threadId] route
  // segment, and a router navigation would remount this component mid-
  // conversation - Next.js syncs replaceState into usePathname/
  // useSearchParams without one. No-op for embedded usages (no base).
  const syncThreadUrl = (
    threadId?: string,
    { dropParams = [] as string[] } = {},
  ) => {
    if (!threadPathBase) return;
    const params = new URLSearchParams(searchParams.toString());
    // ?q= has already been consumed as autoStartQuestion - drop it so it
    // doesn't linger in (or get shared via) the thread URL.
    params.delete("q");
    dropParams.forEach((p) => params.delete(p));

    const path = threadId
      ? `${threadPathBase}/${encodeURIComponent(threadId)}`
      : threadPathBase;
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${path}?${query}` : path);
  };

  // The "Recent Chats" list itself now lives in the global sidebar drawer
  // (dashboard-layout.tsx), fetched via useFetchChatThreads - invalidate
  // that same query key here whenever this thread list could have changed,
  // so the drawer shows the new/updated thread next time it's opened.
  const refreshChatThreads = () => {
    if (!user?._id) return;
    queryClient.invalidateQueries({
      queryKey: [queryKeys.getChatThreads, user._id],
    });
  };

  // The thread "New chat" just left (see handleNewChat). Its id lingers in
  // the URL for a render after the reset (history.replaceState reaches
  // usePathname a render later), and with history now empty the effect
  // below would otherwise start re-loading that very thread.
  const leavingThreadIdRef = useRef<string | null>(null);

  useEffect(() => {
    // the URL has moved off the thread being left - stop ignoring it, so
    // it can still be reopened normally later (e.g. from the sidebar)
    if (
      leavingThreadIdRef.current &&
      selectedThreadId !== leavingThreadIdRef.current
    ) {
      leavingThreadIdRef.current = null;
    }

    if (!selectedThreadId || sharedBy) {
      return;
    }

    const guestEntry = readGuestEntry();
    let owner: { userId: string } | { guestId: string };
    if (user?._id) {
      if (claimingGuestThread || guestEntry?.threadId) return;
      owner = { userId: user._id };
    } else if (isGuest && guestEntry?.threadId === selectedThreadId) {
      owner = { guestId: guestEntry.guestId };
    } else {
      return;
    }

    if (selectedThreadId === leavingThreadIdRef.current) {
      return;
    }

    if (selectedThreadId === activeThreadId && chatHistory.length > 0) {
      return;
    }

    let cancelled = false;

    const loadThreadHistory = async () => {
      setThreadyHistoryLoading(true);

      try {
        const history = await fetchThreadHistory(owner, selectedThreadId);

        if (cancelled) {
          return;
        }

        if ("guestId" in owner) scheduleLoginPrompt();

        setChatHistory(history);
        setActiveThreadId(selectedThreadId);
        let lastIdx = -1;
        history.forEach((h, i) => {
          if (h.answer.projectsList && h.answer.projectsList.length) {
            setProjectResults(h.answer.projectsList);
            lastIdx = i;
          }
        });
        if (lastIdx >= 0) setMapResultsIndex(lastIdx);
        const lastAnswer = history[history.length - 1]?.answer;
        setFocusedReferredLocations(
          lastAnswer ? getDefaultReferredLocations(lastAnswer) : [],
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load thread history:", error);
        message.error("Failed to load thread history.");
        setActiveThreadId(undefined);
        setChatHistory([]);

        setThreadyHistoryLoading(false);
        syncThreadUrl();
      } finally {
        if (!cancelled) {
          setThreadyHistoryLoading(false);
        }
      }
    };

    void loadThreadHistory();

    return () => {
      cancelled = true;
      // a cancelled load never reaches its own finally-reset below, so clear
      // the "Loading conversation..." flag here - otherwise it sticks
      setThreadyHistoryLoading(false);
    };
  }, [
    activeThreadId,
    chatHistory.length,
    selectedThreadId,
    sharedBy,
    user?._id,
    isGuest,
    claimingGuestThread,
  ]);

  useEffect(() => {
    if (!user?._id) return;
    clearLoginPromptTimer();
    const guest = readGuestEntry();
    if (!guest?.threadId) return;

    setClaimingGuestThread(true);
    claimGuestThread(user._id, guest.guestId, guest.threadId)
      .catch((error) => {
        console.error("Failed to save guest thread:", error);
        message.error("Couldn't save this conversation to your account.");
      })
      .finally(() => {
        writeGuestEntry(null);
        refreshChatThreads();
        setLoginModalOpen(false);
        setClaimingGuestThread(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // clone the thread into the current user and swap the URL to it.
  useEffect(() => {
    if (!user?._id || !selectedThreadId || !sharedBy) {
      return;
    }

    let cancelled = false;

    const loadSharedThread = async () => {
      setThreadyHistoryLoading(true);

      try {
        const { history, threadId: newThreadId } = await openSharedThread(
          user._id,
          sharedBy,
          selectedThreadId,
        );

        if (cancelled) {
          return;
        }

        setChatHistory(history);
        if (newThreadId) {
          setActiveThreadId(newThreadId);
        }

        let lastIdx = -1;
        history.forEach((h, i) => {
          if (h.answer.projectsList && h.answer.projectsList.length) {
            setProjectResults(h.answer.projectsList);
            lastIdx = i;
          }
        });
        if (lastIdx >= 0) setMapResultsIndex(lastIdx);
        const lastAnswer = history[history.length - 1]?.answer;
        setFocusedReferredLocations(
          lastAnswer ? getDefaultReferredLocations(lastAnswer) : [],
        );

        refreshChatThreads();

        setThreadyHistoryLoading(false);

        // Drop sharedBy and point the URL at the user's own thread copy.
        syncThreadUrl(newThreadId, { dropParams: ["sharedBy"] });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to open shared thread:", error);
        message.error("This conversation is not available.");
        setActiveThreadId(undefined);
        setChatHistory([]);

        setThreadyHistoryLoading(false);
        syncThreadUrl(undefined, { dropParams: ["sharedBy"] });
      } finally {
        if (!cancelled) {
          setThreadyHistoryLoading(false);
        }
      }
    };

    void loadSharedThread();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, selectedThreadId, sharedBy]);

  const handleSearch = async (values: { question: string }) => {
    const question = values.question?.trim();

    if (!question || question.length < 3) {
      message.warning("Please enter at least 3 characters");
      return;
    }

    if (claimingGuestThread) return;

    if (!user?._id && !isGuest) {
      message.info("Loading your account, please try again in a moment.");
      return;
    }

    // guests only get the one free query
    if (isGuest && readGuestEntry()?.threadId) {
      openLoginPrompt();
      return;
    }
    const guestId = isGuest ? getOrCreateGuestId() : undefined;

    setCurrentQuestion(question);
    setChatLoading(true);
    setSteps([]);
    setStreamingSummary(undefined);
    form.resetFields();
    // captured before the reset below - sent with this turn so the planner
    // can resolve "this project"/"it" to whatever was open (see planner.js's
    // "Project open in the user's view")
    const openProjectName = selectedProject?.projectName;
    // a new turn moves the conversation on - close any open 360 view (same
    // reset as Brick360Inline's own onClose) so the new answer isn't hidden
    // behind it and the map goes back to the results
    setSelectedProject(null);
    setPillarMapConfig(null);

    const runStartedAt = Date.now();

    try {
      // "New chat" aborts this (see handleNewChat), so a reply still
      // streaming can't land in the fresh conversation afterwards
      searchAbortRef.current?.abort();
      const abortController = new AbortController();
      searchAbortRef.current = abortController;
      const res = await fetch(`${baseApiUrl}ai/explore-projects/stream`, {
        signal: abortController.signal,
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
        },
        body: JSON.stringify({
          query: question,
          limit: 10,
          ...(guestId ? { guestId } : { userId: user?._id }),
          threadId: activeThreadId,
          // null when nothing's open, so the backend clears last turn's
          selectedProject: openProjectName || null,
          // always sent, every turn - the planner resolves a project
          // reference against these only when it's confident the user
          // means their saved/pinned set (see planner.js's "User's saved/
          // pinned projects" prompt section), not as a default pool.
          ...(pinnedProjectResults?.length
            ? {
                userPinnedProjects: pinnedProjectResults.map(
                  (p) => p.projectName,
                ),
              }
            : {}),
        }),
      });

      if (res.status === 401) {
        const json = await res.json().catch(() => null);
        if (json?.requiresLogin) {
          // put the question back so it's there after they sign in
          form.setFieldsValue({ question });
          openLoginPrompt();
          return;
        }
      }

      if (!res.ok || !res.body)
        throw new Error(`explore-projects ${res.status}`);

      // parse SSE events: status/token while the agent runs, final at the end
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer: ExploreAnswer | undefined;
      let resolvedThreadId: string | undefined;
      let streamedText = "";

      let stepList: TimelineStep[] = [];

      const upsertStep = (incoming: {
        id: string;
        label?: string;
        detail?: string;
        status: "active" | "done";
      }) => {
        const i = stepList.findIndex((s) => s.id === incoming.id);
        if (i === -1) {
          if (incoming.status === "done") return;
          stepList = [
            ...stepList,
            {
              id: incoming.id,
              label: incoming.label || incoming.id,
              detail: incoming.detail,
              status: incoming.status,
              startedAt: Date.now(),
            },
          ];
        } else {
          stepList = [...stepList];
          stepList[i] = {
            ...stepList[i],
            label: incoming.label ?? stepList[i].label,
            detail: incoming.detail ?? stepList[i].detail,
            status: incoming.status,
            endedAt:
              incoming.status === "done"
                ? (stepList[i].endedAt ?? Date.now())
                : stepList[i].endedAt,
          };
        }
        setSteps(stepList);
      };

      const handleEvent = (raw: string) => {
        if (!raw.startsWith("data: ")) return;
        let event;
        try {
          event = JSON.parse(raw.slice(6));
        } catch {
          return;
        }
        if (event.type === "step") {
          upsertStep(event);
        } else if (event.type === "status") {
          stepList = stepList.map((s) =>
            s.status === "active"
              ? { ...s, status: "done" as const, endedAt: Date.now() }
              : s,
          );
          upsertStep({
            id: event.node || event.message,
            label: event.message,
            status: "active",
          });
        } else if (event.type === "token") {
          streamedText += event.content;
          setStreamingSummary(streamedText);
        } else if (event.type === "final") {
          answer = event.payload as ExploreAnswer;
          resolvedThreadId = event.meta?.threadId;
        } else if (event.type === "error") {
          throw new Error(event.error || "stream error");
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          handleEvent(buffer.slice(0, idx));
          buffer = buffer.slice(idx + 2);
        }
      }

      if (!answer) throw new Error("stream ended without a result");
      const finalAnswer: ExploreAnswer = answer;

      if (finalAnswer.projectsList && finalAnswer.projectsList.length) {
        setProjectResults(finalAnswer.projectsList);
        setMapResultsIndex(chatHistory.length);
      }
      setFocusedReferredLocations(getDefaultReferredLocations(finalAnswer));

      const completedSteps = stepList.map((s) =>
        s.status === "active"
          ? { ...s, status: "done" as const, endedAt: s.endedAt ?? Date.now() }
          : s,
      );
      setChatHistory((prev) => [
        ...prev,
        {
          question,
          answer: finalAnswer,
          steps: completedSteps,
          durationMs: Date.now() - runStartedAt,
        },
      ]);

      if (!activeThreadId && resolvedThreadId) {
        setActiveThreadId(resolvedThreadId);
        syncThreadUrl(resolvedThreadId);
      }

      if (guestId && resolvedThreadId) {
        writeGuestEntry({ guestId, threadId: resolvedThreadId });
        scheduleLoginPrompt();
      }

      refreshChatThreads();
    } catch (error) {
      // aborted by "New chat" - expected, not a failure to report
      if ((error as any)?.name === "AbortError") return;
      console.error("Search error:", error);
      message.error("Failed to search projects. Please try again.");
    } finally {
      setCurrentQuestion(undefined);
      setChatLoading(false);
      setSteps([]);
      setStreamingSummary(undefined);
    }
  };

  // in-flight /explore-projects/stream request, if any (see handleSearch)
  const searchAbortRef = useRef<AbortController | null>(null);

  // Starts a fresh conversation in place (no page reload): stops any reply
  // still streaming, clears the thread and everything shown for it (history,
  // streaming state, open 360 view, map focus/results, search box), and
  // points the URL back at the bare chat path. Pinned projects are kept.
  const handleNewChat = () => {
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    // don't let the history effect re-load the thread being left while its
    // id is still in the URL (see leavingThreadIdRef)
    leavingThreadIdRef.current = selectedThreadId || activeThreadId || null;

    setActiveThreadId(undefined);
    setChatHistory([]);
    setCurrentQuestion(undefined);
    setChatLoading(false);
    setSteps([]);
    setStreamingSummary(undefined);
    setThreadyHistoryLoading(false);

    setSelectedProject(null);
    setPillarMapConfig(null);
    setFocusedReferredLocations([]);
    setFocusedProjectId(null);
    setMapResultsIndex(undefined);
    setProjectResults(undefined);

    form.resetFields();
    syncThreadUrl();
  };

  const handleShare = async () => {
    const threadId = activeThreadId || selectedThreadId;
    if (!threadId || !user?._id) {
      return;
    }

    setShareModalOpen(true);
    setSharePreparing(true);
    setShareLink(undefined);

    try {
      await shareThread(user._id, threadId);
      // always the standalone chat page, even when shared from an embedded
      // usage - that's the only place a thread can be opened from a link
      const link = `${window.location.origin}/app/brickchat/${encodeURIComponent(threadId)}?sharedBy=${user._id}`;
      setShareLink(link);
    } catch (error) {
      console.error("Failed to prepare share link:", error);
      message.error("Failed to create share link. Please try again.");
      setShareModalOpen(false);
    } finally {
      setSharePreparing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      message.success("Link copied to clipboard");
    } catch {
      message.error("Couldn't copy. Please copy the link manually.");
    }
  };

  // --- Brickfi offerings (see offering-flows.tsx) ---

  // the CTA flow open in its dialog, if any
  const [activeOfferingFlow, setActiveOfferingFlow] =
    useState<ActiveOfferingFlow | null>(null);

  // what a flow can prefill from: projects in this conversation (the open
  // one, then the latest answers' cards first, then saved ones) and the
  // signed-in user's contact
  const offeringFlowContext = useMemo<OfferingFlowContext>(() => {
    const seen = new Set<string>();
    const projects: OfferingFlowContext["projects"] = [];
    const add = (p?: { projectId: string; projectName: string } | null) => {
      if (!p?.projectId || !p.projectName || seen.has(p.projectId)) return;
      seen.add(p.projectId);
      projects.push({ projectId: p.projectId, projectName: p.projectName });
    };
    add(selectedProject);
    [...chatHistory]
      .reverse()
      .forEach((m) => (m.answer.projectsList || []).forEach(add));
    (pinnedProjectResults || []).forEach(add);
    return {
      projects,
      mobile: user?.mobile || undefined,
      countryCode: user?.countryCode || undefined,
      name: user?.name || undefined,
    };
  }, [selectedProject, chatHistory, pinnedProjectResults, user]);

  // a ticket is created for the thread's owner - the signed-in user, or the
  // guest who started it
  const offeringTicketOwner = user?._id
    ? { userId: user._id }
    : { guestId: readGuestEntry()?.guestId };

  // this thread's requests with their live status, and the latest one per
  // offering - shown as a card in place of that offering's CTA buttons (see
  // OfferingCtaButtons)
  const offeringThreadId = activeThreadId || selectedThreadId;
  const threadTickets = useThreadTickets(offeringTicketOwner, offeringThreadId);
  const offeringTicketsByKey = useMemo(() => {
    const byKey: Record<string, OfferingTicket> = {};
    // oldest first, so the latest request per offering wins
    (threadTickets || []).forEach((t) => (byKey[t.offeringKey] = t));
    return byKey;
  }, [threadTickets]);

  // show the new request straight away - its card replaces the buttons it
  // was raised from
  const handleOfferingSubmitted = (ticket: OfferingTicket) => {
    queryClient.setQueryData<OfferingTicket[]>(
      threadTicketsQueryKey(offeringThreadId),
      (prev) => [...(prev || []), ticket],
    );
  };

  const renderImages = (imagesGroups?: ExploreImagesGroup[]) => {
    const items = (imagesGroups || []).flatMap((group) =>
      group.images.map((image) => ({
        ...image,
        caption: `${group.projectName}: ${image.caption}`,
      })),
    );

    if (!items.length) {
      return null;
    }

    return (
      <Image.PreviewGroup>
        <Flex
          className={styles.scrollContainer}
          gap={12}
          style={{ marginTop: 8 }}
        >
          {items.map((image, index) => (
            <Flex
              key={`${image.url}-${index}`}
              vertical
              gap={4}
              style={{
                width: 160,
                flexShrink: 0,
              }}
            >
              <Image
                src={image.url}
                alt={image.caption || ""}
                width={160}
                height={120}
                style={{
                  objectFit: "cover",
                  borderRadius: 12,
                  border: `1px solid ${COLORS.borderColor}`,
                }}
              />
              {image.caption ? (
                <Typography.Text
                  ellipsis
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  {image.caption}
                </Typography.Text>
              ) : null}
            </Flex>
          ))}
        </Flex>
      </Image.PreviewGroup>
    );
  };

  const renderQuestion = (question: string) => (
    <Flex>
      <Typography.Text
        style={{
          color: "white",
          fontSize: FONT_SIZE.HEADING_4,
          backgroundColor: COLORS.textColorDark,
          borderRadius: 16,
          padding: "4px 12px",
          maxWidth: 575,
        }}
      >
        {question}
      </Typography.Text>
    </Flex>
  );

  const mobileDrawerWidth = getMobileMapDrawerWidth();

  return (
    <Flex
      vertical={isMobile}
      style={{
        width: "100%",
        maxWidth: 2000,
        height: isMobile ? "calc(100vh - 100px)" : "calc(100vh - 60px)",
        // mobile: no side padding here - the search form and chat panel
        // below carry their own 8px gutter instead, so everything (including
        // the inline Brick360 view) gets an even 8px on both sides
        padding: isMobile ? "8px 0" : 8,
        overflowY: "scroll",
      }}
    >
      <Flex
        vertical
        style={{
          margin: "0 auto",
          position: "relative",
          paddingBottom: 100,
          width: isMobile ? "100%" : "57%",
          height: "100%",
        }}
      >
        {/* Primary Search Input */}
        {!showMobileMap ? (
          <Form
            form={form}
            onFinish={handleSearch}
            style={{
              marginTop: 8,
              position: "absolute",
              bottom: 8,
              width: "100%",
              padding: isMobile ? "0 8px" : undefined,
              boxSizing: "border-box",
              backgroundColor: "white",
              // just enough to sit above the scrollable chat list behind
              // it - antd Modal's own mask/dialog default to zIndex 1000,
              // so anything >= that renders on top of a modal's backdrop
              zIndex: 2,
            }}
          >
            <Flex justify="flex-end" style={{ marginBottom: 2 }}>
              {/* {(activeThreadId || selectedThreadId) && (
                  <Tooltip title="Share chat">
                    <Button
                      type="text"
                      style={{
                        padding: "8px 0",
                        height: "auto",
                        width: 32,
                        lineHeight: 1,
                      }}
                      icon={
                        <DynamicReactIcon
                          iconName="IoIosShareAlt"
                          iconSet="io"
                          color={COLORS.textColorMedium}
                          size={18}
                        />
                      }
                      onClick={handleShare}
                    />
                  </Tooltip>
                )} */}
              {/* hidden until the user query settles, so it doesn't flash
                for a signed-in user whose profile is still loading */}
              {isGuest && !userLoading && (
                <Button
                  size="small"
                  type="text"
                  style={{
                    alignSelf: "center",
                    // pushes it to the left edge, the rest stay right-aligned
                    marginRight: "auto",
                    color: COLORS.primaryColor,
                    fontSize: FONT_SIZE.SUB_TEXT,
                    fontWeight: 500,
                  }}
                  icon={
                    <DynamicReactIcon
                      iconName="FaUserAstronaut"
                      iconSet="fa6"
                      color={COLORS.primaryColor}
                      size={12}
                    />
                  }
                  onClick={openLoginPrompt}
                >
                  Sign Up To Continue
                </Button>
              )}
              <BrickchatFeedback
                threadId={activeThreadId || selectedThreadId}
                userId={user?._id}
              />
              {user?._id && (activeThreadId || selectedThreadId) && (
                <BookmarkThreadButton
                  threadId={(activeThreadId || selectedThreadId) as string}
                  userId={user._id}
                />
              )}
              {isInternalUser && (activeThreadId || selectedThreadId) && (
                <ThreadLinksButton
                  threadId={(activeThreadId || selectedThreadId) as string}
                />
              )}
              <Tooltip title="New chat">
                <Button
                  type="text"
                  style={{
                    padding: "8px 0",
                    height: "auto",
                    width: 32,
                    lineHeight: 1,
                  }}
                  icon={
                    <DynamicReactIcon
                      iconName="RiChatAiFill"
                      iconSet="ri"
                      color={COLORS.textColorMedium}
                      size={16}
                    />
                  }
                  onClick={handleNewChat}
                />
              </Tooltip>
            </Flex>
            <Form.Item name="question" style={{ marginBottom: 0 }}>
              <Input
                placeholder="Search for projects... (e.g., 'apartments near Whitefield')"
                size="large"
                disabled={
                  chatLoading || threadyHistoryLoading || claimingGuestThread
                }
                suffix={
                  <Button
                    type="text"
                    htmlType="submit"
                    icon={<BiSend size={20} />}
                    disabled={
                      chatLoading ||
                      threadyHistoryLoading ||
                      claimingGuestThread
                    }
                    style={{ color: COLORS.primaryColor }}
                  />
                }
                style={{
                  boxShadow: "0 0 8px rgba(41, 181, 232, 0.3)",
                  height: 50,
                  backgroundColor: "white",
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  borderRadius: 16,
                  fontSize: FONT_SIZE.HEADING_4,
                }}
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
          </Form>
        ) : null}
        <Flex
          vertical
          gap={24}
          style={{
            height: "100%",
            overflowY: "scroll",
            scrollbarWidth: "none",
            padding: isMobile ? "0 8px" : "0 8px 0 0",
          }}
        >
          {/* Always at the top, independent of showWelcome below - the
            component itself renders a placeholder when there's nothing to
            show, so no outer conditional is needed here. */}
          <PinnedProjectResults
            results={pinnedProjectResults || []}
            description={pinnedProjectsDescription}
            hasChatStarted={!!chatHistory.length}
            isLoading={pinnedProjectsLoading}
            onLocateProject={handleLocateProject}
            onSelectProject={handleSelectProject}
            selectedProjectId={selectedProject?.projectId}
            collapseOnSelect={true}
          />
          {showWelcome ? (
            <Flex vertical>
              <Flex vertical>
                <Typography.Text
                  style={{
                    marginBottom: 0,
                    fontSize: FONT_SIZE.HEADING_2,
                    fontWeight: 600,
                  }}
                >
                  Welcome to Brickfi
                </Typography.Text>
                <Typography.Text
                  style={{
                    marginBottom: 24,
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  Start your home search with Brickfi. Just enter your
                  requirement and let Brickfi do the work.
                </Typography.Text>
              </Flex>

              <StaticQueries
                disabled={chatLoading}
                onSelect={(query) => {
                  form.setFieldsValue({ question: query });
                  form.submit();
                }}
              />

              <Flex vertical gap={12}>
                <Flex align="center" justify="space-between">
                  {(activeThreadId || selectedThreadId) && (
                    <Button onClick={handleNewChat}>New Chat</Button>
                  )}
                </Flex>
              </Flex>
            </Flex>
          ) : null}

          {threadyHistoryLoading && !chatHistory.length ? (
            <Flex align="center" gap={12}>
              <Spin size="small" />
              <Typography.Text type="secondary">
                Loading conversation...
              </Typography.Text>
            </Flex>
          ) : null}

          <Flex vertical gap={24} style={{ marginBottom: 24, width: "100%" }}>
            {chatHistory.map((messageItem, index) =>
              messageItem.answer.offeringTicket ? (
                // an old "[Submitted: ...]" request record the backend used
                // to add to the thread - the request now shows as a card
                // where its offering's buttons were, so this isn't shown
                null
              ) : (
              <Flex key={`${messageItem.question}-${index}`} vertical gap={12}>
                {renderQuestion(messageItem.question)}

                <Flex
                  vertical
                  style={{
                    borderBottom: `${index !== chatHistory.length - 1 ? 1 : 0}px solid ${COLORS.borderColor}`,
                    paddingBottom: 24,
                    marginBottom: 16,
                  }}
                >
                  {messageItem.steps?.length ? (
                    <ChatTimeline
                      steps={messageItem.steps}
                      running={false}
                      totalMs={messageItem.durationMs}
                    />
                  ) : null}

                  <Flex vertical gap={4} style={{ marginTop: 8 }}>
                    {/* {!messageItem.answer.directAnswer &&
                    !!messageItem.answer.projectsList.length ? (
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.SUB_TEXT,
                          color: COLORS.textColorLight,
                        }}
                      >
                        Found {messageItem.answer.projectsList.length} matching
                        project
                        {messageItem.answer.projectsList.length !== 1
                          ? "s"
                          : ""}
                      </Typography.Text>
                    ) : null} */}

                    {renderImages(messageItem.answer.images)}
                    {/* Map Chips */}
                    <Flex
                      align="center"
                      gap={8}
                      style={{
                        marginBottom: 8,
                        width: "100%",
                        overflowX: "scroll",
                        flexWrap: "nowrap",
                        scrollbarWidth: "none",
                      }}
                    >
                      {messageItem.answer.projectsList &&
                      !!messageItem.answer.projectsList.length ? (
                        <Flex justify="flex-end" style={{ flexShrink: 0 }}>
                          <Button
                            size="small"
                            icon={
                              <DynamicReactIcon
                                iconName="FaMapMarkedAlt"
                                iconSet="fa"
                                size={16}
                                color={
                                  !hasFocusedReferredLocations &&
                                  mapResultsIndex === index
                                    ? "white"
                                    : COLORS.textColorDark
                                }
                              ></DynamicReactIcon>
                            }
                            type={
                              mapResultsIndex === index ? "primary" : "default"
                            }
                            onClick={() => {
                              setFocusedReferredLocations([]);
                              if (isMobile) setShowMobileMap(true);
                              setMapResultsIndex(index);
                              // a fresh array reference even when re-selecting
                              // the same list (e.g. after wandering off to a
                              // driver/locality focus) - MapCenterer's
                              // re-centering effect only re-fires when its
                              // `projects` dependency actually changes
                              // reference, and setProjectResults with the
                              // exact same array object React already holds
                              // is a no-op (React bails out of re-rendering
                              // for an Object.is-identical value), so
                              // re-clicking this button on an
                              // already-selected list would otherwise never
                              // reset the camera back to it.
                              setProjectResults([
                                ...messageItem.answer.projectsList,
                              ]);
                            }}
                            style={{
                              fontSize: FONT_SIZE.PARA,
                              height: 24,
                              borderRadius: 16,
                              border: `1px solid ${
                                !hasFocusedReferredLocations &&
                                mapResultsIndex === index
                                  ? COLORS.primaryColor
                                  : COLORS.borderColorMedium
                              }`,
                              backgroundColor:
                                !hasFocusedReferredLocations &&
                                mapResultsIndex === index
                                  ? COLORS.primaryColor
                                  : COLORS.bgColorLightBlue,
                              color:
                                !hasFocusedReferredLocations &&
                                mapResultsIndex === index
                                  ? "white"
                                  : COLORS.textColorDark,
                            }}
                          >
                            {messageItem.answer.projectsList.length} Projects
                          </Button>
                        </Flex>
                      ) : null}
                      {messageItem.answer.totalCount != null &&
                      !!messageItem.answer.projectsList?.length ? (
                        <Typography.Text
                          style={{
                            flexShrink: 0,
                            fontSize: FONT_SIZE.SUB_TEXT,
                            color: COLORS.textColorMedium,
                          }}
                        >
                          {messageItem.answer.totalCount}{" "}
                          {messageItem.answer.totalCount === 1
                            ? "project matches"
                            : "projects match"}{" "}
                          your criteria
                        </Typography.Text>
                      ) : null}
                    </Flex>
                    {!messageItem.answer.directAnswer ? (
                      <Flex vertical gap={8} style={{}}>
                        <BrickChatResults
                          results={messageItem.answer.projectsList}
                          onLocateProject={(projectId) =>
                            handleLocateProject(projectId, index)
                          }
                          onSelectProject={handleSelectProject}
                          selectedProjectId={selectedProject?.projectId}
                        />
                        {!chatLoading &&
                          (messageItem.answer.nextSetCount ?? 0) > 0 &&
                          index === chatHistory.length - 1 && (
                            <Flex justify="flex-start">
                              <Button
                                size="small"
                                style={{
                                  fontSize: FONT_SIZE.PARA,
                                  height: 24,
                                }}
                                onClick={() => {
                                  form.setFieldsValue({
                                    question: "show me more",
                                  });
                                  form.submit();
                                }}
                              >
                                Show me more
                              </Button>
                            </Flex>
                          )}
                      </Flex>
                    ) : !!messageItem.answer.projectsList?.length ? (
                      <Flex vertical gap={8}>
                        <BrickChatResults
                          results={messageItem.answer.projectsList}
                          onLocateProject={(projectId) =>
                            handleLocateProject(projectId, index)
                          }
                          onSelectProject={handleSelectProject}
                          selectedProjectId={selectedProject?.projectId}
                          skipOneLiner
                          skipSort
                        />
                      </Flex>
                    ) : null}

                    {/* earlier turns clamp to 300px behind "See more" so
                      the thread stays scannable; the latest turn always
                      shows in full */}
                    <CollapsibleAnswer
                      collapsible={index < chatHistory.length - 1}
                    >
                      <Markdown
                        className="bkchat-summary"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                fontWeight: 500,
                                marginBottom: 16,
                                display: "block",
                                maxWidth: 850,
                              }}
                            >
                              {children}
                            </Typography.Text>
                          ),
                          a: ({ href, children }) => {
                            if (!href?.startsWith(LOCATION_REF_HREF_PREFIX)) {
                              return <a href={href}>{children}</a>;
                            }
                            const id = href.slice(
                              LOCATION_REF_HREF_PREFIX.length,
                            );
                            // reuse the chip row's item (same key, so
                            // selection highlights both); an id the answer
                            // didn't list is treated as a driver - the chip
                            // looks up its name, or renders nothing
                            const item = getReferredLocationItems(
                              messageItem.answer,
                            ).find((i) => i.id === id) || {
                              key: `driver:${id}`,
                              id,
                              type: "driver" as const,
                            };
                            return (
                              <ReferredLocationChips
                                inline
                                iconOnly
                                items={[item]}
                                selectedKeys={focusedReferredLocationKeys}
                                onToggle={handleToggleReferredLocation}
                              />
                            );
                          },
                        }}
                      >
                        {linkLocationRefs(messageItem.answer.summary)}
                      </Markdown>
                    </CollapsibleAnswer>

                    {(() => {
                      const referredLocationItems = getReferredLocationItems(
                        messageItem.answer,
                      );
                      if (!referredLocationItems.length) return null;
                      const hasFocusable = referredLocationItems.some(
                        (i) => !!i.id,
                      );
                      return (
                        <Flex vertical gap={4} style={{ marginBottom: 2 }}>
                          <Flex align="center" gap={6}>
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.SUB_TEXT,
                                fontWeight: 400,
                                color: COLORS.textColorMedium,
                              }}
                            >
                              See on map
                            </Typography.Text>
                            {hasFocusable ? (
                              <Tooltip title="Reset">
                                <Button
                                  type="text"
                                  size="small"
                                  aria-label="Reset map selection"
                                  icon={
                                    <DynamicReactIcon
                                      iconName="RxReset"
                                      iconSet="rx"
                                      size={14}
                                      color={COLORS.textColorMedium}
                                    />
                                  }
                                  onClick={() =>
                                    handleResetReferredLocations(
                                      messageItem.answer,
                                    )
                                  }
                                  style={{ height: 20, width: 20 }}
                                />
                              </Tooltip>
                            ) : null}
                          </Flex>
                          <Flex
                            style={{
                              width: "100%",
                              overflowX: "scroll",
                              scrollbarWidth: "none",
                            }}
                          >
                            <ReferredLocationChips
                              items={referredLocationItems}
                              selectedKeys={focusedReferredLocationKeys}
                              onToggle={handleToggleReferredLocation}
                            />
                          </Flex>
                        </Flex>
                      );
                    })()}

                    {messageItem.answer.followupPrompt ? (
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.HEADING_4,
                          marginTop: 8,
                          fontWeight: 600,
                          maxWidth: 800,
                        }}
                      >
                        {messageItem.answer.followupPrompt}
                      </Typography.Text>
                    ) : null}

                    {messageItem.answer.followupOffering ? (
                      <OfferingCtaButtons
                        offeringKey={messageItem.answer.followupOffering.key}
                        existingTicket={
                          offeringTicketsByKey[
                            messageItem.answer.followupOffering.key
                          ]
                        }
                        onStart={(offering, cta) =>
                          setActiveOfferingFlow({
                            offering,
                            cta,
                            turnId: messageItem.answer.turnId,
                          })
                        }
                      />
                    ) : null}

                    {/* feedback on just this answer - only once it carries
                      a turnId, so it can be tied to the turn's log */}
                    {messageItem.answer.turnId ? (
                      <Flex justify="flex-end">
                        <BrickchatFeedback
                          threadId={activeThreadId || selectedThreadId}
                          userId={user?._id}
                          turnId={messageItem.answer.turnId}
                        />
                      </Flex>
                    ) : null}
                  </Flex>
                </Flex>
              </Flex>
              ),
            )}

            {currentQuestion && chatLoading && (
              <Flex vertical gap={12}>
                {renderQuestion(currentQuestion)}
                <ChatTimeline steps={steps} running />
                {/* a project-list answer (directAnswer false) is on its way
                    - placeholder cards until the real ones arrive */}
                {steps.some((s) => PROJECT_LIST_STEP_IDS.includes(s.id)) ? (
                  <BrickChatResultsSkeleton />
                ) : null}
                {streamingSummary ? (
                  <Markdown
                    className="bkchat-summary"
                    remarkPlugins={[remarkGfm]}
                  >
                    {stripLocationRefs(streamingSummary)}
                  </Markdown>
                ) : null}
              </Flex>
            )}

            {selectedProject && selectedLvnzyProjectLoading ? (
              <div ref={brick360InlineTopRef}>
                <Loader />
              </div>
            ) : selectedProject && selectedLvnzyProject ? (
              <Flex vertical gap={32} ref={brick360InlineTopRef}>
                <Brick360Inline
                  key={selectedProject.projectId}
                  slug={selectedProject.projectSlug || ""}
                  projectData={selectedLvnzyProject}
                  onClose={() => {
                    setSelectedProject(null);
                    setPillarMapConfig(null);
                  }}
                  onMapConfigChange={(config) => {
                    setPillarMapConfig(config);
                    // a pillar's "See on Map" - on mobile the map lives in
                    // a closed drawer, so open it to actually show this
                    if (config && isMobile) setShowMobileMap(true);
                  }}
                />
                <Typography.Text
                  style={{
                    fontWeight: 500,
                    fontSize: fs.HEADING_3,
                    marginLeft: 12,
                  }}
                >
                  Ask any specific question about the project or compare it with
                  other projects.
                </Typography.Text>
              </Flex>
            ) : null}

            <div ref={scrollBottomRef} />
          </Flex>
        </Flex>
      </Flex>

      {/* Map View for Desktop */}
      {!isMobile && (
        <Flex
          style={{
            width: "40%",
            minWidth: "37%",
            padding: "0 1.5%",
            flexShrink: 0,
            isolation: "isolate",
          }}
        >
          <BrickMapChat
            projects={projectResults || []}
            focusedProjectId={focusedProjectId}
            onSelectProject={handleSelectProject}
            hideAllFilters={hasFocusedReferredLocations}
            detailedProject={selectedProject ? selectedLvnzyProject : undefined}
            pillarMapConfig={selectedProject ? pillarMapConfig : undefined}
            focusedDrivers={selectedProject ? undefined : mapDisplayDrivers}
            focusedLocalityIds={
              selectedProject ? undefined : focusedLocalityIds
            }
            focusedCorridorIds={
              selectedProject ? undefined : focusedCorridorIds
            }
            focusedMicroPocketIds={
              selectedProject ? undefined : focusedMicroPocketIds
            }
          />
        </Flex>
      )}

      {/* Map View For Mobile in Expandable Drawer */}
      {isMobile && (
        <>
          <Flex
            justify="center"
            align="center"
            onClick={() => {
              setShowMobileMap((prev) => {
                const next = !prev;
                if (next) setFocusedReferredLocations([]);
                return next;
              });
            }}
            style={{
              position: "fixed",
              top: "50%",
              right: showMobileMap ? mobileDrawerWidth : 0,
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              backgroundColor: showMobileMap ? COLORS.primaryColor : "white",
              border: `1px solid ${showMobileMap ? COLORS.primaryColor : COLORS.textColorMedium}`,
              borderRight: showMobileMap ? undefined : "none",
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: "pointer",
              touchAction: "manipulation",
              zIndex: 1000,
              transition: "right 0.25s ease",
              boxShadow: "-2px 0 6px rgba(0,0,0,0.15)",
            }}
          >
            {/* <div
              style={{
                width: 8,
                height: 50,
                borderRadius: 4,
                backgroundColor: "black",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            /> */}
            <DynamicReactIcon
              color={showMobileMap ? "white" : COLORS.textColorDark}
              iconName="FaMapLocationDot"
              iconSet="fa6"
              size={28}
            ></DynamicReactIcon>
          </Flex>

          <Drawer
            placement="right"
            open={showMobileMap}
            onClose={() => setShowMobileMap(false)}
            mask={false}
            closable={false}
            width={mobileDrawerWidth}
            styles={{
              header: { display: "none" },
              body: { padding: 0, position: "relative", overflow: "hidden" },
              content: {
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              },
              wrapper: {
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
                borderLeft: `1px solid ${COLORS.textColorMedium}`,
              },
            }}
          >
            <Flex
              vertical
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
            >
              <BrickMapChat
                projects={projectResults || []}
                focusedProjectId={focusedProjectId}
                onSelectProject={handleSelectProject}
                // not tied to showMobileMap: hideAllFilters also disables
                // driver filtering (see useMapFilters), so flipping it on
                // close made every driver render during the slide-out
                hideAllFilters={hasFocusedReferredLocations}
                detailedProject={
                  selectedProject ? selectedLvnzyProject : undefined
                }
                pillarMapConfig={selectedProject ? pillarMapConfig : undefined}
                focusedDrivers={selectedProject ? undefined : mapDisplayDrivers}
                focusedLocalityIds={
                  selectedProject ? undefined : focusedLocalityIds
                }
                focusedCorridorIds={
                  selectedProject ? undefined : focusedCorridorIds
                }
                focusedMicroPocketIds={
                  selectedProject ? undefined : focusedMicroPocketIds
                }
              />
            </Flex>
          </Drawer>
        </>
      )}
      <OfferingFlowDialog
        flow={activeOfferingFlow}
        context={offeringFlowContext}
        owner={offeringTicketOwner}
        threadId={activeThreadId || selectedThreadId}
        onClose={() => setActiveOfferingFlow(null)}
        onSubmitted={handleOfferingSubmitted}
      />
      <Modal
        open={loginModalOpen && !user?._id}
        // dismissable - a guest who closes it gets it back on their next
        // submit (see the one-free-query check in handleSearch)
        onCancel={() => setLoginModalOpen(false)}
        footer={null}
        style={{ padding: 0 }}
        styles={{
          mask: { backgroundColor: "rgba(0,0,0,0.25)" },
        }}
      >
        <Flex vertical>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: 500 }}
          >
            Sign in to continue
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              marginBottom: 24,
              color: COLORS.textColorMedium,
            }}
          >
            Login/Signup with your mobile number to keep this conversation going
          </Typography.Text>
          {/* useAuth invalidates a different query client than the app's,
            so refetch the user here to pick up the new sign in */}
          <LoginForm onMobVerified={() => refetchUser()} />
        </Flex>
      </Modal>
      <Modal
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        closable
        title="Share this chat"
        styles={{ content: { padding: 24 } }}
      >
        <Typography.Paragraph style={{ color: COLORS.textColorMedium }}>
          Anyone with this link can open a copy of this conversation and
          continue it on their own.
        </Typography.Paragraph>
        {sharePreparing || !shareLink ? (
          <Flex justify="center" style={{ padding: 16 }}>
            <Spin />
          </Flex>
        ) : (
          <Flex gap={8}>
            <Input value={shareLink} readOnly />
            <Button type="primary" onClick={handleCopyShareLink}>
              Copy link
            </Button>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
}

// useSearchParams() (here and inside BrickChatCore) must sit under a
// Suspense boundary, otherwise Next.js can't prerender the pages rendering
// this (/app, /app/brickchat, /app/brickchat/[threadId], /app/[projectRef])
// and fails the build ("missing-suspense-with-csr-bailout").
export default function BrickChatClient(props: { projectRef?: string } = {}) {
  return (
    <Suspense fallback={<Loader />}>
      <BrickChatClientContent {...props} />
    </Suspense>
  );
}

function BrickChatClientContent({ projectRef }: { projectRef?: string }) {
  // ?q= is set by the landing page search input - auto-submit it as the
  // first question of a fresh chat.
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() || undefined;

  return (
    <BrickChatCore
      autoStartQuestion={initialQuery}
      threadPathBase={BRICKCHAT_THREAD_PATH_BASE}
      projectRef={projectRef}
    />
  );
}
