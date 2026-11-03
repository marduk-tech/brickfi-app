"use client";

import { COLORS } from "@/theme/style-constants";
import { Flex, Form, Input } from "antd";
import {
  ContactConsent,
  contactFrom,
  ExpertCallField,
  FlowFooter,
  MobileField,
  queryLabel,
} from "./flow-shared";
import type { OfferingFlowProps } from "./types";

// ---------------------------------------------------------------------------
// free-legal-consulation (Brickfi Legal Assist)
// ---------------------------------------------------------------------------

export default function LegalConsultationFlow({
  context,
  submitting,
  onSubmit,
  onCancel,
}: OfferingFlowProps) {
  const [form] = Form.useForm();
  const query: string = Form.useWatch("query", form) || "";
  const askExpert: boolean = Form.useWatch("askExpertToContact", form) || false;
  // something to act on: a question, or a request for an expert to call
  const canSubmit = !!query.trim() || askExpert;

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      disabled={submitting}
      initialValues={{ askExpertToContact: false }}
      onFinish={(values) =>
        onSubmit({
          ...(values.query?.trim() ? { query: values.query.trim() } : {}),
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
          label={queryLabel("Create a Task for Me")}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            placeholder="Enter your query"
          />
        </Form.Item>

        <ExpertCallField />

        <MobileField context={context} />
      </Flex>

      <ContactConsent />

      <FlowFooter
        submitting={submitting}
        onCancel={onCancel}
        disabled={!canSubmit}
      />
    </Form>
  );
}
