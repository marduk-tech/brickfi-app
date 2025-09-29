import { Button, Flex, Form, Input, Typography } from "antd";
import PhoneInput from "antd-phone-input";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useUser } from "../hooks/use-user";
import { safeWindow } from "../libs/browser-utils";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function LoginForm({ onMobVerified }: { onMobVerified?: any }) {
  // auth
  const {
    generateOtp: generateOtpMutation,
    login: loginMutation,
    loginStatus,
    setLoginStatus,
  } = useAuth();
  const [resendTimer, setResendTimer] = useState(45);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "error" | "success" | "info"
  >("info");

  const [form] = Form.useForm();

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0 && loginStatus === "OTP_SENT") {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, loginStatus]);

  const generateOtp = async ({
    mobile,
    countryCode,
  }: {
    mobile: string;
    countryCode: string;
  }) => {
    try {
      await generateOtpMutation.mutateAsync({
        mobile: mobile,
        countryCode: countryCode,
      });

      setFeedbackText("OTP sent. Please verify.");
      setFeedbackType("success");
      setLoginStatus("OTP_SENT");
      setResendTimer(45);
    } catch (error: any) {
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setFeedbackText(error.response.data.message);
      } else {
        setFeedbackText("Failed to send OTP. Please try again.");
      }
      setFeedbackType("error");
    }
  };

  const handleGenerateOtp = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    try {
      const values = await form.validateFields();

      let phoneNumber;
      let countryCode;

      if (values.mobileNumber) {
        phoneNumber =
          values.mobileNumber.areaCode + values.mobileNumber.phoneNumber;
        countryCode = values.mobileNumber.countryCode;
      }

      setFeedbackText("Sending OTP. Please wait..");
      setFeedbackType("info");
      await generateOtp({ mobile: phoneNumber, countryCode: `${countryCode}` });
    } catch (error) {
      console.error("Error generating OTP:", error);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    try {
      const values = await form.validateFields();

      setFeedbackText("Verifying OTP. Please wait..");
      setFeedbackType("info");

      const response = await loginMutation.mutateAsync({
        code: values.otp,
        mobile: values.mobileNumber,
      });

      if (response?.data?.user) {
        console.log(
          "Login successful, user authenticated:",
          response.data.user
        );

        setFeedbackText("Verification successful!");
        setFeedbackType("success");
        setLoginStatus("LOGIN_SUCCESS");

        if (onMobVerified) {
          console.log("Calling onMobVerified callback");
          onMobVerified(response.data.user);
        }

        setTimeout(() => {
          form.resetFields();
          setLoginStatus("EDIT_MOBILE");
          setFeedbackText("");
        }, 1500);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setFeedbackText("Incorrect OTP. Please try again");
      setFeedbackType("error");
      form.resetFields(["otp"]);
      setLoginStatus("OTP_SENT");
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 8,
          borderRadius: 4,
        }}
      >
        {/* <Divider style={{ marginTop: 8, marginBottom: 32 }} /> */}

        <Flex>
          <Form
            style={{ width: "100%" }}
            form={form}
            layout="vertical"
            onFinish={(e) => e.preventDefault()}
          >
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                return (
                  <>
                    <Form.Item
                      label=""
                      name="mobileNumber"
                      validateTrigger="onSubmit"
                      rules={[
                        {
                          required: true,
                          message: "Please input your mobile number!",
                        },

                        {
                          validator: (_, value) => {
                            const mobile = value.areaCode + value.phoneNumber;

                            console.log(mobile);

                            return value && mobile.length >= 10
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error(
                                    "Mobile number must be at least 10 digits long!"
                                  )
                                );
                          },
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                      initialValue={{
                        countryCode: 91,
                        isoCode: "in",
                      }}
                    >
                      <PhoneInput
                        disabled={loginStatus === "OTP_SENT"}
                        placeholder="Enter 10 digit mobile "
                        enableArrow
                        enableSearch
                        disableParentheses
                      />
                    </Form.Item>

                    {loginStatus === "OTP_SENT" && (
                      <Button
                        type="link"
                        size="small"
                        style={{ padding: 0 }}
                        onClick={() => {
                          setLoginStatus("EDIT_MOBILE");
                          form.resetFields(["otp"]);
                          setFeedbackText("");
                        }}
                      >
                        Edit number
                      </Button>
                    )}

                    {loginStatus === "OTP_SENT" && (
                      <>
                        <Form.Item
                          label="OTP"
                          name="otp"
                          rules={[
                            {
                              required: true,
                              message: "Please input the OTP!",
                            },
                          ]}
                          validateTrigger="onSubmit"
                          style={{ marginBottom: 0, marginTop: 20 }}
                        >
                          <Input
                            style={{
                              width: "100%",
                              fontSize: FONT_SIZE.HEADING_3,
                            }}
                            placeholder="Enter the OTP"
                            maxLength={6}
                            disabled={loginMutation.isPending}
                          />
                        </Form.Item>

                        <Button
                          disabled={resendTimer > 0 || loginMutation.isPending}
                          style={{
                            padding: 0,
                            color:
                              resendTimer > 0 || loginMutation.isPending
                                ? COLORS.textColorLight
                                : COLORS.textColorDark,
                          }}
                          type="link"
                          onClick={() => {
                            const mobile = getFieldValue("mobileNumber");

                            const phoneNumber =
                              mobile.countryCode +
                              mobile.areaCode +
                              mobile.phoneNumber;

                            setFeedbackText("Sending OTP. Please wait..");
                            setFeedbackType("info");
                            generateOtp({
                              mobile: phoneNumber,
                              countryCode: `${mobile.countryCode}`,
                            });
                          }}
                          size="small"
                        >
                          {resendTimer > 0 ? (
                            <>Resend OTP in {resendTimer} sec</>
                          ) : (
                            <>Resend OTP</>
                          )}
                        </Button>
                      </>
                    )}
                  </>
                );
              }}
            </Form.Item>
            <Form.Item style={{ marginTop: 32 }}>
              <Button
                type="primary"
                loading={
                  generateOtpMutation.isPending || loginMutation.isPending
                }
                onClick={
                  loginStatus === "OTP_SENT" ? handleLogin : handleGenerateOtp
                }
                style={{
                  fontSize: FONT_SIZE.HEADING_3,
                  height: 40,
                  backgroundColor: COLORS.textColorDark,
                }}
              >
                {loginStatus === "OTP_SENT" ? "Verify OTP" : "Send OTP"}
              </Button>
              {feedbackText && (
                <Typography.Text
                  style={{
                    display: "block",
                    marginTop: 16,
                    fontSize: FONT_SIZE.HEADING_3,
                    color:
                      feedbackType === "error"
                        ? COLORS.redIdentifier
                        : feedbackType === "success"
                        ? COLORS.greenIdentifier
                        : COLORS.textColorMedium,
                  }}
                >
                  {feedbackText}
                </Typography.Text>
              )}
            </Form.Item>
          </Form>
        </Flex>
      </div>
    </>
  );
}
