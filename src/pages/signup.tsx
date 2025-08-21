import { Button, Flex, Form, Input, message, Typography } from "antd";
import PhoneInput from "antd-phone-input";
import { useDevice } from "../hooks/use-device";

import { useState } from "react";
import { useCreateUserMutation } from "../hooks/user-hooks";
import { getUserByMobile } from "../libs/api/user";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function SignUpForm() {
  const [form] = Form.useForm();

  const { isTabletOrMobile } = useDevice();

  const createUserMutation = useCreateUserMutation({ enableToasts: false });

  const [signUpStatus, setSignUpStatus] = useState<"EXISTS" | "NEW">();

  const handleOnSubmit = async () => {
    const values = await form.validateFields();

    let phoneNumber;
    let countryCode;

    if (values.mobile) {
      phoneNumber =
        values.mobile.countryCode +
        values.mobile.areaCode +
        values.mobile.phoneNumber;

      countryCode = values.mobile.countryCode;
    }

    const userAlreadyExists = await getUserByMobile(phoneNumber);

    if (userAlreadyExists) {
      setSignUpStatus("EXISTS");
      form.resetFields();
    } else {
      await createUserMutation
        .mutateAsync({
          userData: {
            mobile: phoneNumber,
            countryCode: countryCode,
            profile: {
              ...values,
            },
          },
        })
        .then((data) => {
          setSignUpStatus("NEW");
          form.resetFields();
        })
        .catch((err) => {
          message.error("Please try again later");
        });
    }
  };

  return (
    <>
      <Flex
        vertical={isTabletOrMobile}
        style={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
        }}
      >
        <Flex
          vertical
          style={{
            width: isTabletOrMobile ? "calc(100% - 64px)" : "calc(50% - 64px)",
            padding: "0 32px",
            backgroundColor: COLORS.bgColorDark,
          }}
        >
          <img
            src="./logo-name.png"
            style={{
              width: 100,
              marginBottom: 16,
              marginTop: 24,
              marginLeft: -8,
            }}
          ></img>
          <div
            style={{
              display: "flex",
              overflowX: "scroll",
              margin: "auto",
              justifyContent: isTabletOrMobile ? "flex-start" : "center",
              scrollbarWidth: "none",
            }}
          >
            <img
              src="./images/home-demo.png"
              style={{ width: isTabletOrMobile ? 400 : 600 }}
            ></img>
          </div>
        </Flex>
        <div
          style={{
            width: isTabletOrMobile
              ? "calc(100vw - 64px)"
              : "calc(50% - 128px)",
            padding: isTabletOrMobile ? "32px" : "40px 64px",
          }}
        >
          {signUpStatus === "EXISTS" ? (
            <Flex vertical style={{ marginTop: 100 }} align="flex-start">
              <Typography.Title level={2}>Thank You!</Typography.Title>

              <Typography.Title
                level={4}
                style={{ fontWeight: "normal", marginTop: 0 }}
              >
                Click button below & login with your mobile number.
              </Typography.Title>
              <Button
                style={{ marginTop: 32 }}
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Starting Exploring Projects
              </Button>
            </Flex>
          ) : signUpStatus === "NEW" ? (
            <Flex
              vertical
              justify="center"
              style={{ height: "100%" }}
              align="flex-start"
            >
              <Typography.Title level={2}>Thank You!</Typography.Title>

              <Typography.Title
                level={4}
                style={{ fontWeight: "normal", margin: 0 }}
              >
                Click button below & login with your mobile number.
              </Typography.Title>
              <Button
                style={{ marginTop: 32 }}
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Starting Exploring Projects
              </Button>
            </Flex>
          ) : (
            <>
              <Flex vertical style={{ marginBottom: 24 }}>
                <Typography.Text
                  style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: "bold" }}
                >
                  Explore Farmlands For Sale Near Bangalore
                </Typography.Text>
                <Typography.Text>
                  Sign Up for Exclusive Access to Brickfi
                </Typography.Text>
              </Flex>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleOnSubmit}
                style={{
                  marginTop: 16,
                  maxWidth: "400px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                <Form.Item
                  label="Your Name"
                  name="name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Your Email"
                  name="email"
                  rules={[
                    { required: true },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input />
                </Form.Item>

                {/* <Form.Item
                  label="Your Linkedin Profile"
                  name="linkedin"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item> */}

                <Form.Item
                  label="Your Current City & Country"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Your Mobile Number"
                  name="mobile"
                  rules={[{ required: true }]}
                  initialValue={{
                    countryCode: 91,
                    isoCode: "in",
                  }}
                >
                  <PhoneInput enableArrow enableSearch disableParentheses />
                </Form.Item>

                <Form.Item>
                  <Button
                    loading={createUserMutation.isPending}
                    type="primary"
                    htmlType="submit"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </Flex>
    </>
  );
}
