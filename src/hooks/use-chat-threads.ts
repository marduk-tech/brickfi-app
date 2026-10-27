import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
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

export function useToggleThreadBookmark(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.getChatThreads, userId];

  return useMutation({
    mutationFn: async ({
      threadId,
      isBookmarked,
    }: {
      threadId: string;
      isBookmarked: boolean;
    }) => {
      await axiosApiInstance.post("ai/explore-projects/bookmark", {
        userId,
        threadId,
        isBookmarked,
      });
    },

    onMutate: async ({ threadId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ChatThread[]>(queryKey);
      queryClient.setQueryData<ChatThread[]>(queryKey, (threads) =>
        threads?.map((t) =>
          t.thread_id === threadId ? { ...t, isBookmarked } : t,
        ),
      );
      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      console.error("Failed to update bookmark:", error);
      message.error("Couldn't update bookmark. Please try again.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
