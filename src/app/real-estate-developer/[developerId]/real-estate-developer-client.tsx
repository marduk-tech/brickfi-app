"use client";

import { CustomError } from "@/libs/error-handler";
import { getRealEstateDeveloperBySlugQuery } from "@/queries/real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Collapse,
  Flex,
  Spin,
  Tabs,
  TabsProps,
  Tag,
  Typography,
} from "antd";
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
import SectionCenter from "@/custom-pages/landing/section";
import { useLatestBlogs } from "@/hooks/marketing-hooks";

const { Paragraph, Text } = Typography;

interface RealEstateDeveloperClientProps {
  slug: string;
  initialIsMobile?: boolean;
}

export default function RealEstateDeveloperClient({
  slug,
  initialIsMobile = false,
}: RealEstateDeveloperClientProps) {
  const {
    data: developer,
    isLoading,
    isError,
    error,
  } = useQuery({ ...getRealEstateDeveloperBySlugQuery(slug), retry: 3 });

  const { data: latestBlogs = [] } = useLatestBlogs();

  const [isMobile, setIsMobile] = useState(initialIsMobile);

  useEffect(() => {
    const detect = () => {
      const el = document.createElement("div");
      el.className = "mobile-only";
      el.style.cssText = "position:absolute;visibility:hidden";
      document.body.appendChild(el);
      const detected = window.getComputedStyle(el).display === "block";
      document.body.removeChild(el);
      setIsMobile(detected);
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

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
                  },
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
    const regex = /\b(plot|apartment|villa|rowhouse)(?=s?\b)/gi;
    let subType = project.subType ? project.subType.match(regex) : "";
    if (!subType) {
      subType =
        `${project.type.toLowerCase()}, ${project.unitVariations.toLowerCase()}`.match(
          regex,
        );
      subType = subType && subType.length ? subType[0] : "";
    } else {
      subType = subType.length ? subType[0] : subType;
    }
    const type =
      project.type.toLowerCase() == "residential"
        ? "Residential Community"
        : project.type;

    return (
      <Flex
        key={index}
        style={{
          width: 225,
          flexShrink: 0,
          border: `1.5px solid ${COLORS.borderColor}`,
          borderRadius: 8,
          padding: 8,
        }}
        vertical
      >
        <div
          style={{
            backgroundImage: `url(/images/builder-page/${
              project.type.toLowerCase() == "residential" ||
              project.type.toLowerCase().includes("residential")
                ? subType
                  ? subType.toLowerCase()
                  : "apartment"
                : "commercial"
            }-r.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: isMobile ? 200 : 150,
            width: "100%",
            borderRadius: 8,
          }}
        ></div>

        <Flex vertical style={{ padding: "8px 0" }}>
          <Text
            ellipsis={{ tooltip: project.name }}
            style={{
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 500,
              lineHeight: "100%",
            }}
          >
            {project.name}
          </Text>
          <Text
            style={{
              textWrap: "wrap",
              fontSize: FONT_SIZE.HEADING_4,
              lineHeight: "110%",
              marginTop: "0",
            }}
          >
            {capitalize(type)} {subType ? `| ${capitalize(subType)}` : ""}
          </Text>
          <Flex gap={4} wrap style={{ marginTop: 16 }}>
            {Array.from(
              new Set(
                project.location
                  ?.split(",")
                  .map((s: string) => s.trim().split(" ")[0])
                  .filter(Boolean)
                  .map((w: string) =>
                    w.toLowerCase() === "bengaluru" ? "Bangalore" : w,
                  ),
              ),
            ).map((word) => (
              <Tag
                color={COLORS.textColorDark}
                key={word as string}
                style={{ fontSize: FONT_SIZE.SUB_TEXT, margin: 0 }}
              >
                {word as string}
              </Tag>
            ))}
          </Flex>
        </Flex>
      </Flex>
    );
  };

  const renderFaq = (faq: any) => {
    const faqItems = faq.map((qa: any, index: number) => {
      return {
        key: `${index + 1}`,
        label: (
          <p style={{ fontWeight: 600, margin: 0, marginTop: 2, fontSize: FONT_SIZE.HEADING_3 }}>
            {qa.question}
          </p>
        ),
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
        style={{ width: "100%", border: "none" }}
        items={faqItems}
        defaultActiveKey={faqItems.map((item: any) => item.key)}
      />
    );
  };

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
        isMobile={isMobile}
      ></LandingHeader>
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          paddingTop: 100,
          paddingBottom: 100,
          width: isMobile ? "100%" : "auto",
          margin: 0,
        }}
      >
        <Flex
          vertical
          justify="center"
          align="flex-start"
          style={{ width: isMobile ? "96%" : "auto"}}
        >
          <Text
            style={{ color: COLORS.textColorMedium, wordBreak: "break-word" }}
          >
            Real Estate Developer &gt; {developer.name}
          </Text>

          <h1
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              fontWeight: "bold",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {developer.name}
          </h1>
          <Paragraph
            style={{
              marginBottom: 16,
              width: isMobile ? "100%" : 1200,
            }}
            ellipsis={{ rows: 6, expandable: true }}
          >
            {developer.info?.oneLiner}
          </Paragraph>

          <Typography.Text style={{ width: isMobile ? "100%" : 1200 }}>
            {developer.info.credibility.experienceTime}
          </Typography.Text>
        </Flex>

        {/* Banner BrickAssist */}
        <Flex
          align="center"
          justify="center"
          vertical={isMobile}
          gap={64}
          style={{
            padding: "32px 0",
            margin: "24px 0",
            backgroundColor: COLORS.LANDING.MEDIUM_PINK,
          }}
        >
          <Flex vertical style={{ width: isMobile ? "96%" : "40%" }}>
            <Flex align="center" gap={4} style={{ marginBottom: 8 }}>
              <img
                src="/images/landing/brickassistv2/logo.png"
                style={{ width: "auto", height: 20 }}
              ></img>
              <Typography.Text
                style={{
                  fontSize: 20,
                  color: COLORS.primaryColor,
                  lineHeight: "100%",
                  fontWeight: 500,
                }}
              >
                BRICKFI ASSIST
              </Typography.Text>
            </Flex>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                fontWeight: 300,
                width: isMobile ? "100%" : 500,
                padding: 0,
                margin: 0,
                lineHeight: "100%",
                wordBreak: "break-word",
              }}
            >
              Experience The Difference in Home Buying with Brickfi Assist
            </Typography.Text>
            <p>
              Brickfi presents the new way to find your dream home. No hype, No
              manipulation, No pushing inventory. Only legitimate data and hard
              facts to ensure your interests are protected
            </p>
            <Button
              type="default"
              style={{ height: 32, width: 175 }}
              onClick={() => {
                safeWindow.location.assign(LandingConstants.brickAssistLink);
              }}
            >
              Explore Brickfi Assist
            </Button>
          </Flex>
          <img
            src="/images/landing/brickassistv2/2.png"
            style={{
              height: "auto",
              width: isMobile ? "95%" : 400,
              maxWidth: "100%",
            }}
          ></img>
        </Flex>

        {/* Developer Projects */}
        <Flex
          align="flex-start"
          vertical
          style={{ marginTop: 0, width: isMobile ? "96%" : "auto" }}
        >
          <h2
            style={{
              color: COLORS.textColorDark,
              fontWeight: 300,
              margin: 0,
              marginBottom: 8,
              fontSize: FONT_SIZE.HEADING_1,
            }}
          >
            Developer Projects
          </h2>
          {/* <Tabs defaultActiveKey="projects" items={items} /> */}

          <Paragraph
            style={{ marginBottom: 16, width: isMobile ? "100%" : 1200 }}
          >
            {developer.info.credibility.projectsTheme}
          </Paragraph>
          <Flex
            style={{
              width: isMobile ? "100%" : 1200,
              overflowX: "scroll",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
              marginBottom: 0,
            }}
            gap={16}
          >
            {developer.genDetails.details.projects
              ?.slice(0, isMobile ? 5 : 10)
              .map((project: any, index: number) => {
                return renderProject(project, index);
              })}
          </Flex>
        </Flex>

        {/* FAQ */}
        <Flex
          justify="center"
          align="flex-start"
          vertical
          style={{ marginTop: 32, width: isMobile ? "96%" : "auto" }}
        >
          <h2
            style={{
              color: COLORS.textColorDark,
              marginBottom: 0,
              fontWeight: 300,
              fontSize: FONT_SIZE.HEADING_1,
              textTransform: "uppercase",
              marginTop: 16,
            }}
          >
            FAQ
          </h2>

          <Flex style={{ width: isMobile ? "100%" : 1200 }}>
            {renderFaq(developer.info.faq)}
          </Flex>
        </Flex>

        {/* Rpeport CTA */}
        <Flex
          justify="center"
          style={{
            margin: "32px 0",
            padding: "8px 0",
            backgroundColor: COLORS.LANDING.MEDIUM_PINK,
            width: "100%",
            borderRadius: 8,
          }}
          align="center"
        >
          <ReportCTABar
            title={`Brick360 Report for ${developer.name}`}
            msg="Get a free Brick360 report for detailed builder credibility analysis
            including time committment, customer complaints and more."
            isMobile={isMobile}
          ></ReportCTABar>
        </Flex>

        {/* Blogs List */}
        {latestBlogs.length > 0 && (
          <Flex
            vertical
            align="flex-start"
            style={{ marginTop: 32, width: isMobile ? "96%" : "auto" }}
          >
            <h2
              style={{
                color: COLORS.textColorDark,
                fontWeight: 300,
                margin: 0,
                marginBottom: 16,
                fontSize: FONT_SIZE.HEADING_1,
              }}
            >
              Latest from the Blog
            </h2>
            <Flex
              style={{
                width: isMobile ? "100%" : 1200,
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
              gap={16}
            >
              {latestBlogs.map((blog) => (
                <Flex
                  key={blog.slug}
                  vertical
                  style={{
                    width: 220,
                    flexShrink: 0,
                    border: `1.5px solid ${COLORS.borderColor}`,
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    safeWindow.location.assign(
                      `https://blog.brickfi.in/${blog.slug}`,
                    )
                  }
                >
                  <div
                    style={{
                      height: 130,
                      backgroundImage: blog.feature_image
                        ? `url(${blog.feature_image})`
                        : undefined,
                      backgroundColor: blog.feature_image
                        ? undefined
                        : COLORS.borderColorMedium,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <Flex vertical style={{ padding: 8 }} gap={4}>
                    <Text
                      ellipsis={{ tooltip: blog.title }}
                      style={{
                        fontSize: FONT_SIZE.HEADING_4,
                        fontWeight: 500,
                        whiteSpace: "normal",
                        lineHeight: "120%",
                      }}
                    >
                      {blog.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorMedium,
                      }}
                    >
                      {new Date(blog.published_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
}
