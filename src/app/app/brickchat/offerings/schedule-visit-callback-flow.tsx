"use client";

import { DatePicker, Flex, Form, Input, Select, Switch } from "antd";
import {
  ContactConsent,
  contactFrom,
  fieldLabel,
  FlowFooter,
  MobileField,
  REQUEST_OPTION_DEFAULTS,
  RequestOptions,
  ToggleSection,
  useRequestOptions,
} from "./flow-shared";
import type { OfferingFlowProps } from "./types";

// ---------------------------------------------------------------------------
// schedule-visit-callback (Brickfi Builder Buy)
// ---------------------------------------------------------------------------

// sent as the label, so the ticket reads as-is
const VISIT_TIME_SLOTS = [
  "Morning (9 AM – 12 PM)",
  "Afternoon (12 PM – 4 PM)",
  "Evening (4 PM – 7 PM)",
].map((slot) => ({ label: slot, value: slot }));

// project-dropdown entry for a project not in the conversation - sent as
// otherProject: true, with the project named in the (then required) query
const OTHER_PROJECT = "__other__";

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
  const { anySelected, taskMissingQuery } = useRequestOptions(form);
  const projectIds: string[] = Form.useWatch("projectIds", form) || [];
  const otherProject = scheduleVisit && projectIds.includes(OTHER_PROJECT);
  // something to act on: a visit, a task, a call with an expert
  const canSubmit = (scheduleVisit || anySelected) && !taskMissingQuery;

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={false}
      disabled={submitting}
      initialValues={{
        scheduleVisit: false,
        ...REQUEST_OPTION_DEFAULTS,
        // preselect the project being discussed, when there's exactly one
        projectIds:
          context.projects.length === 1 ? [context.projects[0].projectId] : [],
      }}
      onFinish={(values) =>
        onSubmit({
          scheduleVisit: !!values.scheduleVisit,
          createTask: !!values.createTask,
          askExpertToContact: !!values.askExpertToContact,
          ...(values.scheduleVisit
            ? {
                projects: context.projects.filter((p) =>
                  values.projectIds.includes(p.projectId),
                ),
                ...(values.projectIds.includes(OTHER_PROJECT)
                  ? { otherProject: true }
                  : {}),
                visitDate: values.visitDate.format("YYYY-MM-DD"),
                visitTime: values.visitTime,
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
          borderRadius: 8,
        }}
      >
        <ToggleSection
          title="Looking to schedule a visit?"
          note="We will arrange a visit at your convenient time and get back with a confirmation."
          open={scheduleVisit}
          toggle={
            <Form.Item name="scheduleVisit" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          }
        >
          <Form.Item
            name="projectIds"
            label={fieldLabel("Which project(s) would you like to visit?")}
            rules={[{ required: true, message: "Please choose a project" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select projects"
              options={[
                ...context.projects.map((p) => ({
                  label: p.projectName,
                  value: p.projectId,
                })),
                {
                  label: "Other (mention in your query)",
                  value: OTHER_PROJECT,
                },
              ]}
              optionFilterProp="label"
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
          <Form.Item
            name="visitTime"
            label={fieldLabel("Preferred time")}
            rules={[{ required: true, message: "Please choose a time" }]}
          >
            <Select placeholder="Select a time" options={VISIT_TIME_SLOTS} />
          </Form.Item>
        </ToggleSection>

        <Form.Item
          name="query"
          rules={[
            {
              required: otherProject,
              whitespace: true,
              message: "Please mention the project you'd like to visit",
            },
          ]}
          // otherwise the rule above sets it
          validateStatus={taskMissingQuery ? "error" : undefined}
        >
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 6 }}
            maxLength={1000}
            placeholder={
              otherProject
                ? "Type in your query - mention the project you'd like to visit"
                : "Type in your query"
            }
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
