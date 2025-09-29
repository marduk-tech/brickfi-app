"use client";

import { Button, Collapse, CollapseProps, Flex, Typography } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { safeWindow } from "../../libs/browser-utils";
import { LandingConstants } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "./header";
import LandingFooter from "./footer";
import { CaretRightOutlined } from "@ant-design/icons";
import { SectionLeft, SectionCenter, SectionRight } from "./section";
import Marquee from "react-fast-marquee";
import { NewReportRequestForm } from "@/components/common/new-report-request-form";

export default function ReportLanding() {
  const { isMobile } = useDevice();

  const getFaqHeading = (text: string) => {
    return (
      <h3
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          textAlign: "left",
          color: COLORS.textColorDark,
          margin: 0,
          fontWeight: 500,
          lineHeight: "120%",
        }}
      >
        {text}
      </h3>
    );
  };

  const getFaqText = (text: string | ReactNode) => {
    return (
      <p style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}>
        {typeof text == "string" ? text : <>{text}</>}
      </p>
    );
  };
  const faqPanelStyle = {
    color: "black",
    padding: "8px 0",
  };
  const faqs: CollapseProps["items"] = [
    {
      key: "diff-q",
      label: getFaqHeading("What is Brick360 Report? "),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          Brick360 provides a consolidated and comprehensive report about any
          property in Bangalore covering information builder credibility,
          location insights, property profile, price point evaluation and more.
          We collect data over 200+ data points from sources like RERA, Open
          City, BBMP, City info and then do an end to end analysis using AI to
          create a report that enables you to analyse the property and make a
          confident decision.
        </>
      ),
    },
    {
      key: "paid-q",
      label: getFaqHeading("Is this report free ?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          <br></br>
          You can request upto 3 Brick360 reports for FREE to do a thorough
          analysis and make an informed decision. This service is completely
          free.
          <br></br>
          <a
            href={LandingConstants.genReportFormLink}
            style={{ fontSize: "90%", color: COLORS.primaryColor }}
          >
            Generate Free Report
          </a>
          <br></br>
        </>
      ),
    },
    {
      key: "does-report-compare-properties",
      label: getFaqHeading("Does the report compare multiple properties?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          You can download report for multiple properties and do a side by side
          comparison across different data points.
        </>
      ),
    },
    {
      key: "how-accurate-is-data",
      label: getFaqHeading("How accurate is the data in the report?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          We have put a system in place to fetch data from verified government
          and credible public sources. Besides, we also cross check as well as
          manually check the data for accuracy.
        </>
      ),
    },
    {
      key: "what-issues-revealed",
      label: getFaqHeading("What kind of issues can the report reveal?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          You can identify issues like high tension lines near the property,
          upcoming metro stations, understand premiumess of the property, look
          at timely delivery committment of the builder and much more.
        </>
      ),
    },
    {
      key: "will-property-appreciate",
      label: getFaqHeading(
        "Can this report tell me if the property will appreciate?"
      ),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          It includes a “Growth Potential” analysis based on location trends,
          upcoming infrastructure, and historical price patterns.
        </>
      ),
    },
    {
      key: "different-from-broker",
      label: getFaqHeading("How is this different from a broker’s advice?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          Brokers are often incentivized to sell specific properties and heavily
          market them. We do not have tie ups to specific properties and
          prioritize 100% data-driven and unbiased insights.
        </>
      ),
    },
    {
      key: "how-quickly-report",
      label: getFaqHeading("How quickly can I get my property report?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          A Brick360 report can be generated in as little as an hour. In some
          cases, it may take longer to gather all the necessary property
          details, but the report will always be delivered within 24–48 hours.
        </>
      ),
    },
    {
      key: "ask-questions-after-report",
      label: getFaqHeading("What if I have a question with the report ?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          The report is interactive and has an AI assistant which lets you ask
          unlimited questions for clarity and to generate more insights. You can
          also reach out to the Brickfi team at hello@brickfi.in in case you
          have any more specific questions.
        </>
      ),
    },
  ];

  useState(false);
  useEffect(() => {
    const hash = safeWindow.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        // Optional: add smooth scrolling
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);
  const whoAreWeText = (
    <Flex vertical>
      {/* <a
        href={LandingConstants.sampleReport}
        style={{
          fontSize: FONT_SIZE.HEADING_3,
          display: "block",
          color: COLORS.primaryColor,
        }}
      >
        SEE SAMPLE BRICK360 REPORT
      </a> */}
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          display: "block",
        }}
      >
        Get detailed 360 insights on builder credibility, price evaluation,
        neighborhood analysis, property profile and more.
      </Typography.Text>
    </Flex>
  );
  return (
    <Flex
      vertical
      style={{
        height: "100vh",
        overflowY: "scroll",
        position: "relative",
        paddingTop: 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      <LandingHeader
        bgColor="#fdf7f6"
        logo="/images/brickfi-logo.png"
        color={COLORS.textColorDark}
      ></LandingHeader>
      <SectionLeft
        sectionData={{
          id: "demo-brkfi",
          heading: (
            <Typography.Text
              style={{
                fontSize: isMobile
                  ? FONT_SIZE.HEADING_1 * 1.6
                  : FONT_SIZE.HEADING_1 * 2,
                lineHeight: "100%",
                fontWeight: 300,
                paddingTop: isMobile ? 60 : 0,
              }}
            >
              The 360° Scorecard for Smarter Property Decisions
            </Typography.Text>
          ),
          subHeading:
            "Get an independent, data-backed property report with builder history, surroundings, pricing, growth potential & more. Powered by 100% verified government and public data.",
          mediaUrl: "/images/landing/demo-landing.mp4?v=1",
          bgColor: "#fdf7f6",
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          imageContainerWidth: 45,
          primaryImageSize: "100%",
          fullHeight: true,
          verticalPadding: isMobile ? 50 : 0,
        }}
      ></SectionLeft>

      <SectionCenter
        sectionData={{
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          mainImgUrl: isMobile
            ? "/images/landing/report-numbers-mob.png"
            : "/images/landing/report-numbers.png",
          primaryImageSize: isMobile ? "80%" : "70%",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
          verticalPadding: 100,
        }}
      ></SectionCenter>
      <Flex
        style={{ backgroundColor: COLORS.LANDING.BLUISH, paddingBottom: 60 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "40%"}
          style={{ opacity: 0.3 }}
        ></img>
      </Flex>
      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          heading: "",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.4
                    : FONT_SIZE.HEADING_1 * 1.7,
                  marginBottom: 8,
                  lineHeight: "100%",
                  fontWeight: 200,
                  color: COLORS.textColorVeryLight,
                }}
              >
                Property Buying can be Risky & Confusing.
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.4
                    : FONT_SIZE.HEADING_1 * 1.7,
                  color: COLORS.primaryColor,
                  lineHeight: "100%",
                  fontWeight: 600,
                  marginBottom: 32,
                }}
              >
                Brick360 Report Gives You Clarity & Confidence
              </Typography.Text>
            </Flex>
          ),
          mainImgAltText: "About Brickfi",
          primaryImageSize: isMobile ? "100%" : "60%",
          mainImgUrl: isMobile
            ? "/images/landing/comparison-mob.png"
            : "/images/landing/comparison.png",
          imageContainerWidth: 50,
          verticalPadding: 42,
        }}
      ></SectionCenter>

      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          heading: "",
          subHeading: "",
          primaryImageSize: isMobile ? "100%" : "80%",
          mainImgUrl: isMobile
            ? "/images/landing/slide-9-v2-mob.png"
            : "/images/landing/slide-9-v2.png",
          mainImgAltText: "Testimonials from Brickfi Customers",
          imageContainerWidth: 50,
          verticalPadding: 100,
        }}
      ></SectionCenter>

      <Flex
        align="flex-start"
        justify="flex-start"
        style={{
          backgroundColor: COLORS.LANDING.LIGHT_PINK,
          padding: "100px 0",
          fontWeight: 200,
          width: "100%",
        }}
      >
        <Flex vertical style={{ maxWidth: 1400, margin: "auto" }}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1 * 1.5,
              lineHeight: "100%",
              fontWeight: 300
            }}
          >
            Make a <span style={{ color: COLORS.LANDING.PINK }}>Confident</span>{" "}
            Decision with Brick360 Report
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "100%",
            }}
          >
            A sneak peak of what you get in the report.
          </Typography.Text>
        </Flex>
      </Flex>

      <SectionLeft
        sectionData={{
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                marginBottom: 16,
              }}
            >
              Detailed Breakdown of The Layout
            </Typography.Text>
          ),
          subHeading:
            "Don't judge a property by its brochure (said someone); Brick360 looks at numbers like open space, unit density, unit distribution, amenities mix and more to give a deeper insights into property layout.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-layout.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          verticalPadding: 8,
        }}
      ></SectionLeft>

      {[
        {
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
              }}
            >
              Assesing Livability
            </Typography.Text>
          ),
          subHeading:
            "Analysing livability is more than just checking the nearest mall. We go deeper to understand road connectivity, workplace distribution, type of schools nearby and more.",
          imageContainerWidth: 60,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-location.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 8,
        },
      ].map((a: any) => {
        return isMobile ? (
          <SectionLeft sectionData={a}></SectionLeft>
        ) : (
          <SectionRight sectionData={a}></SectionRight>
        );
      })}

      <SectionLeft
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                marginBottom: 16,
              }}
            >
              Hidden Builder Complaints & Delays
            </Typography.Text>
          ),
          subHeading:
            "Trust more than builder's words; look at their past projects, customer complaint, timely delivery, scale, diversity to get a sense of execution risks and credibility.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-builder.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 8,
        }}
      ></SectionLeft>

      {[
        {
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
              }}
            >
              Navigating the Financials
            </Typography.Text>
          ),
          subHeading:
            "Making the right financial decisions becomes all the more necessary. Assess the price point, rental yield and growth potential with upto date pricing information. ",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-financials.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 8,
        },
      ].map((a: any) => {
        return isMobile ? (
          <SectionLeft sectionData={a}></SectionLeft>
        ) : (
          <SectionRight sectionData={a}></SectionRight>
        );
      })}

      <SectionLeft
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                marginBottom: 16,
              }}
            >
              Go Deeper with AI.
            </Typography.Text>
          ),
          subHeading:
            "Get answers to your questions and generate your own insights. Our AI assistant with every report can help you explore the hidden data and provide answers that any broker won't be able to.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-ai.png",
          primaryImageSize: "90%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 8,
        }}
      ></SectionLeft>

      <SectionCenter
        sectionData={{
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 2,
                lineHeight: "100%",
                marginBottom: 16,
                color: "white",
              }}
            >
              The Most Data Backed Approach
            </Typography.Text>
          ),
          subHeading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                lineHeight: "100%",
                fontWeight: 200,
                marginBottom: 32,
                color: "white",
                opacity: 0.9,
                margin: "0 0 32px 0",
              }}
            >
              Brickfi pioneers a data-first approach to exploring and evaluating
              real estate in India
            </Typography.Text>
          ),
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          primaryImageSize: isMobile ? "100%" : "70%",
          mainImgUrl: isMobile
            ? "/images/landing/data-grid-mob.png"
            : "/images/landing/data-grid.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          heading: (
            <Flex style={{ width: "100%", maxWidth: 1000 }}>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 2,
                  lineHeight: "100%",
                  color: "white",
                  margin: 0,
                }}
              >
                How it Works ?
              </Typography.Text>
            </Flex>
          ),
          subHeading: (
            <Flex
              vertical
              style={{ width: "100%", maxWidth: 1000, marginBottom: 60 }}
              align="flex-start"
            >
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  lineHeight: "100%",
                  fontWeight: 200,
                  color: "white",
                  opacity: 0.9,
                  margin: "0 0 32px 0",
                }}
              >
                You can generate upto 2 free reports for any RERA registered
                property across Bangalore
              </Typography.Text>
              <Button
                type="primary"
                onClick={() => {
                  safeWindow.location.href = "/requestreport";
                }}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 16,
                  marginBottom: isMobile ? 32 : 0,
                  fontSize: FONT_SIZE.HEADING_2,
                }}
              >
                Generate Free Report
              </Button>
            </Flex>
          ),
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          primaryImageSize: isMobile ? "100%" : "70%",
          mainImgUrl: isMobile
            ? "/images/landing/how-it-works-mob.png"
            : "/images/landing/how-it-works.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>

      <SectionCenter
        sectionData={{
          heading: (
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: 200 }}
            >
              Frequently Asked Questions
            </Typography.Text>
          ),
          bgColor: "#fdf7f6",
          verticalPadding: isMobile ? 24 : 100,
          subHeading: (
            <Flex style={{ width: isMobile ? "100%" : "auto" }}>
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
                items={faqs}
                defaultActiveKey={["1"]}
              />
            </Flex>
          ),
        }}
      ></SectionCenter>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
