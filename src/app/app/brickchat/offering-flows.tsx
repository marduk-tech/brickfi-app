"use client";

import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Switch,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

// An answer's offering - the CTA buttons shown under its followupPrompt (the
// offering's pitch) or under an answer about the offering itself. Only its
// key: the title and CTAs come from useActiveOfferings, so an answer saved
// in a thread always shows the offering's current labels. See
// resolveFollowupOffering in synthesize.js.
export interface FollowupOffering {
  key: string;
}

// An active offering as the app shows it (GET /brickfi-offerings/active)
export interface BrickfiOffering {
  key: string;
  title: string;
  summary: string;
  ctas: OfferingCta[];
}

export interface OfferingCta {
  ctaId: string;
  label: string;
  /** names the flow below (OFFERING_FLOWS) the button opens */
  flowKey: string;
  description?: string;
  /** optional button icon, set per CTA in the admin app */
  icon?: { iconSet: string; iconName: string };
}

// A request raised from an offering's CTA in this thread, with its live
// status (POST /brickfi-offerings/tickets/thread) - shown as a card where the
// offering's buttons were. The offering's/CTA's names come from
// useActiveOfferings.
export interface OfferingTicket {
  ticketId: string;
  offeringKey: string;
  ctaId: string;
  /** turnId of the answer the request was raised from */
  turnId?: string;
  status: "open" | "in-progress" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface OfferingProjectOption {
  projectId: string;
  projectName: string;
}

// What a flow gets from the chat - everything the backend doesn't send with
// the offering, worked out client side
export interface OfferingFlowContext {
  /** projects in play in this conversation, for pickers - shown first in the order given */
  projects: OfferingProjectOption[];
  /** the signed-in user's mobile, when there is one - otherwise the flow asks for it */
  mobile?: string;
  countryCode?: string;
  name?: string;
}

interface OfferingFlowProps {
  context: OfferingFlowContext;
  submitting: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

const fieldLabel = (text: string) => (
  <Typography.Text style={{ fontSize: FONT_SIZE.PARA, fontWeight: 500 }}>
    {text}
  </Typography.Text>
);

// The contact a ticket carries - the signed-in user's own number, or one the
// guest types in (asked for by MobileField below)
const contactFrom = (
  context: OfferingFlowContext,
  values: { mobile?: string },
) => ({
  name: context.name,
  mobile: context.mobile || values.mobile?.trim(),
  countryCode: context.countryCode || "91",
});

// Asked only when the user isn't signed in - a ticket our team can't call
// back on is useless
function MobileField({ context }: { context: OfferingFlowContext }) {
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

function FlowFooter({
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
function ContactConsent() {
  return (
    <Flex vertical style={{margin: "16px 0"}}>
    {/* <DynamicReactIcon size={14} iconName="FaCheckSquare" iconSet="fa" color={COLORS.textColorMedium}></DynamicReactIcon> */}
      {/* the disabled label colour is too faint for terms the user should read */}
      <Typography.Text
        style={{fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
      >
        <span style={{fontSize: FONT_SIZE.HEADING_3}}>☑</span>The Brickfi Team never intends to reach out unless necessary. Only when
        additional information is required or a detailed discussion is required,
        we will initial a call. By creating this request, you agree to be contacted by a Brickfi
        Expert only with respect to your query.
      </Typography.Text>
    </Flex>
  );
}

// ---------------------------------------------------------------------------
// free-legal-consulation (Brickfi Legal Assist)
// ---------------------------------------------------------------------------

function LegalConsultationFlow({
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
        style={{ padding: 8, backgroundColor: COLORS.bgColorBlue, borderRadius: 8 }}
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
          label={fieldLabel("Type in your question")}
          style={{ marginBottom: 12 }}
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={1000}
            placeholder="e.g. title verification, reviewing the sale agreement, or a specific legal question"
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

// ---------------------------------------------------------------------------
// schedule-visit-callback (Brickfi Builder Buy)
// ---------------------------------------------------------------------------

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

function ScheduleVisitCallbackFlow({
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
        style={{ padding: 8, backgroundColor: COLORS.bgColorBlue, borderRadius: 8 }}
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

// flowKey (set per CTA on the offering, in the admin app) -> its form. A
// CTA whose flowKey isn't listed here has no button (see
// OfferingCtaButtons), so an offering added before its flow is built never
// shows a dead button.
const OFFERING_FLOWS: Record<string, React.FC<OfferingFlowProps>> = {
  "free-legal-consulation": LegalConsultationFlow,
  "schedule-visit-callback": ScheduleVisitCallbackFlow,
};

// ---------------------------------------------------------------------------
// Active offerings
// ---------------------------------------------------------------------------

const getActiveOfferings = async (): Promise<BrickfiOffering[]> => {
  const res = await fetch(`${baseApiUrl}brickfi-offerings/active`, {
    headers: { "x-api-key": apiKey || "" },
  });
  if (!res.ok) throw new Error(`offerings ${res.status}`);
  return res.json();
};

// Every active offering, by key - one request shared by every answer's
// buttons and ticket cards. An offering archived since an answer was given
// just isn't found, so its buttons disappear.
export function useActiveOfferings() {
  const { data } = useQuery({
    queryKey: ["brickfi-active-offerings"],
    queryFn: getActiveOfferings,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return (key?: string) => data?.find((o) => o.key === key);
}

// ---------------------------------------------------------------------------
// Ticket submission
// ---------------------------------------------------------------------------

export interface OfferingTicketOwner {
  userId?: string;
  guestId?: string;
}

const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(`${baseApiUrl}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `${path} ${res.status}`);
  return json;
};

const createOfferingTicket = ({
  owner,
  ...rest
}: {
  owner: OfferingTicketOwner;
  threadId: string;
  turnId?: string;
  offeringKey: string;
  ctaId: string;
  data: Record<string, unknown>;
}) =>
  postJson<OfferingTicket>("brickfi-offerings/tickets", { ...owner, ...rest });

export const threadTicketsQueryKey = (threadId?: string) => [
  "brickfi-thread-tickets",
  threadId,
];

// This thread's requests with their live status - only its owner gets any
// (see getThreadTickets in brickfi-offering-ticket.service.js)
export function useThreadTickets(
  owner: OfferingTicketOwner,
  threadId?: string,
) {
  const { data } = useQuery({
    queryKey: threadTicketsQueryKey(threadId),
    queryFn: () =>
      postJson<OfferingTicket[]>("brickfi-offerings/tickets/thread", {
        ...owner,
        threadId,
      }),
    enabled: !!threadId && !!(owner.userId || owner.guestId),
    refetchOnWindowFocus: false,
  });
  return data;
}

// ---------------------------------------------------------------------------
// UI pieces used by brickchat-client.tsx
// ---------------------------------------------------------------------------

// The CTA buttons under an answer's offering. Once the thread has a request
// for this offering, the buttons are replaced by that request's card, with
// its current status - the backend stops suggesting an offering while its
// ticket is open, and a second request would only duplicate it. Once the
// request is closed the buttons come back under the card, so the user can
// raise a new one.
export function OfferingCtaButtons({
  offeringKey,
  existingTicket,
  onStart,
}: {
  offeringKey: string;
  existingTicket?: OfferingTicket;
  onStart: (offering: BrickfiOffering, cta: OfferingCta) => void;
}) {
  const findOffering = useActiveOfferings();
  const offering = findOffering(offeringKey);
  if (existingTicket && existingTicket.status !== "closed") {
    return <OfferingTicketCard ticket={existingTicket} />;
  }
  const ticketCard = existingTicket ? (
    <OfferingTicketCard ticket={existingTicket} />
  ) : null;
  // still loading, or no longer active
  if (!offering) return ticketCard;
  const ctas = offering.ctas.filter((cta) => OFFERING_FLOWS[cta.flowKey]);
  if (!ctas.length) return ticketCard;
  return (
    <>
    {ticketCard}
    <Flex gap={8} wrap style={{ marginTop: 16, width: 200, borderRadius: 8, border: `1px solid ${COLORS.borderColor}`}}>
      {ctas.map((cta) => (
        <Flex key={cta.ctaId} vertical gap={16}>
          {" "}
          <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT,  padding: "4px 8px"  }}>
            {cta.description}
          </Typography.Text>
          <Flex>
            <Button
              type="primary"
              size="small"
              icon={
                cta.icon ? (
                  <DynamicReactIcon
                    iconSet={cta.icon.iconSet as IconSetKey}
                    iconName={cta.icon.iconName}
                    size={14}
                    color="white"
                  />
                ) : undefined
              }
              onClick={() => onStart(offering, cta)}
              style={{ width: 200,textAlign:"center", fontSize: FONT_SIZE.HEADING_4 }}
            >
              {cta.label}
            </Button>
          </Flex>
        </Flex>
      ))}
    </Flex>
    </>
  );
}

export interface ActiveOfferingFlow {
  offering: BrickfiOffering;
  cta: OfferingCta;
  /** turnId of the answer the button was under */
  turnId?: string;
}

// The dialog a CTA button opens - runs the CTA's flow and creates the ticket
// when it's submitted. onSubmitted gets the new ticket.
export function OfferingFlowDialog({
  flow,
  context,
  owner,
  threadId,
  onClose,
  onSubmitted,
}: {
  flow: ActiveOfferingFlow | null;
  context: OfferingFlowContext;
  owner: OfferingTicketOwner;
  threadId?: string;
  onClose: () => void;
  onSubmitted: (ticket: OfferingTicket) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  // a fresh form every time the dialog opens
  const [formKey, setFormKey] = useState(0);
  useEffect(() => {
    if (flow) setFormKey((k) => k + 1);
  }, [flow]);

  const Flow = flow ? OFFERING_FLOWS[flow.cta.flowKey] : null;

  const submit = async (data: Record<string, unknown>) => {
    if (!flow) return;
    if (!threadId || (!owner.userId && !owner.guestId)) {
      message.error("Please start a conversation before sending a request.");
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await createOfferingTicket({
        owner,
        threadId,
        turnId: flow.turnId,
        offeringKey: flow.offering.key,
        ctaId: flow.cta.ctaId,
        data,
      });
      onSubmitted(ticket);
      onClose();
    } catch (error) {
      console.error("Offering request failed:", error);
      message.error("Couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={!!flow && !!Flow}
      title={
        flow ? (
          <Flex vertical gap={2}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.SUB_TEXT,
                color: COLORS.primaryColor,
                textTransform: "uppercase",
              }}
            >
              {flow.offering.title}
            </Typography.Text>
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 600 }}
            >
              {flow.cta.label}
            </Typography.Text>
          </Flex>
        ) : null
      }
      onCancel={() => !submitting && onClose()}
      maskClosable={!submitting}
      footer={null}
      destroyOnClose
      width={520}
    >
      {flow && Flow ? (
        <Flow
          key={formKey}
          context={context}
          submitting={submitting}
          onSubmit={submit}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}

const TICKET_STATUS_LABELS: Record<OfferingTicket["status"], string> = {
  open: "Submitted",
  "in-progress": "In progress",
  closed: "Closed",
};

const TICKET_STATUS_MESSAGES: Record<OfferingTicket["status"], string> = {
  open: "Your request has been sent to our team. We'll get back to you soon.",
  "in-progress": "Our team is working on your request.",
  closed: "This request has been closed.",
};

const formatTicketDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// A request raised in this thread, shown where its offering's CTA buttons
// were - with its live status, and the offering's and CTA's current names
// (their keys, once the offering is no longer active)
export function OfferingTicketCard({ ticket }: { ticket: OfferingTicket }) {
  const offering = useActiveOfferings()(ticket.offeringKey);
  const ctaLabel =
    offering?.ctas.find((c) => c.ctaId === ticket.ctaId)?.label ||
    ticket.ctaId;
  return (
    <Flex
      vertical
      gap={6}
      style={{
        border: `1px solid ${COLORS.borderColorMedium}`,
        borderRadius: 12,
        padding: "12px 16px",
        backgroundColor: COLORS.bgColorLightBlue,
        maxWidth: 600,
      }}
    >
      <Flex align="center" justify="space-between" gap={8} wrap>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_4, fontWeight: 600 }}
        >
          {offering?.title || ticket.offeringKey} · {ctaLabel}
        </Typography.Text>
        <Tag
          color={
            ticket.status === "closed"
              ? "default"
              : ticket.status === "in-progress"
                ? "blue"
                : "green"
          }
          bordered={false}
        >
          {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
        </Tag>
      </Flex>
      <Typography.Text
        style={{ fontSize: FONT_SIZE.PARA, color: COLORS.textColorMedium }}
      >
        {TICKET_STATUS_MESSAGES[ticket.status] ||
          "Your request has been sent to our team."}
      </Typography.Text>
      <Typography.Text
        copyable={{ text: ticket.ticketId }}
        style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorMedium }}
      >
        Ticket {ticket.ticketId} · {formatTicketDate(ticket.createdAt)}
      </Typography.Text>
    </Flex>
  );
}
