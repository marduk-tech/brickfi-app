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
import LandingHeader from "@/custom-pages/landing/header";
import LandingFooter from "@/custom-pages/landing/footer";
import { capitalize } from "@/libs/lvnzy-helper";
import { safeWindow } from "@/libs/browser-utils";
import { LandingConstants } from "@/libs/constants";

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
  const renderProject = (project: any, index: number) => {
    return (
      <Flex
        key={index}
        style={{
          width: isMobile ? "100%" : 200,
          border: `1.5px solid ${COLORS.borderColor}`,
          borderRadius: 8,
          padding: 4,
        }}
        vertical
      >
        <div
          style={{
            backgroundImage: `url(/images/builder-page/${
              project.type == "residential" ? project.subType : "commercial"
            }.png)`,
            backgroundPosition: "center",
            backgroundSize: "60%",
            backgroundRepeat: "no-repeat",
            height: 100,
            width: "100%",
          }}
        ></div>
        <Flex vertical style={{ marginTop: 8 }}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 500,
              lineHeight: "100%",
              marginBottom: 8,
            }}
          >
            {project.name}
          </Typography.Text>
          <Typography.Text
            style={{ textWrap: "wrap", fontSize: FONT_SIZE.PARA }}
          >
            {capitalize(project.type)} | {capitalize(project.subType)}
          </Typography.Text>
          <Typography.Text
            style={{
              textWrap: "wrap",
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorMedium,
            }}
          >
            {project.location}
          </Typography.Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      ></LandingHeader>
      <Flex
        vertical
        style={{
          maxWidth: MAX_WIDTH,
          margin: "auto",
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <Typography.Text style={{ color: COLORS.textColorMedium }}>
          Real Estate Developer &gt; {developer.name}
        </Typography.Text>
        <Flex vertical>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}
          >
            {developer.name}
          </Typography.Text>
          <Paragraph
            style={{ marginBottom: 32 }}
            ellipsis={{ rows: 6, expandable: true }}
          >
            {developer.info?.oneLiner}
          </Paragraph>

          {/* <Tabs defaultActiveKey="projects" items={items} /> */}
          <Flex style={{ width: "100%", flexWrap: "wrap" }} gap={16}>
            {developer.genDetails.details.projects
              ?.slice(
                0,
                10
              )
              .map((project: any, index: number) => {
                return renderProject(project, index);
              })}

            {/* <Flex
              key={developer.genDetails.details.projects.length}
              style={{
                width: isMobile ? "100%" : 200,
                border: `1.5px solid ${COLORS.borderColor}`,
                borderRadius: 8,
                padding: 4,
                
              }}
              vertical
            >
              <div
                style={{
                  backgroundImage: `url(/images/builder-page/lock-symbol.png)`,
                  backgroundPosition: "center",
                  backgroundSize: "30%",
                  backgroundRepeat: "no-repeat",
                  height: "100%",
                  width: "100%",
                  opacity: 0.4
                }}
              ></div>
            </Flex> */}
          </Flex>

          <Flex
            align="center"
            style={{ width: "100%", marginTop: 32 }}
            justify="center"
            onClick={() => {
              safeWindow.location.assign(LandingConstants.reportLink);
            }}
          >
            <img
              style={{
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: 8,
              }}
              src="/images/builder-page/free-report-cta.png"
              height={300}
              width="auto"
            ></img>
          </Flex>
        </Flex>
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
}
