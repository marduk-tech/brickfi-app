import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps, Flex, Typography } from "antd";
import { ReactNode, useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LandingFooter } from "./footer";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";

export function BrickAssistLanding() {
  const { isMobile } = useDevice();

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

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
    background: COLORS.textColorDark,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    color: "white",
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
        </>
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
              We DON'T sell or market specific projects like other channel
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
              We DON'T provide superficial, biased marketing information.
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
              Our work DOESN'T stop once you make a decision.
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
        </>
      ),
    },
  ];

  return (
    <Flex
      vertical
      style={{
        height: window.innerHeight,
        overflowY: "scroll",
        position: "relative",
        paddingTop: 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
        backgroundColor: "#fdf7f6",
        backgroundRepeat: "no-repeat",
        width: "100%",
      }}
    >
      <LandingHeader
        bgColor={COLORS.textColorDark}
        color={"white"}
        logo="/images/brickfi-logo-white.png"
      ></LandingHeader>
      <SectionRight
        sectionData={{
          heading: (
            <Flex vertical>
              <img
                style={{ width: 150 }}
                src="/images/brickfi-assist-white.png"
                alt="Brickfi Assist"
              />
              <h1
                style={{
                  lineHeight: "100%",
                  width: "100%",
                  margin: 0,
                  fontSize: isMobile ? 50 : 60,
                  color: "white",
                }}
              >
                Buyer First, Unbiased & Data Backed.
              </h1>
            </Flex>
          ),
          mainImgAltText:
            "Brickfi Assist | Expert property advice with Brickfi",
          subHeading:
            "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.",
          primaryImageSize: isMobile ? "75%" : "80%",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          mainImgAlign: "center",
          mainImgUrl: "/images/landing/brick-assist-landing-3.png",
          btn: {
            link: "",
            txt: "Schedule Callback",
            btnAction: () => {
              setRequestCallbackDialogOpen(true);
            },
          },
          imageContainerWidth: 50,
          verticalPadding: 100,
        }}
      ></SectionRight>
      <SectionLeft
        sectionData={{
          heading: "We are there with you, every step of the way.",
          subHeading: (
            <Typography.Text
              style={{
                marginTop: 16,
                fontSize: FONT_SIZE.HEADING_2,
                color: "white",
              }}
            >
              We provide end to end services, pre and post purchase with our
              data backed research to help you make confident decisions.
            </Typography.Text>
          ),
          mainImgAltText: "Brickfi Assist - End to End Property Consultation",
          primaryImageSize: "100%",
          mainImgUrl: "/images/landing/brick-assist-landing-2.png",
          imageContainerWidth: 50,
          bgColor: COLORS.textColorDark,
          textColor: "white",
          verticalPadding: isMobile ? 32 : 32,
        }}
      ></SectionLeft>
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
