"use client";

import { ProjectResult } from "@/app/app/brickchat/brickchat-client";
import { useUser } from "@/hooks/use-user";
import { useUpdateUserMutation } from "@/hooks/user-hooks";
import { safeStorage } from "@/libs/browser-utils";
import { LocalStorageKeys } from "@/libs/constants";
import {
  capitalize,
  getSaveCollectionIndex,
  removeDuplicatesAndPrepend,
  rupeeAmountFormat,
} from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import {
  Card,
  Flex,
  message,
  Modal,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import DynamicReactIcon from "../../../components/common/dynamic-react-icon";
import ProjectImageCarousel from "./project-image-carousel";
import styles from "./brick-chat-results.module.css";

interface BrickChatResultsProps {
  results: ProjectResult[];
  onLocateProject?: (projectId: string) => void;
  /** Whether this results list is the one currently plotted on the map — controls locate-pin visibility. */
  /**
   * When provided, the "project-details" button sets this project as the
   * brickchat-client's inline selection instead of navigating to the
   * standalone brick360 page in a new tab.
   */
  onSelectProject?: (project: ProjectResult) => void;
  /** Narrative/shortlist answers have no oneLiner (the LLM wasn't asked to write one for these) - hide the block instead of rendering it empty. */
  skipOneLiner?: boolean;
  /** Narrative/shortlist answers have no rankScore (no rerank happened) - keep the order the server returned (order of first mention) instead of sorting. */
  skipSort?: boolean;
  /**
   * Compact single-line-per-project view instead of the full image card -
   * just project name, corridor, and the 360 Details button (see
   * PinnedProjectResults, where the saved/pinned strip doesn't need the
   * full card treatment every other results list gets).
   */
  minimal?: boolean;
  /** projectId of the project currently open in the inline 360 view - its card gets a highlighted border. */
  selectedProjectId?: string;
}

// Pull the ids of projects already in the user's save collection (their
// first one - see getSaveCollectionIndex)
const getDefaultCollectionIds = (user: any): string[] => {
  const defaultCollection = (user?.savedLvnzyProjects || [])[0];
  return (defaultCollection?.projects || []).map((p: any) =>
    (p?._id || p)?.toString(),
  );
};

const formatPriceInCrores = (price: number): string => {
  const crores = price / 10000000;
  return `₹${crores.toFixed(2)} Crs`;
};

// One-liners from discovery results start with how well the project matches
// the query - "strong-match; ..." / "moderate-match; ..." / "weak-match; ..."
// - which is shown as its own tag next to the corridor rather than inline.
type MatchLevel = "strong-match" | "moderate-match" | "weak-match";

const MATCH_LEVEL_CONFIG: Record<MatchLevel, { label: string; color: string }> =
  {
    "strong-match": { label: "Strong Match", color: "green" },
    "moderate-match": { label: "Moderate Match", color: "gold" },
    "weak-match": { label: "Weak Match", color: "red" },
  };

const ONE_LINER_MATCH_PREFIX = /^\s*(strong-match|moderate-match|weak-match)\s*;\s*/i;

// Splits the leading match level off a one-liner; `text` is the rest (or the
// whole one-liner, unchanged, when it has no such prefix).
const parseOneLiner = (
  oneLiner?: string,
): { match?: MatchLevel; text: string } => {
  const raw = oneLiner || "";
  const m = raw.match(ONE_LINER_MATCH_PREFIX);
  if (!m) return { text: raw };
  const rest = raw.slice(m[0].length);
  return {
    match: m[1].toLowerCase() as MatchLevel,
    // capitalise just the first letter - the rest of the sentence as written
    text: rest.charAt(0).toUpperCase() + rest.slice(1),
  };
};

// Display order: rankScore (highest first) unless skipSort, then every
// weak match moved to the end. Strong and moderate matches aren't reordered
// among themselves, and weak ones keep their relative order too.
const orderResults = (
  results: ProjectResult[],
  skipSort?: boolean,
): ProjectResult[] => {
  const ranked = skipSort
    ? results
    : [...results].sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));
  const isWeak = (p: ProjectResult) =>
    parseOneLiner(p.oneLiner).match === "weak-match";
  return [...ranked.filter((p) => !isWeak(p)), ...ranked.filter(isWeak)];
};

