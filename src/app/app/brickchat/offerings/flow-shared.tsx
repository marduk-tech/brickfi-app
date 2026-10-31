"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Form, Input, Typography } from "antd";
import type { OfferingFlowContext } from "./types";

// Form pieces shared by the offering flows

export const fieldLabel = (text: string) => (
  <Typography.Text style={{ fontSize: FONT_SIZE.PARA, fontWeight: 500 }}>
    {text}
  </Typography.Text>
);

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

export function FlowFooter({
  submitting,
  onCancel,
  submitLabel,
  disabled = false,
}: {
  submitting: boolean;
  onCancel: () => void;
  submitLabel: string;
  /** e.g. until the flow has something to act on */
  disabled?: boolean;
}) {
  return (
    <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
      <Button onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        loading={submitting}
        disabled={disabled}
      >
        {submitLabel}
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
        initial a call. By creating this request, you agree to be contacted by a
        Brickfi Expert only with respect to your query.
      </Typography.Text>
    </Flex>
  );
}
