"use client";

import { CaretRightOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  CollapseProps,
  Divider,
  Flex,
  Typography,
} from "antd";
import { ReactNode, useEffect, useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import { useDevice } from "../../hooks/use-device";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";
import LandingFooter from "./footer";
import { safeWindow } from "@/libs/browser-utils";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";

export default function BrickAssistLandingV2() {
  const { isMobile } = useDevice();
  const { height } = useWindowDimensions();

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

    
  useEffect(() => {
    captureAnalyticsEvent("brickassist-landing",{});
  },[])


  const getCTA = () => {
    return (
      <Button
        type="primary"
        onClick={() => {
          safeWindow.location.href = "/callback-request?srcIntent=brkassist-landing";
        }}
        style={{
          alignSelf: "flex-start",
          marginTop: 16,
          marginBottom: isMobile ? 32 : 0,
          fontSize: FONT_SIZE.HEADING_2,
          letterSpacing: -0.5,
          textTransform: "uppercase",
        }}
      >
        <Flex align="center" gap={8}>
          <DynamicReactIcon
            color="white"
            iconName="RiChatAiFill"
            iconSet="ri"
          ></DynamicReactIcon>
          <Typography.Text
            style={{
              color: "white",
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 500,
            }}
          >
            Book a Free Call
          </Typography.Text>
        </Flex>
      </Button>
    );
  };

  const getFaqHeading = (text: string) => {
    return (
      <h3
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          textAlign: "left",
          color: "white",
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
      <p style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}>
        {typeof text == "string" ? text : <>{text}</>}
      </p>
    );
  };
  const faqPanelStyle = {
    marginBottom: 24,
    background: COLORS.LANDING.BLUISH,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    color: COLORS.LANDING.LIGHT_PINK,
    border: "none",
  };
  const faqs: CollapseProps["items"] = [
    {
      key: "1",
      label: getFaqHeading("What is Brickfi Assist ?"),
      style: faqPanelStyle,
      children: getFaqText(<>
          With Brickfi Assist, you get expert property-buying advice for new and under-construction properties, including apartments, villas, and plots in Bengaluru.<br></br>
We provide a data-backed, verified list of curated properties tailored to your requirements.<br></br>
Additionally, we offer end-to-end support—from site visits and negotiations to post-purchase documentation assistance.
</>),
    },
    {
      key: "2",
      label: getFaqHeading("Is this a paid service ?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          <b style={{ color: COLORS.primaryColor }}>
            The service is completely free for our buyers.
          </b>
          <br></br>
         We typically earn a commission from developers. However, this does not mean we favor any particular developer.
 Most developers allocate a standard commission for advisors which varies. This ensures that buyers do not incur any additional costs.

        </>,
      ),
    },
    {
      key: "3",
      label: getFaqHeading("How are you different from other brokers ?"),
      style: faqPanelStyle,
      children: (
        <Flex vertical gap={16}>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <p
              style={{
                color: COLORS.primaryColor,
                margin: 0,
                lineHeight: "120%",
                fontWeight: 500,
              }}
            >
              We DON&apos;T sell or promote specific projects like traditional brokers.
            </p>
            Instead, we provide data-backed advice, curation, and analysis across projects in Bangalore.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            {" "}
            <p
              style={{
                color: COLORS.primaryColor,
                margin: 0,
                lineHeight: "120%",
                fontWeight: 500,
              }}
            >
              We DON&apos;T provide superficial or biased marketing information.
            </p>{" "}
            Our insights are derived from verified sources such as RERA, OpenStreetMap, Google Maps, and OpenCity—combined with deep analysis of builder track record, location dynamics, and future developments.<br></br>
             We help you understand both the strengths and risks of every property.<br></br>
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            {" "}
            <p
              style={{
                color: COLORS.primaryColor,
                margin: 0,
                lineHeight: "120%",
                fontWeight: 500,
              }}
            >
              Our work DOESN&apos;T stop once you make a decision.
            </p>{" "}
            We go the extra mile in terms of negotiation, post purchase
            formalities, legal due-dilligence and any other assistance you might need once you have
            made your decision.
          </Typography.Text>
        </Flex>
      ),
    },
    {
      key: "4",
      label: getFaqHeading("What all to expect during consultation?"),
      style: faqPanelStyle,
      children: (
        <Flex vertical gap={32}>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ INTRO CALL</b>
            <br></br>
           We begin with a detailed discussion of your requirements and provide an overview of Bangalore’s landscape and understanding of different micro-markets.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ SHORTLISTING</b>
            <br></br>
            Based on your needs, we curate a set of relevant projects and share detailed Brick360° reports for each to help you understand & evaluate each property.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ DECISION MAKING</b>
            <br></br>
             Once you shortlist properties, we assist with site visits, pricing discussions, and timelines to help you make an informed decision.
             We support you through final negotiations, unit selection, and payment planning.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ POST BUY ASSISTANCE</b>
            <br></br>
            Once a deal is finalized we help with{" "}
            <span style={{ color: COLORS.textColorDark }}>
              legal oversight, builder communication, contractual review, and
              title verification
            </span>{" "}
            of the property. This ensures you are free from any legal conflicts
            and payments are secure as well as risk free.
          </Typography.Text>
        </Flex>
      ),
    },
    {
      key: "5",
      label: getFaqHeading("How do you curate projects?"),
      style: faqPanelStyle,
      children: getFaqText(
        <>
          We have a database of over{" "}
          <span style={{ color: COLORS.textColorDark }}>
            2000 projects across Bangalore
          </span>{" "}
          including data points around{" "}
          <span style={{ color: COLORS.textColorDark }}>
            builder credibility, upcoming infra projects near a location,
            surroundings & more
          </span>{" "}
          . This helps us to match-make projects based on your requirements.
          For instance, if you are love a home with more greenery around,
          we can shortlist projects based on surroundings. If you are primary
          purpose is investment, we can find projects near upcoming infra or business centres.
        </>,
      ),
    },
     {
      key: "6",
      label: getFaqHeading(
        "Do you provide legal services ?",
      ),
      style: faqPanelStyle,
      children: getFaqText(`
          We do offer legal services as part of our consultation including legal oversight, lawyer contractual review and title verification.`),
    },
    {
      key: "6",
      label: getFaqHeading(
        "Do you help with property management including resale/rental ?",
      ),
      style: faqPanelStyle,
      children: getFaqText(`
          We do not directly provide services with resale or rental. However, we can help you get in touch with a partner who can assist you with the same.`),
    },
    {
      key: "6",
      label: getFaqHeading("Do you help with finding a rental property ?"),
      style: faqPanelStyle,
      children: getFaqText(`
          As of now, we do NOT provide assistance with rentals.`),
    },
  ];

  const renderProcessStep = (data: any) => {
    const padding = isMobile ? 8 : 16;
    const sectionMaxWidth = 625;
    return (
      <Flex
        vertical={isMobile || !data.fullWidth}
        style={{
          width: isMobile
            ? `calc(100% - ${padding * 2}px - 16px)`
            : `calc(${sectionMaxWidth * (data.fullWidth ? 2 : 1)}px - ${padding * 2}px - 32px)`,
          padding: `${padding}px`,
          borderRadius: 16,
          marginLeft: isMobile ? 8 : 0,
          border: `1px solid #0e5882`,
          backgroundColor: "#0d4f74",
        }}
        align="center"
        justify="center"
      >
        <Flex
          vertical
          style={{ width: data.fullWidth && !isMobile ? "50%" : "100%" }}
        >
          <Flex gap={8} vertical style={{ width: "100%" }}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 1.2,
                fontWeight: 500,
                borderRadius: "50%",
                backgroundColor: COLORS.LANDING.LIGHT_PINK,
                color: COLORS.LANDING.BLUISH,
                width: 56,
                height: 56,
                textAlign: "center",
              }}
            >
              {data.index}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1,
                color: COLORS.LANDING.LIGHT_PINK,
                lineHeight: "120%",
                fontWeight: 500,
                marginTop: 8,
                textTransform: "uppercase",
              }}
            >
              {data.heading}
            </Typography.Text>
          </Flex>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_2 * 0.9,
              marginTop: 8,
              color: COLORS.LANDING.LIGHT_PINK,
              lineHeight: "130%",
            }}
          >
            {data.subHeading}
          </Typography.Text>
        </Flex>
        <img
          alt=""
          src={data.imageUrl}
          style={{
            width: isMobile ? "100%" : data.fullWidth ? "40%" : "85%",
            marginTop: data.fullWidth && !isMobile ? 0 : 32,
          }}
        />
      </Flex>
    );
  };

  return (
    <Flex
      vertical
      style={{
        height: height,
        overflowY: "scroll",
        position: "relative",
        paddingTop: 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
        backgroundColor: COLORS.LANDING.LIGHT_PINK,
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      <LandingHeader
        bgColor={COLORS.LANDING.LIGHT_PINK}
        color={COLORS.textColorDark}
        logo="/images/brickfi-logo.png"
      ></LandingHeader>

      <SectionCenter
        sectionData={{
          sectionMaxWidth: isMobile ? "100%" : 1000,
          heading: (
            <Flex vertical gap={8}>
              <Flex align="center" gap={4}>
                <img
                  src="/images/landing/brickassistv2/logo.png"
                  style={{ width: "auto", height: 28 }}
                ></img>
                <Typography.Text
                  style={{
                    fontSize: 28,
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
                  fontSize: isMobile ? 40 : 54,
                  color: COLORS.textColorDark,
                  lineHeight: "100%",
                  fontWeight: 800,
                }}
              >
                Make Your Biggest Investment Decision on Data, Not FOMO
              </Typography.Text>
            </Flex>
          ),
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 100 : 100,
          primaryImageSize: isMobile ? "100%" : "100%",
          mainImgUrl: isMobile
            ? "/images/landing/brickassistv2/1-mob.png"
            : "/images/landing/brickassistv2/1.png",
          centerSectionTextAlign: "left",
          // btn: {
          //   link: "",
          //   txt: "Schedule Callback",
          //   btnAction: () => {
          //     setRequestCallbackDialogOpen(true);
          //   },
          // },
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                Brickfi Assist is a real estate advisory that works for you—the
                buyer. Get data backed research & guided decision making to
                power your home search and buying journey.
              </Typography.Text>
              {getCTA()}
            </Flex>
          ),
        }}
      ></SectionCenter>
    
       {/* <SectionCenter
        sectionData={{
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          mainImgUrl: isMobile
            ? "/images/landing/brickassistv2/4-mob.png"
            : "/images/landing/brickassistv2/4.png",
          primaryImageSize: isMobile ? "80%" : "100%",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
          verticalPadding: 1,
          sectionMaxWidth: "100%"
        }}
      ></SectionCenter> */}
      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.LIGHT_PINK,
          heading: "",

          subHeading: (
            <Flex vertical style={{ paddingBottom: 100 }}>
              <Typography.Text
                style={{
                  textTransform: "uppercase",
                  color: COLORS.primaryColor,
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_2,
                }}
              >
                A NOTE FROM OUR FOUNDER
              </Typography.Text>
              <Typography.Text
                style={{
                  marginTop: 16,
                  fontSize: FONT_SIZE.HEADING_1 * 0.8,
                  maxWidth: 1000,
                  color: COLORS.textColorDark,
                  textAlign: "left",
                  paddingBottom: 24,
                }}
              >
                Buying real estate in India can feel like stepping into the{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  Wild Wild West
                </span>{" "}
                — everyone claiming they’ve found gold. 🌄
                <br></br>
                <br></br>
                You’re rushed with “last few units” warnings and
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  {" "}
                  fear-of-missing-out
                </span>{" "}
                tactics. 😱
                <br></br>
                <br></br>
                The{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  best-fit
                </span>{" "}
                properties rarely show up, because the match making and curation
                rarely happen at a deeper level.🫣
                <br></br>
                <br></br>
                You sign{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  stacks of papers
                </span>{" "}
                based on verbal assurances. And once the deal is done, you're left to navigate the builder’s maze alone. 😭
                <br></br>
                <br></br>
                We started Brickfi to change this. By leveraging{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  technology
                </span>{" "}
                and by being
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  {" "}
                  radically transparent
                </span>
                , we aim to bring the much needed clarity and confidence to real estate decisions 😇
              </Typography.Text>
              {getCTA()}
            </Flex>
          ),
          mainImgAltText: "Brickfi Assist - End to End Property Consultation",
          primaryImageSize: "100%",
          imageContainerWidth: 50,
          verticalPadding: isMobile ? 32 : 32,
        }}
      ></SectionCenter>
        <img width={isMobile ? "90%": "70%" } style={{margin: "auto", marginBottom: 100}} src={isMobile
            ? "/images/landing/brickassistv2/4-mob.png"
            : "/images/landing/brickassistv2/4.png"} />
      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
          sectionMaxWidth: "100%",
          heading: (
            <Flex
              vertical
              align="flex-start"
              style={{ width: isMobile ? "100%" : 1000 }}
            >
              <Typography.Text
                style={{
                  fontSize: isMobile ? 40 : 54,
                  lineHeight: "100%",
                  fontWeight: 800,
                  color: COLORS.LANDING.LIGHT_PINK,
                  textAlign: "left",
                }}
              >
                How does Brickfi Assist Work ?
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  lineHeight: "100%",
                  maxWidth: 1000,
                  color: COLORS.LANDING.LIGHT_PINK,
                }}
              >
                Get end to end guidance and a holistic pre and post purchase
                support.
              </Typography.Text>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brickassistv2/7-mob.png"
            : "/images/landing/brickassistv2/7.png",
          primaryImageSize: isMobile ? "90%" : "60%",
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          bgColor: COLORS.LANDING.LIGHT_PINK,
          heading:
            "Brickfi Gives You the Upper Hand In Your Homebuying Journey ",
          subHeading: (
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_2, margin: "16px 0" }}
            >
              Brickfi presents the new way to find your dream home. No hype, No
              manipulation, No pushing inventory. Only legitimate data and hard
              facts to ensure your interests are protected
            </Typography.Text>
          ),
          mainImgAltText: "Brickfi Assist - End to End Property Consultation",
          mainImgUrl: "/images/landing/brickassistv2/2.png",
          primaryImageSize: isMobile ? "100%" : "80%",
          imageContainerWidth: 50,
          verticalPadding: isMobile ? 60 : 180,
        }}
      ></SectionLeft>

      {/* <Flex
          vertical
          style={{ width: isMobile ? "100%" : 1250, margin: "auto" }}
        >
          <Flex
            vertical={isMobile}
            style={{
              margin: "16px 0",
            }}
            justify="center"
            gap={36}
          >
            {renderProcessStep({
              index: 1,
              heading: "True Discovery",
              subHeading:
                "Start with couple of detailed 1:1 call to understand your requirements and take you through the Bangalore landscape. We help you navigate different areas as per your needs on basis of corridor analysis, price trends, infrastructure growth and more.",
              imageUrl: "/images/landing/brickassistv2/3-1.png",
            })}
            {renderProcessStep({
              index: 2,
              heading: "Property Evaluation",
              subHeading:
                "A detailed 360 report for every shortlisted project helps you evaluate and compare multiple properties. The report compiles legit data around builder, property, location and financials so that you can make an informed and confident decision. Learn more about Brick360 Report.",
              imageUrl: "/images/landing/brickassistv2/3-2.png",
            })}
          </Flex>
          <Flex
            vertical={isMobile}
            style={{
              margin: "16px 0",
            }}
            justify="center"
            gap={36}
          >
            {renderProcessStep({
              index: 3,
              heading: "Pre Purchase Support",
              subHeading: "End to end support including scheduling site visits, real time inventory availability, unit selection guidance, negotitations. We are there with you to he",
              imageUrl: "/images/landing/brickassistv2/3-3.png",
            })}
            {renderProcessStep({
              index: 4,
              heading: "Post Purchase Support",
              subHeading:
                "Start with couple of detailed 1:1 call to understand your requirements and take you through the Bangalore landscape. We help you navigate different areas as per your needs on basis of corridor analysis, price trends, infrastructure growth and more.",
              imageUrl: "/images/landing/brickassistv2/3-3.png",
            })}
          </Flex>
        </Flex> */}
      <Flex align="center" justify="center">
        <img
          src="/images/landing/brickassistv2/divider.png"
          width={isMobile ? "60%":400}
          height="auto"
        ></img>
      </Flex>
      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.LIGHT_PINK,
          heading: "",
          subHeading: "",
          primaryImageSize: isMobile ? "100%" : "80%",
          mainImgUrl: isMobile
            ? "/images/landing/brickassistv2/6-mob.png"
            : "/images/landing/brickassistv2/6.png",
          mainImgAltText: "Testimonials from Brickfi Customers",
          imageContainerWidth: 50,
          verticalPadding: isMobile ? 32 : 100,
        }}
      ></SectionCenter>
      <SectionLeft
        sectionData={{
          heading: "Built By People Who Understand Both Data & Real Estate",
          bgColor: COLORS.LANDING.LIGHT_PINK,
          sectionMaxWidth: isMobile ? "100%" : "85%",
          verticalPadding: isMobile ? 48 : 100,
          mainImgUrl: "/images/landing/brickassistv2/5.png",
          imageContainerWidth: 60,
          subHeading: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_3,
                margin: isMobile ? "16px 0" : 0,
              }}
            >
              After seeing friends and family struggle with biased broker
              recommendations, confusing property decisions and broken advise, our founders
              (ex-Google engineer) realized: Real estate is the only major
              industry without organized, accessible data and trusted approach. That had to change.
              Brickfi Assist applies the same data infrastructure principles
              that power modern tech platforms to an industry desperately
              lacking them and radical transparency where its needed the most.
            </Typography.Text>
          ),
        }}
      ></SectionLeft>
      

      <SectionCenter
        sectionData={{
          heading: "FAQ",
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 48 : 100,
          subHeading: (
            <Flex style={{ marginTop: 32 }}>
              <Collapse
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined
                    style={{
                      color: "white",
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

      <BrickAssistCallback
        isOpen={requestCallbackDialogOpen}
        onClose={() => {
          setRequestCallbackDialogOpen(false);
        }}
      ></BrickAssistCallback>
    </Flex>
  );
}
