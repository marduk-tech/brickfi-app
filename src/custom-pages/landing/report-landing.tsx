"use client";

import { Collapse, CollapseProps, Flex, Typography } from "antd";
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
      key: "what-brickfi",
      label: getFaqHeading("What is Brickfi ?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          Brickfi is a customer focused real estate platform & advisory in
          Bangalore. <br></br> Our difference lies in being buyer focused & our
          technology driven research. By collecting data from hundreds of legit
          sources & using AI to analyse, we provide 360 insights around Builder
          Credibility, Property Density, Growth Drivers, Price Point etc.
          <br></br>All this, so that you can shortlist properties faster,
          eliminate guess work and take decisions more confidently.
        </>
      ),
    },
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
      label: getFaqHeading("Is this a paid service ?"),
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
                  : FONT_SIZE.HEADING_1 * 2,
                lineHeight: "100%",
                fontWeight: "bold",
              }}
            >
              What Property Brochures or Billboars Won't Tell You
            </Typography.Text>
          ),
          subHeading: whoAreWeText,
          mainImgUrl: "/images/landing/brick360-landing-2.png",
          bgColor: "#fdf7f6",
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          imageContainerWidth: 40,
          primaryImageSize: "100%",
          fullHeight: true,
          verticalPadding: isMobile ? 100 : 0,
        }}
      ></SectionLeft>
      <Flex
        style={{ backgroundColor: "#fdf7f6", paddingTop: isMobile ? 16 : 0 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
      </Flex>
      <SectionCenter
        sectionData={{
          bgColor: "#fdf7f6",
          heading: "BRICK360",
          subHeading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1,
                marginBottom: 16,
              }}
            >
              Backed By Legit Data. Qualified ratings across Builder, Property,
              Location & Financials.
            </Typography.Text>
          ),
          mainImgAltText: "About Brickfi",
          primaryImageSize: isMobile ? "50%" : "100%",
          mediaUrl: "/images/landing/demo-2.mp4?v=1",
          imageContainerWidth: 50,

          fullHeight: true,
        }}
      ></SectionCenter>

      <SectionCenter
        sectionData={{
          bgColor: "#fdf7f6",
          heading: "",
          subHeading: "",
          primaryImageSize: isMobile ? "100%" : "80%",
          mainImgUrl: isMobile
            ? "/images/landing/slide-9-v2-mob.png"
            : "/images/landing/slide-9-v2.png",
          mainImgAltText: "Testimonials from Brickfi Customers",
          imageContainerWidth: 50,
        }}
      ></SectionCenter>

      {/* <Flex
        style={{ backgroundColor: "#32495e", paddingTop: isMobile ? 16 : 60 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
      </Flex> */}
      {/* <SectionLeft
        sectionData={{
          id: "demo-brkfi",
          heading: "BRICK360",
          subHeading: "Legit Sources. 200+ Data Points. One Report.",
          mediaUrl: "/images/landing/demo-landing-small-2.mp4?v=1",
          bgColor: "#32495e",
          btn: {
            link: LandingConstants.sampleReport,
            txt: "See Sample Report",
          },
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "80%",
          imageContainerWidth: 50,
        }}
      ></SectionLeft> */}

      <SectionCenter
        sectionData={{
          heading: "The Most Data Backed Approach",
          fullHeight: true,
          bgColor: "#006dcc",
          textColor: "white",

          subHeading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1,
                marginBottom: 16,
                color: "white",
              }}
            >
              Over 10+ Legit Sources. 100+ Data Points.
            </Typography.Text>
          ),
          mainImgUrl: isMobile
            ? "/images/landing/data-grid-mob.png"
            : "/images/landing/data-grid.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "Find Red Flags, Challenges, Opportunites & More",
          bgColor: "#006dcc",
          textColor: "white",
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          subHeading:
            "Our AI analyses every data point so that you don't have to. Get a clear understanding of what to look at, what's important and why its important.",
          mainImgUrl: isMobile
            ? "/images/landing/insights-mob.png"
            : "/images/landing/insights.png",
          mainImgAltText:
            "Brickfi uses AI to make sense of data points and provide you more clarity.",
        }}
      ></SectionLeft>
      {/* <SectionCenter
        sectionData={{
          heading: "Nuanced Location Intelligence",
          verticalPadding: isMobile ? 2 : 60,
          subHeading: "",
           bgColor: "#006dcc",
          textColor: "white",
          mainImgUrl: "/images/landing/slide-7.png",
          mainImgAltText:
            "See location insights visually on a map with Brickfi.",
        }}
      ></SectionCenter> */}

      <SectionCenter
        sectionData={{
          heading: "FAQ",
          bgColor: "#fdf7f6",
          verticalPadding: isMobile ? 24 : 100,
          subHeading: (
            <Flex>
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
      <Flex vertical style={{ height: 700, padding: 48, backgroundColor: "#fdf7f6" }} align="center">
        <Typography.Text style={{margin: "32px 0", fontSize: FONT_SIZE.HEADING_1 * 1.2, color: COLORS.primaryColor}}># Be a Smart Real Estate Investor</Typography.Text>
        <Marquee>
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
                <Flex  style={{
                    padding: 8,
                    height: 100
                  }}>
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
      </Flex>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
