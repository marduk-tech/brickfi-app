"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import {
  useFetchChatThreads,
  useToggleThreadBookmark,
} from "@/hooks/use-chat-threads";
import { COLORS } from "@/theme/style-constants";
import { Button, Tooltip } from "antd";

export default function BookmarkThreadButton({
  threadId,
  userId,
}: {
  threadId: string;
  userId: string;
}) {
  const { data: chatThreads } = useFetchChatThreads(userId);
  const toggleBookmark = useToggleThreadBookmark(userId);

  const thread = chatThreads?.find((t) => t.thread_id === threadId);
  if (!thread) return null;

  const isBookmarked = !!thread.isBookmarked;
  const tooltip = isBookmarked ? "Remove bookmark" : "Bookmark chat";

  return (
    <Tooltip title={tooltip}>
      <Button
        type="text"
        aria-label={tooltip}
        aria-pressed={isBookmarked}
        disabled={toggleBookmark.isPending}
        style={{
          padding: "8px 0",
          height: "auto",
          width: 32,
          lineHeight: 1,
        }}
        icon={
          <DynamicReactIcon
            iconName={isBookmarked ? "IoBookmark" : "IoBookmarkOutline"}
            iconSet="io5"
            color={isBookmarked ? COLORS.primaryColor : COLORS.textColorMedium}
            size={16}
          />
        }
        onClick={() =>
          toggleBookmark.mutate({ threadId, isBookmarked: !isBookmarked })
        }
      />
    </Tooltip>
  );
}
