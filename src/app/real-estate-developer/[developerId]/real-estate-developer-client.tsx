"use client";

import { useDevice } from "@/hooks/use-device";
import { CustomError } from "@/libs/error-handler";
import { getRealEstateDeveloperBySlugQuery } from "@/queries/real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import { Alert, Flex, Spin, Tabs, TabsProps, Typography } from "antd";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RealEstateDeveloperLoading from "./loading";

const { Paragraph } = Typography;

interface RealEstateDeveloperClientProps {
  slug: string;
}

export default function RealEstateDeveloperClient({
  slug,
}: RealEstateDeveloperClientProps) {
  const {
    data: developer,
    isLoading,
    isError,
    error,
  } = useQuery({ ...getRealEstateDeveloperBySlugQuery(slug), retry: 3 });

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
    return <RealEstateDeveloperLoading />;
  }

  if (!developer || !developer.genDetails) {
    throw new CustomError({
      status: 500,
      title: "Something went super wrong",
      description: "Please try again later",
    });
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
