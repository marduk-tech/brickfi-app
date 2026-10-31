"use client";

import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, message, Modal, Typography } from "antd";
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
  );
}
