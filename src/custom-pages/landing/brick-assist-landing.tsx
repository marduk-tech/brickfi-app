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
import { ReactNode, useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import { useDevice } from "../../hooks/use-device";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";
import LandingFooter from "./footer";
import { safeWindow } from "@/libs/browser-utils";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

export default function BrickAssistLanding() {
  const { isMobile } = useDevice();
  const { height } = useWindowDimensions();

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

  const getCTA = () => {
    return (
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
          <Typography.Text style={{color: "white", fontSize: FONT_SIZE.HEADING_2, fontWeight: 500}}>Book a Free Call</Typography.Text>
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
      <p style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}>
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
      children: getFaqText(`
          With BrickfiAssist you get expert property buying advise on new and
          under construction properties including apartments, villas and plots
          in Bengaluru. We provide data backed and verified list of curated
          properties personalized for your requirements. Besides, we also
          provide end to end support when it comes to visits, negotiation, post
          purchase documentation assistance and more.`),
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
          We usually charge commission from the developer. However, that does
          not mean, that we prefer or have any bias with any particular
          developer. Most of the developers have a set commisssion for
          partners/advisors which is separate from the final cost quoted to the
          buyer. That means, the buyer does not have to accomodate any part of
          their cost when it comes to commissions.
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
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            <p
              style={{
                color: COLORS.redIdentifier,
                margin: 0,
                fontWeight: "bold",
              }}
            >
              We DON&apos;T sell or market specific projects like other channel
              partners/brokers.
            </p>
            Instead, we offer data backed advise, curation and analysis of
            projects across Bangalore.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            {" "}
            <p
              style={{
                color: COLORS.redIdentifier,
                margin: 0,
                fontWeight: "bold",
              }}
            >
              We DON&apos;T provide superficial, biased marketing information.
            </p>{" "}
            Instead we refer verified sources of information and show both sides
            of the coin and go deep into understanding a particular project. Our
            system has been integrated with source like{" "}
            <span style={{ color: COLORS.primaryColor, marginRight: 8 }}>
              RERA, Open Street, Google Maps, Open City
            </span>
            including how reliable the builder is, the location, upcoming
            projects near the area, surroundings and more. We make sure you
            understand the benefits as well as its shortcomings.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            {" "}
            <p
              style={{
                color: COLORS.redIdentifier,
                margin: 0,
                fontWeight: "bold",
              }}
            >
              Our work DOESN&apos;T stop once you make a decision.
            </p>{" "}
            We go the extra mile in terms of negotiation, post purchase
            formalities and any other assistance you might need once you have
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
        <Flex vertical gap={16}>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            <b>INTRO CALL</b>
            <br></br>
            We initially do a intro call to discuss in detail your set of
            requirements, provide overview of the Bangalore market in terms of
            different micro markets
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            <b>SHORTLISTING</b>
            <br></br>
            Based on your requirements, we shortlist/curate set of projects and
            share detailed BRICK360 reports to help you understand each property
            in detail.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            <b>VISITS</b>
            <br></br>
            Once you have selected a few properties, we assist with you visits
            as well as any other assistance related to pricing, timeline, etc
            which can help you make an informed decision .
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
          >
            <b>DEAL MAKING</b>
            <br></br>
            Based on your final selection, we do strategic negotitation
            including pricing negotiation, unit selection and payment planning.
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
          We have an in house database of over{" "}
          <span style={{ color: COLORS.primaryColor }}>
            2000 projects across Bengaluru
          </span>{" "}
          including data around{" "}
          <span style={{ color: COLORS.primaryColor }}>
            builder credibility, upcoming infra projects near a location,
            surroundings & more
          </span>{" "}
          . This helps us to narrow down the project based on your requirements.
          For example, if you are looking for a home with more greenery nearby,
          we can shortlist projects based on surroundings. If you are primary
          purpose is investment, we can find projects near upcoming tech parks.
        </>,
      ),
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
          marginLeft: isMobile ? 8: 0,
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
          <Flex gap={8} vertical style={{width: "100%"}}>
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
          heading: "Make Your Biggest Investment Decision on Data, Not FOMO",
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 100 : 200,
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
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Brickfi is a real estate advisory that works for you the buyer.
                Get data backed research & guided decision making to power your
                home search and buying experience.
              </Typography.Text>
              {getCTA()}
            </Flex>
          ),
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          fullHeight: true,
          bgColor: COLORS.LANDING.BLUISH,
          textColor: "white",
          mainImgUrl: isMobile
            ? "/images/landing/brickassistv2/4-mob.png"
            : "/images/landing/brickassistv2/4.png",
          primaryImageSize: isMobile ? "80%" : "65%",
          mainImgAltText:
            "Brickfi collects multiple data points from sources like RERA, Open City, BBMP, Open Street etc.",
          verticalPadding: 100,
        }}
      ></SectionCenter>
      <SectionCenter
        sectionData={{
          bgColor: COLORS.LANDING.BLUISH,
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
                  color: "white",
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
                is never really happening at a deeper level.🫣
                <br></br>
                <br></br>
                You sign{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  stacks of papers
                </span>{" "}
                believing verbal assurances. And once the deal is done, the
                cowboys ride off — leaving you alone to navigate the builder’s
                maze. 😭
                <br></br>
                <br></br>
                We started Brickfi to change this. Using{" "}
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  technology
                </span>{" "}
                and by being
                <span style={{ color: COLORS.LANDING.PINK, fontWeight: 800 }}>
                  {" "}
                  radically transparent
                </span>
                , we aim to bring the much needed clarity and confidence in this
                industry. 😇
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
          verticalPadding: 180,
        }}
      ></SectionLeft>

      <Flex
        vertical
        style={{ backgroundColor: COLORS.LANDING.BLUISH, padding: "64px 0" }}
      >
        <SectionCenter
          sectionData={{
            bgColor: COLORS.LANDING.BLUISH,
            sectionMaxWidth: isMobile ? "100%" : 1250,
            heading: "How does Brickfi Ensure Your Best Interest ?",
            subHeading: "",
            centerSectionTextAlign: "left",
            verticalPadding: 16,
            textColor: COLORS.LANDING.LIGHT_PINK,
          }}
        ></SectionCenter>
        <Flex vertical style={{ width: isMobile ? "100%" : 1250}}>
          <Flex
            vertical={isMobile}
            style={{
              margin: "16px 0",
            }}
            justify="center"
            gap={48}
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
              margin: isMobile ? "16px 0": "16px 36px",
            }}
            justify="center"
            gap={32}
          >
            {renderProcessStep({
              index: 3,
              heading: "Pre & Post Purchase Support",
              subHeading:
                "Start with couple of detailed 1:1 call to understand your requirements and take you through the Bangalore landscape. We help you navigate different areas as per your needs on basis of corridor analysis, price trends, infrastructure growth and more.",
              imageUrl: "/images/landing/brickassistv2/3-3.png",
              fullWidth: true,
            })}
          </Flex>
        </Flex>
      </Flex>
      <SectionLeft
        sectionData={{
          heading: "Built By People Who Understand Both Data & Real Estate",
          bgColor: COLORS.LANDING.LIGHT_PINK,
          sectionMaxWidth: isMobile ? "100%" : "90%",
          verticalPadding: isMobile ? 24 : 100,
          textColor: COLORS.LANDING.BLUISH,
          mainImgUrl: "/images/landing/brickassistv2/5.png",
          imageContainerWidth: 55,
          subHeading:
            <Typography.Text style={{fontSize: FONT_SIZE.HEADING_3, margin: isMobile ? "16px 0": 0}}>After seeing friends and family struggle with biased broker recommendations and confusing property decisions, our founders (ex-Google engineer) realized: Real estate is the only major industry without organized, accessible data. That had to change. Brickfi Assist applies the same data infrastructure principles that power modern tech platforms to an industry desperately lacking them.</Typography.Text>,
        }}
      ></SectionLeft>
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
          verticalPadding: 100,
        }}
      ></SectionCenter>

      <SectionCenter
        sectionData={{
          heading: "FAQ",
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 24 : 100,
          subHeading: (
            <Flex style={{ marginTop: 64 }}>
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