const MatchTag = ({
  match,
  style,
}: {
  match?: MatchLevel;
  style?: React.CSSProperties;
}) =>
  match ? (
    <Tag
      color={MATCH_LEVEL_CONFIG[match].color}
      style={{ borderRadius: 8, fontSize: FONT_SIZE.NOTE, ...style }}
    >
      {MATCH_LEVEL_CONFIG[match].label}
    </Tag>
  ) : null;

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

export default function BrickChatResults({
  results,
  onLocateProject,
  onSelectProject,
  skipOneLiner,
  skipSort,
  minimal,
  selectedProjectId,
}: BrickChatResultsProps) {
 

  const { user, refetch } = useUser();
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const [savedIds, setSavedIds] = useState<string[]>(() =>
    getDefaultCollectionIds(user),
  );

  useEffect(() => {
    setSavedIds(getDefaultCollectionIds(user));
  }, [user]);

  const handleToggleSave = (e: React.MouseEvent, project: ProjectResult) => {
    // cards are wrapped in a Link - don't navigate on icon click
    e.preventDefault();
    e.stopPropagation();

    const lvnzyId = project.lvnzyProjectId;
    if (!lvnzyId || !user) return;

    const isSaved = savedIds.includes(lvnzyId);

    modal.confirm({
      title: isSaved ? "Remove from saved projects?" : "Save this project?",
      content: isSaved
        ? `Remove "${project.projectName}" from your saved projects?`
        : `Add "${project.projectName}" to your saved projects?`,
      okText: isSaved ? "Remove" : "Save",
      onOk: async () => {
        const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];
        const defaultCollectionIndex = getSaveCollectionIndex(savedLvnzyProjects);

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
      },
    });
  };

  // full one-liner in a dialog - the card only shows the first 3 lines
  const handleShowOneLiner = (e: React.MouseEvent, project: ProjectResult) => {
    // cards are wrapped in a Link - don't navigate on click
    e.preventDefault();
    e.stopPropagation();

    modal.info({
      title: project.projectName,
      content: (
        <Typography.Paragraph
          style={{
            fontSize: FONT_SIZE.PARA,
            color: COLORS.textColorMedium,
            lineHeight: "140%",
            marginBottom: 0,
          }}
        >
          {parseOneLiner(project.oneLiner).text}
        </Typography.Paragraph>
      ),
      icon: null,
      okText: "Close",
      maskClosable: true,
    });
  };

  const handleLocateOnMap = (e: React.MouseEvent, project: ProjectResult) => {
    // cards are wrapped in a Link - don't navigate on icon click
    e.preventDefault();
    e.stopPropagation();

    onLocateProject?.(project.projectId);
  };

  if (!results || results.length === 0) {
    return (
      <Typography.Text type="secondary">
        No projects found matching your search.
      </Typography.Text>
    );
  }

  if (minimal) {
    const orderedResults = orderResults(results, skipSort);

    return (
      <Flex className={styles.scrollContainer} gap={16}>
        {contextHolder}
        {modalContextHolder}
        {orderedResults.map((project) => (
          <Flex key={project.projectId} style={{ width: 175 }}>
            <Card
              hoverable
              style={{
                width: 165,
                borderRadius: 12,
                overflow: "hidden",
                margin: "8px 0",
                border: `1px solid ${COLORS.borderColor}`,
                // column layout so the body can fill the card's full height
                // and pin "View 360 Details" to the bottom (see below)
                display: "flex",
                flexDirection: "column",
              }}
              styles={{
                body: {
                  padding: 0,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                },
              }}
              cover={
                <div
                  style={{
                    height: 100,
                    width: "100%",
                    backgroundColor: COLORS.bgColor,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {project.projectImages?.length ? (
                    <ProjectImageCarousel
                      images={project.projectImages}
                      alt={project.projectName}
                    />
                  ) : project.projectImage ? (
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
                      <Typography.Text type="secondary">
                        No Image
                      </Typography.Text>
                    </Flex>
                  )}
                </div>
              }
            >
              <Flex vertical gap={2} style={{ flex: 1 }}>
                <Tooltip title={project.projectName}>
                <Typography.Text
                  strong
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    color: COLORS.textColorDark,
                    padding: '4px 8px'
                  }}
                  ellipsis={{ tooltip: project.projectName }}
                >
                  {project.projectName}
                </Typography.Text>
                </Tooltip>
                <Flex align="center" gap={0} style={{padding: "4px 8px"}}>
                  {project.projectCorridor ? (
                    <Tag
                      style={{
                        fontSize: FONT_SIZE.NOTE,
                        color: COLORS.textColorDark,
                        padding: "0px 4px"
                      }}
                    >
                      {project.projectCorridor}
                    </Tag>
                  ) : (
                    <span />
                  )}
                  <MatchTag
                    match={parseOneLiner(project.oneLiner).match}
                    style={{ padding: "0px 4px", }}
                  />
                  <Flex align="center" gap={4} style={{ marginLeft: "auto" }}>
                    {project.lvnzyProjectId && (
                      <Flex
                        align="center"
                        justify="center"
                        onClick={(e) => handleToggleSave(e, project)}
                        style={{
                          width: 24,
                          height: 24,
                          flexShrink: 0,
                          borderRadius: "50%",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                          cursor: "pointer",
                        }}
                      >
                        <DynamicReactIcon
                          iconName={
                            savedIds.includes(project.lvnzyProjectId)
                              ? "MdOutlineBookmark"
                              : "MdOutlineBookmarkBorder"
                          }
                          iconSet="md"
                          size={16}
                          color={COLORS.primaryColor}
                        />
                      </Flex>
                    )}
                  
                  </Flex>
                </Flex>
                  {onSelectProject && (
                      <Flex
                        id="project-details"
                        align="center"
                        justify="center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                        style={{
                          height: 24,
                          flexShrink: 0,
                          padding: "2px 4px",
                          borderBottomLeftRadius: 4,
                          borderBottomRightRadius: 4,
                          // pushed to the bottom of the card whatever the
                          // content above it, so buttons line up across cards
                          marginTop: "auto",
                          backgroundColor: project.projectId === selectedProjectId ? COLORS.primaryColor: COLORS.textColorDark,
                          cursor: "pointer",
                          color: "white",
                          fontSize: FONT_SIZE.SUB_TEXT,
                          width: "100%",
                          fontWeight: 500
                        }}
                      >
                        View 360 Details
                      </Flex>
                    )}
              </Flex>
            </Card>
          </Flex>
        ))}
      </Flex>
    );
  }

  return (
    <Flex className={styles.scrollContainer} gap={4}>
      {contextHolder}
      {modalContextHolder}
      {orderResults(results, skipSort).map((project) => (
       <Flex style={{width: 225}}>
          <Card
            hoverable
            style={{
              width: 225,
              borderRadius: 12,
              display: "block",
              overflow: "hidden",
              margin: "8px 0",
              border: `1px solid ${COLORS.borderColor}`,
            }}
            styles={{ body: { padding: 0 } }}
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
                {project.projectImages?.length ? (
                  <ProjectImageCarousel
                    images={project.projectImages}
                    alt={project.projectName}
                  />
                ) : project.projectImage ? (
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

               
              </div>
            }
          >
            <Flex  vertical gap={2}>
              <Flex style={{padding: 8}} gap={0} vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_3,
                  color: COLORS.textColorDark,
                  fontWeight: 500
                }}
                ellipsis={{ tooltip: project.projectName }}
              >
                {project.projectName}
              </Typography.Text>
                 {getProjectMetadata(project) && (
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                    marginTop: -4
                  }}
                  ellipsis={{ tooltip: getProjectMetadata(project) }}
                >
                  {getProjectMetadata(project)}
                </Typography.Text>
              )}
              <Flex wrap>
                <Tag
                  style={{
                    fontSize: FONT_SIZE.NOTE,
                    color: COLORS.textColorDark,
                    padding: "0 4px",
                    marginTop: 8,
                    backgroundColor: COLORS.bgColor,
                    borderRadius: 8,
                  }}
                >
                  {project.projectCorridor}
                </Tag>
                <MatchTag
                  match={parseOneLiner(project.oneLiner).match}
                  style={{ padding: "0 4px", marginTop: 8 }}
                />
              </Flex>

           

              {!skipOneLiner && project.oneLiner && (
                <Typography.Paragraph
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorMedium,
                    marginBottom: 0,
                    marginTop: 8,
                    lineHeight: "140%",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  ellipsis={{
                    rows: 3,
                    tooltip: parseOneLiner(project.oneLiner).text,
                  }}
                  onClick={(e) => handleShowOneLiner(e, project)}
                >
                  {parseOneLiner(project.oneLiner).text}
                </Typography.Paragraph>
              )}
              <Flex style={{ width: "100%", marginTop: 8 }} gap={4}>
                {project.lvnzyProjectId && (
                  <Flex
                    align="center"
                    justify="center"
                    onClick={(e) => handleToggleSave(e, project)}
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <DynamicReactIcon
                      iconName={
                        savedIds.includes(project.lvnzyProjectId)
                          ? "MdOutlineBookmark"
                          : "MdOutlineBookmarkBorder"
                      }
                      iconSet="md"
                      size={16}
                      color={COLORS.primaryColor}
                    />
                  </Flex>
                )}

                 {project.projectLocation?.lat && project.projectLocation?.lng && (
                  <Flex
                    align="center"
                    justify="center"
                    onClick={(e) => handleLocateOnMap(e, project)}
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                    }}
                  >
                    <DynamicReactIcon
                      iconName="IoLocateOutline"
                      iconSet="io5"
                      size={18}
                      color={COLORS.primaryColor}
                    />
                  </Flex>
                )}

                {project.isDeveloperPartner && (
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <DynamicReactIcon
                      iconName="FaPeopleArrows"
                      iconSet="fa6"
                      size={14}
                      color={COLORS.primaryColor}
                    />
                  </Flex>
                )}

                {onSelectProject && (
                  <Flex
                    id="project-details"
                    align="center"
                    justify="center"
                    onClick={(e) => {
                      // cards are wrapped in a Link - don't navigate on icon click
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    style={{
                      height: 24,
                      marginLeft: "auto",
                      flexShrink: 0,
                      padding: "2px 4px",
                      borderRadius: 4,
                      backgroundColor:COLORS.primaryColor ,
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                      cursor: "pointer",
                      color: "white",
                      fontSize: FONT_SIZE.SUB_TEXT
                    }}
                  >
                    {/* <DynamicReactIcon
                      iconName={project.projectStatus === "report-verified" ? "TbView360Number": "BiDetail"}
                      iconSet={project.projectStatus === "report-verified" ? "tb": "bi"}
                      size={18}
                      color={project.projectStatus === "report-verified" ? "white": COLORS.primaryColor}
                    /> */}
                    360 Details
                  </Flex>
                )}
              </Flex>
              </Flex>
              {/* {onSelectProject && (
                  <Flex
                    id="project-details"
                    align="center"
                    justify="center"
                    onClick={(e) => {
                      // cards are wrapped in a Link - don't navigate on icon click
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: project.projectStatus === "report-verified" ? COLORS.primaryColor : "rgba(255, 255, 255, 0.9)",
                      cursor: "pointer",
                    }}
                  >
                   <Typography.Text style={{color: "white"}}>View 360 Analysis</Typography.Text>
                  </Flex>
                )} */}
            </Flex>
          </Card>
          </Flex>
      ))}
    </Flex>
  );
}

// Placeholder row shown while a project list is still being fetched (see
// brickchat-client's streaming block) - same card size/shape and scroll row
// as the full (non-minimal) result cards above, so the real cards drop into
// the same space.
export function BrickChatResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Flex className={styles.scrollContainer} gap={0}>
      {Array.from({ length: count }).map((_, i) => (
        <Flex key={i} style={{ width: 225, flexShrink: 0 }}>
          <Card
            style={{
              width: 200,
              borderRadius: 12,
              overflow: "hidden",
              margin: "8px 0",
              border: `1px solid ${COLORS.borderColor}`,
            }}
            styles={{ body: { padding: 8 } }}
            cover={
              <Skeleton.Node
                active
                style={{ width: 200, height: 100, borderRadius: 0 }}
              >
                <span />
              </Skeleton.Node>
            }
          >
            <Skeleton
              active
              title={{ width: "70%", }}
              paragraph={{ rows: 0, width: ["40%", "90%", "80%"] }}
            />
          </Card>
        </Flex>
      ))}
    </Flex>
  );
}
