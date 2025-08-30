"use client";

import { Loader } from "@/components/common/loader";
import { useDevice } from "@/hooks/use-device";
import { useFetchRealEstateDeveloperId } from "@/hooks/use-real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { Flex, Tabs, TabsProps, Typography } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
const { Paragraph } = Typography;

export default function RealEstateDeveloperPage() {
  const { developerId } = useParams<{ developerId: string }>()!;
  const { data: realEstateDeveloper, isLoading: realEstateDeveloperLoading } =
    useFetchRealEstateDeveloperId(developerId!);
  const [items, setItems] = useState<TabsProps["items"]>([]);
  const { isMobile } = useDevice();

  useEffect(() => {
    if (realEstateDeveloper && realEstateDeveloper.genDetails) {
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
              {realEstateDeveloper!.genDetails.details.projects.map(
                (project: any) => {
                  return (
                    <Flex
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
              {realEstateDeveloper!.info.management}
            </Markdown>
          ),
        },
        {
          key: "financials",
          label: "Financials",
          children: (
            <Markdown remarkPlugins={[remarkGfm]}>
              {realEstateDeveloper!.info.financials}
            </Markdown>
          ),
        },
      ]);
    }
  }, [realEstateDeveloper]);

  if (realEstateDeveloperLoading) {
    return <Loader></Loader>;
  }

  return (
    <Flex vertical style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
      {/* <div
        style={{
          backgroundImage: `url("https://www.punctualabstract.com/wp-content/uploads/2019/01/Best-Markets-for-Real-Estate-Investors.png"
              )`,
          height: 300,
          width: "100%",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      ></div> */}
      <Flex vertical style={{ padding: 16 }}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}
        >
          {realEstateDeveloper!.name}
        </Typography.Text>
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {realEstateDeveloper!.info.oneLiner}
        </Paragraph>

        <Tabs defaultActiveKey="1" items={items} />
      </Flex>
    </Flex>
  );
}
