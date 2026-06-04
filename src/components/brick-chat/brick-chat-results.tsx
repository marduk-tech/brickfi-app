"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Card, Flex, Tag, Typography } from "antd";
import Link from "next/link";
import DynamicReactIcon from "../common/dynamic-react-icon";
import styles from "./brick-chat-results.module.css";
import { ProjectResult } from "@/app/app/brickchat/brickchat-client";
import { capitalize, rupeeAmountFormat } from "@/libs/lvnzy-helper";

interface BrickChatResultsProps {
  results: ProjectResult[];
}

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
  if (!results || results.length === 0) {
    return (
      <Typography.Text type="secondary">
        No projects found matching your search.
      </Typography.Text>
    );
  }

  return (
    <Flex className={styles.scrollContainer} gap={16}>
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
