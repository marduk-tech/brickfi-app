"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Radio,
  RadioChangeEvent,
  Select,
  Slider,
  Tag,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LandingHeader from "../../custom-pages/landing/header";
import { useSubmitFeedbackMutation } from "../../hooks/marketing-hooks";
import { useDevice } from "../../hooks/use-device";
import { useUser } from "../../hooks/use-user";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

const { TextArea } = Input;

interface FeedbackAnswer {
  question: string;
  answer: string;
  key: string;
  required: boolean;
}
const sourceOptions = [
  { label: "Direct Email/Message", value: "Direct email or message" },
  {
    label: "Google Search/Other Search",
    value: "Google Search/Other Search",
  },
  {
    label: "AI Chatbot (GPT/Gemini/Perplexity)",
    value: "AI Chatbot (GPT/Gemini/Perplexity)",
  },
  {
    label: "Social Media (Insta/FB/LinkedIn)",
    value: "Social Media (Insta/FB/LinkedIn)",
  },
  { label: "Through a friend", value: "Through a friend" },
  { label: "Other", value: "Other" },
];

export const FeedbackForm = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(7);
  const { user } = useUser();
  const { isMobile } = useDevice();
  const router = useRouter();
  const submitFeedback = useSubmitFeedbackMutation({ enableToasts: false });
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [feedbackAnswers, setFeedbackAnswers] = useState<FeedbackAnswer[]>([
    {
      question: "How did you hear about Brickfi?",
      answer: "",
      key: "source",
      required: true,
    },
    {
      question:
        "On a scale of 1 to 10, how would helpful would you rate the Brick360 report ?",
      answer: "",
      key: "rating",
      required: true,
    },
    {
      question: "What did you find helpful in the report?",
      answer: "",
      key: "helpful",
    },
    {
      question: "What did you find missing/lacking in the report?",
      answer: "",
      key: "helpful",
      required: false,
    },
    {
      question: "Any other feedback?",
      answer: "",
      key: "helpful",
      required: false,
    },
  ]);

  const handleFeedbackChange = (index: number, value: string) => {
    const updated = [...feedbackAnswers];
    updated[index].answer = value;
    setFeedbackAnswers(updated);
  };

  const handleNext = async () => {
    const allFilled = feedbackAnswers.every(
      (item) => !item.required || item.answer !== ""
    );

    if (!allFilled) {
      message.error("Please fill in all feedback fields");
      return;
    }

    if (user) {
      await handleSubmit();
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");

      let contact;
      if (user) {
        contact = {
          name: user.profile.name || " ",
          contact: user._id,
        };
      } else {
        const values = await form.validateFields();
        contact = {
          name: values.name,
          contact: values.contact,
        };
      }

      const feedback = feedbackAnswers.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));

      await submitFeedback.mutateAsync({
        feedbackData: {
          feedback,
          contact,
        },
      });

      setStep(3);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    }
  };

  const renderBanner = () => {
    return (
      <Flex
        style={{
          width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
          padding: 16,
        }}
        justify="center"
      >
        <div
          style={{
            backgroundImage: `url(/images/brickfi-feedback-plchlder.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: isMobile ? 200 : 400,
            width: isMobile ? "100%" : "80%",
          }}
        ></div>
      </Flex>
    );
  };

  return (
    <>
      <LandingHeader
        bgColor="transparent"
        logo="/images/brickfi-logo.png"
        color={COLORS.textColorMedium}
      ></LandingHeader>
      <Flex
        vertical={isMobile}
        style={{
          paddingTop: 72,
          minHeight: "calc(100vh - 100px)",
        }}
        align="center"
      >
        {isMobile ? null : renderBanner()}
        <Flex
          style={{
            width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
            padding: "16px 8px",
            height: "100%",
            maxWidth: 600,
            marginTop: 0,
          }}
          vertical
        >
          <Flex
            vertical
            style={{
              padding: "8px 16px",
              backgroundColor: COLORS.bgColor,
              marginTop: 8,
              border: "1px solid",
              borderColor: COLORS.borderColor,
              borderRadius: 16,
            }}
          >
            {step === 1 && (
              <Flex vertical style={{ padding: "16px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: isMobile
                      ? FONT_SIZE.HEADING_1 * 0.8
                      : FONT_SIZE.HEADING_1,
                    lineHeight: "100%",
                    marginBottom: 4,
                  }}
                >
                  We&apos;d love to hear from you!
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    lineHeight: "130%",
                    marginBottom: 16,
                    color: COLORS.textColorLight,
                  }}
                >
                  We are continously looking to improve our product & services.
                  Your feedback will be immensely helpful.
                </Typography.Text>

                <Flex vertical style={{ width: "100%", maxWidth: 500 }}>
                  {feedbackAnswers.map((item, index) => (
                    <Flex
                      key={index}
                      vertical
                      style={{
                        marginBottom:
                          index == feedbackAnswers.length - 1 ? 0 : 16,
                      }}
                    >
                      <Typography.Text
                        style={{
                          marginBottom: 4,
                          fontWeight: 500,
                        }}
                      >
                        {item.question}
                      </Typography.Text>
                      {item.key === "source" ? (
                        <Select
                          placeholder="Select an option"
                          style={{
                            width: "100%",
                            fontSize: FONT_SIZE.HEADING_3,
                          }}
                          allowClear
                          onChange={(selection: string) => {
                            handleFeedbackChange(index, selection);
                          }}
                        >
                          {sourceOptions.map((option) => (
                            <Select.Option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : item.key == "rating" ? (
                        <Radio.Group
                          value={rating}
                          optionType="button"
                          size="small"
                          onChange={({
                            target: { value },
                          }: RadioChangeEvent) => {
                            console.log("radio3 checked", value);
                            setRating(value);
                            handleFeedbackChange(index, value);
                          }}
                          options={[
                            {
                              value: "1",
                              label: "1",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "2",
                              label: "2",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "3",
                              label: "3",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "4",
                              label: "4",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "5",
                              label: "5",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "6",
                              label: "6",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "7",
                              label: "7",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "8",
                              label: "8",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "9",
                              label: "9",
                              style: { padding: "0 12px" },
                            },
                            {
                              value: "10",
                              label: "10",
                              style: { padding: "0 12px" },
                            },
                          ]}
                        />
                      ) : (
                        <TextArea
                          rows={2}
                          value={item.answer}
                          onChange={(e) =>
                            handleFeedbackChange(index, e.target.value)
                          }
                          placeholder="Your feedback..."
                        />
                      )}
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            )}

            {step === 2 && (
              <Flex vertical style={{ padding: "16px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_2,
                  }}
                >
                  Please share your contact details
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    marginBottom: 16,
                    color: COLORS.textColorLight,
                  }}
                >
                  Just to make sure you are human. We would never spam or call
                  you without your consent.
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  style={{ width: "100%", maxWidth: 500 }}
                >
                  <Form.Item
                    name="name"
                    label="Your Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input placeholder="Enter your name" />
                  </Form.Item>

                  <Form.Item
                    name="contact"
                    label="Your email or mobile number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your email or mobile",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your email or mobile number" />
                  </Form.Item>
                </Form>
              </Flex>
            )}

            {step === 3 && (
              <Flex vertical style={{ padding: "32px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                    marginBottom: 16,
                  }}
                >
                  Thank you for submitting the feedback
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.textColorMedium,
                  }}
                >
                  We appreciate your time and feedback. It helps us improve our
                  services.
                </Typography.Text>

                <Flex gap={8} align="center">
                  <Button
                    type="default"
                    size="small"
                    style={{ marginTop: 24 }}
                    onClick={() => window.location.reload()}
                  >
                    Submit another response
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>

          {step !== 3 && errorMsg && (
            <Alert message={errorMsg} type="error" style={{ marginTop: 16 }} />
          )}

          {step !== 3 && (
            <Flex style={{ marginTop: 16 }} gap={16}>
              {step === 1 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  loading={submitFeedback.isPending}
                  disabled={
                    !feedbackAnswers.every(
                      (item) => !item.required || item.answer !== ""
                    )
                  }
                >
                  {user ? "Submit" : "Next"}
                </Button>
              ) : step === 2 ? (
                <>
                  <Button onClick={() => setStep(1)}>Back</Button>
                  <Button
                    type="primary"
                    loading={submitFeedback.isPending}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </>
              ) : null}
            </Flex>
          )}
        </Flex>
        {isMobile ? renderBanner() : null}
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
};
