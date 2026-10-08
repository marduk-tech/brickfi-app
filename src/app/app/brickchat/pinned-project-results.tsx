"use client";

import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, Flex, Typography } from "antd";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import BrickChatResults from "./brick-chat-results";
import { ProjectResult } from "./brickchat-client";
import styles from "./pinned-project-results.module.css";

interface PinnedProjectResultsProps {
  results: ProjectResult[];
  description?: string;
  hasChatStarted: boolean;
  onLocateProject?: (projectId: string) => void;
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
  onSelectProject,
}: PinnedProjectResultsProps) {
  // if (results?.length) {
  //   return (
  //     <div
  //       style={{
  //         width: 175,
  //         height: 150,
  //         flexShrink: 0,
  //         backgroundImage:
  //           "url(/images/landing/brick-chat/project-placeholder.png)",
  //         backgroundSize: "60%",
  //         backgroundRepeat: "no-repeat",
  //         backgroundPosition: "center",
  //         border: `1px solid ${COLORS.borderColor}`
  //       }}
  //     />
  //   );
  // }

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
      ) : null}
      <Collapse
        ghost
        className={styles.collapse}
        defaultActiveKey={[]}
        expandIcon={({ isActive }) => (
          <Flex
            align="center"
            justify="center"
            style={{
              width: 20,
              height: 20,
              flexShrink: 0,
              borderRadius: "50%",
              backgroundColor: COLORS.primaryColor,
            }}
          >
            <CaretRightOutlined
              style={{ color: "white", fontSize: FONT_SIZE.SUB_TEXT }}
              rotate={isActive ? 90 : 0}
            />
          </Flex>
        )}
        items={[
          {
            key: "pinned-projects",
            label: (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorLight,
                }}
              >
                Your saved projects ({results.length})
              </Typography.Text>
            ),
            children: !results.length ? (
              <div
                style={{
                  width: 130,
                  height: 125,
                  flexShrink: 0,
                  backgroundImage:
                    "url(/images/landing/brick-chat/project-placeholder.png)",
                  backgroundSize: "75%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  border: `1px dashed ${COLORS.borderColor}`,
                  borderRadius: 8,
                  marginLeft: 32,
                  marginTop: 16
                }}
              />
            ) : (
              <BrickChatResults
                results={results}
                onLocateProject={onLocateProject}
                onSelectProject={onSelectProject}
                minimal
              />
            ),
          },
        ]}
      />
    </Flex>
  );
}
