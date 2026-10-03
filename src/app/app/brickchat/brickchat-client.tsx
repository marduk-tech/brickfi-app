"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import BrickChatResults from "@/app/app/brickchat/brick-chat-results";
import ChatTimeline, { TimelineStep } from "@/app/app/brickchat/chat-timeline";
import { PillarMapConfig } from "@/components/brick-360/brick360-pillar";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
import { useDevice } from "@/hooks/use-device";
import {
  useFetchAllLivindexPlaces,
  useFetchLvnzyProjectDrivers,
} from "@/hooks/use-livindex-places";
import { useFetchLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import { useUser } from "@/hooks/use-user";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { ChatThread } from "@/types/User";
import {
  Button,
  Drawer,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brick360Inline } from "./brick360-inline";
import { BrickMapChat } from "./brick-map-chat";
import BrickchatFeedback from "./brickchat-feedback";
import ReferredLocationChips, {
  ReferredLocationChipItem,
} from "./referred-location-chips";
import PinnedProjectResults from "./pinned-project-results";
import StaticQueries from "./static-queries";
import styles from "./brick-chat-results.module.css";

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
  images?: ExploreImagesGroup[];
  /** brickfiId(s) of driver/infra records (schools, transit, tech parks etc) the answer discussed - see synthesize.js. */
  brickfiDriverIds?: string[];
  /** LLM-suggested next step/question for this turn, e.g. "Want me to compare these?" - see synthesize.js. Empty when there's no sensible follow-up. */
  followupPrompt?: string;
  /** Named place(s)/area(s) resolved this turn (project-distance.js's targetPlaces, location-analysis.js's locationNames) - see summarizeResolvedLocation in shared.js. */
  resolvedLocations?: ResolvedLocation[];
}

interface ChatMessage {
  question: string;
  answer: ExploreAnswer;
  steps?: TimelineStep[];
  durationMs?: number;
}

// Desktop width for the "Your recent chats" left drawer - on mobile it uses
// the same 85%-of-viewport sizing as the right-side map drawer instead (see
// getMobileMapDrawerWidth).
const RECENT_CHATS_DRAWER_WIDTH = 320;



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

const formatThreadDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fetchChatThreads = async (userId: string): Promise<ChatThread[]> => {
  const res = await fetch(`${baseApiUrl}user/${userId}/chat-threads`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
  });
  if (!res.ok) throw new Error(`chat-threads ${res.status}`);
  const json = await res.json();
  return json?.data || [];
};

const fetchThreadHistory = async (
  userId: string,
  threadId: string,
): Promise<ChatMessage[]> => {
  const res = await fetch(`${baseApiUrl}ai/explore-projects/history`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ userId, threadId }),
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

interface BrickChatCoreProps {
  defaultProjectResults?: ProjectResult[];
  defaultProjectsDescription?: string;
  /**
   * When set and there's no thread already open (no ?threadId=, no history),
   * automatically submits this question on mount instead of waiting for the
   * user to type - e.g. an initial "compare my saved projects" query.
   */
  autoStartQuestion?: string;
  /**
   * Saved LvnzyProject ids to ground the auto-started query in (sent
   * alongside the question on that first request only) - the backend
   * resolves these to canonical project names and grounds the comparison
   * in exactly them (see resolveExploreRequest/groundQueryInSeedProjects
   * in ai.route.js).
   */
  seedProjectIds?: string[];
  /** Fires once, the first time a new thread id is assigned to this conversation. */
  onThreadCreated?: (threadId: string) => void;
  /**
   * Fires when the thread named by ?threadId= (from defaultProjectResults'
   * caller, e.g. a stored compareThreadId) fails to load - e.g. it expired
   * or was deleted server-side. Lets the caller stop re-syncing that same
   * dead id back into the URL, which would otherwise loop forever against
   * the url-clearing this component already does on failure.
   */
  onThreadLoadError?: (threadId: string) => void;
  /**
   * Hides the question bubble for the thread's first turn - for a seeded
   * entry point (autoStartQuestion) where that turn is always the
   * auto-generated question, not something the user typed. Applies whether
   * that first turn is currently streaming or was loaded from history on a
   * resumed thread.
   */
  hideFirstQuestion?: boolean;
}

