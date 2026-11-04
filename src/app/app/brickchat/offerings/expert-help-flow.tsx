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
  const { anySelected, taskMissingQuery } = useRequestOptions(form);
  // something to act on: a task, or a call with an expert
  const canSubmit = anySelected && !taskMissingQuery;

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
        ...REQUEST_OPTION_DEFAULTS,
      }}
      onFinish={(values) =>
        onSubmit({
          ...(values.query?.trim() ? { query: values.query.trim() } : {}),
          // what was prefilled, kept even if the user edits the request
          ...(offeringContext ? { offeringContext } : {}),
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
            placeholder="Type in your query"
          />
        </Form.Item>

        <RequestOptions />

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
