"use client";

import { Flex, Typography } from "antd";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import BrickChatResults from "./brick-chat-results";
import { ProjectResult } from "./brickchat-client";

interface PinnedProjectResultsProps {
  results: ProjectResult[];
  description?: string;
  hasChatStarted: boolean;
  onLocateProject?: (projectId: string) => void;
  isShownOnMap?: boolean;
  onSelectProject?: (project: ProjectResult) => void;
}

// Always-visible strip of the seeded/default project set (e.g. a user's
// saved projects on the account page) - stays stuck to the top of the
// scrollable conversation panel (its parent must be the scroll container)
// so the projects being discussed stay referenceable throughout the whole
// chat, not just before the first message.
export default function PinnedProjectResults({
  results,
  description,
  hasChatStarted,
  onLocateProject,
  isShownOnMap,
  onSelectProject,
}: PinnedProjectResultsProps) {
  if (!results?.length) {
    return null;
  }

  return (
    <Flex
      vertical
      gap={12}
      style={{
        zIndex: 2,
        backgroundColor: "white",
        paddingBottom: 12,
      }}
    >
      {description && !hasChatStarted ? (
        <Flex vertical>
          <Typography.Text
            style={{
              color: "white",
              fontSize: FONT_SIZE.HEADING_3,
              backgroundColor: COLORS.textColorDark,
              borderRadius: 16,
              padding: "8px 16px",
            }}
          >
            {description}
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorLight,
              marginLeft: 8,
              marginTop: 16,
            }}
          >
            Curated by your Brickfi Advisor
          </Typography.Text>
        </Flex>
      ) : hasChatStarted ? (
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
          }}
        >
          Your saved projects ({results.length})
        </Typography.Text>
      ) : null}
      <BrickChatResults
        results={results}
        onLocateProject={onLocateProject}
        isShownOnMap={isShownOnMap}
        onSelectProject={onSelectProject}
      />
    </Flex>
  );
}
