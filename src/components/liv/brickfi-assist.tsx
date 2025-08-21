import { Button, Flex, Form, Input, message, Typography } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../hooks/use-user";
import { axiosApiInstance } from "../../libs/axios-api-Instance";
import { baseApiUrl } from "../../libs/constants";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import { sha256 } from "js-sha256";

const { Paragraph } = Typography;

export interface AICuratedProject {
  projectId: string;
  relevancyScore: number;
  relevantDetails: string;
}

export interface Brick360Props {
  lvnzyProjectId?: string;
  lvnzyProjectsCollection?: string;
}
interface BrickfiAssistRef {
  clearChatData: () => void;
}

export interface Brick360Answer {
  answer: string;
}

export const BrickfiAssist = forwardRef<BrickfiAssistRef, Brick360Props>(
  ({ lvnzyProjectId, lvnzyProjectsCollection }, ref) => {
    const [currentQuestion, setCurrentQuestion] = useState<string>();
    const [currentAnswer, setCurrentAnswer] = useState<
      Brick360Answer | undefined
    >();

    const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
      uuidv4()
    );
    const [queryStreaming, setQueryStreaming] = useState<boolean>(false);
    const [loadingLivThread, setLoadingLivThread] = useState(false);

    const { user } = useUser();

    const [form] = Form.useForm();
    const [livThread, setLivThread] = useState<
      Array<{ question: string; answer: any }>
    >([]);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const [messageApi, contextHolder] = message.useMessage();

    const [
      selectedProjectPredefinedQuestion,
      setSelectedProjectPredefinedQuestion,
    ] = useState<string>();

    // Expose functions to the parent
    useImperativeHandle(ref, () => ({
      clearChatData: () => {
        setLivThread([]);
        setCurrentQuestion(undefined);
        setCurrentAnswer(undefined);
      },
    }));

    useEffect(() => {
      if (user && (lvnzyProjectId || lvnzyProjectsCollection)) {
        const sessionId = sha256(`${user._id}:${lvnzyProjectsCollection}`);
        setCurrentSessionId(sessionId);
        fetchHistory(sessionId);
      }
    }, [user, lvnzyProjectId, lvnzyProjectsCollection]);

    const fetchHistory = async (historySessionId: string) => {
      try {
        setLoadingLivThread(true);
        const response = await axiosApiInstance.post("/ai/history", {
          sessionId: historySessionId,
        });

        if (response.data?.data) {
          const history = response.data.data;
          const threads: Array<{ question: string; answer: Brick360Answer }> =
            [];

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

        if (currentQuestion) {
          setLivThread((prev) => [
            ...prev,
            { question: currentQuestion!, answer: currentAnswer || {} },
          ]);
        }
        setCurrentQuestion(question);
        setCurrentAnswer({ answer: "..." });

        // // if this is first question store session info
        // if (isFirstQuestion && user?._id) {
        //   try {
        //     await axiosApiInstance.put(`/user/${user._id}/chat-session`, {
        //       userId: user._id,
        //       sessionId: currentSessionId,
        //       startingQuestion: question,
        //     });
        //     setIsFirstQuestion(false);
        //   } catch (error) {
        //     console.log("Error saving chat session:", error);
        //   }
        // }

        const stream = makeStreamingJsonRequest({
          url: `${baseApiUrl}ai/ask-stream-v2`,
          method: "POST",
          payload: {
            question,
            sessionId: currentSessionId,
            userId: user?._id,
            lvnzyProjectsCollection,
            lvnzyProjectId,
          },
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

    const renderQABlock = (q: string, a: string, currentQuestion: boolean) => {
      return (
        <Flex vertical>
          <Flex>
            {queryStreaming && currentQuestion ? (
              <img
                src="/images/liv-streaming.gif"
                style={{
                  height: 28,
                  width: 28,
                }}
              />
            ) : null}
            <Flex>
              <Typography.Text
                style={{
                  backgroundColor: COLORS.textColorDark,
                  color: "white",
                  borderRadius: 8,
                  padding: "4px 8px",
                  marginBottom: 8,
                }}
              >
                {q}
              </Typography.Text>
            </Flex>
          </Flex>
          {/* <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {a}
          </Markdown> */}
          <Flex
            style={{
              maxWidth: 500,
              borderRadius: 8,
              borderColor: COLORS.borderColorMedium,
              padding: 8,
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: a }}
              className="reasoning"
              style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
            ></div>
          </Flex>
        </Flex>
      );
    };

    const renderQuestionAnswerSection = () => {
      return (
        <Flex
          ref={chatContainerRef}
          vertical
          gap={24}
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            scrollBehavior: "smooth",
            padding: 8,
            paddingTop: 16,
            paddingBottom: 80,
          }}
        >
          {(livThread && livThread.length) || currentQuestion ? (
            <>
              {" "}
              {/* Past Interactions */}
              {livThread.map((thread, index) =>
                renderQABlock(thread.question, thread.answer.answer, false)
              )}
              {/* Current Question & Answer (Only show while processing) */}
              {currentQuestion &&
                renderQABlock(currentQuestion, currentAnswer?.answer!, true)}
            </>
          ) : null}
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
          position: "relative",
        }}
      >
        <Flex vertical style={{ height: "100%" }}>
          {/* Single session of question / answer */}
          {renderQuestionAnswerSection()}

          {/* Prompts & Input */}
          <Flex
            vertical
            style={{
              width: "100%",
              backgroundColor: "white",
            }}
          >
            {/* {!queryStreaming && currentAnswer && currentAnswer.projectId ? (
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
          ) : null} */}

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
                    marginBottom: 16,
                    marginTop: 8,
                    paddingRight: 0,
                    backgroundColor: "white",
                    border: "1px solid",
                    borderColor: COLORS.borderColorMedium,
                    borderRadius: 16,
                    width: "100%",
                    fontSize: FONT_SIZE.HEADING_3,
                  }}
                  name="query"
                  placeholder="Ask anything!"
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
  }
);

export default BrickfiAssist;
