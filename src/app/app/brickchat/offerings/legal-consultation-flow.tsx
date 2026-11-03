"use client";

import { COLORS } from "@/theme/style-constants";
import { Flex, Form, Input, Radio } from "antd";
import {
  ContactConsent,
  contactFrom,
  ExpertCallField,
  fieldLabel,
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
          propertyStage: values.propertyStage,
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
          name="propertyStage"
          label={fieldLabel("Is the property under construction or a resale?")}
          rules={[{ required: true, message: "Please choose one" }]}
        >
          <Radio.Group>
            <Radio value="under-construction">Under construction</Radio>
            <Radio value="resale">Resale</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="query"
          label={queryLabel("Type in your query (optional)")}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            placeholder="e.g. title verification, reviewing the sale agreement, or a specific legal question"
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
