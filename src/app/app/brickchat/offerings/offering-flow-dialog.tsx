"use client";

import { useDevice } from "@/hooks/use-device";
import { trackPixelConversion } from "@/libs/ad-attribution";
import { FONT_SIZE } from "@/theme/style-constants";
import { Button, message, Modal, Result, Typography } from "antd";
import { useEffect, useState } from "react";
import { createOfferingTicket } from "./api";
import { OFFERING_FLOWS } from "./flows";
import type {
  BrickfiOffering,
  OfferingCta,
  OfferingFlowContext,
  OfferingTicket,
  OfferingTicketOwner,
} from "./types";

// The confirmation's message, by what the request asked for (see
// RequestOptions) - neither is possible in flows where a visit or loan offers
// are the request on their own
const submittedMessage = (data: Record<string, unknown>) =>
  data.createTask
    ? "You will receive a response on this request within 24-48 hours."
    : data.askExpertToContact
      ? "A Brickfi expert will reach out to schedule a call at your convenient time."
      : "The Brickfi team will get back to you shortly.";

export interface ActiveOfferingFlow {
  offering: BrickfiOffering;
  cta: OfferingCta;
  /** turnId of the answer the button was under */
  turnId?: string;
  /** that answer's followupOffering.context, passed on to the flow */
  offeringContext?: string;
}

// The dialog a CTA button opens - runs the CTA's flow and creates the ticket
// when it's submitted. onSubmitted gets the new ticket.
export default function OfferingFlowDialog({
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
  const { isMobile } = useDevice();
  const [submitting, setSubmitting] = useState(false);
  // a fresh form every time the dialog opens
  const [formKey, setFormKey] = useState(0);
  // the confirmation shown once a request is created - its message, or null
  const [submittedNote, setSubmittedNote] = useState<string | null>(null);
  useEffect(() => {
    if (flow) setFormKey((k) => k + 1);
  }, [flow]);

  const Flow = flow ? OFFERING_FLOWS[flow.cta.flowKey] : null;

  const submit = async (data: Record<string, unknown>) => {
    if (!flow) return;
    // no thread is fine - the request then reaches the user by WhatsApp and
    // email instead of in a conversation
    if (!owner.userId && !owner.guestId) {
      message.error("Please sign in before sending a request.");
      return;
    }
    setSubmitting(true);
    try {
      const { conversion, ...ticket } = await createOfferingTicket({
        owner,
        threadId,
        turnId: flow.turnId,
        offeringKey: flow.offering.key,
        ctaId: flow.cta.ctaId,
        data,
      });
      trackPixelConversion(conversion);
      onSubmitted(ticket);
      onClose();
      setSubmittedNote(submittedMessage(data));
    } catch (error) {
      console.error("Offering request failed:", error);
      message.error("Couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Modal
      open={!!flow && !!Flow}
      title={
        flow ? (
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 600 }}
          >
            {flow.offering.title}
          </Typography.Text>
        ) : null
      }
      onCancel={() => !submitting && onClose()}
      maskClosable={!submitting}
      footer={null}
      destroyOnClose
      width={isMobile ? "90%" : 800}
      style={{ top: "10vh" }}
      // fixed height whatever the flow's step - the body scrolls, with its
      // scrollbar hidden so it takes no width
      classNames={{ body: "no-scrollbar" }}
      styles={{ body: { height: "70vh", overflowY: "auto" } }}
    >
      {flow && Flow ? (
        <Flow
          key={formKey}
          context={context}
          offeringContext={flow.offeringContext}
          submitting={submitting}
          onSubmit={submit}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
    <Modal
      open={!!submittedNote}
      onCancel={() => setSubmittedNote(null)}
      footer={null}
      width={isMobile ? "90%" : 550}
      centered
    >
      <Result
        status="success"
        title="Request Submitted"
        subTitle={submittedNote}
        extra={
          <Button type="primary" onClick={() => setSubmittedNote(null)}>
            Close
          </Button>
        }
      />
    </Modal>
    </>
  );
}
