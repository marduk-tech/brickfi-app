"use client";

import { COLORS } from "@/theme/style-constants";
import { Checkbox, DatePicker, Flex, Form, Input, Select, Switch } from "antd";
import {
  ContactConsent,
  contactFrom,
  fieldLabel,
  FlowFooter,
  MobileField,
} from "./flow-shared";
import type { OfferingFlowProps } from "./types";

// ---------------------------------------------------------------------------
// schedule-visit-callback (Brickfi Builder Buy)
// ---------------------------------------------------------------------------

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export default function ScheduleVisitCallbackFlow({
  context,
  submitting,
  onSubmit,
  onCancel,
}: OfferingFlowProps) {
  const [form] = Form.useForm();
  const scheduleVisit: boolean = Form.useWatch("scheduleVisit", form) || false;
  const askExpert: boolean = Form.useWatch("askExpertToContact", form) || false;
  const query: string = Form.useWatch("query", form) || "";
  // something to act on: a visit, a callback, or a question
  const canSubmit = scheduleVisit || askExpert || !!query.trim();

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      disabled={submitting}
      initialValues={{
        scheduleVisit: false,
        askExpertToContact: false,
        // preselect the project being discussed, when there's exactly one
        projectIds:
          context.projects.length === 1 ? [context.projects[0].projectId] : [],
      }}
      onFinish={(values) =>
        onSubmit({
          scheduleVisit: !!values.scheduleVisit,
          askExpertToContact: !!values.askExpertToContact,
          ...(values.scheduleVisit
            ? {
                projects: context.projects.filter((p) =>
                  values.projectIds.includes(p.projectId),
                ),
                visitDate: values.visitDate.format("YYYY-MM-DD"),
              }
            : {}),
          ...(values.query?.trim() ? { query: values.query.trim() } : {}),
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
        <Flex
          align="center"
          justify="space-between"
          gap={12}
          style={{ marginBottom: 16 }}
        >
          {fieldLabel("Looking to schedule a visit?")}
          <Form.Item name="scheduleVisit" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </Flex>

        {scheduleVisit && (
          <>
            <Form.Item
              name="projectIds"
              label={fieldLabel("Which project(s) would you like to visit?")}
              rules={[{ required: true, message: "Please choose a project" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select projects"
                options={context.projects.map((p) => ({
                  label: p.projectName,
                  value: p.projectId,
                }))}
                optionFilterProp="label"
                notFoundContent="No projects in this conversation yet"
              />
            </Form.Item>
            <Form.Item
              name="visitDate"
              label={fieldLabel("Preferred visit date")}
              rules={[{ required: true, message: "Please choose a date" }]}
            >
              <DatePicker
                format="DD MMM YYYY"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  !!current && current.valueOf() < startOfToday()
                }
                inputReadOnly
              />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="query"
          label={fieldLabel("Type in your question (optional)")}
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            maxLength={1000}
            placeholder="e.g. preferred time to call, configurations you're considering, or any questions"
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
        submitLabel={
          scheduleVisit
            ? "Schedule visit"
            : askExpert
            ? "Request callback"
            : "Raise Request"
        }
        disabled={!canSubmit}
      />
    </Form>
  );
}
