"use client";

import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { safeStorage } from "@/libs/browser-utils";
import { LocalStorageKeys } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import BrickChatResults from "./brick-chat-results";
import { ProjectResult } from "./brickchat-client";
import styles from "./pinned-project-results.module.css";

const PINNED_KEY = "pinned-projects";

interface PinnedProjectResultsProps {
  results: ProjectResult[];
  description?: string;
  hasChatStarted: boolean;
  onLocateProject?: (projectId: string) => void;
  onSelectProject?: (project: ProjectResult) => void;
  selectedProjectId?: string;
  // collapse whenever a project gets selected (e.g. on mobile, where the
  // open strip would push the selected project's details out of view)
  collapseOnSelect?: boolean;
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
  selectedProjectId,
  collapseOnSelect,
}: PinnedProjectResultsProps) {
  // Open by default only on the very first visit ever (remembered in
  // localStorage), collapsed on every visit, new chat or thread switch after
  // that - the user can still toggle it. Starts collapsed and opens after
  // mount, since localStorage isn't readable during server rendering.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (safeStorage.getItem(LocalStorageKeys.pinnedProjectsSeen)) return;
    safeStorage.setItem(LocalStorageKeys.pinnedProjectsSeen, "true");
    setExpanded(true);
  }, []);

  // keyed on the selected id (not a boolean) so picking a different project
  // collapses it again even if the user re-opened it in between
  useEffect(() => {
    if (collapseOnSelect && selectedProjectId) setExpanded(false);
  }, [collapseOnSelect, selectedProjectId]);

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
        activeKey={expanded ? [PINNED_KEY] : []}
        onChange={(keys) =>
          setExpanded((Array.isArray(keys) ? keys : [keys]).includes(PINNED_KEY))
        }
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
            key: PINNED_KEY,
            label: (<Flex gap={6} align="center" >
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorLight,
                }}
              >
                Your saved projects
              </Typography.Text>
               <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: COLORS.textColorMedium,
                  backgroundColor: COLORS.bgColorMedium,
                  borderRadius: 4,
                  width: 18,
                  height: 18,
                  textAlign: "center",
                  fontWeight: 500
                }}
              >
                {results.length}
              </Typography.Text>
              </Flex>
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
                selectedProjectId={selectedProjectId}
                minimal
              />
            ),
          },
        ]}
      />
    </Flex>
  );
}
