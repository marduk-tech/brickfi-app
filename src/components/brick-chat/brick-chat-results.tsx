"use client";

import { ProjectResult } from "@/app/app/brickchat/brickchat-client";
import { useUser } from "@/hooks/use-user";
import { useUpdateUserMutation } from "@/hooks/user-hooks";
import { safeStorage } from "@/libs/browser-utils";
import { LocalStorageKeys } from "@/libs/constants";
import {
  capitalize,
  removeDuplicatesAndPrepend,
  rupeeAmountFormat,
} from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Card, Flex, message, Tag, Typography } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import DynamicReactIcon from "../common/dynamic-react-icon";
import styles from "./brick-chat-results.module.css";

interface BrickChatResultsProps {
  results: ProjectResult[];
}

// Pull the ids of projects already in the user's default collection
const getDefaultCollectionIds = (user: any): string[] => {
  const defaultCollection = (user?.savedLvnzyProjects || []).find(
    (c: any) => c.collectionName === "default",
  );
  return (defaultCollection?.projects || []).map((p: any) =>
    (p?._id || p)?.toString(),
  );
};

const formatPriceInCrores = (price: number): string => {
  const crores = price / 10000000;
  return `₹${crores.toFixed(2)} Crs`;
};

const getProjectMetadata = (project: ProjectResult): string => {
  const parts: string[] = [];

  if (project.projectHomeTypes && project.projectHomeTypes.length > 0) {
    parts.push(capitalize(project.projectHomeTypes[0]));
  }

  if (project.projectUnitTypes && project.projectUnitTypes.length > 0) {
    const unitTypes = project.projectUnitTypes
      .filter((u: number) => u % 1 !== 0.5)
      .sort((a: number, b: number) => a - b)
      .slice(0, 3)
      .join(", ");
    parts.push(unitTypes + ` BHK`);
  } else {
    parts.push("Various Plot Sizes");
  }

  if (project.projectAvgSquareFootPrice && project.sizeBuiltupMin) {
    const price = project.projectAvgSquareFootPrice * project.sizeBuiltupMin;
    parts.push(String(rupeeAmountFormat(price)));
  }

  return parts.join(" · ");
};

