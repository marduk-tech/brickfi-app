"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import { Alert, Button, Flex, Form, Input, Typography, message } from "antd";
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
}

export const FeedbackForm = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const { isMobile } = useDevice();
  const router = useRouter();
  const submitFeedback = useSubmitFeedbackMutation({ enableToasts: false });
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [feedbackAnswers, setFeedbackAnswers] = useState<FeedbackAnswer[]>([
    { question: "How did you hear about Brickfi?", answer: "" },
    { question: "What did you find helpful?", answer: "" },
    { question: "What did you not find helpful?", answer: "" },
    { question: "Any other feedback?", answer: "" },
  ]);

  const handleFeedbackChange = (index: number, value: string) => {
    const updated = [...feedbackAnswers];
    updated[index].answer = value;
    setFeedbackAnswers(updated);
  };

  const handleNext = async () => {
    const allFilled = feedbackAnswers.every(
      (item) => item.answer.trim() !== ""
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
            backgroundImage: `url(/images/landing/brick360-request-1.png)`,
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
              padding: 16,
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
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "100%",
                    marginBottom: 24,
                  }}
                >
                  We&apos;d love to hear from you!
                </Typography.Text>

                <Flex vertical style={{ width: "100%", maxWidth: 500 }}>
                  {feedbackAnswers.map((item, index) => (
                    <Flex key={index} vertical style={{ marginBottom: 16 }}>
                      <Typography.Text
                        style={{
                          marginBottom: 8,
                          fontWeight: 500,
                        }}
                      >
                        {item.question}
                      </Typography.Text>
                      {index === 0 ? (
                        <Input
                          value={item.answer}
                          onChange={(e) =>
                            handleFeedbackChange(index, e.target.value)
                          }
                          placeholder="Your answer..."
                        />
                      ) : (
                        <TextArea
                          rows={3}
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
                    marginBottom: 16,
                  }}
                >
                  Please share your contact details
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
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
                  We appreciate your time and feedback. It helps us improve our
                  services.
                </Typography.Text>

                <Button
                  type="primary"
                  size="large"
                  style={{ marginTop: 24 }}
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
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
