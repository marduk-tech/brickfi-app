import { Button, Flex, Form, Input, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
  useUpdateUserMutation,
} from "../../hooks/user-hooks";
import { FONT_SIZE } from "../../theme/style-constants";

export function BrickAssistCallback({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [form] = Form.useForm();
  const { user } = useUser();
  const createUser = useCreateUserMutation({});
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const sendMail = useSendUserMailMutation();

  const [formSuccess, setFormSuccess] = useState(false);
  const [alreadyRequested, setAlreadyRequested] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.profile.name,
        mobile: user.mobile,
      });
      if (user.status && user.status !== "new-lead") {
        setAlreadyRequested(true);
      }
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

  const handleClose = () => {
    setFormSuccess(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      closable={true}
      onClose={handleClose}
      onCancel={handleClose}
      footer={null}
    >
      <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
        {alreadyRequested ? (
          <Flex vertical>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1,
                lineHeight: "120%",
                marginBottom: 16,
              }}
            >
              We are processing your request.
            </Typography.Text>
            <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
              Looks like you have already requested a callback. One of our team
              members will reach out shortly.
            </Typography.Text>
          </Flex>
        ) : (
          <>
            {formSuccess ? (
              <Flex vertical>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                    marginBottom: 16,
                  }}
                >
                  Wohoo! Your request is submitted.
                </Typography.Text>
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
                  Thank you for your request. Our team will call you back at
                  your preferred time.
                </Typography.Text>
              </Flex>
            ) : (
              <Flex vertical>
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
                  Provide Your Details
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{
                    marginTop: 16,
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

            <Flex justify="flex-end" style={{ marginTop: 24 }} gap={16}>
              <Button onClick={handleClose}>{"Cancel"}</Button>
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
          </>
        )}
      </Flex>
    </Modal>
  );
}