export default function BrickChatResults({ results }: BrickChatResultsProps) {
  const { user, refetch } = useUser();
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const [messageApi, contextHolder] = message.useMessage();

  const [savedIds, setSavedIds] = useState<string[]>(() =>
    getDefaultCollectionIds(user),
  );

  useEffect(() => {
    setSavedIds(getDefaultCollectionIds(user));
  }, [user]);

  const handleToggleSave = async (
    e: React.MouseEvent,
    project: ProjectResult,
  ) => {
    // cards are wrapped in a Link - don't navigate on icon click
    e.preventDefault();
    e.stopPropagation();

    const lvnzyId = project.lvnzyProjectId;
    if (!lvnzyId || !user) return;

    const isSaved = savedIds.includes(lvnzyId);

    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];
    const defaultCollectionIndex = savedLvnzyProjects.findIndex(
      (c: any) => c.collectionName === "default",
    );

    if (defaultCollectionIndex === -1) {
      // nothing saved yet - create default collection with this project
      savedLvnzyProjects.push({
        collectionName: "default",
        projects: [lvnzyId],
      });
    } else {
      const existingProjects = (
        savedLvnzyProjects[defaultCollectionIndex].projects || []
      ).map((proj: any) => (proj?._id || proj)?.toString());

      savedLvnzyProjects[defaultCollectionIndex].projects = isSaved
        ? existingProjects.filter((id: string) => id !== lvnzyId)
        : removeDuplicatesAndPrepend(existingProjects, lvnzyId);
    }

    // optimistic update
    const prevSavedIds = savedIds;
    setSavedIds(
      isSaved
        ? savedIds.filter((id) => id !== lvnzyId)
        : [lvnzyId, ...savedIds.filter((id) => id !== lvnzyId)],
    );

    try {
      await updateUser.mutateAsync({
        userData: { savedLvnzyProjects },
      });

      const cached = safeStorage.getItem(LocalStorageKeys.user);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.updated = new Date(0).toString();
        safeStorage.setItem(LocalStorageKeys.user, JSON.stringify(parsed));
      }
      refetch();

      messageApi.success(
        isSaved ? "Removed from saved" : "Saved to your collection",
      );
    } catch {
      setSavedIds(prevSavedIds);
    }
  };

  if (!results || results.length === 0) {
    return (
      <Typography.Text type="secondary">
        No projects found matching your search.
      </Typography.Text>
    );
  }

  return (
    <Flex className={styles.scrollContainer} gap={16}>
      {contextHolder}
      {results.map((project) => (
        <Link
          key={project.projectId}
          href={`/app/brick360/${project.projectSlug || project.lvnzyProjectId}`}
          style={{ textDecoration: "none" }}
          target="_blank"
        >
          <Card
            hoverable
            style={{
              width: 225,
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${COLORS.borderColor}`,
            }}
            styles={{ body: { padding: 12 } }}
            cover={
              <div
                style={{
                  height: 125,
                  width: "100%",
                  backgroundColor: COLORS.bgColor,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {project.projectImage ? (
                  <img
                    src={project.projectImage}
                    alt={project.projectName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Flex
                    justify="center"
                    align="center"
                    style={{ height: "100%", color: COLORS.textColorLight }}
                  >
                    <Typography.Text type="secondary">No Image</Typography.Text>
                  </Flex>
                )}

                {project.lvnzyProjectId && (
                  <Flex
                    align="center"
                    justify="center"
                    onClick={(e) => handleToggleSave(e, project)}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <DynamicReactIcon
                      iconName={
                        savedIds.includes(project.lvnzyProjectId)
                          ? "IoBookmark"
                          : "IoBookmarkOutline"
                      }
                      iconSet="io5"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </Flex>
                )}
              </div>
            }
          >
            <Flex vertical gap={2}>
              <Typography.Text
                strong
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorDark,
                }}
                ellipsis={{ tooltip: project.projectName }}
              >
                {project.projectName}
              </Typography.Text>
              <Flex>
                <Tag
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorDark,
                  }}
                >
                  {project.projectCorridor}
                </Tag>
              </Flex>

              {getProjectMetadata(project) && (
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    color: COLORS.textColorLight,
                  }}
                  ellipsis={{ tooltip: getProjectMetadata(project) }}
                >
                  {getProjectMetadata(project)}
                </Typography.Text>
              )}

              {project.oneLiner && (
                <Typography.Paragraph
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorMedium,
                    marginBottom: 0,
                    marginTop: 8,
                    lineHeight: "140%",
                    backgroundColor: COLORS.bgColorLightBlue,
                    padding: 4,
                    borderRadius: 4,
                    border: `1px solid ${COLORS.borderColor}`,
                  }}
                  ellipsis={{ rows: 4, tooltip: project.oneLiner }}
                >
                  {project.oneLiner}
                </Typography.Paragraph>
              )}
              <Flex style={{ width: "100%", marginTop: 8 }}>
                <Link
                  href={`/app/brick360/${project.projectSlug}`}
                  prefetch={false}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    border: `1px solid ${COLORS.borderColorMedium}`,
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                  target="_blank"
                >
                  <Flex
                    align="center"
                    justify="center"
                    gap={6}
                    style={{ padding: "4px 0" }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.PARA,
                        color: COLORS.textColorDark,
                      }}
                    >
                      {"See Details"}
                    </Typography.Text>
                    {project.projectStatus === "report-verified" && (
                      <DynamicReactIcon
                        iconName="TbView360Number"
                        iconSet="tb"
                        size={18}
                        color={COLORS.primaryColor}
                      />
                    )}
                  </Flex>
                </Link>
              </Flex>
            </Flex>
          </Card>
        </Link>
      ))}
    </Flex>
  );
}
