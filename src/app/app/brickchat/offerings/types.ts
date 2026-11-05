// An answer's offering - the CTA buttons shown under its followupPrompt (the
// offering's pitch) or under an answer about the offering itself. Only its
// key: the title and CTAs come from useActiveOfferings, so an answer saved
// in a thread always shows the offering's current labels. See
// resolveFollowupOffering in synthesize.js.
export interface FollowupOffering {
  key: string;
  /** the specific next step it's for (e.g. "Please onboard X with RERA
   * number Y") - prefills the flow's request, see promptUserNode */
  context?: string;
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
  /** what the user asked for in the flow, when it had a text field */
  query?: string | null;
  /** the Brickfi team's replies, oldest first */
  replies?: { text: string; createdAt: string }[];
  status: "open" | "in-progress" | "closed";
  createdAt: string;
  updatedAt: string;
}

// A request ops just updated (status and/or a reply), as the backend posts
// it to the thread (see postTicketUpdates in brickfi-offering-ticket.service.js)
export interface OfferingTicketUpdate {
  ticketId: string;
  offeringKey: string;
  offeringTitle?: string;
  ctaId: string;
  status: OfferingTicket["status"];
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

export interface OfferingFlowProps {
  context: OfferingFlowContext;
  /** the answer's followupOffering.context, when it has one */
  offeringContext?: string;
  submitting: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

export interface OfferingTicketOwner {
  userId?: string;
  guestId?: string;
}
