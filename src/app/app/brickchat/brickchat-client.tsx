"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import BrickChatResults from "@/app/app/brickchat/brick-chat-results";
import ChatTimeline, { TimelineStep } from "@/app/app/brickchat/chat-timeline";
import { PillarMapConfig } from "@/components/brick-360/brick360-pillar";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
import { useDevice } from "@/hooks/use-device";
import { useFetchAllLivindexPlaces } from "@/hooks/use-livindex-places";
import { useFetchLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import { useUser } from "@/hooks/use-user";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { ChatThread } from "@/types/User";
import {
  Button,
  Collapse,
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
import { useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brick360Inline } from "./brick360-inline";
import { BrickMapChat } from "./brick-map-chat";
import DriverChips from "./driver-chips";
import PinnedProjectResults from "./pinned-project-results";
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

interface ExploreAnswer {
  projectsList: ProjectResult[];
  summary: string;
  directAnswer: boolean;
  nextSetCount?: number;
  images?: ExploreImagesGroup[];
  /** brickfiId(s) of driver/infra records (schools, transit, tech parks etc) the answer discussed - see synthesize.js. */
  brickfiDriverIds?: string[];
}

interface ChatMessage {
  question: string;
  answer: ExploreAnswer;
  steps?: TimelineStep[];
  durationMs?: number;
}

const SAMPLE_PROMPTS = [
  "Looking for a 3BHK above 1200 sq.ft near Electronic City",
  "Find me a plot at less than 6000 per sq.ft in North Bangalore",
  "4BHK apartment above 2500 sq.ft with lake facing units",
];

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

  const getMobileMapDrawerWidth = () =>
    typeof window !== "undefined" ? Math.round(window.innerWidth * 0.85) : 320;

  const [projectResults, setProjectResults] = useState<
    ProjectResult[] | undefined
  >(defaultProjectResults);
  const [mapResultsIndex, setMapResultsIndex] = useState<number | undefined>();
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  const handleLocateProject = (projectId: string) => {
    if (isMobile) setShowMobileMap(true);
    setTimeout(() => {
          setFocusedProjectId(projectId);

    }, isMobile ? 300: 10);
  };

  // A chat answer's brickfiDriverIds chip, clicked (see DriverChips) - plots
  // just that one driver on the map (BrickMapChat has no default "every
  // driver" fetch of its own). Single-select: clicking the already-selected
  // chip again clears it back to showing none.
  const [focusedDriverIds, setFocusedDriverIds] = useState<string[] | null>(
    null,
  );
  const { data: focusedDrivers } = useFetchAllLivindexPlaces(
    focusedDriverIds || undefined,
    undefined,
    !!focusedDriverIds?.length,
  );
  const handleToggleDriverFocus = (driverId: string) => {
    if (isMobile) setShowMobileMap(true);
    setFocusedDriverIds((prev) =>
      prev?.length === 1 && prev[0] === driverId ? null : [driverId],
    );
  };

  // Set by the "project-details" button on a project card (see
  // brick-chat-results.tsx) - swaps the chat panel for Brick360Inline and
  // switches the already-mounted map to that project's detail view instead
  // of the multi-project search-results view.
  const [selectedProject, setSelectedProject] = useState<ProjectResult | null>(
    null,
  );
  const {
    data: selectedLvnzyProject,
    isLoading: selectedLvnzyProjectLoading,
  } = useFetchLvnzyProjectBySlug(
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
  const [pillarMapConfig, setPillarMapConfig] = useState<PillarMapConfig | null>(
    null,
  );

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
    !threadyHistoryLoading;

  // Auto-submit autoStartQuestion once, only when landing fresh (no thread
  // selected/active/loading and no history yet) - e.g. the initial
  // "compare my saved projects" query on the account page.
  useEffect(() => {
    if (autoStartFiredRef.current) return;
    if (!autoStartQuestion || !user?._id) return;
    if (selectedThreadId || activeThreadId || chatHistory.length || threadyHistoryLoading) {
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
          maxWidth: 420,
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
      style={{ width: "100%", maxWidth: 2000, height: "calc(100vh - 50px)", padding: 8, overflowY: "scroll" }}
    >
      <Flex
        vertical
        style={{
          margin: "0 auto",
          position: "relative",
          paddingBottom: 100,
          width: isMobile ? "100%" : "50%",
          height: "100%"
        }}
      >
         {!showMobileMap ? <Form
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
            {(activeThreadId || selectedThreadId) && (
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
            )}
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
        </Form> : null}
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
            <Flex
              vertical
            >
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

              <Flex vertical gap={12}>
                <Flex align="center" justify="space-between">
                  {(activeThreadId || selectedThreadId) && (
                    <Button onClick={handleNewChat}>New Chat</Button>
                  )}
                </Flex>
                {threadsLoading ? (
                  <Flex align="center" gap={8}>
                    <Spin size="small" />
                    <Typography.Text type="secondary">
                      Loading conversations...
                    </Typography.Text>
                  </Flex>
                ) : chatThreads.length === 0 ? (
                  <Flex style={{ width: "100%", flexWrap: "wrap" }}>
                    {SAMPLE_PROMPTS.map((prompt) => (
                      <Tag
                        key={prompt}
                        style={{
                          marginBottom: 8,
                          fontSize: FONT_SIZE.PARA,
                          backgroundColor: COLORS.textColorDark,
                          color: "white",
                          padding: "2px 8px",
                          cursor: chatLoading ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (chatLoading) {
                            return;
                          }

                          form.setFieldsValue({ question: prompt });
                          form.submit();
                        }}
                      >
                        {prompt}
                      </Tag>
                    ))}
                  </Flex>
                ) : (
                  <Collapse
                    items={[
                      {
                        key: "recent-chats",
                        label: (
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.PARA,
                              color: COLORS.textColorLight,
                            }}
                          >
                            Your recent chats
                          </Typography.Text>
                        ),
                        children: (
                          <Flex
                            vertical
                            style={{
                              maxHeight: 300,
                              overflowY: "scroll",
                              scrollbarWidth: "none",
                            }}
                          >
                            {chatThreads.map((thread, index) => (
                              <Flex
                                key={thread.thread_id}
                                vertical
                                gap={2}
                                onClick={() =>
                                  handleThreadSelect(thread.thread_id)
                                }
                                style={{
                                  cursor: "pointer",
                                  padding: "8px 4px",
                                  borderBottom:
                                    index == chatThreads.length - 1
                                      ? "none"
                                      : `1px solid ${COLORS.bgColorBlue}`,
                                  backgroundColor:
                                    thread.thread_id ===
                                    (selectedThreadId || activeThreadId)
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
                        ),
                      },
                    ]}
                  />
                )}
              </Flex>
            </Flex>
          ) : defaultProjectResults?.length ? (
            <PinnedProjectResults
              results={defaultProjectResults}
              description={defaultProjectsDescription}
              hasChatStarted={!!chatHistory.length}
              onLocateProject={handleLocateProject}
              isShownOnMap={mapResultsIndex === undefined}
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
              <Flex key={`${messageItem.question}-${index}`} vertical gap={12}>
                {hideFirstQuestion && index === 0
                  ? null
                  : renderQuestion(messageItem.question)}

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
                      Found {messageItem.answer.projectsList.length} matching
                      project
                      {messageItem.answer.projectsList.length !== 1 ? "s" : ""}
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
                  {messageItem.answer.brickfiDriverIds?.length ? (
                    <DriverChips
                      driverIds={messageItem.answer.brickfiDriverIds}
                      selectedDriverId={focusedDriverIds?.[0] ?? null}
                      onToggle={handleToggleDriverFocus}
                    />
                  ) : null}
                  {!messageItem.answer.directAnswer ? (
                    <Flex
                      vertical
                      gap={8}
                      style={{
                        borderRadius: 8,
                        padding: mapResultsIndex === index ? "8px 16px" : 0,
                        backgroundColor:
                          mapResultsIndex === index
                            ? COLORS.bgColorLightBlue
                            : undefined,
                        transition: "background-color 0.2s",
                        border: `${
                          mapResultsIndex === index ? "0.5px" : "0"
                        } solid ${COLORS.borderColor}`,
                      }}
                    >
                      {messageItem.answer.projectsList &&
                      !!messageItem.answer.projectsList.length ? (
                        <Flex justify="flex-end">
                          <Button
                            size="small"
                            icon={
                              <DynamicReactIcon
                                iconName="FaMapMarkedAlt"
                                iconSet="fa"
                                size={16}
                                color={
                                  mapResultsIndex === index
                                    ? "white"
                                    : COLORS.primaryColor
                                }
                              ></DynamicReactIcon>
                            }
                            type={
                              mapResultsIndex === index ? "primary" : "default"
                            }
                            onClick={() => {
                              if (mapResultsIndex !== index) {
                                setMapResultsIndex(index);
                                setProjectResults(
                                  messageItem.answer.projectsList,
                                );
                                    if (isMobile) setShowMobileMap(true);

                              }
                            }}
                            style={{ fontSize: FONT_SIZE.PARA, height: 24 }}
                          >
                            {mapResultsIndex === index ? "" : "See on Map"}
                          </Button>
                        </Flex>
                      ) : null}

                      <BrickChatResults
                        results={messageItem.answer.projectsList}
                        onLocateProject={handleLocateProject}
                        isShownOnMap={mapResultsIndex === index}
                        onSelectProject={handleSelectProject}
                      />
                      {!chatLoading &&
                        (messageItem.answer.nextSetCount ?? 0) > 0 &&
                        index === chatHistory.length - 1 && (
                          <Flex justify="flex-start">
                            <Button
                              size="small"
                              style={{ fontSize: FONT_SIZE.PARA, height: 24 }}
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
            width: "47%",
            minWidth: "47%",
            padding: "0 1.5%",
            flexShrink: 0,
            isolation: "isolate",
          }}
        >
          <BrickMapChat
            projects={projectResults || []}
            focusedProjectId={focusedProjectId}
            hideAllFilters={true}
            detailedProject={selectedProject ? selectedLvnzyProject : undefined}
            pillarMapConfig={selectedProject ? pillarMapConfig : undefined}
            focusedDrivers={selectedProject ? undefined : focusedDrivers}
          />
        </Flex>
      )}

      {isMobile && (
        <>
          <Flex
            justify="center"
            align="center"
            onClick={() => setShowMobileMap((v) => !v)}
            style={{
              position: "fixed",
              top: "50%",
              right: showMobileMap ? mobileDrawerWidth : 0,
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              backgroundColor: showMobileMap ? COLORS.primaryColor : "white",
              border: `1px solid ${showMobileMap ? COLORS.primaryColor: COLORS.textColorMedium}`,
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
            <DynamicReactIcon color={showMobileMap ? "white": COLORS.textColorDark} iconName="FaMapLocationDot" iconSet="fa6" size={28}></DynamicReactIcon>
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
            <Flex vertical style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <BrickMapChat
                projects={projectResults || []}
                focusedProjectId={focusedProjectId}
                hideAllFilters={!showMobileMap}
                detailedProject={selectedProject ? selectedLvnzyProject : undefined}
                pillarMapConfig={selectedProject ? pillarMapConfig : undefined}
                focusedDrivers={selectedProject ? undefined : focusedDrivers}
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
