import { apiKey, baseApiUrl } from "@/libs/constants";
import { useQuery } from "@tanstack/react-query";
import type {
  BrickfiOffering,
  OfferingTicket,
  OfferingTicketOwner,
} from "./types";

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


export const postJson = async <T,>(path: string, body: unknown): Promise<T> => {
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

export const createOfferingTicket = ({
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
