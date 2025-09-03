"use client";

import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { RealEstateDeveloper } from "@/types/RealEstateDeveloper";
import { Flex, Tabs, TabsProps, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const { Paragraph } = Typography;

interface RealEstateDeveloperClientProps {
  developer: RealEstateDeveloper;
}

export default function RealEstateDeveloperClient({
  developer,
}: RealEstateDeveloperClientProps) {
  const [items, setItems] = useState<TabsProps["items"]>([]);
  const { isMobile } = useDevice();

  useEffect(() => {
    if (developer && developer.genDetails) {
      setItems([
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
              {developer.genDetails.details.projects.map(
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
              {developer.info.management}
            </Markdown>
          ),
        },
        {
          key: "financials",
          label: "Financials",
          children: (
            <Markdown remarkPlugins={[remarkGfm]}>
              {developer.info.financials}
            </Markdown>
          ),
        },
      ]);
    }
  }, [developer, isMobile]);

  return (
    <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
      <Flex vertical style={{ padding: 16 }}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}
        >
          {developer.name}
        </Typography.Text>
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {developer.info.oneLiner}
        </Paragraph>

        <Tabs defaultActiveKey="projects" items={items} />
      </Flex>
    </Flex>
  );
}