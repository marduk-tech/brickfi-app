"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Modal, Tag, Typography } from "antd";
import { useState } from "react";
import { useActiveOfferings } from "./api";
import type { OfferingTicket } from "./types";

const TICKET_STATUS_LABELS: Record<OfferingTicket["status"], string> = {
  open: "Submitted",
  "in-progress": "In progress",
  closed: "Closed",
};

// A request raised in this thread - just its offering and status. Shown
// where the offering's CTA buttons were (live status, from
// useThreadTickets), and above a ticket status update message (the status
// it changed to). The offering's current title, else the one the update
// carries, else its key once the offering is no longer active.
const formatTicketDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const statusTag = (status: OfferingTicket["status"]) => (
  <Tag
    color={
      status === "closed" ? "default" : status === "in-progress" ? "blue" : "green"
    }
    bordered={false}
    style={{ margin: 0 }}
  >
    {TICKET_STATUS_LABELS[status] || status}
  </Tag>
);

const detailRow = (label: string, value: React.ReactNode) => (
  <Flex vertical gap={2}>
    <Typography.Text
      style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
    >
      {label}
    </Typography.Text>
    {value}
  </Flex>
);

// A request's details, opened by clicking its card - with its current status
function OfferingTicketDetailsModal({
  ticket,
  title,
  onClose,
}: {
  ticket: OfferingTicket | null;
  title: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!ticket}
      onCancel={onClose}
      footer={null}
      width={480}
      title={
        <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 600 }}>
          {title}
        </Typography.Text>
      }
    >
      {ticket ? (
        <Flex vertical gap={16} style={{ marginTop: 8 }}>
          {detailRow("Status", <div>{statusTag(ticket.status)}</div>)}
          {detailRow(
            "Ticket ID",
            <Typography.Text
              copyable={{ text: ticket.ticketId }}
              style={{ fontSize: FONT_SIZE.PARA }}
            >
              {ticket.ticketId}
            </Typography.Text>,
          )}
          {detailRow(
            "Created on",
            <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
              {formatTicketDate(ticket.createdAt)}
            </Typography.Text>,
          )}
          {detailRow(
            "Your request",
            <Typography.Text
              style={{ fontSize: FONT_SIZE.PARA, whiteSpace: "pre-wrap" }}
            >
              {ticket.query?.trim() || "—"}
            </Typography.Text>,
          )}
          {ticket.replies?.length
            ? detailRow(
                "Replies from Brickfi",
                <Flex vertical gap={8}>
                  {ticket.replies.map((r, i) => (
                    <Flex
                      key={i}
                      vertical
                      gap={2}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        backgroundColor: COLORS.bgColorLightBlue,
                      }}
                    >
                      <Typography.Text
                        style={{ fontSize: FONT_SIZE.PARA, whiteSpace: "pre-wrap" }}
                      >
                        {r.text}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.SUB_TEXT,
                          color: COLORS.textColorLight,
                        }}
                      >
                        {formatTicketDate(r.createdAt)}
                      </Typography.Text>
                    </Flex>
                  ))}
                </Flex>,
              )
            : null}
        </Flex>
      ) : null}
    </Modal>
  );
}

const isFullTicket = (t: unknown): t is OfferingTicket =>
  !!t && typeof (t as OfferingTicket).createdAt === "string";

export default function OfferingTicketCard({
  ticket,
  details,
}: {
  ticket: Pick<OfferingTicket, "offeringKey" | "status"> & {
    offeringTitle?: string;
  };
  /** the full, live ticket for the details modal - defaults to `ticket`
   * when that's already one; without either the card isn't clickable */
  details?: OfferingTicket;
}) {
  const offering = useActiveOfferings()(ticket.offeringKey);
  const [open, setOpen] = useState(false);
  const fullTicket = details || (isFullTicket(ticket) ? ticket : undefined);
  const title = offering?.title || ticket.offeringTitle || ticket.offeringKey;
  return (
    <>
    <Flex
      align="center"
      gap={12}
      role={fullTicket ? "button" : undefined}
      tabIndex={fullTicket ? 0 : undefined}
      onClick={fullTicket ? () => setOpen(true) : undefined}
      onKeyDown={
        fullTicket
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
              }
            }
          : undefined
      }
      style={{
        border: `1px solid ${COLORS.borderColorMedium}`,
        borderRadius: 12,
        padding: "4px 8px",
        backgroundColor: COLORS.bgColorLightBlue,
        maxWidth: 400,
        cursor: fullTicket ? "pointer" : "default",
      }}
    >
      <DynamicReactIcon
        iconSet={"fa"}
        iconName={"FaUserAstronaut"}
        size={14}
        color={COLORS.textColorDark}
      />
      <Typography.Text
        style={{ fontSize: FONT_SIZE.HEADING_4, fontWeight: 600 }}
      >
        {title}
      </Typography.Text>
      {/* <div style={{ marginLeft: "auto" }}>{statusTag(ticket.status)}</div> */}
      <div style={{marginLeft:"auto"}}> <Tag
    color={"blue"}
    bordered={false}
    style={{ margin: 0 }}
  >
    {"Task Created"}
  </Tag></div>
    </Flex>
    <OfferingTicketDetailsModal
      ticket={open && fullTicket ? fullTicket : null}
      title={title}
      onClose={() => setOpen(false)}
    />
    </>
  );
}
