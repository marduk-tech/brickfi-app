"use client";

import { Button, Flex, Form, Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
  useUpdateUserMutation,
} from "../../hooks/user-hooks";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";

export function BrickfiCallback() {
  const [form] = Form.useForm();
  const { user } = useUser();
  const { isMobile } = useDevice();
  const createUser = useCreateUserMutation({});
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const sendMail = useSendUserMailMutation();

  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.profile.name,
        mobile: user.mobile,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    let userId = user?._id;

    if (user) {
      await updateUser.mutateAsync({
        userData: {
          status: "callback-request",
          profile: {
            ...user.profile,
            preferredCallbackTime: values.callbackTime,
          },
        },
      });
    } else {
      const newUser = await createUser.mutateAsync({
        userData: {
          mobile: values.mobile,
          status: "callback-request",
          profile: {
            name: values.name,
            preferredCallbackTime: values.callbackTime,
          },
          countryCode: "91",
        },
      });
      userId = newUser._id;
    }

    setFormSuccess(true);
    if (userId) {
      await sendMail.mutateAsync({
        userId,
        emailType: "callback-request",
        params: {
          name: values.name,
          mobile: values.mobile,
          callbackTime: values.callbackTime,
        },
      });
    }
  };

  return (
    <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
      <>
        <LandingHeader></LandingHeader>
        <Flex
          vertical={isMobile}
          style={{
            marginTop: 100,
            width: isMobile ? "90%": "100%",
            maxWidth: 1200,
            margin: "auto",
            paddingTop: 100,
          }}
          gap={64}
        >
          {!isMobile ? (
            <Flex
              style={{ width: isMobile ? "100%" : "40%", height: 600 }}
              align="center"
              justify="flex-start"
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{ height: isMobile ? 250: 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
          <Flex
            vertical
            style={{ width: isMobile ? "100%" : "60%" }}
            align="center"
            justify="center"
          >
            {formSuccess ? (
              <Flex vertical>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1 * 1.3,
                    marginBottom: 24,
                    lineHeight: "100%"
                  }}
                >
                  Get in Touch with a Brickfi Advisor
                </Typography.Text>
                <Flex
                  vertical
                  style={{
                    backgroundColor: COLORS.bgColorBlue,
                    padding: "16px 32px",
                    borderRadius: 16,
                  }}
                >
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_2,
                      fontWeight: 800,
                      lineHeight: "120%",
                    }}
                  >
                    Wohoo! Your request is submitted.
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      lineHeight: "120%",
                    }}
                  >
                    Thank you for your request. A Brickfi Advisor will call you
                    back at your preferred time.
                  </Typography.Text>
                </Flex>
              </Flex>
            ) : (
              <Flex vertical>
                <Typography.Text
                  style={{ fontSize: FONT_SIZE.HEADING_1 * 1.5, lineHeight: "100%" }}
                >
                  Get in Touch with a Brickfi Advisor
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    marginBottom: 8,
                    color: COLORS.textColorMedium,
                    lineHeight: "120%"
                  }}
                >
                  Fill details below and one of our advisors will get in touch
                  with you.
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{
                    marginTop: 32,
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
                    <Input disabled={!!user} />
                  </Form.Item>
                  <Form.Item
                    label="Your Mobile Number"
                    name="mobile"
                    rules={[{ required: true }]}
                  >
                    <Input disabled={!!user} />
                  </Form.Item>
                  <Form.Item
                    label="What's a good day and time to call you ? "
                    name="callbackTime"
                  >
                    <Input placeholder="Sunday after 12pm" />
                  </Form.Item>
                </Form>
              </Flex>
            )}

            <Flex
              style={{ marginTop: 24, alignSelf: "flex-start", marginLeft: 16 }}
              gap={16}
            >
              {formSuccess ? null : (
                <Button
                  onClick={() => form.submit()}
                  type="primary"
                  loading={
                    createUser.isPending ||
                    updateUser.isPending ||
                    sendMail.isPending
                  }
                >
                  {"Submit"}
                </Button>
              )}
            </Flex>
          </Flex>
          {isMobile ? (
            <Flex
              style={{ width: isMobile ? "100" : "40%", height: 600 }}
              align={!isMobile ? "center":"flex-start"}
              justify={isMobile ? "center":"flex-start"}
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{height: isMobile ? 320: 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
        </Flex>
      </>
    </Flex>
  );
}
