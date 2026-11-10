import { Button, Flex, Form, Input, Select, Typography } from "antd";
import { useUser } from "../hooks/use-user";
import { useUpdateUserMutation } from "../hooks/user-hooks";
import { safeWindow } from "../libs/browser-utils";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { useState } from "react";
import DynamicReactIcon from "./common/dynamic-react-icon";

const sourceOptions = [
  {
    label: "Found on Google/Other Search Engine",
    value: "Found on Google or others",
  },
  {
    label: "Via ChatGPT/Gemini/Others",
    value: "Via ChatGPT/Gemini/Others",
  },
  { label: "Social Media (Insta/FB)", value: "Social Media" },
  { label: "Through a Friend", value: "Through a Friend" },
   { label: "Direct email or Whatsapp", value: "Direct email or Whatsapp" },
  { label: "Other", value: "Other" },
];

export function UserDetailsForm({
  ignoreSource = false,
  ignoreCity = true,
}: {
  ignoreSource?: boolean;
  ignoreCity?: boolean;
}) {
  const [form] = Form.useForm();

  const { user } = useUser();
  const [profileUpdated, setProfileUpdated] = useState(false);

  const updateUserMutation = useUpdateUserMutation({
    userId: user?._id as string,
  });

  const handleUserUpdate = async () => {
    const values = await form.validateFields();

    updateUserMutation
      .mutateAsync({
        userData: {
          profile: {
            ...user?.profile,
            ...values,
            name: values.name?.trim(),
          },
        },
      })
      .then((user: any) => {
        setProfileUpdated(true);
        setTimeout(() => {
          safeWindow.location.reload();
        }, 500);
      });
  };

  if (user) {
    return (
      <Form
        style={{ width: "100%", paddingTop: 32 }}
        form={form}
        layout="vertical"
        onFinish={handleUserUpdate}
        initialValues={user.profile}
      >
        <Typography.Text style={{ color: COLORS.primaryColor, marginTop: 16, fontSize: FONT_SIZE.HEADING_2, marginBottom: 48, fontWeight: 500, lineHeight: "110%" }}>
          If you can help us with a few basic details
        </Typography.Text>
        <Form.Item
          label="Your Good Name"
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Please enter your name",
            },
            {
              // counted without surrounding spaces, so "  a " doesn't pass
              validator: (_, value?: string) =>
                !value?.trim() || value.trim().length >= 2
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Name must be at least 2 characters"),
                    ),
            },
          ]}
          validateTrigger="onSubmit"
          style={{ marginTop: 32, marginBottom: 0 }}
        >
          <Input
            style={{
              width: "100%",
              fontSize: FONT_SIZE.HEADING_3,
            }}
            placeholder="Enter your full name"
          />
        </Form.Item>

        <Form.Item
          label="Your Email"
          name="email"
          // emails never contain spaces - drop any typed or pasted in
          normalize={(value?: string) => value?.replace(/\s/g, "")}
          rules={[
            {
              required: true,
              message: "Please enter your email",
            },
            {
              // name@domain.tld, with a 2+ letter top-level domain
              type: "email",
              message: "Please enter a valid email",
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
            placeholder="jondoe@gmail.com"
          />
        </Form.Item>
        

        {!ignoreCity && (
          <Form.Item
            label="Current City Location"
            name="city"
            style={{ marginBottom: 0, marginTop: 20 }}
          >
            <Input
              style={{
                width: "100%",
                fontSize: FONT_SIZE.HEADING_3,
              }}
              placeholder="Enter your city"
            />
          </Form.Item>
        )}

        {!ignoreSource && (
          <Form.Item
            label="How did you get to know about Brickfi?"
            name="source"
            style={{ marginBottom: 0, marginTop: 20 }}
          >
            <Select
              placeholder="Select an option"
              style={{ width: "100%", fontSize: FONT_SIZE.HEADING_3 }}
              allowClear
            >
              {sourceOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 30 }}>
          <Flex gap={8}>
            <Button
              loading={updateUserMutation.isPending}
              type="primary"
              htmlType="submit"
              icon={
                profileUpdated ? (
                  <DynamicReactIcon
                    iconName="IoIosCloudDone"
                    iconSet="io"
                    color="white"
                  ></DynamicReactIcon>
                ) : null
              }
              iconPosition="end"
            >
              {updateUserMutation.isPending
                ? "Saving"
                : profileUpdated
                ? "Saved"
                : "Save"}
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    );
  }
}
