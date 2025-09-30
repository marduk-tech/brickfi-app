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
const { Paragraph } = Typography;

export default function MainLanding() {
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
          <br></br>All this, so that you can da properties faster, eliminate
          guess work and take decisions more confidently.
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
          We offer two types of services
          <br></br>
          <br></br>
          <b style={{ color: COLORS.textColorDark }}>
            Brick360: DIY Property Research
          </b>
          <br></br>
          You can request upto 3 Brick360 reports to do a thorough analysis and
          make an informed decision. This service is completely free.
          <br></br>
          <a
            href={LandingConstants.genReportFormLink}
            style={{ fontSize: "90%", color: COLORS.primaryColor }}
          >
            Generate Free Report
          </a>
          <br></br>
          <br></br>
          <b style={{ color: COLORS.textColorDark }}>
            Brickfi Assist: Guided Home Buying
          </b>
          <br></br>
          We offer expert consultation which includes services like area
          analysis, unlimited 360 reports, deal making, agreement review and
          more. We differ from other advisory services by being buyer focused &
          our technology driven research. This service is also completely free
          for our customers*.
          <br></br>
          <a
            href={LandingConstants.brickAssistLink}
            style={{ fontSize: "90%", color: COLORS.primaryColor }}
          >
            Explore Brickfi Assist
          </a>
          <br></br>
          <br></br>
          <div style={{ fontSize: "70%", lineHeight: "120%" }}>
            * We usually charge commission from the developer. However, that
            does not mean, that we prefer or have any bias with any particular
            developer. Most of the developers have a set commisssion for
            partners/advisors which is separate from the final cost quoted to
            the buyer. That means, the buyer does not have to accomodate any
            part of their cost when it comes to commissions.
          </div>
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
        bgColor="transparent"
        color={COLORS.textColorDark}
      ></LandingHeader>
      <SectionLeft
        sectionData={{
          itemsAlignSectionLeft: "flex-start",
          heading: (
            <Typography.Text
              style={{
                fontSize: isMobile
                  ? FONT_SIZE.HEADING_1 * 2
                  : FONT_SIZE.HEADING_1 * 2.3,
                lineHeight: "100%",
                fontWeight: "bold",
                textShadow: "3px 3px 0 white",
              }}
            >
              Stress Free Home Buying Experience
            </Typography.Text>
          ),
          mainImgAltText: "About Brickfi",
          btn: {
            link: "/#brk360",
            txt: "Explore Offerings",
          },
          subHeading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                display: "block",
                lineHeight: "120%",
                backgroundColor: COLORS.LANDING.LIGHT_PINK,
                padding: 8,
                border: `3px solid ${COLORS.LANDING.PINK}`,
                borderRadius: 8,
                marginTop: 16,
                maxWidth: 500,
              }}
            >
              The only platform which provides you unbiased and data backed
              advise for your next property purchase. 
            </Typography.Text>
          ),
          bgImage: "/images/landing/slide-1-bg.png",
          imageContainerWidth: 60,
          fullHeight: true,
          verticalPadding: isMobile ? 125 : 0,
        }}
      ></SectionLeft>

      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.LIGHT_PINK,
          id: "demo-brkfi",
          heading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.5
                    : FONT_SIZE.HEADING_1 * 1.75,
                  marginBottom: 8,
                  lineHeight: "100%",
                  fontWeight: 200,
                }}
              >
                Buying Property is Broken.
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_1 * 1.5
                    : FONT_SIZE.HEADING_1 * 1.75,
                  color: COLORS.primaryColor,
                  lineHeight: "100%",
                  fontWeight: 600,
                  marginBottom: 32,
                }}
              >
                Brickfi is Here to Fix it.
              </Typography.Text>
            </Flex>
          ),
          mainImgUrl: "/images/landing/slide-4-v2.png",
          textColor: "white",
          verticalPadding: 100,
          primaryImageSize: isMobile ? "100%" : "70%",
        }}
      ></SectionCenter>

      <Typography.Text
        id="brk360"
        style={{
          fontSize: isMobile
            ? FONT_SIZE.HEADING_1 * 1.5
            : FONT_SIZE.HEADING_1 * 1.75,
          backgroundColor: COLORS.LANDING.BLUISH,
          textAlign: "center",
          color: "white",
          padding: "48px 0",
        }}
      >
        Our Offerings
      </Typography.Text>
      <SectionLeft
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          heading: (
            <Flex vertical align="flex-start">
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_1,
                  color: COLORS.primaryColor,
                }}
              >
                BRICK360
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_1,
                  color: "white",
                }}
              >
                DIY Property Research
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  color: "white",
                  fontSize: FONT_SIZE.HEADING_2,
                  maxWidth: 500,
                  lineHeight: "120%",
                }}
              >
                Evaluate any property before buying, with a Brick360 Report. We
                collect data from hundreds of legit sources & use AI to provide
                human insights.
              </Typography.Text>
              <Button
                type="primary"
                onClick={() => {
                  safeWindow.location.href = "/brick360";
                }}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 16,
                  fontSize: FONT_SIZE.HEADING_2,
                }}
              >
                Explore Brick360
              </Button>
            </Flex>
          ),
          subHeading: "",
          mainImgUrl: "/images/landing/offering-1.png",
          verticalPadding: 4,
          primaryImageSize: isMobile ? "100%" : "60%",
          imageContainerWidth: 50,
        }}
      ></SectionLeft>
      <SectionLeft
        sectionData={{
          id: "demo-brkfi",
          heading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_1,
                  color: COLORS.primaryColor,
                }}
              >
                BrickfiAssist
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_1,
                  color: "white",
                }}
              >
                Guided Home Buying
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  color: "white",
                  maxWidth: 500,
                  fontSize: FONT_SIZE.HEADING_2,
                  lineHeight: "120%",
                }}
              >
                Our advise differentiates by being buyer focused & our
                technology driven research. Get a free consultation with one of
                our experts.
              </Typography.Text>
              <Button
                type="primary"
                onClick={() => {
                  safeWindow.location.href = "/brickassist";
                }}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 16,
                  fontSize: FONT_SIZE.HEADING_2,
                }}
              >
                Explore BrickAssist
              </Button>
            </Flex>
          ),
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          subHeading: "",
          mainImgUrl: "/images/landing/offering-2.png",
          verticalPadding: 60,
          primaryImageSize: isMobile ? "100%" : "60%",
          imageContainerWidth: 50,
        }}
      ></SectionLeft>

      <SectionRight
        sectionData={{
          heading: (
            <Typography.Text
              style={{
                fontSize: isMobile
                  ? FONT_SIZE.HEADING_1 * 1.5
                  : FONT_SIZE.HEADING_1 * 1.75,
                lineHeight: "100%",
                textAlign: "left",
              }}
            >
              Data Backed Research. <br></br><span style={{color: COLORS.primaryColor}}>Catered For Home Buying</span>
            </Typography.Text>
          ),
          fullHeight: true,
          bgColor: "#fdf7f6",

          subHeading: (
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_2, marginBottom: 16 }}
            >
              We trust legit data sources to gather over 1000+ data points around
              Builder, Location, Property and Financials. 
            </Typography.Text>
          ),
          mainImgUrl: "/images/landing/research.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
          imageContainerWidth: 50,
          primaryImageSize: "100%",
          verticalPadding: 50
        }}
      ></SectionRight>


      {/* <Flex style={{ backgroundColor: "#fdf7f6", padding: "100px 0" }}>
        <Marquee speed={20}>
          <Flex>
            {[1, 2, 3, 4, 5].map((item: number) => {
              return (
                <img
                  style={{ marginRight: 24 }}
                  width={250}
                  src={`/images/landing/brands/${item}.png`}
                />
              );
            })}
          </Flex>
        </Marquee>
      </Flex> */}
      {/* <SectionRight
        sectionData={{
          verticalPadding: 100,
          bgColor: "#fdf7f6",
          heading: "Invest into the Pulse of Bangalore",
          subHeading:
            "Bangalore continues its strong growth as the IT Capital of India capturing the largest percentage  of Global Capability Centers (GCCs) at 35% in across India. For homebuyers and investors, this translates into stronger rental yields, better infrastructure, and future-proof property value.",
          mainImgUrl: "/images/landing/slide-11-v2.png",
          mainImgAltText: "Diversify with real estate",
          primaryImageSize: "60%",
        }}
      ></SectionRight> */}
      {/* <SectionCenter
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
      ></SectionCenter> */}
      <Flex
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
            color: COLORS.LANDING.PINK,
          }}
        >
          #ChooseToInvestSmartly
        </Typography.Text>
        <Marquee speed={30}>
          {newsLinks.map((l: any) => {
            return (
              <Flex
                style={{
                  width: 175,
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
                    filter: "grayscale(100%)",
                    height: 100,
                    width: "100%",
                    borderRadius: 8,
                  }}
                ></div>
                <Flex
                  style={{
                    padding: "8px 0",
                    height: 100,
                  }}
                >
                  <Paragraph
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      fontWeight: 500,
                      lineHeight: "110%",
                    }}
                    ellipsis={{ rows: 2, expandable: false }}
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
