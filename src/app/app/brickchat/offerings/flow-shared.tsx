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

// What a section does, right under its heading - the same small grey text
// for the visit switch, the query box and the expert-call checkbox
export function FieldNote({ children }: { children: React.ReactNode }) {
  return (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
    >
      {children}
    </Typography.Text>
  );
}

// A bordered, switch-expanded block (the visit request, home loan offers):
// heading + note with the switch on the right, its fields below while on.
// `keepMounted` hides rather than unmounts the fields when off, for a block
// whose entered state should survive toggling (it mustn't hold fields the
// enclosing form validates, or they'd block submit while hidden)
export function ToggleSection({
  title,
  note,
  toggle,
  open,
  keepMounted = false,
  children,
}: {
  title: React.ReactNode;
  note?: React.ReactNode;
  /** the Switch - a Form.Item-wrapped one, or a controlled one */
  toggle: React.ReactNode;
  open: boolean;
  keepMounted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Flex
      vertical
      style={{
        border: `1px solid ${COLORS.borderColor}`,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
      }}
    >
      <Flex align="center" justify="space-between" gap={12}>
        <Flex vertical gap={2}>
          {typeof title === "string" ? (
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
            >
              {title}
            </Typography.Text>
          ) : (
            title
          )}
          {note ? <FieldNote>{note}</FieldNote> : null}
        </Flex>
        {toggle}
      </Flex>
      {open || keepMounted ? (
        <div style={{ marginTop: 16, display: open ? undefined : "none" }}>
          {children}
        </div>
      ) : null}
    </Flex>
  );
}

// Every flow's query-box label - larger than the other fields' labels, with
// what happens to a typed-in query right under it (above the box)
export const queryLabel = (text: string) => (
  <Flex vertical gap={2}>
    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}>
      {text}
    </Typography.Text>
    <FieldNote>
      Just type in your query. I will work on it and reply to your query
      directly through a message within 24-48 hrs. No additional calls.
    </FieldNote>
  </Flex>
);

// The askExpertToContact checkbox every flow ends with - the box on its own
// line, its label (clickable, via htmlFor) and what ticking it means below
const EXPERT_CALL_ID = "askExpertToContact";

export function ExpertCallField() {
  return (
    <Flex vertical gap={2} style={{ marginTop: 16, marginBottom: 24 }}>
      <Form.Item name="askExpertToContact" valuePropName="checked" noStyle>
        <Checkbox id={EXPERT_CALL_ID} />
      </Form.Item>
      <label htmlFor={EXPERT_CALL_ID} style={{ cursor: "pointer" }}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
        >
          Free 15 min Consultation with Brickfi Expert
        </Typography.Text>
      </label>
      <FieldNote>
        A free 15 min call with a Brickfi Expert will be scheduled at your
        convenience.
      </FieldNote>
    </Flex>
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
