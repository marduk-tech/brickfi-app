"use client";

import BrickChatResults from "@/components/brick-chat/brick-chat-results";
import { useUser } from "@/hooks/use-user";
import { axiosApiInstance } from "@/libs/axios-api-Instance";
import { baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import {
  Button,
  Flex,
  Form,
  Input,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { BiSend } from "react-icons/bi";
import { AdminGuard } from "@/components/auth/admin-guard";


export interface ProjectResult {
  projectId: string;
  projectName: string;
  oneLiner: string;
  projectSlug?: string;
  projectImage?: string;
  projectCorridor?: string;
  lvnzyProjectId: string;
  projectMinMaxPrice?: {
    min: number;
    max: number;
  };
  projectUnitTypes?: string[];
}
interface ChatMessage {
  question: string;
  results: ProjectResult[];
}

const SAMPLE_PROMPTS = [
  "Looking for a 3BHK above 1200 sq.ft near Electronic City",
  "Find me a plot at less than 6000 per sq.ft in North Bangalore",
  "4BHK apartment above 2500 sq.ft with lake facing units",
];

export default function BrickChatPage() {
  const [form] = Form.useForm();
  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async (values: { question: string }) => {
    const { question } = values;

    if (!question || question.trim().length < 3) {
      message.warning("Please enter at least 3 characters");
      return;
    }

    setCurrentQuestion(question);
    setLoading(true);
    form.resetFields();

    try {
      const response = await axiosApiInstance.post(
        `${baseApiUrl}ai/explore-projects`,
        {
          query: question.trim(),
          limit: 20,
          userId: user?._id,
        },
      );

      const results = response.data.data || [];

      setChatHistory((prev) => [...prev, { question, results }]);
      setCurrentQuestion(undefined);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to search projects. Please try again.");
      setCurrentQuestion(undefined);
    } finally {
      setLoading(false);
    }
  };

  function renderQuestion(q: string) {
    return (
      <Flex>
        <Tag
          style={{
            color: "white",
            fontSize: FONT_SIZE.HEADING_3,
            backgroundColor: COLORS.textColorDark,
            borderRadius: 16,
            padding: "8px 16px",
          }}
        >
          {q}
        </Tag>
      </Flex>
    );
  }
  return (
    <AdminGuard>
      <Flex
        vertical
        style={{
          padding: 24,
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          minHeight: "87vh",
          position: "relative",
          paddingBottom: 100
        }}
      >
        {!chatHistory || !chatHistory.length ? (
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
              Start your home search with Brickfi. Just enter your requirement
              and let Brickfi do the work.
            </Typography.Text>
            <Flex style={{ width: 800, flexWrap: "wrap" }}>
              {SAMPLE_PROMPTS.map((p) => {
                return (
                  <Tag
                    style={{
                      marginBottom: 8,
                      fontSize: FONT_SIZE.PARA,
                      borderRadius: 16,
                      backgroundColor: COLORS.textColorDark,
                      color: "white",
                      padding: "2px 8px",
                    }}
                  >
                    {p}
                  </Tag>
                );
              })}
            </Flex>
          </Flex>
        ) : null}

        {/* Chat History Display */}
        <Flex vertical gap={24} style={{ marginBottom: 24, flex: 1 }}>
          {chatHistory.map((msg, idx) => (
            <Flex key={idx} vertical gap={12}>
              {/* Question Display */}
              {renderQuestion(msg.question)}

              {/* Answer Display */}
              <Flex vertical gap={8} style={{ marginTop: 8 }}>
                <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
                  Found {msg.results.length} matching project
                  {msg.results.length !== 1 ? "s" : ""}
                </Typography.Text>
                <BrickChatResults results={msg.results} />
              </Flex>
            </Flex>
          ))}

          {/* Current Question Loading State */}
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

        {/* Search Input */}
        <Form
          form={form}
          onFinish={handleSearch}
          style={{
            marginTop: 24,
            position: "absolute",
            bottom: 16,
            width: "100%",
          }}
        >
          <Form.Item name="question" style={{ marginBottom: 0 }}>
            <Input
              placeholder="Search for projects... (e.g., 'apartments near Whitefield')"
              size="large"
              disabled={loading}
              suffix={
                <Button
                  type="text"
                  htmlType="submit"
                  icon={<BiSend size={20} />}
                  disabled={loading}
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
    </AdminGuard>
  );
}
