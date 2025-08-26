"use client";

import { Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { safeWindow } from "../../libs/browser-utils";
import { LandingConstants } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LandingFooter } from "./footer";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";

export function MainLanding() {
  const { isMobile } = useDevice();
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
        style={{ fontSize: FONT_SIZE.HEADING_2, display: "block" }}
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
          primaryImageSize: "100%",
          bgColor: "#fdf7f6",
          bgImage: "../../images/landing/slide-1-bg.png",
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
                }}
              >
                Brickfi is Here to Fix it.
              </Typography.Text>
            </Flex>
          ),
          mainImgUrl: "/images/landing/slide-4-v2.png",
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "80%",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          bgColor: "#fdf7f6",
          verticalPadding: 100,
          heading: "Here's what our home buyers have to say",
          subHeading: "",
          primaryImageSize: "80%",
          mainImgUrl: "/images/landing/slide-9-v2.png",
          mainImgAltText: "Testimonials from Brickfi Customers",
          imageContainerWidth: 50,
        }}
      ></SectionLeft>
      <Typography.Text
        style={{
          fontSize: isMobile ? 50 : 60,
          backgroundColor:  "#32495e",
          fontWeight: "bold",
          textAlign: "center",
          color: "white",
          paddingTop: 48
        }}
      >
        Our Offerings
      </Typography.Text>
      <SectionRight
        sectionData={{
          id: "demo-brkfi",
          bgColor:  "#32495e",
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
                   lineHeight: "120%"
                }}
              >
                We collect data from hundreds of legit sources & use AI to provide human insights. Get upto three Brick360 Report to analyse and compare properties on your own
              </Typography.Text>
            </Flex>
          ),
          subHeading:
            "",
          mainImgUrl: "/images/landing/offering-1.png",
          verticalPadding: 60,
          primaryImageSize: "60%",
          imageContainerWidth: 50,
        }}
      ></SectionRight>
      <SectionRight
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
                style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_1, color: "white", }}
              >
                Guided Home Buying
              </Typography.Text>
              <Typography.Text
                style={{
                  textAlign: "left",
                  color: "white",
                  maxWidth: 500,
                  fontSize: isMobile ? 20 : 24,
                  lineHeight: "120%"
                }}
              >
                Our advise differentiates by being buyer focused & our technology driven research. Get a free consultation with one of our experts.
              </Typography.Text>
            </Flex>
          ),
          bgColor: "#32495e",
          textColor: "white",
          subHeading:
            "",
          mainImgUrl: "/images/landing/offering-2.png",
          verticalPadding: 60,
          primaryImageSize: "60%",
          imageContainerWidth: 50,
        }}
      ></SectionRight>
      <SectionLeft
        sectionData={{
          id: "demo-brkfi",
          heading: "BRICK360",
          subHeading: "Legit Sources. 200+ Data Points. One Report.",
          mediaUrl: "/images/landing/demo-landing-small-2.mp4?v=1",
          bgColor: "#32495e",
          btn: {
            link: LandingConstants.sampleReport,
            txt: "See Sample Report"
          },
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "80%",
          imageContainerWidth: 50,
        }}
      ></SectionLeft>
      {/* <Flex
        style={{ backgroundColor: "#32495e", paddingTop: 100 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          width={isMobile ? "80%" : "30%"}
        ></img>
      </Flex> */}

      <SectionCenter
        sectionData={{
          heading: "Data to Give a Full Picture",
          fullHeight: true,
          bgColor: "#fdf7f6",

          subHeading:
            "Our technology collects data points across different legitimate sources.",
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
          heading: "",
          bgColor: "#fdf7f6",
          primaryImageSize: "95%",
          subHeading: "",
          mainImgUrl: isMobile
            ? "/images/landing/slide-10-mobile.png"
            : "/images/landing/slide-10-v2.png",
          mainImgAltText:
            "Brickfi covers 6 micro markets, 100+ developers and 400+ projects across Bengaluru",
        }}
      ></SectionCenter>
      <SectionRight
        sectionData={{
          verticalPadding: 100,
          heading: "Choose Real Estate To Diversify & Leverage",
          btn: {
            link: LandingConstants.brickAssistLink,
            txt: "Explore BrickfiAssist",
          },
          subHeading:
            "Diversify your portfolio with real estate — a stable, physical asset that grows in value over time. Take advantage of leverage to secure high-value investments with lower upfront costs. With BrickfiAssist, you get unbiased, data backed advice to help you make superior investments.",
          mainImgUrl: "/images/landing/slide-11.png",
          mainImgAltText: "Diversify with real estate",
          primaryImageSize: "80%",
        }}
      ></SectionRight>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
