"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Card, Flex, Typography } from "antd";
import Link from "next/link";

interface ProjectResult {
  projectId: string;
  projectName: string;
  oneLiner: string;
}

interface BrickChatResultsProps {
  results: ProjectResult[];
}

export default function BrickChatResults({ results }: BrickChatResultsProps) {
  if (!results || results.length === 0) {
    return (
      <Typography.Text type="secondary">
        No projects found matching your search.
      </Typography.Text>
    );
  }

  return (
    <Flex vertical gap={12}>
      {results.map((project, idx) => (
        <Link
          key={project.projectId}
          href={`/app/brick360/${project.projectId}`}
          style={{ textDecoration: "none" }}
        >
          <Card
            hoverable
            size="small"
            style={{
              borderLeft: `4px solid ${COLORS.primaryColor}`,
              backgroundColor: COLORS.bgColor,
            }}
          >
            <Flex vertical gap={4}>
              <Typography.Text
                strong
                style={{
                  fontSize: FONT_SIZE.HEADING_3,
                  color: COLORS.textColorDark,
                }}
              >
                {idx + 1}. {project.projectName}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.PARA,
                  color: COLORS.textColorMedium,
                }}
              >
                {project.oneLiner}
              </Typography.Text>
            </Flex>
          </Card>
        </Link>
      ))}
    </Flex>
  );
}
