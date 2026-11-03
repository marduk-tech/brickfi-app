"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Checkbox, Flex, Form, Input, Typography } from "antd";
import type { OfferingFlowContext } from "./types";

// Form pieces shared by the offering flows

export const fieldLabel = (text: string) => (
  <Typography.Text style={{ fontSize: FONT_SIZE.PARA, fontWeight: 500 }}>
    {text}
  </Typography.Text>
);

// Every flow's query-box label - larger than the other fields' labels, with
// what happens to a typed-in query right under it (above the box)
export const queryLabel = (text: string) => (
  <Flex vertical gap={2}>
    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}>
      {text}
    </Typography.Text>
    <Typography.Text
      style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
    >
      I will reply to your query directly through a message within 24-48 hrs.
      No additional calls.
    </Typography.Text>
  </Flex>
);

// The askExpertToContact checkbox every flow ends with, with what ticking it
// means underneath
export function ExpertCallField() {
  return (
    <Form.Item
      name="askExpertToContact"
      valuePropName="checked"
      extra="A free 15 min call will be scheduled at your convenience."
    >
      <Checkbox>Schedule a Free 15 min consultation with Brickfi Expert</Checkbox>
    </Form.Item>
  );
}

// The contact a ticket carries - the signed-in user's own number, or one the
// guest types in (asked for by MobileField below)
export const contactFrom = (
  context: OfferingFlowContext,
  values: { mobile?: string },
) => ({
  name: context.name,
  mobile: context.mobile || values.mobile?.trim(),
  countryCode: context.countryCode || "91",
});

// Asked only when the user isn't signed in - a ticket our team can't call
// back on is useless
export function MobileField({ context }: { context: OfferingFlowContext }) {
  if (context.mobile) return null;
  return (
    <Form.Item
      name="mobile"
      label={fieldLabel("Mobile number")}
      rules={[
        { required: true, message: "Please enter your mobile number" },
        {
          pattern: /^[6-9]\d{9}$/,
          message: "Please enter a valid 10-digit mobile number",
        },
      ]}
    >
      <Input addonBefore="+91" inputMode="numeric" maxLength={10} />
    </Form.Item>
  );
}

// every flow submits with the same "Raise Request" button
export function FlowFooter({
  submitting,
  onCancel,
  disabled = false,
  form,
}: {
  submitting: boolean;
  onCancel: () => void;
  /** e.g. until the flow has something to act on */
  disabled?: boolean;
  /** the Form's name, when the footer is rendered outside that form */
  form?: string;
}) {
  return (
    <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
      <Button onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        form={form}
        loading={submitting}
        disabled={disabled}
      >
        Raise Request
      </Button>
    </Flex>
  );
}

// The terms every request is sent on - shown ticked and disabled, so it reads
// as what submitting means rather than a choice; each flow's data records it
// as consentToContact: true
export function ContactConsent() {
  return (
    <Flex vertical style={{ margin: "16px 0" }}>
      {/* <DynamicReactIcon size={14} iconName="FaCheckSquare" iconSet="fa" color={COLORS.textColorMedium}></DynamicReactIcon> */}
      {/* the disabled label colour is too faint for terms the user should read */}
      <Typography.Text
        style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
      >
        <span style={{ fontSize: FONT_SIZE.HEADING_3 }}>☑</span>The Brickfi Team
        never intends to reach out unless necessary. Only when additional
        information is required or a detailed discussion is required, we will
        initiate a call. By creating this request, you agree to be contacted by a
        Brickfi Expert only with respect to your query.
      </Typography.Text>
    </Flex>
  );
}
