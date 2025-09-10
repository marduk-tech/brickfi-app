"use client";

import { useDevice } from "@/hooks/use-device";
import { getRealEstateDevelopersQuery } from "@/queries/real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import { Alert, Flex, Spin, Tabs, TabsProps, Typography } from "antd";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { Paragraph } = Typography;

interface RealEstateDeveloperClientProps {
  developerId: string;
}

export default function RealEstateDeveloperClient({
  developerId,
}: RealEstateDeveloperClientProps) {
  const {
    data: developer,
    isLoading,
    isError,
    error,
  } = useQuery(getRealEstateDevelopersQuery(developerId));

  const { isMobile } = useDevice();

  const items: TabsProps["items"] =
    developer && developer.genDetails
      ? [
          {
            key: "projects",
            label: "Projects",
            children: (
              <Flex
                style={{
                  width: "100%",
                  flexWrap: "wrap",
                }}
                gap={16}
              >
                {developer.genDetails.details.projects?.map(
                  (project: any, index: number) => {
                    return (
                      <Flex
                        key={index}
                        vertical
                        style={{
                          width: isMobile ? "100%" : 250,
                          border: `1px solid ${COLORS.borderColorMedium}`,
                          borderRadius: 8,
                          padding: 4,
                        }}
                      >
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_2,
                            fontWeight: 500,
                          }}
                        >
                          {project.name}
                        </Typography.Text>
                        <Typography.Text style={{ textWrap: "wrap" }}>
                          {project.location}
                        </Typography.Text>
                        <Typography.Text style={{ textWrap: "wrap" }}>
                          {project.type}
                        </Typography.Text>
                      </Flex>
                    );
                  }
                )}
              </Flex>
            ),
          },
          {
            key: "mgmt",
            label: "Management",
            children: (
              <Markdown remarkPlugins={[remarkGfm]}>
                {developer.info?.management ||
                  "No management information available."}
              </Markdown>
            ),
          },
          {
            key: "financials",
            label: "Financials",
            children: (
              <Markdown remarkPlugins={[remarkGfm]}>
                {developer.info?.financials ||
                  "No financial information available."}
              </Markdown>
            ),
          },
        ]
      : [];

  if (isLoading) {
    return (
      <Flex
        vertical
        style={{
          maxWidth: MAX_WIDTH,
          margin: "auto",
          padding: 16,
          minHeight: "50vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
        <Typography.Text style={{ marginTop: 16, color: "#666" }}>
          Loading developer information...
        </Typography.Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
        <Flex vertical style={{ padding: 16 }}>
          <Alert
            message="Failed to load developer information"
            description={error?.message || "Please try again later."}
            type="error"
            showIcon
          />
        </Flex>
      </Flex>
    );
  }

  if (!developer || !developer.genDetails) {
    return null;
  }

  return (
    <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
      <Flex vertical style={{ padding: 16 }}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}
        >
          {developer.name}
        </Typography.Text>
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {developer.info?.oneLiner}
        </Paragraph>

        <Tabs defaultActiveKey="projects" items={items} />
      </Flex>
    </Flex>
  );
}
