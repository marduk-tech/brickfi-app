"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import BrickChatResults from "@/components/brick-chat/brick-chat-results";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { useDevice } from "@/hooks/use-device";
import { useUser } from "@/hooks/use-user";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { ChatThread } from "@/types/User";
import {
  Button,
  Collapse,
  Empty,
  Flex,
  Form,
  Input,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSend } from "react-icons/bi";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrickMapChat } from "./brick-map-chat";

export interface ProjectResult {
  projectId: string;
  projectName: string;
  oneLiner: string;
  projectSlug?: string;
  projectStatus?: string;
  projectImage?: string;
  lvnzyProjectId?: string;
  projectUnitTypes?: Array<number>;
  projectAvgSquareFootPrice?: number;
  projectCorridor?: string;
  projectHomeTypes?: Array<string>;
  sizeBuiltupMin?: number;
  projectLocation: {
    lat: number;
    lng: number;
  };
}

interface ExploreAnswer {
  projectsList: ProjectResult[];
  summary: string;
  directAnswer: boolean;
}

interface ChatMessage {
  question: string;
  answer: ExploreAnswer;
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
}

export function BrickChatCore({
  defaultProjectResults,
  defaultProjectsDescription,
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
  const [loading, setLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [projectResults, setProjectResults] = useState<
    ProjectResult[] | undefined
  >(defaultProjectResults);
  const [mapResultsIndex, setMapResultsIndex] = useState<number | undefined>();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string>();
  const [sharePreparing, setSharePreparing] = useState(false);

  useEffect(() => {
    if (defaultProjectResults?.length) setProjectResults(defaultProjectResults);
  }, [defaultProjectResults]);

  const selectedThreadId = searchParams.get("threadId")?.trim() || undefined;
  const sharedBy = searchParams.get("sharedBy")?.trim() || undefined;
  const showWelcome =
    !selectedThreadId &&
    !activeThreadId &&
    !chatHistory.length &&
    !defaultProjectResults?.length &&
    !historyLoading;

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
      setHistoryLoading(true);

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
        router.replace(pathname, { scroll: false });
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
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
      setHistoryLoading(true);

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

        // Drop sharedBy and point the URL at the user's own thread copy.
        router.replace(
          newThreadId ? `${pathname}?threadId=${newThreadId}` : pathname,
          { scroll: false },
        );

        await refreshChatThreads();
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to open shared thread:", error);
        message.error("This conversation is not available.");
        setActiveThreadId(undefined);
        setChatHistory([]);
        router.replace(pathname, { scroll: false });
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
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
    setLoading(true);
    form.resetFields();

    try {
      const res = await fetch(`${baseApiUrl}ai/explore-projects`, {
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
        }),
      });

      if (!res.ok) throw new Error(`explore-projects ${res.status}`);
      const json = await res.json();
      const answer = json?.data as ExploreAnswer;
      const resolvedThreadId = json?.meta?.threadId as string | undefined;

      if (answer.projectsList && answer.projectsList.length) {
        setProjectResults(answer.projectsList);
        setMapResultsIndex(chatHistory.length);
      }
      setChatHistory((prev) => [...prev, { question, answer }]);

      if (!activeThreadId && resolvedThreadId) {
        setActiveThreadId(resolvedThreadId);
        syncThreadSearchParam(resolvedThreadId);
      }

      await refreshChatThreads();
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to search projects. Please try again.");
    } finally {
      setCurrentQuestion(undefined);
      setLoading(false);
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
    setHistoryLoading(false);
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

  return (
    <Flex
      vertical={isMobile}
      style={{ width: "100%", maxWidth: 2000, padding: 8, overflowY: "scroll" }}
    >
      <Flex
        vertical
        style={{
          margin: "0 auto",
          position: "relative",
          paddingBottom: 100,
          width: isMobile ? "100%" : "50%",
          height: "90vh",
        }}
      >
        <Flex
          vertical
          gap={24}
          style={{
            height: "80vh",
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
                      Loading threads...
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
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (loading) {
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
            <Flex vertical gap={12}>
              {defaultProjectsDescription && (
                <Flex vertical>
                  <Typography.Text
                    style={{
                      color: "white",
                      fontSize: FONT_SIZE.HEADING_3,
                      backgroundColor: COLORS.textColorDark,
                      borderRadius: 16,
                      padding: "8px 16px",
                    }}
                  >
                    {defaultProjectsDescription}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorLight,
                      marginLeft: 8,
                      marginTop: 16,
                    }}
                  >
                    Curated by your Brickfi Advisor
                  </Typography.Text>
                </Flex>
              )}
              <BrickChatResults results={defaultProjectResults} />
            </Flex>
          ) : null}

          {historyLoading && !chatHistory.length ? (
            <Flex align="center" gap={12}>
              <Spin size="small" />
              <Typography.Text type="secondary">
                Loading thread history...
              </Typography.Text>
            </Flex>
          ) : null}

          <Flex vertical gap={24} style={{ marginBottom: 24, width: "100%" }}>
            {chatHistory.map((messageItem, index) => (
              <Flex key={`${messageItem.question}-${index}`} vertical gap={12}>
                {renderQuestion(messageItem.question)}

                <Flex vertical gap={4} style={{ marginTop: 8 }}>
                  {!messageItem.answer.directAnswer ? (
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
                            if (mapResultsIndex === index) {
                              setMapResultsIndex(undefined);
                            } else {
                              setMapResultsIndex(index);
                              setProjectResults(
                                messageItem.answer.projectsList,
                              );
                            }
                          }}
                          style={{ fontSize: FONT_SIZE.PARA, height: 24 }}
                        ></Button>
                      </Flex>
                      <BrickChatResults
                        results={messageItem.answer.projectsList}
                      />
                    </Flex>
                  ) : null}
                </Flex>
              </Flex>
            ))}

            {currentQuestion && loading && (
              <Flex vertical gap={12}>
                {renderQuestion(currentQuestion)}
                <Flex align="center" gap={12} style={{ marginTop: 8 }}>
                  <Spin size="small" />
                  <Typography.Text type="secondary">
                    Searching for projects...
                  </Typography.Text>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>

        <Form
          form={form}
          onFinish={handleSearch}
          style={{
            marginTop: 8,
            position: "absolute",
            bottom: 8,
            width: "100%",
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
              disabled={loading || historyLoading}
              suffix={
                <Button
                  type="text"
                  htmlType="submit"
                  icon={<BiSend size={20} />}
                  disabled={loading || historyLoading}
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
      </Flex>

      <Flex
        style={{
          width: isMobile ? "100%" : "47%",
          minWidth: isMobile ? undefined : "47%",
          padding: "0 1.5%",
          flexShrink: 0,
        }}
      >
        <BrickMapChat projects={projectResults || []} />
      </Flex>

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
    <AdminGuard allowedRoles={["admin", "member", "user"]}>
      <BrickChatCore />
    </AdminGuard>
  );
}
