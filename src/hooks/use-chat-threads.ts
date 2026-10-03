import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { ChatThread } from "../types/User";

export const formatThreadDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const fetchChatThreads = async (
  userId: string,
): Promise<ChatThread[]> => {
  const { data } = await axiosApiInstance.get(`/user/${userId}/chat-threads`);
  return data?.data || [];
};

// Shared between the global "Recent Chats" drawer (dashboard-layout.tsx) and
// brickchat-client.tsx (which invalidates this same query key whenever a new
// thread is created) - both subscribe to the same react-query cache entry
// for a given userId, so either one refreshing keeps the other in sync.
export function useFetchChatThreads(userId?: string) {
  return useQuery<ChatThread[]>({
    queryKey: [queryKeys.getChatThreads, userId],
    queryFn: () => fetchChatThreads(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
