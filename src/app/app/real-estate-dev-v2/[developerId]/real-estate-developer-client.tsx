"use client";

import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { Alert, Flex, Tabs, TabsProps, Typography } from "antd";
import { notFound } from "next/navigation";
import { use } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DeveloperActionResult, RealEstateDeveloper } from "./actions/types";
import { ErrorFallback } from "./components/error-fallback";

const { Paragraph } = Typography;

interface RealEstateDeveloperClientProps {
  developerPromise: Promise<DeveloperActionResult>;
  developerId: string;
}

export default function RealEstateDeveloperClient({
  developerPromise,
  developerId,
}: RealEstateDeveloperClientProps) {
  const result = use(developerPromise);

  const { isMobile } = useDevice();

  const developer = result.success ? result.data : null;

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
                  (project, index: number) => {
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

  // Handle error states after hooks
  if (!result.success) {
    if (result.error === "Developer not found") {
      notFound();
    }

    return (
      <ErrorFallback
        title="Failed to load developer information"
        message={result.error || "Please try again later."}
        type="error"
      />
    );
  }

  if (!result.data) {
    return (
      <ErrorFallback
        title="Developer not found"
        message="The requested developer information could not be found."
        type="warning"
      />
    );
  }

  return (
    <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
      <Flex vertical style={{ padding: 16 }}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}
        >
          {result.data.name}
        </Typography.Text>
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {result.data.info?.oneLiner}
        </Paragraph>

        {items && items.length > 0 ? (
          <Tabs defaultActiveKey="projects" items={items} />
        ) : (
          <Alert
            message="No additional information available"
            description="This developer profile doesn't have detailed information yet."
            type="info"
            showIcon
          />
        )}
      </Flex>
    </Flex>
  );
}
