"use client";

import { COLORS } from "@/theme/style-constants";
import { Checkbox, Flex, Form, Input } from "antd";
import {
  ContactConsent,
  contactFrom,
  fieldLabel,
  FlowFooter,
  MobileField,
} from "./flow-shared";
import type { OfferingFlowProps } from "./types";

// ---------------------------------------------------------------------------
// brkfi-expert (Brickfi Expert Help)
// ---------------------------------------------------------------------------

export default function ExpertHelpFlow({
  context,
  offeringContext,
  submitting,
  onSubmit,
  onCancel,
}: OfferingFlowProps) {
  const [form] = Form.useForm();
  const query: string = Form.useWatch("query", form) || "";
  const askExpert: boolean = Form.useWatch("askExpertToContact", form) || false;
  // something to act on: a request, or a request for an expert to call
  const canSubmit = !!query.trim() || askExpert;

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      disabled={submitting}
      initialValues={{
        // the next step the answer offered, e.g. which project to onboard -
        // editable, so the user can add to it
        query: offeringContext || "",
        askExpertToContact: false,
      }}
      onFinish={(values) =>
        onSubmit({
          ...(values.query?.trim() ? { query: values.query.trim() } : {}),
          // what was prefilled, kept even if the user edits the request
          ...(offeringContext ? { offeringContext } : {}),
          askExpertToContact: !!values.askExpertToContact,
          consentToContact: true,
          contact: contactFrom(context, values),
        })
      }
    >
      <Flex
        vertical
        style={{
          padding: 8,
          backgroundColor: COLORS.bgColorBlue,
          borderRadius: 8,
        }}
      >
        <Form.Item
          name="query"
          label={fieldLabel("What would you like us to do?")}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            placeholder="e.g. details on a project, or anything else we can help with"
          />
        </Form.Item>

        <Form.Item name="askExpertToContact" valuePropName="checked">
          <Checkbox>Ask a Brickfi expert to contact me</Checkbox>
        </Form.Item>

        <MobileField context={context} />
      </Flex>

      <ContactConsent />

      <FlowFooter
        submitting={submitting}
        onCancel={onCancel}
        submitLabel="Raise Request"
        disabled={!canSubmit}
      />
    </Form>
  );
}
