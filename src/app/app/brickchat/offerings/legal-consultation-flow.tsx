"use client";

import { COLORS } from "@/theme/style-constants";
import { Flex, Form, Input } from "antd";
import {
  ContactConsent,
  contactFrom,
  FlowFooter,
  MobileField,
  REQUEST_OPTION_DEFAULTS,
  RequestOptions,
  useRequestOptions,
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
  const { anySelected, taskMissingQuery, queryPlaceholder } =
    useRequestOptions(form);
  // something to act on: a task, or a call with an expert
  const canSubmit = anySelected && !taskMissingQuery;

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      disabled={submitting}
      initialValues={REQUEST_OPTION_DEFAULTS}
      onFinish={(values) =>
        onSubmit({
          ...(values.query?.trim() ? { query: values.query.trim() } : {}),
          createTask: !!values.createTask,
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
          validateStatus={taskMissingQuery ? "error" : undefined}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            placeholder={queryPlaceholder}
          />
        </Form.Item>

        <RequestOptions callFirst={true}/>

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
