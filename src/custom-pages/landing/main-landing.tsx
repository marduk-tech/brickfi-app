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

export default function MainLanding() {
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
    padding: "8px 0"
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
          We offer two types of services
          <br></br>
          <br></br>
          <b style={{ color: COLORS.textColorDark }}>Brick360: DIY Property Research</b>
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
        style={{ fontSize: FONT_SIZE.HEADING_2, display: "block", color: "white" }}
      >
        The only platform that makes property buying fully transparent and
        data-driven. Get detailed insights on builder credibility, price
        evaluation, neighborhood analysis, property profile and more.
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
      <LandingHeader></LandingHeader>
      <SectionLeft
        sectionData={{
          heading: "Don't Leave Your Next Property Purchase To Guesswork",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText as any,
          primaryImageSize: "90%",
          bgColor: "#32495e",
          textColor: "white",
          mediaUrl: "/images/landing/demo-landing-small-2.mp4?v=1",
          imageContainerWidth: 50,
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          fullHeight: true,
          verticalPadding: isMobile ? 125 : 0,
        }}
      ></SectionLeft>

      <SectionCenter
        sectionData={{
          bgColor: "#fdf7f6",
          id: "demo-brkfi",
          heading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 1.5,
                  marginBottom: 8,
                  lineHeight: "100%",
                }}
              >
                Buying Property is Broken.
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 1.5,
                  color: COLORS.primaryColor,
                  lineHeight: "100%",
                  marginBottom: 32
                }}
              >
                Brickfi is Here to Fix it.
              </Typography.Text>
            </Flex>
          ),
          mainImgUrl: "/images/landing/slide-4-v2.png",
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: isMobile ? "100%": "70%",
        }}
      ></SectionCenter>
       <Flex
        style={{ backgroundColor: "#fdf7f6", paddingTop: isMobile ? 16 : 60 }}
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
          heading: "",
          subHeading: "",
          primaryImageSize: "80%",
          mainImgUrl: "/images/landing/slide-9-v2.png",
          mainImgAltText: "Testimonials from Brickfi Customers",
          imageContainerWidth: 50,
        }}
      ></SectionCenter>
      <Typography.Text
        style={{
          fontSize: isMobile ? 50 : 60,
          backgroundColor: "#32495e",
          fontWeight: "bold",
          textAlign: "center",
          color: "white",
          paddingTop: 48,
        }}
      >
        Our Offerings
      </Typography.Text>
      <SectionLeft
        sectionData={{
          id: "demo-brkfi",
          bgColor: "#32495e",
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
                  fontSize: isMobile ? 20 : 24,
                  maxWidth: 500,
                  lineHeight: "120%",
                }}
              >
                We collect data from hundreds of legit sources & use AI to
                provide human insights. Get upto three Brick360 Report to
                analyse and compare properties on your own
              </Typography.Text>
            </Flex>
          ),
          subHeading: "",
          mainImgUrl: "/images/landing/offering-1.png",
          verticalPadding: 60,
          primaryImageSize: isMobile ? "100%":"60%",
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
                brickAssist
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
                  fontSize: isMobile ? 20 : 24,
                  lineHeight: "120%",
                }}
              >
                Our advise differentiates by being buyer focused & our
                technology driven research. Get a free consultation with one of
                our experts.
              </Typography.Text>
            </Flex>
          ),
          bgColor: "#32495e",
          textColor: "white",
          subHeading: "",
          mainImgUrl: "/images/landing/offering-2.png",
          verticalPadding: 60,
          primaryImageSize: isMobile ? "100%":"60%",
          imageContainerWidth: 50,
        }}
      ></SectionLeft>
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
          heading: "BRICK360",
          fullHeight: true,
          bgColor: "#fdf7f6",

          subHeading:
            <Typography.Text style={{fontSize: FONT_SIZE.HEADING_1, marginBottom: 16}}>Legit Sources. 200+ Data Points. One Report.</Typography.Text>,
          mainImgUrl: "/images/landing/slide-5.png",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "Insights that Lead to Clarity",
          bgColor: "#fdf7f6",
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          subHeading:
            "Our AI analyses every data point so that you don't have to. Get a clear understanding of what to look at, what's important and why its important.",
          mainImgUrl: "/images/landing/slide-6.png",
          mainImgAltText:
            "Brickfi uses AI to make sense of data points and provide you more clarity.",
        }}
      ></SectionLeft>
      <SectionCenter
        sectionData={{
          heading: "Nuanced Location Intelligence",
          verticalPadding: isMobile ? 2 : 60,
          subHeading: "",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/slide-7.png",
          mainImgAltText:
            "See location insights visually on a map with Brickfi.",
        }}
      ></SectionCenter>

      <SectionCenter
        sectionData={{
          verticalPadding: 100,
          heading: "Key Partners" ,
          bgColor: "#fdf7f6",
          primaryImageSize: "100%",
          subHeading: "",
          mainImgUrl: isMobile
            ? "/images/landing/slide-10-mobile-v2.png"
            : "/images/landing/slide-10-v2.png",
          mainImgAltText:
            "Brickfi covers 6 micro markets, 100+ developers and 400+ projects across Bengaluru",
        }}
      ></SectionCenter>
      <SectionRight
        sectionData={{
          verticalPadding: 100,
          bgColor: "#fdf7f6",
          heading: "Invest into the Pulse of Bangalore",
          subHeading:
            "Bangalore continues its strong growth as the IT Capital of India capturing the largest percentage  of Global Capability Centers (GCCs) at 35% in across India. For homebuyers and investors, this translates into stronger rental yields, better infrastructure, and future-proof property value.",
          mainImgUrl: "/images/landing/slide-11-v2.png",
          mainImgAltText: "Diversify with real estate",
          primaryImageSize: "80%",
        }}
      ></SectionRight>
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
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
