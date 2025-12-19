"use client";

import BrickChatResults from "@/components/brick-chat/brick-chat-results";
import { useUser } from "@/hooks/use-user";
import { axiosApiInstance } from "@/libs/axios-api-Instance";
import { baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Form, Input, Spin, Typography, message } from "antd";
import { useState } from "react";
import { BiSend } from "react-icons/bi";

interface ProjectResult {
  projectId: string;
  projectName: string;
  oneLiner: string;
}

interface ChatMessage {
  question: string;
  results: ProjectResult[];
}

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
          limit: 10,
          userId: user?._id,
        }
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

  return (
    <Flex
      vertical
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        minHeight: "80vh",
      }}
    >
      {/* Page Title */}
      <Typography.Title level={2} style={{ marginBottom: 24 }}>
        Project Search
      </Typography.Title>
      <Typography.Paragraph
        style={{ marginBottom: 32, fontSize: FONT_SIZE.PARA }}
      >
        Search for projects using natural language. Try: &quot;apartments near
        Whitefield&quot;, &quot;3 BHK near Outer Ring Road&quot;, or
        &quot;projects with swimming pool&quot;
      </Typography.Paragraph>

      {/* Chat History Display */}
      <Flex vertical gap={24} style={{ marginBottom: 24, flex: 1 }}>
        {chatHistory.map((msg, idx) => (
          <Flex key={idx} vertical gap={12}>
            {/* Question Display */}
            <Flex
              style={{
                backgroundColor: COLORS.textColorDark,
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              <Typography.Text
                style={{
                  color: "white",
                  fontSize: FONT_SIZE.HEADING_3,
                }}
              >
                {msg.question}
              </Typography.Text>
            </Flex>

            {/* Answer Display */}
            <Flex vertical gap={8} style={{ marginTop: 8 }}>
              <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
                Found {msg.results.length} matching project
                {msg.results.length !== 1 ? "s" : ""}:
              </Typography.Text>
              <BrickChatResults results={msg.results} />
            </Flex>
          </Flex>
        ))}

        {/* Current Question Loading State */}
        {currentQuestion && loading && (
          <Flex vertical gap={12}>
            <Flex
              style={{
                backgroundColor: COLORS.textColorDark,
                padding: "12px 16px",
                borderRadius: 8,
              }}
            >
              <Typography.Text
                style={{
                  color: "white",
                  fontSize: FONT_SIZE.HEADING_3,
                }}
              >
                {currentQuestion}
              </Typography.Text>
            </Flex>
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
      <Form form={form} onFinish={handleSearch} style={{ marginTop: 24 }}>
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
  );
}
