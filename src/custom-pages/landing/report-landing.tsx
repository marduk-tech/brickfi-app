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
const { Paragraph } = Typography;

export default function ReportLanding() {
  const { isMobile } = useDevice();

  const newsLinks = [
    {
      url: "https://bangaloremirror.indiatimes.com/bangalore/civic/open-drains-heighten-public-health-concerns/articleshow/109354187.cms",
      title: "Open drains heighten public health concerns",
      img: "https://bangaloremirror.indiatimes.com/photo/109354187.cms?imgsize=55596",
    },
    {
      url: "https://www.hindustantimes.com/real-estate/krera-update-over-2-600-real-estate-projects-delayed-in-karnataka-bengaluru-worst-hit-101749022326781.html",
      title:
        "KRERA update: Over 2,600 real estate projects delayed in Karnataka; Bengaluru worst hit",
      img: "https://www.hindustantimes.com/ht-img/img/2025/06/04/550x309/asccsa_1748240643655_1749023747292.png",
    },
    {
      url: "https://timesofindia.indiatimes.com/city/bengaluru/residents-unite-move-rera-authority-against-builder-after-decade-long-wait-in-bengaluru/articleshow/123350319.cms",
      title:
        "Residents unite, move Rera authority against builder after decade-long wait in Bengaluru",
      img: "https://media.newindianexpress.com/TNIE/import/2021/9/1/original/rera.JPG?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true",
    },
    {
      url: "https://www.moneycontrol.com/news/business/127-karnataka-homebuyers-lodge-fir-against-real-estate-developer-ozone-group-level-criminal-charges-8859721.html",
      title:
        "127 Karnataka homebuyers lodge FIR against real estate developer Ozone Group, level criminal charges",
      img: "https://images.livemint.com/img/2020/05/26/600x338/f82c8c58-9f33-11ea-acb1-9d0caa391d0e_1590514632106_1590514707533.jpg",
    },
    {
      url: "https://www.thehindu.com/news/cities/bangalore/metro-drives-property-boom-in-bengaluru/article67766840.ece",
      title:
        "Growing metro network puts new areas of Bengaluru on map of desirable real estate",
      img: "https://etimg.etb2bimg.com/photo/121927905.cms",
    },
    {
      url: "https://www.hindustantimes.com/real-estate/bengaluru-floods-karnataka-may-ban-basement-parking-in-flood-prone-areas-experts-flag-higher-costs-design-challenges-101747935363549.html",
      title:
        "Bengaluru floods: Karnataka may ban basement parking in flood-prone areas; Experts flag higher costs, design challenges",
      img: "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/2YTZPRJP6RIPHCEHLQMK5GGURM.jpg",
    },
    {
      url: "https://www.newindianexpress.com/business/2025/Mar/11/purchasing-the-right-address-why-smart-homebuyers-prioritize-location",
      title:
        "Purchasing the right address: Why smart homebuyers prioritize location",
      img: "https://propertysimplify.com/wp-content/uploads/2025/02/Bangalore-Real-Estate-Investment.jpg",
    },
  ];

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
         You can identify issues like high tension lines near the property, upcoming metro stations, understand premiumess of the property, look at timely delivery committment of the builder and much more. 
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
          Brokers are often incentivized to sell specific properties and heavily market them. We do not have tie ups to specific properties and prioritize 100% data-driven and unbiased insights.
        </>
      ),
    },
    {
      key: "how-quickly-report",
      label: getFaqHeading("How quickly can I get my property report?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
         A Brick360 report can be generated in as little as an hour. In some cases, it may take longer to gather all the necessary property details, but the report will always be delivered within 24–48 hours.
        </>
      ),
    },
    {
      key: "ask-questions-after-report",
      label: getFaqHeading("What if I have a question with the report ?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
         The report is interactive and has an AI assistant which lets you ask unlimited questions
          for clarity and to generate more insights. You can also reach out to the Brickfi team at hello@brickfi.in in case you have any more specific questions. 
        </>
      ),
    }
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
                  ? FONT_SIZE.HEADING_1 * 1.5
                  : FONT_SIZE.HEADING_1 * 1.8,
                lineHeight: "100%",
                fontWeight: "bold",
                paddingTop: isMobile ? 60: 0
              }}
            >
              The 360° Scorecard for Smarter Property Decisions
            </Typography.Text>
          ),
          subHeading:
            "Get an independent, data-backed property report with builder history, surroundings, pricing, growth potential & more. Powered by 100% verified government and public data.",
          mainImgUrl: "/images/landing/brick360-landing-2.png",
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
      {/* <SectionCenter
        sectionData={{
          bgColor: "#fdf7f6",
          heading: "",
          subHeading: "",
          mainImgAltText: "About Brickfi",
          primaryImageSize: isMobile ? "100%":"60%",
          mainImgUrl: "/images/landing/report-numbers.png",
          imageContainerWidth: 50,
          verticalPadding:1
        }}
      ></SectionCenter> */}

      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          heading: "",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.2
                    : FONT_SIZE.HEADING_1 * 1.4,
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
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.2
                    : FONT_SIZE.HEADING_1 * 1.4,
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
      {/* <Flex
        style={{ backgroundColor: "#fdf7f6", paddingTop: isMobile ? 16 : 0 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
      </Flex> */}
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

      <SectionLeft
        sectionData={{
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.5,
                lineHeight: "100%",
              }}
            >
              Breaking Down The Layout
            </Typography.Text>
          ),
          subHeading:
            "Don't judge a property by its brochure (said someone); Brick360 looks at numbers like open space, unit density, unit distribution, amenities mix and more to give a deeper insights into property layout.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-layout.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          sectionMaxWidth: isMobile ? "100%" : "1200px",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      {isMobile ? <SectionLeft
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1200px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.5,
                lineHeight: "100%",
              }}
            >
              Dissecting the Location
            </Typography.Text>
          ),
          subHeading:
            "A location is more than just checking the nearest mall to your property. We go deeper to understand road connectivity, workplace distribution, type of schools nearby and more.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-location.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        }}
      ></SectionLeft>: <SectionRight
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1200px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.5,
                lineHeight: "100%",
              }}
            >
              Dissecting the Location
            </Typography.Text>
          ),
          subHeading:
            "A location is more than just checking the nearest mall to your property. We go deeper to understand road connectivity, workplace distribution, type of schools nearby and more.",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-location.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        }}
      ></SectionRight>}
     

    
      <SectionLeft
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : "1200px",
          heading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.5,
                lineHeight: "100%",
              }}
            >
              Looking Beyond Builder&apos;s Popularity
            </Typography.Text>
          ),
          subHeading:
            "Trust more than builder's words; look at their past projects, customer complaint, timely delivery, scale, diversity and more",
          imageContainerWidth: 50,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: "/images/landing/report-feature-builder.png",
          primaryImageSize: "100%",
          itemsAlignSectionLeft: "flex-start",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      <SectionCenter
        sectionData={{
          
          heading: <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 2,
                lineHeight: "100%",
                marginBottom: 60 ,
                color: "white"
              }}
            >
              The Most Data Backed Approach
            </Typography.Text>,
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          primaryImageSize: isMobile ? "100%": "70%",
          mainImgUrl: isMobile
            ? "/images/landing/data-grid-mob.png"
            : "/images/landing/data-grid.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          mainImgUrl: isMobile ? "/images/landing/report-numbers-mob.png": "/images/landing/report-numbers.png",
          primaryImageSize: "80%",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>

      {/* <SectionCenter
        sectionData={{
          heading: "Nuanced Location Intelligence",
          verticalPadding: isMobile ? 2 : 60,
          subHeading: "",
           bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          mainImgUrl: "/images/landing/slide-7.png",
          mainImgAltText:
            "See location insights visually on a map with Brickfi.",
        }}
      ></SectionCenter> */}

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
      {/* <Flex
        vertical
        style={{
          height: 700,
          padding: "8px 0",
          backgroundColor: "#fdf7f6",
          paddingBottom: 48,
        }}
        align="center"
      >
        <Typography.Text
          style={{
            margin: "32px 0",
            fontSize: isMobile
              ? FONT_SIZE.HEADING_1
              : FONT_SIZE.HEADING_1 * 1.2,
            color: COLORS.primaryColor,
          }}
        >
          #ChooseToInvestSmartly
        </Typography.Text>
        <Marquee speed={30}>
          {newsLinks.map((l: any) => {
            return (
              <Flex
                style={{
                  width: 225,
                  border: `1px solid ${COLORS.borderColorMedium}`,
                  borderRadius: 8,
                  marginRight: 48,
                }}
                vertical
                onClick={() => {
                  safeWindow.location.assign(l.url);
                }}
              >
                <div
                  style={{
                    backgroundImage: `url('${l.img}')`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: 150,
                    width: "100%",
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                ></div>
                <Flex
                  style={{
                    padding: 8,
                    height: 100,
                  }}
                >
                  <Paragraph
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      lineHeight: "110%",
                    }}
                    ellipsis={{ rows: 4, expandable: false }}
                  >
                    {l.title}
                  </Paragraph>
                </Flex>
              </Flex>
            );
          })}
        </Marquee>
      </Flex> */}
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
