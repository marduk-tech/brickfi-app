"use client";

import { useDevice } from "@/hooks/use-device";
import { CustomError } from "@/libs/error-handler";
import { getRealEstateDeveloperBySlugQuery } from "@/queries/real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import { Alert, Collapse, Flex, Spin, Tabs, TabsProps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RealEstateDeveloperLoading from "./loading";
import LandingHeader from "@/custom-pages/landing/header";
import LandingFooter from "@/custom-pages/landing/footer";
import { capitalize } from "@/libs/lvnzy-helper";
import { safeWindow } from "@/libs/browser-utils";
import { LandingConstants } from "@/libs/constants";
import { CaretRightOutlined } from "@ant-design/icons";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import ReportCTABar from "@/components/common/report-cta-bar";

const { Paragraph, Text } = Typography;

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

  const [flickerWait, setFlickerWait] = useState(true);

  const { isMobile } = useDevice();

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 1000);
  });

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
                        <Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_2,
                            fontWeight: 500,
                          }}
                        >
                          {project.name}
                        </Text>
                        <Text style={{ textWrap: "wrap" }}>
                          {project.location}
                        </Text>
                        <Text style={{ textWrap: "wrap" }}>{project.type}</Text>
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

  if (isLoading || flickerWait) {
    return <RealEstateDeveloperLoading />;
  }

  if (!developer || !developer.genDetails) {
    throw new CustomError({
      status: 500,
      title: "Something went super wrong",
      description: "Please try again later",
    });
  }

  const renderCTA = () => {
    return (
      <Flex
        align="center"
        gap={16}
        style={{
          cursor: "pointer",
          backgroundColor: COLORS.primaryColor,
          borderRadius: 4,
          margin: "16px 0",
          padding: 8,
          maxWidth: 500,
        }}
        onClick={() => {
          safeWindow.location.assign(LandingConstants.genReportFormLink);
        }}
      >
        <img
          src="/images/real-estate-dev/report-cta-icon.png"
          height={60}
        ></img>
        <Flex vertical>
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_2, color: "white" }}
          >
            Get a free Brick360 Report.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: "white",
              lineHeight: "110%",
            }}
          >
            Get a free Brick360 report for detailed builder credibility analysis
            including time committment, customer satisfaction and more.
          </Typography.Text>
        </Flex>
      </Flex>
    );
  };
  const renderProject = (project: any, index: number) => {
    const regex = /\b(plot|apartment|villa)(?=s?\b)/gi;
    let subType = project.subType ? project.subType.match(regex): "";
    if (!subType) {
      subType = `${project.type.toLowerCase()}, ${project.unitVariations.toLowerCase()}`.match(regex);
      subType = subType && subType.length ? subType[0]: "";
    } else {
      subType = subType.length ? subType[0]: subType;
    }
    const type = project.type.toLowerCase() == "residential" ? "Residential Community": project.type;
    
    return (
      <Flex
        key={index}
        style={{
          minWidth: 200,
          border: `1.5px solid ${COLORS.borderColor}`,
          borderRadius: 8,
          padding: 4,
        }}
        vertical
      >
        <div
          style={{
            backgroundImage: `url(/images/builder-page/${
              project.type.toLowerCase() == "residential" || project.type.toLowerCase().includes("residential")
                ? subType
                  ? subType.toLowerCase()
                  : "apartment"
                : "commercial"
            }.png)`,
            backgroundPosition: "center",
            backgroundSize: "60%",
            backgroundRepeat: "no-repeat",
            height: isMobile ? 150 : 100,
            width: "100%",
          }}
        ></div>

          <Text
            style={{
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 500,
              lineHeight: "100%",
              textWrap: "wrap",
            }}
          >
            {project.name}
          </Text>
           <Text
            style={{
              textWrap: "wrap",
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorMedium,
              marginBottom: 8,
              lineHeight: "110%"
            }}
          >
            {project.location}
          </Text>
          <Text style={{ textWrap: "wrap", fontSize: FONT_SIZE.HEADING_4, lineHeight: "110%", marginTop: "0" }}>
            {capitalize(type)} {subType ? `| ${capitalize(subType)}`: ""}
          </Text>
         
           {/* <Text
            style={{
              textWrap: "wrap",
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorMedium,
              lineHeight: "110%"
            }}
          >
            {project.unitVariations}
          </Text> */}
      </Flex>
    );
  };

  const renderFaq = (faq: any) => {
    const faqItems = faq.map((qa: any) => {
      return {
        key: qa.question.toLowerCase().replaceAll(" ", "-"),
        label: qa.question,
        children: (
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {qa.answer}
          </Markdown>
        ),
      };
    });
    return (
      <Collapse
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              marginTop: 4,
            }}
            rotate={isActive ? 90 : 0}
          />
        )}
        style={{ width: isMobile ? "100%" : 900, border: "none" }}
        items={faqItems}
        defaultActiveKey={["1"]}
      />
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
          paddingTop: 100,
          paddingBottom: 100,
          margin: isMobile ? 8 : "auto",
        }}
      >
        <Text style={{ color: COLORS.textColorMedium }}>
          Real Estate Developer &gt; {developer.name}
        </Text>
        <Flex vertical>
          <Text style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: "bold" }}>
            {developer.name}
          </Text>
          <Paragraph
            style={{ marginBottom: 16, fontSize: FONT_SIZE.HEADING_3 }}
            ellipsis={{ rows: 6, expandable: true }}
          >
            {developer.info?.oneLiner}
          </Paragraph>

          <h2
            style={{
              color: COLORS.primaryColor,
              marginBottom: 0,
              fontWeight: 300,
              textTransform: "uppercase",
            }}
          >
            Projects
          </h2>
          {/* <Tabs defaultActiveKey="projects" items={items} /> */}
          <Flex
            style={{
              width: "100%",
              overflowX: "scroll",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
              marginBottom: 16,
            }}
            gap={16}
          >
            {developer.genDetails.details.projects
              ?.slice(0, isMobile ? 5 : 10)
              .map((project: any, index: number) => {
                return renderProject(project, index);
              })}
          </Flex>
          <ReportCTABar
            msg="Get a free Brick360 report for detailed builder credibility analysis
            including time committment, customer satisfaction and more."
          ></ReportCTABar>
          <h2
            style={{
              color: COLORS.primaryColor,
              marginBottom: 0,
              fontWeight: 300,
              textTransform: "uppercase",
              marginTop: 16,
            }}
          >
            MORE ABOUT THE BUILDER
          </h2>

          <h3
            style={{
              color: COLORS.textColorMedium,
              marginBottom: 0,
              fontWeight: 300,
            }}
          >
            Experience
          </h3>

          <Typography.Text>
            {developer.info.credibility.experienceTime}
          </Typography.Text>

          <h3
            style={{
              color: COLORS.textColorMedium,
              marginBottom: 0,
              fontWeight: 300,
            }}
          >
            Project Types
          </h3>

          <Typography.Text>
            {developer.info.credibility.projectsTheme}
          </Typography.Text>

          <h2
            style={{
              color: COLORS.primaryColor,
              marginBottom: 0,
              fontWeight: 300,
              textTransform: "uppercase",
              marginTop: 16,
            }}
          >
            FAQ
          </h2>

          {renderFaq(developer.info.faq)}
          {/* <Flex
            align="center"
            style={{ width: "100%", marginTop: 72 }}
            justify="center"
            onClick={() => {
              safeWindow.location.assign(LandingConstants.reportLink);
            }}
          >
            <img
              style={{
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: 8,
                maxWidth: 500,
              }}
              src={
                isMobile
                  ? "/images/builder-page/free-report-cta-mob.png"
                  : "/images/builder-page/free-report-cta.png"
              }
              height="auto"
              width="100%"
            ></img>
          </Flex> */}
        </Flex>
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
}
