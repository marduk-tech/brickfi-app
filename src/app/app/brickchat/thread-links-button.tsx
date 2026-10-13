"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { adminUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Modal, Tooltip, Typography } from "antd";
import { useState } from "react";

const LANGSMITH_PROJECT_URL =
  "https://smith.langchain.com/o/f789969a-14ab-5073-b68e-2822efcebf90/projects/p/4e5569cf-0f16-4779-ac99-d4297e21b54f";

const langsmithThreadUrl = (threadId: string) =>
  `${LANGSMITH_PROJECT_URL}?runview=threads&peekedConversationId=${encodeURIComponent(threadId)}`;

// matches BRICKFI_LOGGER_PATHS.thread in the admin app
// (livinzy-homes-admin/src/components/traces/brickfi-logger-paths.ts)
const adminThreadUrl = (threadId: string) =>
  `https://livinzy-admin-staging.netlify.app/brickfi-logger/threads/${encodeURIComponent(threadId)}`;

const optionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  height: "auto",
  padding: "10px 12px",
  textAlign: "left",
  whiteSpace: "normal",
};

function ThreadLinkOption({
  iconName,
  title,
  description,
  href,
  onClick,
}: {
  iconName: string;
  title: string;
  description: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Button
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      style={optionStyle}
    >
      <DynamicReactIcon
        iconName={iconName}
        iconSet="lu"
        size={18}
        color={COLORS.textColorMedium}
      />
      <Flex vertical style={{ minWidth: 0 }}>
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Text
          type="secondary"
          style={{ fontSize: FONT_SIZE.SUB_TEXT }}
        >
          {description}
        </Typography.Text>
      </Flex>
    </Button>
  );
}

// Debug link for the current chat thread: an icon button that opens a small
// dialog with both places to inspect it - the LangSmith thread view and the
// admin's Brickfi Logger thread page. Both open in a new tab.
export default function ThreadLinksButton({ threadId }: { threadId: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Tooltip title="Open thread">
        <Button
          type="text"
          aria-label="Open thread"
          style={{
            padding: "8px 0",
            height: "auto",
            width: 32,
            lineHeight: 1,
          }}
          icon={
            <DynamicReactIcon
              iconName="LuUnlink"
              iconSet="lu"
              color={COLORS.textColorMedium}
              size={16}
            />
          }
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      <Modal
        open={open}
        onCancel={close}
        footer={null}
        title="Open thread"
        width={420}
        destroyOnClose
      >
        <Typography.Text
          type="secondary"
          copyable
          style={{ fontSize: FONT_SIZE.SUB_TEXT, fontFamily: "monospace" }}
        >
          {threadId}
        </Typography.Text>
        <Flex vertical gap={8} style={{ marginTop: 12 }}>
          <ThreadLinkOption
            iconName="LuExternalLink"
            title="LangSmith"
            description="Full trace of every run in this thread"
            href={langsmithThreadUrl(threadId)}
            onClick={close}
          />
          <ThreadLinkOption
            iconName="LuScrollText"
            title="Brickfi Logger (admin)"
            description="Turns, plan, step logs and LLM calls"
            href={adminThreadUrl(threadId)}
            onClick={close}
          />
        </Flex>
      </Modal>
    </>
  );
}
