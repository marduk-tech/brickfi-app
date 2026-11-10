"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Typography,
  type FormInstance,
} from "antd";
import { useEffect } from "react";
import type { OfferingFlowContext } from "./types";

// Form pieces shared by the offering flows

export const fieldLabel = (text: string) => (
  <Typography.Text style={{ fontSize: FONT_SIZE.PARA, fontWeight: 500 }}>
    {text}
  </Typography.Text>
);

// What a section does, right under its heading - the same small grey text
// for the visit switch and the request options
export function FieldNote({ children }: { children: React.ReactNode }) {
  return (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
    >
      {children}
    </Typography.Text>
  );
}

// A shaded, switch-expanded block (the visit request, home loan offers):
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
        backgroundColor: COLORS.bgColorBlue,
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

// What the user wants done with their request, below the query box - one
// of: a task worked on over messages (createTask), or a call with an expert
// (askExpertToContact). Each is its own boolean in the ticket data, and
// RequestOptions keeps at most one of them true.
export const REQUEST_OPTION_DEFAULTS = {
  createTask: false,
  askExpertToContact: false,
};

export const useRequestOptions = (form: FormInstance) => {
  const createTask: boolean = Form.useWatch("createTask", form) || false;
  const askExpert: boolean = Form.useWatch("askExpertToContact", form) || false;
  const query: string = Form.useWatch("query", form) || "";
  return {
    createTask,
    askExpert,
    anySelected: createTask || askExpert,
    // a task with nothing typed in yet (a task is worked on from what was
    // typed in) - the flow keeps Raise Request disabled and gives the query
    // box a red border, no message, until there is
    taskMissingQuery: createTask && !query.trim(),
    // the query box's prompt, for the card selected below it
    queryPlaceholder: createTask
      ? "Type in your query or what you need"
      : askExpert
      ? "Any additional information you want to provide for the call"
      : "Type in your query",
  };
};

// One selectable card - the whole card is the toggle: a Button (so the
// form's disabled state applies) laid out as title + note, filled with the
// primary colour and white text while selected. Takes checked / onChange
// from its Form.Item; onSelect runs when it's selected.
function RequestOption({
  checked = false,
  onChange,
  onSelect,
  title,
  note,
}: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onSelect: () => void;
  title: string;
  note: string;
}) {
  const textColor = checked ? "white" : undefined;
  return (
    <Button
      block
      aria-pressed={checked}
      onClick={() => {
        onChange?.(!checked);
        if (!checked) onSelect();
      }}
      style={{
        height: "100%",
        padding: 12,
        borderRadius: 8,
        whiteSpace: "normal",
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        border: `1px solid ${checked ? COLORS.primaryColor : COLORS.borderColor}`,
        backgroundColor: checked ? COLORS.primaryColor : "white",
      }}
    >
      <Flex vertical gap={2}>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_4,
            fontWeight: 500,
            color: textColor,
          }}
        >
          {title}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: textColor ?? COLORS.textColorLight,
          }}
        >
          {note}
        </Typography.Text>
      </Flex>
    </Button>
  );
}

// Selecting one card clears the other - a request is either a task or a
// call. The selected one can still be clicked off, for flows where something
// above (a visit, offers) is the request on its own.
export function RequestOptions({
  callFirst = false,
  defaultSelected,
}: {
  /** show the expert call before the task, instead of after it */
  callFirst?: boolean;
  /** the card selected when the options first show - none if left out */
  defaultSelected?: "task" | "call";
}) {
  const form = Form.useFormInstance();

  // Set here, not through the Form's initialValues, which hold both as false
  // and would win over a Form.Item initialValue. Skipped if a card is already
  // selected, so coming back to a flow's step keeps the user's choice.
  useEffect(() => {
    if (
      !defaultSelected ||
      form.getFieldValue("createTask") ||
      form.getFieldValue("askExpertToContact")
    ) {
      return;
    }
    form.setFieldValue(
      defaultSelected === "task" ? "createTask" : "askExpertToContact",
      true,
    );
  }, [defaultSelected, form]);

  const taskOption = (
    <Col key="createTask" xs={24} sm={12}>
      <Form.Item name="createTask" valuePropName="checked" noStyle>
        <RequestOption
          onSelect={() => form.setFieldValue("askExpertToContact", false)}
          title="Create a Task for Me"
          note="I will work on your query and reply directly through a message within 24-48 hrs. No additional calls."
        />
      </Form.Item>
    </Col>
  );
  const callOption = (
    <Col key="askExpertToContact" xs={24} sm={12}>
      <Form.Item name="askExpertToContact" valuePropName="checked" noStyle>
        <RequestOption
          onSelect={() => form.setFieldValue("createTask", false)}
          title="15 min Free Consultation with Brickfi Expert"
          note="A free 15 min call with a Brickfi Expert will be scheduled at your convenience."
        />
      </Form.Item>
    </Col>
  );
  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
      {callFirst ? [callOption, taskOption] : [taskOption, callOption]}
    </Row>
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
// as consentToContact: true. `msg` replaces the default terms.
export function ContactConsent({ msg }: { msg?: React.ReactNode }) {
  return (
    <Flex vertical style={{ margin: "16px 0" }}>
      {/* <DynamicReactIcon size={14} iconName="FaCheckSquare" iconSet="fa" color={COLORS.textColorMedium}></DynamicReactIcon> */}
      {/* the disabled label colour is too faint for terms the user should read */}
      <Typography.Text
        style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
      >
        <span style={{ fontSize: FONT_SIZE.HEADING_3, paddingTop: 1 }}>☑</span>
        {msg ??
          "The Brickfi Team never intends to reach out unless necessary. Only when additional information or a detailed discussion is required, we will initiate a call. By creating this request, you agree to be contacted by a Brickfi Expert only with respect to your query."}
      </Typography.Text>
    </Flex>
  );
}
