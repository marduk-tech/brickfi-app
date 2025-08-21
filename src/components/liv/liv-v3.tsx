import { Button, Flex, Form, Input, message, Typography } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useDevice } from "../../hooks/use-device";
import { useFetchProjects } from "../../hooks/use-project";
import { useUser } from "../../hooks/use-user";
import { axiosApiInstance } from "../../libs/axios-api-Instance";
import { baseApiUrl } from "../../libs/constants";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import ThreadMsg from "./thread-msg";

const { Paragraph } = Typography;

export interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface LivRef {}

export interface LivAnswer {
  details: string | undefined;
  projects?: any[];
  drivers?: string[];
  projectId?: string;
  followUp?: string[];
}

export const LivV3 = forwardRef<LivRef, {}>((props, ref) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>();
  const [currentAnswer, setCurrentAnswer] = useState<LivAnswer | undefined>();

  const { data: projects, isLoading: projectIsLoading } = useFetchProjects();

  const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
    uuidv4()
  );
  const [queryStreaming, setQueryStreaming] = useState<boolean>(false);
  const { sessionId } = useParams();
  const [loadingLivThread, setLoadingLivThread] = useState(false);

  const { user } = useUser();

  const { isMobile } = useDevice();
  const [query, setQuery] = useState<string>();
  const [form] = Form.useForm();
  const [livThread, setLivThread] = useState<
    Array<{ question: string; answer: any }>
  >([]);

  const [details, setDetails] = useState<string>();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const [
    selectedProjectPredefinedQuestion,
    setSelectedProjectPredefinedQuestion,
  ] = useState<string>();

  useEffect(() => {
    if (sessionId && !livThread.length && !loadingLivThread) {
      fetchHistory(sessionId);
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  const fetchHistory = async (historySessionId: string) => {
    try {
      setLoadingLivThread(true);
      const response = await axiosApiInstance.post("/ai/history", {
        sessionId: historySessionId,
      });

      if (response.data?.data) {
        const history = response.data.data;
        const threads: Array<{ question: string; answer: LivAnswer }> = [];

        //  (human question + ai answer)
        for (let i = 0; i < history.length; i += 2) {
          const question = history[i];
          const answer = history[i + 1];

          if (question?.role === "human" && answer?.role === "ai") {
            try {
              // parse the ai response which is a json string
              const aiResponse = JSON.parse(answer.content);
              threads.push({
                question: question.content,
                answer: aiResponse,
              });
            } catch (e) {
              console.error("Error parsing AI response:", e);
            }
          }
        }

        // update livThread with historical messages
        setLivThread(threads);
      }
      setLoadingLivThread(false);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const [isFirstQuestion, setIsFirstQuestion] = useState<boolean>(true);

  const handleRequest = async (question: string) => {
    try {
      if (!question || question.length < 3) {
        return;
      }

      captureAnalyticsEvent("question-asked", { question });
      setQueryStreaming(true);
      setDetails("...");

      if (currentQuestion) {
        setLivThread((prev) => [
          ...prev,
          { question: currentQuestion!, answer: currentAnswer || {} },
        ]);
      }
      setCurrentQuestion(question);
      setCurrentAnswer({ details: "..." });

      // if this is first question store session info
      if (isFirstQuestion && user?._id) {
        try {
          await axiosApiInstance.put(`/user/${user._id}/chat-session`, {
            userId: user._id,
            sessionId: currentSessionId,
            startingQuestion: question,
          });
          setIsFirstQuestion(false);
        } catch (error) {
          console.log("Error saving chat session:", error);
        }
      }

      const stream = makeStreamingJsonRequest({
        url: `${baseApiUrl}ai/ask-stream`,
        method: "POST",
        payload: { question, sessionId: currentSessionId, userId: user?._id },
      });

      for await (const data of stream) {
        console.log("received stream response: ", JSON.stringify(data));
        setCurrentAnswer(data);
      }
      console.log("Streaming completed");
      setQueryStreaming(false);
    } catch (error) {
      console.error("Error sending message:", error);
      messageApi.open({
        type: "error",
        content: "Oops. Can you please try again?",
      });
    } finally {
      setQueryStreaming(false);
      setSelectedProjectPredefinedQuestion(undefined);
    }
  };

  const renderQuestionAnswerSection = () => {
    return (
      <Flex
        ref={chatContainerRef}
        vertical
        style={{
          height: window.innerHeight - 60,
          overflowY: "auto",
          scrollbarWidth: "none",
          paddingBottom: 150,
          scrollBehavior: "smooth",
        }}
      >
        {(livThread && livThread.length) || currentQuestion ? (
          <>
            {" "}
            {/* Past Interactions */}
            {livThread.map((thread, index) => (
              <ThreadMsg
                question={thread.question}
                answer={thread.answer}
                streaming={false}
                allProjects={projects || []}
                handleProjectClick={(clickedProjectId: string) => {
                  handleRequest(`summarize this project - ${clickedProjectId}`);
                }}
              ></ThreadMsg>
            ))}
            {/* Current Question & Answer (Only show while processing) */}
            {currentQuestion && (
              <ThreadMsg
                question={currentQuestion || ""}
                answer={currentAnswer!}
                streaming={queryStreaming}
                allProjects={projects || []}
                handleProjectClick={(clickedProjectId: string) => {
                  handleRequest(`summarize this project - ${clickedProjectId}`);
                }}
              ></ThreadMsg>
            )}
          </>
        ) : (
          <Flex vertical style={{ padding: isMobile ? "0 16px" : 0 }}>
            {" "}
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1,
                  lineHeight: "120%",
                  marginBottom: 16,
                  marginTop: 8,
                }}
              >
                Liv is an AI Powered Real Estate Agent.
              </Typography.Text>
              <Typography.Text
                style={{ fontSize: FONT_SIZE.HEADING_4, marginBottom: 16 }}
              >
                Liv is here to make your property search effortless for{" "}
                <b>North Bengaluru</b> which is rapidly emerging as a real
                estate hotspot, fueled by its proximity to the
                <b>&nbsp; Airport, KIADB Hi-Tech Park, Metro</b>, Highways, the
                upcoming Foxconn Factory and more.
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  marginBottom: 16,
                  marginTop: 16,
                }}
              >
                💡 Ask Liv anything
              </Typography.Text>
            </Flex>
            <Flex
              style={{ flexWrap: "wrap", marginTop: 0, marginBottom: 16 }}
              gap={16}
            >
              {[
                "Show me farmlands near Nandi Hills",
                "How are the schools in the area ?",
                "Properties with rental income ? ",
              ].map((q) => {
                return (
                  <Flex>
                    <Typography.Text
                      onClick={() => {
                        if (selectedProjectPredefinedQuestion == q) {
                          return;
                        }
                        setSelectedProjectPredefinedQuestion(q);
                        handleRequest(q);
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor: "white",
                        padding: "4px 12px",
                        color: COLORS.textColorDark,
                        borderRadius: 16,
                        border: "1px solid",
                        borderColor: COLORS.primaryColor,
                        display: "flex",
                        fontSize: FONT_SIZE.HEADING_4,
                      }}
                    >
                      {q}
                    </Typography.Text>
                  </Flex>
                );
              })}
            </Flex>
            <ThreadMsg
              question={""}
              answer={{
                projectId: "",
                projects: projects
                  ? projects.sort((a, b) => 0.5 - Math.random())
                  : [],
                drivers: [],
                details: "",
              }}
              streaming={false}
              allProjects={projects || []}
              handleProjectClick={(clickedProjectId: string) => {
                handleRequest(`summarize this project - ${clickedProjectId}`);
              }}
            ></ThreadMsg>
          </Flex>
        )}
      </Flex>
    );
  };

  if (loadingLivThread) {
    return <Loader></Loader>;
  }

  return (
    <Flex
      vertical
      style={{
        width: "100%",
      }}
    >
      <Flex vertical style={{ position: "relative", height: "100%" }}>
        {/* Single session of question / answer */}
        {renderQuestionAnswerSection()}

        {/* Prompts & Input */}
        <Flex
          style={{
            justifySelf: "flex-end",
            marginTop: "auto",
            width: "100%",
            position: "fixed",
            bottom: 0,
            paddingBottom: 24,
            maxWidth: 1000,
            paddingTop: 24,
            backgroundColor: "white",
          }}
          vertical
        >
          {!queryStreaming && currentAnswer && currentAnswer.projectId ? (
            <Flex
              style={{
                overflowX: "scroll",
                whiteSpace: "nowrap",
                marginBottom: 16,
                scrollbarWidth: "none",
                padding: isMobile ? "0 16px" : 0,
              }}
              gap={8}
              align={isMobile ? "flex-start" : "center"}
            >
              {[
                "Project amenities",
                "Explain cost structure",
                "How is the location ?",
              ].map((q) => {
                return (
                  <Typography.Text
                    onClick={() => {
                      if (selectedProjectPredefinedQuestion == q) {
                        return;
                      }
                      setSelectedProjectPredefinedQuestion(q);
                      handleRequest(q);
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "white",
                      padding: "4px 12px",
                      color: COLORS.textColorDark,
                      borderRadius: 16,
                      border: "1px solid",
                      borderColor: COLORS.textColorDark,
                      display: "flex",
                      fontSize: FONT_SIZE.PARA,
                    }}
                  >
                    {q}
                  </Typography.Text>
                );
              })}
            </Flex>
          ) : null}

          <Form
            form={form}
            onFinish={async (value) => {
              form.resetFields();
              const { question } = value;
              handleRequest(question);
            }}
          >
            <Form.Item label="" name="question" style={{ marginBottom: 0 }}>
              <Input
                disabled={queryStreaming}
                style={{
                  height: 50,
                  paddingRight: 0,
                  backgroundColor: "white",
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  borderRadius: 16,
                  width: isMobile ? "95%" : "100%",
                  marginLeft: isMobile ? "2.5%" : 0,
                  fontSize: FONT_SIZE.HEADING_3,
                }}
                name="query"
                placeholder="I am Liv. How can I help ?"
                prefix={
                  <Flex style={{ marginRight: 8 }}>
                    <DynamicReactIcon
                      iconName="GiOilySpiral"
                      iconSet="gi"
                      size={24}
                    ></DynamicReactIcon>
                  </Flex>
                }
                suffix={
                  <Button
                    htmlType="submit"
                    type="link"
                    disabled={queryStreaming}
                    style={{
                      opacity: !queryStreaming ? 1 : 0.3,
                      padding: 0,
                      paddingRight: 8,
                    }}
                  >
                    <DynamicReactIcon
                      iconName="BiSolidSend"
                      iconSet="bi"
                    ></DynamicReactIcon>
                  </Button>
                }
              />
            </Form.Item>
          </Form>
        </Flex>
      </Flex>
    </Flex>
  );
});

export default LivV3;