export function BrickChatCore({
  defaultProjectResults,
  defaultProjectsDescription,
  autoStartQuestion,
  seedProjectIds,
  onThreadCreated,
  onThreadLoadError,
  hideFirstQuestion,
}: BrickChatCoreProps) {
  const [form] = Form.useForm();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile } = useDevice();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>();
  const [currentQuestion, setCurrentQuestion] = useState<string>();
  const [chatLoading, setChatLoading] = useState(false);
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [streamingSummary, setStreamingSummary] = useState<string>();
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadyHistoryLoading, setThreadyHistoryLoading] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [recentChatsDrawerOpen, setRecentChatsDrawerOpen] = useState(false);

  const getMobileMapDrawerWidth = () =>
    typeof window !== "undefined" ? Math.round(window.innerWidth * 0.85) : 320;

  const [projectResults, setProjectResults] = useState<
    ProjectResult[] | undefined
  >(defaultProjectResults);
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
  // to (undefined for the PinnedProjectResults/defaultProjectResults card,
  // which isn't part of chatHistory) - activates that message's own results
  // list as the active one on the map first (same reasoning as the "N
  // Projects" button fix: a fresh projectResults array reference so
  // MapCenterer's re-centering effect fires even when re-selecting an
  // already-active list), so the focused project is guaranteed to actually
  // be among what's currently plotted rather than possibly belonging to a
  // list that isn't the one currently shown on the map.
  const handleLocateProject = (projectId: string, historyIndex?: number) => {
    setFocusedReferredLocation(null);
    setMapResultsIndex(historyIndex);
    setProjectResults(
      historyIndex !== undefined
        ? [...(chatHistory[historyIndex]?.answer.projectsList || [])]
        : [...(defaultProjectResults || [])],
    );
    if (isMobile) setShowMobileMap(true);
    setTimeout(
      () => {
        setFocusedProjectId(projectId);
      },
      isMobile ? 300 : 10,
    );
  };

  // A chat answer's referred-location chip, clicked (see
  // ReferredLocationChips/getReferredLocationItems) - narrows the map to
  // just that one record (driver, or a locality/corridor/micropocket, or a
  // no-op for a landmark with no id - see ReferredLocationChips's
  // `clickable` check). Single-select: clicking the already-selected chip
  // again clears it back to the default view.
  const [focusedReferredLocation, setFocusedReferredLocation] =
    useState<ReferredLocationChipItem | null>(null);
  const handleToggleReferredLocation = (item: ReferredLocationChipItem) => {
    setFocusedReferredLocation((prev) => {
      const next = prev?.key === item.key ? null : item;
      if (isMobile) setShowMobileMap(!!next);
      return next;
    });
  };

  const focusedDriverIds =
    focusedReferredLocation?.type === "driver"
      ? [focusedReferredLocation.id]
      : null;
  const { data: focusedDrivers } = useFetchAllLivindexPlaces(
    focusedDriverIds || undefined,
    undefined,
    !!focusedDriverIds?.length,
  );
  const focusedLocalityIds =
    focusedReferredLocation?.type === "locality"
      ? [focusedReferredLocation.id]
      : [];
  const focusedCorridorIds =
    focusedReferredLocation?.type === "corridor"
      ? [focusedReferredLocation.id]
      : [];
  const focusedMicroPocketIds =
    focusedReferredLocation?.type === "micropocket"
      ? [focusedReferredLocation.id]
      : [];

  // Default to the drivers relevant to the current results list; a driver
  // chip click narrows the map down to just that one driver, and a
  // locality/corridor/micropocket/landmark chip click clears drivers
  // entirely instead (that layer plots its own thing via
  // focusedLocalityIds/focusedCorridorIds/focusedMicroPocketIds below - no
  // reason to also clutter the map with every result's drivers). Unselecting
  // (clicking the same chip again, which clears focusedReferredLocation back
  // to null) falls back to the full results-driven set again.
  const mapDisplayDrivers = !focusedReferredLocation
    ? projectResultsDrivers
    : focusedReferredLocation.type === "driver"
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

  // Reported by Brick360Pillar (via Brick360Inline) when a data-point panel
  // is expanded/collapsed - narrows the primary map to just that pillar's
  // relevant drivers/surroundings/nearby-pricing instead of the whole
  // project's connectivity. See brick-map-chat.tsx.
  const [pillarMapConfig, setPillarMapConfig] =
    useState<PillarMapConfig | null>(null);

  // Keeps the conversation panel pinned to its latest content - new Q&A
  // pairs, in-flight streaming tokens, and the loader/Brick360Inline that
  // appear after selecting a project all land at the bottom of this list, so
  // scroll there whenever any of them change instead of requiring the user
  // to scroll down manually. Debounced because streamingSummary updates on
  // every token - calling scrollIntoView("smooth") that often restarts the
  // animation each time and looks like stutter rather than a scroll.
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
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

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>();
  const [sharePreparing, setSharePreparing] = useState(false);

  useEffect(() => {
    if (defaultProjectResults?.length) setProjectResults(defaultProjectResults);
  }, [defaultProjectResults]);

  const pendingSeedProjectIdsRef = useRef<string[] | undefined>(undefined);
  const autoStartFiredRef = useRef(false);

  const selectedThreadId = searchParams.get("threadId")?.trim() || undefined;
  const sharedBy = searchParams.get("sharedBy")?.trim() || undefined;
  const showWelcome =
    !selectedThreadId &&
    !activeThreadId &&
    !chatHistory.length &&
    !defaultProjectResults?.length &&
    !threadyHistoryLoading &&
    !chatLoading;

  // Auto-submit autoStartQuestion once, only when landing fresh (no thread
  // selected/active/loading and no history yet) - e.g. the initial
  // "compare my saved projects" query on the account page.
  useEffect(() => {
    if (autoStartFiredRef.current) return;
    if (!autoStartQuestion || !user?._id) return;
    if (
      selectedThreadId ||
      activeThreadId ||
      chatHistory.length ||
      threadyHistoryLoading
    ) {
      return;
    }

    autoStartFiredRef.current = true;
    pendingSeedProjectIdsRef.current = seedProjectIds;
    form.setFieldsValue({ question: autoStartQuestion });
    form.submit();
  }, [
    autoStartQuestion,
    seedProjectIds,
    user?._id,
    selectedThreadId,
    activeThreadId,
    chatHistory.length,
    threadyHistoryLoading,
    form,
  ]);

  const syncThreadSearchParam = (threadId?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (threadId) {
      params.set("threadId", threadId);
    } else {
      params.delete("threadId");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const refreshChatThreads = async () => {
    if (!user?._id) {
      return;
    }

    setThreadsLoading(true);

    try {
      const threads = await fetchChatThreads(user._id);
      setChatThreads(threads);
    } catch (error) {
      console.error("Failed to load chat threads:", error);
      message.error("Failed to load saved threads.");
    } finally {
      setThreadsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    let cancelled = false;

    const loadChatThreads = async () => {
      setThreadsLoading(true);

      try {
        const threads = await fetchChatThreads(user._id);

        if (cancelled) {
          return;
        }

        setChatThreads(threads);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load chat threads:", error);
        message.error("Failed to load saved threads.");
      } finally {
        if (!cancelled) {
          setThreadsLoading(false);
        }
      }
    };

    void loadChatThreads();

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !selectedThreadId || sharedBy) {
      return;
    }

    if (selectedThreadId === activeThreadId && chatHistory.length > 0) {
      return;
    }

    let cancelled = false;

    const loadThreadHistory = async () => {
      setThreadyHistoryLoading(true);

      try {
        const history = await fetchThreadHistory(user._id, selectedThreadId);

        if (cancelled) {
          return;
        }

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
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load thread history:", error);
        message.error("Failed to load thread history.");
        setActiveThreadId(undefined);
        setChatHistory([]);

        setThreadyHistoryLoading(false);
        onThreadLoadError?.(selectedThreadId);
        router.replace(pathname, { scroll: false });
      } finally {
        if (!cancelled) {
          setThreadyHistoryLoading(false);
        }
      }
    };

    void loadThreadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    activeThreadId,
    chatHistory.length,
    onThreadLoadError,
    pathname,
    router,
    selectedThreadId,
    sharedBy,
    user?._id,
  ]);

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

        await refreshChatThreads();

        setThreadyHistoryLoading(false);

        // Drop sharedBy and point the URL at the user's own thread copy.
        router.replace(
          newThreadId ? `${pathname}?threadId=${newThreadId}` : pathname,
          { scroll: false },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to open shared thread:", error);
        message.error("This conversation is not available.");
        setActiveThreadId(undefined);
        setChatHistory([]);

        setThreadyHistoryLoading(false);
        router.replace(pathname, { scroll: false });
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

    if (!user?._id) {
      message.error("User not found. Please refresh and try again.");
      return;
    }

    setCurrentQuestion(question);
    setChatLoading(true);
    setSteps([]);
    setStreamingSummary(undefined);
    form.resetFields();

    const runStartedAt = Date.now();
    const seedProjectIdsForThisRequest = pendingSeedProjectIdsRef.current;
    pendingSeedProjectIdsRef.current = undefined;

    try {
      const res = await fetch(`${baseApiUrl}ai/explore-projects/stream`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
        },
        body: JSON.stringify({
          query: question,
          limit: 10,
          userId: user._id,
          threadId: activeThreadId,
          // only meaningful on a brand new thread - the backend grounds the
          // comparison in these exact projects instead of the free-text
          // question alone (see groundQueryInSeedProjects in ai.route.js).
          ...(seedProjectIdsForThisRequest?.length
            ? { seedProjectIds: seedProjectIdsForThisRequest }
            : {}),
        }),
      });

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
        syncThreadSearchParam(resolvedThreadId);
        onThreadCreated?.(resolvedThreadId);
      }

      await refreshChatThreads();
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to search projects. Please try again.");
    } finally {
      setCurrentQuestion(undefined);
      setChatLoading(false);
      setSteps([]);
      setStreamingSummary(undefined);
    }
  };

  const handleThreadSelect = (threadId: string) => {
    if (!threadId || threadId === selectedThreadId) {
      return;
    }

    setChatHistory([]);
    setCurrentQuestion(undefined);
    setMapResultsIndex(undefined);
    syncThreadSearchParam(threadId);
  };

  const handleNewChat = () => {
    setActiveThreadId(undefined);
    setChatHistory([]);
    setCurrentQuestion(undefined);
    setMapResultsIndex(undefined);
    setThreadyHistoryLoading(false);
    syncThreadSearchParam();
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
      const link = `${window.location.origin}${pathname}?threadId=${threadId}&sharedBy=${user._id}`;
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
          fontSize: FONT_SIZE.HEADING_3,
          backgroundColor: COLORS.textColorDark,
          borderRadius: 16,
          padding: "8px 16px",
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
        height: "calc(100vh - 60px)",
        padding: 8,
        overflowY: "scroll",
      }}
    >
      {/* <Drawer
        placement="left"
        open={recentChatsDrawerOpen}
        onClose={() => setRecentChatsDrawerOpen(false)}
        title="Your recent chats"
        width={isMobile ? mobileDrawerWidth : RECENT_CHATS_DRAWER_WIDTH}
        styles={{ body: { padding: 0 } }}
      >
        {threadsLoading ? (
          <Flex align="center" gap={8} style={{ padding: 16 }}>
            <Spin size="small" />
            <Typography.Text type="secondary">
              Loading conversations...
            </Typography.Text>
          </Flex>
        ) : chatThreads.length === 0 ? (
          <Typography.Text
            type="secondary"
            style={{ padding: 16, display: "block" }}
          >
            No recent chats yet.
          </Typography.Text>
        ) : (
          <Flex vertical>
            {chatThreads.map((thread, index) => (
              <Flex
                key={thread.thread_id}
                vertical
                gap={2}
                onClick={() => {
                  handleThreadSelect(thread.thread_id);
                  setRecentChatsDrawerOpen(false);
                }}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  borderBottom:
                    index == chatThreads.length - 1
                      ? "none"
                      : `1px solid ${COLORS.bgColorBlue}`,
                  backgroundColor:
                    thread.thread_id === (selectedThreadId || activeThreadId)
                      ? "#fafafa"
                      : undefined,
                }}
              >
                <Typography.Text
                  ellipsis
                  style={{
                    fontWeight: 500,
                    fontSize: FONT_SIZE.HEADING_4,
                  }}
                >
                  {thread.thread_title}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: FONT_SIZE.SUB_TEXT }}
                >
                  {formatThreadDate(thread.createdAt)}
                </Typography.Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Drawer> */}
        {/* <Flex
          justify="center"
          align="center"
          onClick={() => setRecentChatsDrawerOpen(true)}
          style={{
            width: 32,
            height: 32,
            backgroundColor: recentChatsDrawerOpen
              ? COLORS.primaryColor
              : "white",
            border: `1px solid ${recentChatsDrawerOpen ? COLORS.primaryColor : COLORS.textColorMedium}`,
            cursor: "pointer",
            touchAction: "manipulation",
            zIndex: 1000,
            borderRadius: 8,
            marginLeft: 4,
            transition: "left 0.25s ease",
          }}
        >
          <DynamicReactIcon
            color={recentChatsDrawerOpen ? "white" : COLORS.textColorDark}
            iconName="LuMenu"
            iconSet="lu"
            size={22}
          />
        </Flex> */}
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
          {!showMobileMap ? (
            <Form
              form={form}
              onFinish={handleSearch}
              style={{
                marginTop: 8,
                position: "absolute",
                bottom: 8,
                width: "100%",
                backgroundColor: "white",
                zIndex: 1001,
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
                <BrickchatFeedback
                  threadId={activeThreadId || selectedThreadId}
                  userId={user?._id}
                />
                {(activeThreadId || selectedThreadId) && (
                  <Tooltip title="View in LangSmith">
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
                          iconName="LuUnlink"
                          iconSet="lu"
                          color={COLORS.textColorMedium}
                          size={16}
                        />
                      }
                      onClick={() => {
                        const threadId = activeThreadId || selectedThreadId;
                        window.open(
                          `https://smith.langchain.com/o/f789969a-14ab-5073-b68e-2822efcebf90/projects/p/4e5569cf-0f16-4779-ac99-d4297e21b54f?runview=threads&peekedConversationId=${threadId}`,
                          "_blank",
                        );
                      }}
                    />
                  </Tooltip>
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
                    onClick={() => {
                      window.location.href = window.location.pathname;
                    }}
                  />
                </Tooltip>
              </Flex>
              <Form.Item name="question" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="Search for projects... (e.g., 'apartments near Whitefield')"
                  size="large"
                  disabled={chatLoading || threadyHistoryLoading}
                  suffix={
                    <Button
                      type="text"
                      htmlType="submit"
                      icon={<BiSend size={20} />}
                      disabled={chatLoading || threadyHistoryLoading}
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
              paddingRight: 8,
            }}
          >
            {showWelcome ? (
              <Flex vertical>
                <Flex vertical>
                  <Typography.Text
                    style={{ marginBottom: 0, fontSize: FONT_SIZE.HEADING_1 }}
                  >
                    Welcome to Brickfi
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      marginBottom: 24,
                      fontSize: FONT_SIZE.HEADING_4,
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
            ) : defaultProjectResults?.length ? (
              <PinnedProjectResults
                results={defaultProjectResults}
                description={defaultProjectsDescription}
                hasChatStarted={!!chatHistory.length}
                onLocateProject={handleLocateProject}
                onSelectProject={handleSelectProject}
              />
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
              {chatHistory.map((messageItem, index) => (
                <Flex
                  key={`${messageItem.question}-${index}`}
                  vertical
                  gap={12}
                >
                  {hideFirstQuestion && index === 0
                    ? null
                    : renderQuestion(messageItem.question)}

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
                      {!messageItem.answer.directAnswer &&
                      !!messageItem.answer.projectsList.length ? (
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.SUB_TEXT,
                            color: COLORS.textColorLight,
                          }}
                        >
                          Found {messageItem.answer.projectsList.length}{" "}
                          matching project
                          {messageItem.answer.projectsList.length !== 1
                            ? "s"
                            : ""}
                        </Typography.Text>
                      ) : null}

                      <Markdown
                        className="bkchat-summary"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_3,
                                fontWeight: 500,
                                marginBottom: 16,
                                display: "block",
                                maxWidth: 850,
                              }}
                            >
                              {children}
                            </Typography.Text>
                          ),
                        }}
                      >
                        {messageItem.answer.summary}
                      </Markdown>
                      {renderImages(messageItem.answer.images)}
                      <Flex vertical>
                        {/* <Typography.Text style={{color: COLORS.textColorLight}}>See on Map</Typography.Text> */}
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
                                      !focusedReferredLocation &&
                                      mapResultsIndex === index
                                        ? "white"
                                        : COLORS.textColorDark
                                    }
                                  ></DynamicReactIcon>
                                }
                                type={
                                  mapResultsIndex === index
                                    ? "primary"
                                    : "default"
                                }
                                onClick={() => {
                                  setFocusedReferredLocation(null);
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
                                    !focusedReferredLocation &&
                                    mapResultsIndex === index
                                      ? COLORS.primaryColor
                                      : COLORS.borderColorMedium
                                  }`,
                                  backgroundColor:
                                    !focusedReferredLocation &&
                                    mapResultsIndex === index
                                      ? COLORS.primaryColor
                                      : COLORS.bgColorLightBlue,
                                  color:
                                    !focusedReferredLocation &&
                                    mapResultsIndex === index
                                      ? "white"
                                      : COLORS.textColorDark,
                                }}
                              >
                                {messageItem.answer.projectsList.length}{" "}
                                Projects
                              </Button>
                            </Flex>
                          ) : null}
                          {(() => {
                            const referredLocationItems =
                              getReferredLocationItems(messageItem.answer);
                            return referredLocationItems.length ? (
                              <ReferredLocationChips
                                items={referredLocationItems}
                                selectedKey={
                                  focusedReferredLocation?.key ?? null
                                }
                                onToggle={handleToggleReferredLocation}
                              />
                            ) : null;
                          })()}
                        </Flex>
                      </Flex>
                      {!messageItem.answer.directAnswer ? (
                        <Flex vertical gap={8} style={{}}>
                          <BrickChatResults
                            results={messageItem.answer.projectsList}
                            onLocateProject={(projectId) =>
                              handleLocateProject(projectId, index)
                            }
                            onSelectProject={handleSelectProject}
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
                      ) : null}
                      {messageItem.answer.followupPrompt ? (
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_3,
                            marginTop: 32,
                            fontWeight: 500,
                            maxWidth: 800,
                          }}
                        >
                          {messageItem.answer.followupPrompt}
                        </Typography.Text>
                      ) : null}
                    </Flex>
                  </Flex>
                </Flex>
              ))}

              {currentQuestion && chatLoading && (
                <Flex vertical gap={12}>
                  {hideFirstQuestion && !chatHistory.length
                    ? null
                    : renderQuestion(currentQuestion)}
                  <ChatTimeline steps={steps} running />
                  {streamingSummary ? (
                    <Markdown
                      className="bkchat-summary"
                      remarkPlugins={[remarkGfm]}
                    >
                      {streamingSummary}
                    </Markdown>
                  ) : null}
                </Flex>
              )}

              {selectedProject && selectedLvnzyProjectLoading ? (
                <Loader />
              ) : selectedProject && selectedLvnzyProject ? (
                <Brick360Inline
                  key={selectedProject.projectId}
                  slug={selectedProject.projectSlug || ""}
                  projectData={selectedLvnzyProject}
                  onClose={() => {
                    setSelectedProject(null);
                    setPillarMapConfig(null);
                  }}
                  onMapConfigChange={setPillarMapConfig}
                />
              ) : null}

              <div ref={scrollBottomRef} />
            </Flex>
          </Flex>
        </Flex>

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
              hideAllFilters={!!focusedReferredLocation}
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
        )}

        {isMobile && (
          <>
            <Flex
              justify="center"
              align="center"
              onClick={() => {
                setShowMobileMap((prev) => {
                  const next = !prev;
                  if (next) setFocusedReferredLocation(null);
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
                  hideAllFilters={!showMobileMap || !!focusedReferredLocation}
                  detailedProject={
                    selectedProject ? selectedLvnzyProject : undefined
                  }
                  pillarMapConfig={
                    selectedProject ? pillarMapConfig : undefined
                  }
                  focusedDrivers={
                    selectedProject ? undefined : mapDisplayDrivers
                  }
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

export default function BrickChatClient() {
  return (
    <AdminGuard allowedRoles={["admin", "member"]}>
      <BrickChatCore />
    </AdminGuard>
  );
}
