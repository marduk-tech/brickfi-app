"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Card, Flex, Typography } from "antd";
import Link from "next/link";
import styles from "./brick-chat-results.module.css";
import { ProjectResult } from "@/app/app/brickchat/page";


interface BrickChatResultsProps {
  results: ProjectResult[];
}

const formatPriceInCrores = (price: number): string => {
  const crores = price / 10000000;
  return `₹${crores.toFixed(2)} Crs`;
};

const getProjectMetadata = (project: ProjectResult): string => {
  const parts: string[] = [];

  if (project.projectUnitTypes && project.projectUnitTypes.length > 0) {
    parts.push(project.projectUnitTypes[0]);
  }

  if (project.projectCorridor !== undefined) {
    parts.push(`${project.projectCorridor}`);
  }

  if (project.projectMinMaxPrice) {
    const minPrice = formatPriceInCrores(project.projectMinMaxPrice.min);
    const maxPrice = formatPriceInCrores(project.projectMinMaxPrice.max);
    parts.push(`${minPrice}-${maxPrice}`);
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
          >
            <Card
              hoverable
              style={{
                width: 200,
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
                      <Typography.Text type="secondary">
                        No Image
                      </Typography.Text>
                    </Flex>
                  )}
                </div>
              }
            >
              <Flex vertical gap={8}>
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

                {/* {getProjectMetadata(project) && (
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      color: COLORS.textColorMedium,
                    }}
                    ellipsis={{ tooltip: getProjectMetadata(project) }}
                  >
                    {getProjectMetadata(project)}
                  </Typography.Text>
                )} */}

                <Typography.Paragraph
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorMedium,
                    lineHeight: 1.5,
                    marginBottom: 0,
                  }}
                  ellipsis={{ rows: 2, tooltip: project.oneLiner }}
                >
                  {project.oneLiner}
                </Typography.Paragraph>
              </Flex>
            </Card>
          </Link>
        ))}
    </Flex>
  );
}
