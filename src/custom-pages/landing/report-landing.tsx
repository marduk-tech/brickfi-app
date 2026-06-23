"use client";

import { Button, Collapse, CollapseProps, Flex, Typography } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { safeWindow } from "../../libs/browser-utils";
import { FAQ_360, LandingConstants } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "./header";
import LandingFooter from "./footer";
import { CaretRightOutlined } from "@ant-design/icons";
import { SectionLeft, SectionCenter, SectionRight } from "./section";
import { captureAnalyticsEvent, txtToId } from "@/libs/lvnzy-helper";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

export default function ReportLanding({ initialIsMobile = false }: { initialIsMobile?: boolean }) {
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

  const faqs: CollapseProps["items"] = FAQ_360.map((q) => {
    return {
      style: faqPanelStyle,
      key: txtToId(q.question),
      label: getFaqHeading(q.question),
      children: getFaqText(
        <>
          {q.answer}
          {q.question == "Is this report free ?" ? (
            <>
              <br></br>
              <br></br>
              <a
                href={LandingConstants.genReportFormLink}
                style={{
                  fontSize: "100%",
                  color: COLORS.primaryColor,
                  textTransform: "uppercase",
                  padding: 8,
                  border: `2px solid ${COLORS.primaryColor}`,
                  borderRadius: 8,
                }}
              >
                Get a Free Report
              </a>
              <br></br>
            </>
          ) : null}
        </>,
      ),
    };
  });

  useEffect(() => {
    const hash = safeWindow.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    captureAnalyticsEvent("report-landing", {});
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
        isMobile={isMobile}
      ></LandingHeader>
      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          id: "demo-brkfi",
          heading: (
            <Flex vertical gap={4}>
              {" "}
              <Flex align="center" gap={4} style={{marginTop: isMobile ? 64: 0, }}>
                <DynamicReactIcon
                  color={COLORS.primaryColor}
                  size={24}
                  iconName="TbView360Number"
                  iconSet="tb"
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: 24,
                    color: COLORS.primaryColor,
                    lineHeight: "100%",
                    fontWeight: 500,
                  }}
                >
                  BRICK360° REPORT
                </Typography.Text>
              </Flex>
              <h1
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.6
                    : FONT_SIZE.HEADING_1 * 1.8,
                  lineHeight: "100%",
                  fontWeight: 300,
                  paddingTop: 0,
                  marginTop: 0,
                  marginBottom: 8
                }}
              >
                The 360° Report Card for Smarter Property Decisions
              </h1>
            </Flex>
          ),
          subHeading:
            "Get an independent, data-backed property report with builder history, surroundings, pricing, growth potential & more. Powered by 100% verified government and public data.",
          mediaUrl: "/images/landing/demo-landing.mp4?v=1",
          bgColor: "#fdf7f6",
          btn: {
            link: "/requestreport",
            txt: "Get a Free Report",
          },
          imageContainerWidth: 50,
          primaryImageSize: "100%",
          fullHeight: true,
          verticalPadding: isMobile ? 50 : 0,
        }}
      ></SectionLeft>

      <SectionCenter
        isMobile={isMobile}
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
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          heading: "",
          subHeading: (
            <Flex vertical>
              <h2
                style={{
                  textAlign: "left",
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.4
                    : FONT_SIZE.HEADING_1 * 1.7,
                  lineHeight: "100%",
                  fontWeight: 200,
                  color: COLORS.textColorVeryLight,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Property Buying can be Risky & Confusing.
              </h2>
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
        isMobile={isMobile}
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
        <Flex
          vertical
          style={{ maxWidth: 1400, margin: "auto", padding: "0 16px" }}
        >
          <h2
            style={{
              fontSize: FONT_SIZE.HEADING_1 * 1.5,
              lineHeight: "100%",
              fontWeight: 300,
              margin: 0,
              marginBottom: 8
            }}
          >
            Make a <span style={{ color: COLORS.LANDING.PINK }}>Confident</span>{" "}
            Decision with Brick360 Report
          </h2>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "100%",
            }}
          >
            A sneak peak of what all you get.
          </Typography.Text>
        </Flex>
      </Flex>

      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                marginBottom: 16,
                margin: 0
              }}
            >
              Detailed Breakdown of The Layout
            </h2>
          ),
          subHeading:
            "Don't judge a property by its brochure (said someone); Brick360 looks at numbers like open space, unit density, unit distribution, amenities mix and more to give a deeper insights into property layout.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-layout.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      {[
        {
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                margin: 0
              }}
            >
              Location Dissection to Assess Livability & Future Growth.
            </h2>
          ),
          subHeading:
            "Analysing livability is more than just checking the nearest mall. We go deeper to understand road connectivity, workplace distribution, type of schools nearby and more.",
          imageContainerWidth: 60,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-location.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        },
      ].map((a: any) => {
        return isMobile ? (
          <SectionLeft isMobile={isMobile} sectionData={a}></SectionLeft>
        ) : (
          <SectionRight isMobile={isMobile} sectionData={a}></SectionRight>
        );
      })}

      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                margin: 0,
                marginBottom: 16,
                fontWeight: 300
              }}
            >
              Builder Track Records, Complaints & Delays
            </h2>
          ),
          subHeading:
            "Trust more than builder's words; look at their past projects, customer complaint, timely delivery, scale, diversity to get a sense of execution risks and credibility.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-builder.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      {[
        {
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                margin: 0,
                fontWeight: 300
              }}
            >
              Financials Assessment including Price Point, Rental Yield.
            </h2>
          ),
          subHeading:
            "Making the right financial decisions becomes all the more necessary. Assess the price point, rental yield and growth potential with upto date pricing information. ",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-financials.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        },
      ].map((a: any) => {
        return isMobile ? (
          <SectionLeft isMobile={isMobile} sectionData={a}></SectionLeft>
        ) : (
          <SectionRight isMobile={isMobile} sectionData={a}></SectionRight>
        );
      })}

      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1300px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.25,
                lineHeight: "100%",
                margin: 0,
                marginBottom: 16,
                fontWeight: 300
              }}
            >
              AI Assistance to Clarify Doubts & DIY Research.
            </h2>
          ),
          subHeading:
            "Get answers to your questions and generate your own insights. Our AI assistant with every report can help you explore the hidden data and provide answers that any broker won't be able to.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-ai.png",
          primaryImageSize: "90%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 2,
                lineHeight: "100%",
                margin: 0,
                marginBottom: 16,
                color: "white",
                fontWeight: 300
              }}
            >
              The Most Data Backed Approach
            </h2>
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
              real estate in India.
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
        isMobile={isMobile}
        sectionData={{
          heading: (
            <Flex style={{ width: "100%", maxWidth: 1000 }}>
              <h2
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 2,
                  lineHeight: "100%",
                  color: "white",
                  margin: 0,
                  fontWeight: 300
                }}
              >
                How it Works ?
              </h2>
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
                Get a Free Report
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
        isMobile={isMobile}
        sectionData={{
          heading: (
            <h2
              style={{ fontSize: FONT_SIZE.HEADING_1, fontWeight: 200, margin: 0}}
            >
              Frequently Asked Questions
            </h2>
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
