"use client";

import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Typography } from "antd";
import { useActiveOfferings } from "./api";
import { OFFERING_FLOWS } from "./flows";
import OfferingTicketCard from "./offering-ticket-card";
import type { BrickfiOffering, OfferingCta, OfferingTicket } from "./types";

// The CTA buttons under an answer's offering. Once the thread has a request
// for this offering, the buttons are replaced by that request's card, with
// its current status - the backend stops suggesting an offering while its
// ticket is open, and a second request would only duplicate it. Once the
// request is closed the buttons come back under the card, so the user can
// raise a new one.
export default function OfferingCtaButtons({
  offeringKey,
  existingTicket,
  ticketNoted = false,
  onStart,
}: {
  offeringKey: string;
  existingTicket?: OfferingTicket;
  /** a request was already raised from this answer (its offeringTickets
   * note) - only its card shows, never the buttons, even once it's closed */
  ticketNoted?: boolean;
  onStart: (offering: BrickfiOffering, cta: OfferingCta) => void;
}) {
  const findOffering = useActiveOfferings();
  const offering = findOffering(offeringKey);
  if (ticketNoted) {
    return existingTicket ? <OfferingTicketCard ticket={existingTicket} /> : null;
  }
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
      <Flex
        gap={8}
        wrap
        style={{
          marginTop: 16,
          width: 200,
          borderRadius: 8,
          border: `1px solid ${COLORS.borderColor}`,
        }}
      >
        {ctas.map((cta) => (
          <Flex key={cta.ctaId} vertical gap={8}>
            {" "}
            <Flex
              vertical
              gap={8}
              justify="flex-start"
              align="flex-start"
              style={{ padding: "4px 8px", marginTop: 8 }}
            >
              {cta.icon ? (
                <DynamicReactIcon
                  iconSet={cta.icon.iconSet as IconSetKey}
                  iconName={cta.icon.iconName}
                  size={40}
                  color={COLORS.textColorDark}
                />
              ) : null}
              <Typography.Text
                style={{ fontSize: FONT_SIZE.HEADING_4, lineHeight: "110%" }}
              >
                {cta.description}
              </Typography.Text>
            </Flex>
            <Flex>
              <Button
                type="primary"
                size="small"
                onClick={() => onStart(offering, cta)}
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
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
