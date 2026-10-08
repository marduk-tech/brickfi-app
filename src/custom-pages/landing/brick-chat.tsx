"use client";

import { CaretRightOutlined, SendOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  CollapseProps,
  Divider,
  Flex,
  Input,
  Tag,
  Typography,
} from "antd";
import { ReactNode, useEffect, useState } from "react";
import { BrickAssistCallback } from "../../components/common/brickassist-callback";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import LandingHeader from "./header";
import { SectionCenter, SectionLeft, SectionRight } from "./section";
import LandingFooter from "./footer";
import { safeWindow } from "@/libs/browser-utils";
import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import styles from "./brick-chat.module.css";

const SAMPLE_QUERIES: {
  text: string;
  icons: { iconName: string; iconSet: IconSetKey }[];
}[] = [
  {
    text: "I work in Bellandur, have a ₹1.5 Cr budget, and want the best schools nearby",
    icons: [
      { iconName: "MdWork", iconSet: "md" },
      { iconName: "PiCurrencyInr", iconSet: "pi" },
      { iconName: "MdSchool", iconSet: "md" },
    ],
  },
  {
    text: "I am confused between Prestige Glenpark and Sattva Ecocity",
    icons: [
      { iconName: "MdCompareArrows", iconSet: "md" },
      { iconName: "PiBuildings", iconSet: "pi" },
    ],
  },
  {
    text: "Where can I get the best rental in East Bangalore for 1.5 crore ?",
    icons: [
      { iconName: "PiKey", iconSet: "pi" },
      { iconName: "PiCurrencyInr", iconSet: "pi" },
    ],
  },
  {
    text: "I need a community for kids outdoor activities in less than 2 crore",
    icons: [
      { iconName: "MdChildCare", iconSet: "md" },
      { iconName: "PiTree", iconSet: "pi" },
    ],
  },
  {
    text: "How is Jakkur as an area from an investment perspective ?",
    icons: [
      { iconName: "MdLocationOn", iconSet: "md" },
      { iconName: "MdTrendingUp", iconSet: "md" },
    ],
  },
  {
    text: "Are there any red flags for Shanti Lakeview ?",
    icons: [
      { iconName: "PiFlag", iconSet: "pi" },
      { iconName: "MdWarning", iconSet: "md" },
    ],
  },
  {
    text: "Show me properties under 3 crore within 10 mins of Prestige Tech Park",
    icons: [
      { iconName: "MdHome", iconSet: "md" },
      { iconName: "MdOutlineTimer", iconSet: "md" },
    ],
  },
];

export default function BrickChat({
  initialIsMobile = false,
}: {
  initialIsMobile?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  const { height } = useWindowDimensions();

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

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

  useEffect(() => {
    captureAnalyticsEvent("brickassist-landing", {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  // Needs at least two words before the query is worth sending.
  const isSearchQueryValid = /\S+\s+\S+/.test(searchQuery);

  const submitSearch = () => {
    if (!isSearchQueryValid) return;
    const query = searchQuery.trim();
    captureAnalyticsEvent("brickchat-landing-search", { query });
    safeWindow.location.href = `/app/brickchat?q=${encodeURIComponent(query)}`;
  };

  const getSearchInput = () => {
    return (
      <Input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onPressEnter={submitSearch}
        placeholder="Start Searching Today"
        variant="borderless"
        suffix={
          searchQuery ? (
            <Button
              type="primary"
              shape="round"
              icon={<SendOutlined />}
              disabled={!isSearchQueryValid}
              onClick={submitSearch}
              aria-label="Send"
            />
          ) : null
        }
        style={{
          marginTop: 32,
          marginBottom: isMobile ? 32 : 0,
          height: isMobile ? 56 : 64,
          borderRadius: 24,
          backgroundColor: "white",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          padding: "0 12px 0 24px",
          width: "100%",
          maxWidth: 800,
        }}
        styles={{
          input: {
            fontSize: FONT_SIZE.HEADING_2,
            color: COLORS.textColorDark,
            textAlign: "center",
          },
        }}
      />
    );
  };

  const getMarqueeText = () => {
    return (
      <div
        className={styles.marquee}
        style={{ marginTop: 64, backgroundColor: COLORS.textColorDark, padding: "16px 0" }}
      >
        {/* Cards rendered twice so the -50% translate loops seamlessly */}
        <div className={styles.marqueeTrack}>
          {[...SAMPLE_QUERIES, ...SAMPLE_QUERIES].map((q, i) => (
            <div
              key={i}
              aria-hidden={i >= SAMPLE_QUERIES.length}
              style={{
                flexShrink: 0,
                width: isMobile ? 220 : 280,
                padding: "12px 20px",
                borderRadius: 16,
                marginRight: 16,
                backgroundColor: "white",
                color: COLORS.textColorDark,
                lineHeight: "130%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 8,
                fontWeight: 500,
                boxShadow: `0 2px 8px ${COLORS.primaryColor}40`,
              }}
            >
              <Typography.Text
                style={{
                  backgroundColor: COLORS.LANDING.LIGHT_PINK,
                  padding: "4px 8px",
                  fontSize: FONT_SIZE.HEADING_4,
                  borderRadius: 8,
                  border: `2px solid ${COLORS.LANDING.MEDIUM_PINK}`,
                }}
              >
                {q.text}
              </Typography.Text>
              <Flex gap={8} justify="flex-start">
                {q.icons.map((icon) => (
                  <DynamicReactIcon
                    key={`${icon.iconSet}-${icon.iconName}`}
                    iconName={icon.iconName}
                    iconSet={icon.iconSet}
                    size={20}
                    color={COLORS.LANDING.PINK}
                  />
                ))}
              </Flex>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [selectedFrameworkIndex, setSelectedFrameworkIndex] = useState(0);

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
      children: getFaqText(
        <>
          With Brickfi Assist, you get expert property-buying advice for new and
          under-construction properties, including apartments, villas, and plots
          in Bengaluru.<br></br>
          We provide a data-backed, verified list of curated properties tailored
          to your requirements.<br></br>
          Additionally, we offer end-to-end support—from site visits and
          negotiations to post-purchase documentation assistance.
        </>,
      ),
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
          We typically earn a commission from developers. However, this does not
          mean we favor any particular developer. Most developers allocate a
          standard commission for advisors which varies. This ensures that
          buyers do not incur any additional costs.
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
              We DON&apos;T sell or promote specific projects like traditional
              brokers.
            </p>
            Instead, we provide data-backed advice, curation, and analysis
            across projects in Bangalore.
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
            Our insights are derived from verified sources such as RERA,
            OpenStreetMap, Google Maps, and OpenCity—combined with deep analysis
            of builder track record, location dynamics, and future developments.
            <br></br>
            We help you understand both the strengths and risks of every
            property.<br></br>
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
            formalities, legal due-dilligence and any other assistance you might
            need once you have made your decision.
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
            We begin with a detailed discussion of your requirements and provide
            an overview of Bangalore’s landscape and understanding of different
            micro-markets.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ SHORTLISTING</b>
            <br></br>
            Based on your needs, we curate a set of relevant projects and share
            detailed Brick360° reports for each to help you understand &
            evaluate each property.
          </Typography.Text>
          <Typography.Text
            style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_2 }}
          >
            <b>✔ DECISION MAKING</b>
            <br></br>
            Once you shortlist properties, we assist with site visits, pricing
            discussions, and timelines to help you make an informed decision. We
            support you through final negotiations, unit selection, and payment
            planning.
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
          . This helps us to match-make projects based on your requirements. For
          instance, if you are love a home with more greenery around, we can
          shortlist projects based on surroundings. If you are primary purpose
          is investment, we can find projects near upcoming infra or business
          centres.
        </>,
      ),
    },
    {
      key: "6",
      label: getFaqHeading("Do you provide legal services ?"),
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
        isMobile={isMobile}
      ></LandingHeader>

      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          centerSectionTextAlign: "left",
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
                  Brickfi AI   
                </Typography.Text>
              </Flex>
              <h1
                style={{
                  fontSize: isMobile ? 40 : 54,
                  color: COLORS.textColorDark,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Reinvent Your Home Search
              </h1>
            </Flex>
          ),
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 150 : 150,
          primaryImageSize: isMobile ? "100%" : "100%",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  marginTop: 8,
                  marginBottom: 0,
                  lineHeight:  "120%"
                }}
              >
                Describe your dream home in your own words. Our AI scans
                thousands of properties and data points to deliver tailored
                recommendations and detailed analysis.
              </Typography.Text>
              <Flex wrap gap={8} style={{ marginTop: 16 }}>
                {(
                  [
                    {
                      label: "AI Matchmaking",
                      iconName: "PiMagicWand",
                      iconSet: "pi",
                    },
                    {
                      label: "Legit Data Source",
                      iconName: "MdVerifiedUser",
                      iconSet: "md",
                    },
                    {
                      label: "No Spam",
                      iconName: "PiHandPeace",
                      iconSet: "pi",
                    },
                  ] as const
                ).map((t) => (
                  <Tag
                    key={t.label}
                    style={{
                      margin: 0,
                      color: COLORS.LANDING.LIGHT_PINK,
                      backgroundColor: COLORS.primaryColor,
                    }}
                  >
                    <Flex align="center" gap={4}>
                      <DynamicReactIcon
                        iconName={t.iconName}
                        iconSet={t.iconSet}
                        size={14}
                        color={COLORS.LANDING.LIGHT_PINK}
                      />
                      {t.label}
                    </Flex>
                  </Tag>
                ))}
              </Flex>
              {getSearchInput()}
              {getMarqueeText()}
            </Flex>
          ),
        }}
      ></SectionCenter>

      <img
        width={isMobile ? "90%" : "80%"}
        style={{ margin: "auto", marginBottom: 100 }}
        src={
          isMobile
            ? "/images/landing/brick-chat/landing-demo.png"
            : "/images/landing/brick-chat/landing-demo.png"
        }
      />
      <Flex vertical>
        <Flex
          vertical
          style={{ width: isMobile ? "90%" : "80%", margin: "auto" }}
        >
          <h2
            style={{
              fontSize: isMobile ? 40 : 54,
              color: COLORS.textColorDark,
              lineHeight: "100%",
              fontWeight: 800,
              margin: 0,
            }}
          >
            No One Looks at Real Estate.
          </h2>
          <h2
            style={{
              fontSize: isMobile ? 40 : 54,
              lineHeight: "100%",
              fontWeight: 800,
              margin: 0,
              color: COLORS.primaryColor,
            }}
          >
            Like Brickfi Does.
          </h2>
        </Flex>
        <img
          width={350}
          style={{ margin: "auto", marginBottom: 100, marginTop: 64 }}
          src={
            isMobile
              ? "/images/landing/brick-chat/brickchat-stats.png"
              : "/images/landing/brick-chat/brickchat-stats.png"
          }
        />
        <img
          width={isMobile ? "90%" : "70%"}
          style={{ margin: "auto", marginBottom: 100 }}
          src={
            isMobile
              ? "/images/landing/brick-chat/brickchat-stats-2.png"
              : "/images/landing/brick-chat/brickchat-stats-2.png"
          }
        />
      </Flex>
      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: isMobile ? "100%" : 1300,
          heading: (
            <Flex vertical>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 50,
                  color: COLORS.LANDING.LIGHT_PINK,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Home Buying can be Risky & Confusing.
              </h2>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 50,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  color: COLORS.primaryColor,
                }}
              >
                Brickfi Gives You Clarity & Confidence
              </h2>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/brickchat-vs-broker.png"
            : "/images/landing/brick-chat/brickchat-vs-broker.png",
          primaryImageSize: isMobile ? "90%" : "70%",
        }}
      ></SectionLeft>

      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: "100%",
          heading: (
            <Flex vertical align="center">
              <h2
                style={{
                  fontSize: isMobile ? 40 : 50,
                  color: "white",
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: 32,
                }}
              >
                With The{" "}
                <span style={{ color: COLORS.primaryColor }}>
                  Research ToolSet
                </span>{" "}
                To Make it Easy & Efficient
              </h2>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/brickchat-features.png"
            : "/images/landing/brick-chat/brickchat-features.png",
          primaryImageSize: "65%",
        }}
      ></SectionCenter>

      <Flex
        align="flex-start"
        justify="flex-start"
        style={{
          backgroundColor: COLORS.LANDING.LIGHT_PINK,
          padding: "100px 0",
          fontWeight: 200,
          width: "80%",
          margin: "auto",
        }}
      >
        <Flex vertical style={{ maxWidth: 1400, padding: "0 16px" }}>
          <h2
            style={{
              fontSize: FONT_SIZE.HEADING_1 * 1.5,
              lineHeight: "100%",
              fontWeight: 300,
              margin: 0,
              marginBottom: 8,
            }}
          >
            <span style={{ color: COLORS.LANDING.PINK, fontWeight: 500 }}>
              Brick360 Framework
            </span>{" "}
          </h2>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "100%",
              maxWidth: 800,
            }}
          >
            The most comprehensive and legit data backed framework to rate and
            analyse properties.
          </Typography.Text>
        </Flex>
      </Flex>

      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * .9,
                lineHeight: "100%",
                marginBottom: 16,
                margin: 0,
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
          sectionMaxWidth: isMobile ? "100%" : "1100px",
          verticalPadding: 24,
        }}
      ></SectionLeft>

      {[
        {
          sectionMaxWidth: isMobile ? "100%" : "1100px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * .9,
                lineHeight: "100%",
                margin: 0,
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
          sectionMaxWidth: isMobile ? "100%" : "1100px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * .9,
                lineHeight: "100%",
                margin: 0,
                marginBottom: 16,
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
          sectionMaxWidth: isMobile ? "100%" : "1100px",
          heading: (
            <h2
              style={{
                fontSize: FONT_SIZE.HEADING_1 * .9,
                lineHeight: "100%",
                margin: 0,
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

      <Flex align="center" justify="center">
        <img
          src="/images/landing/brickassistv2/divider.png"
          width={isMobile ? "60%" : 400}
          height="auto"
        ></img>
      </Flex>

      <SectionCenter
        isMobile={isMobile}
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
      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.LANDING.LIGHT_PINK,
          heading: "",
          sectionMaxWidth: isMobile ? "100%" : 900,
          subHeading: (
            <Flex vertical style={{ paddingBottom: 100 }}>
              <h2
                style={{
                  textTransform: "uppercase",
                  color: COLORS.primaryColor,
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_2,
                  margin: 0,
                }}
              >
                A NOTE FROM OUR FOUNDER
              </h2>
              <h1
                style={{
                  color: COLORS.textColorDark,
                  textAlign: "left",
                  fontSize: FONT_SIZE.HEADING_1,
                  margin: 0,
                }}
              >
                Why are we building Brickfi ?
              </h1>
              <Typography.Text
                style={{
                  marginTop: 16,
                  fontSize: FONT_SIZE.HEADING_2,
                  maxWidth: 1000,
                  color: COLORS.textColorDark,
                  textAlign: "left",
                  paddingBottom: 24,
                }}
              >
                When we started out, buying a home in Bangalore felt like
                navigating a maze. Exploring, research, assessment, all things
                that we take for given before buying; in this market, that felt
                almost impossible.<br></br>
                <br></br>
                The brokers were no help. There were far too many of them, the
                spam was relentless, and no one was qualified or unbiased enough
                to actually guide us through the process. Everyone was only
                interested in making a sale. The most shocking part was
                realizing just how comfortable they were with lying—even though
                this was the biggest financial decision of our lives.<br></br>
                <br></br>
                Despite our initial motivation, stepping into the field made one
                thing clear: no one was solving for the buyer. No one seemed
                curious enough to dig deep into the real estate ecosystem to
                build a genuinely data- and research-driven platform.<br></br>
                <br></br>
                That is why we set out to solve this problem. We are building a
                research-oriented platform designed to empower home buyers. Our
                mission is to create the most objective, data-backed real estate
                evaluation platform—giving buyers the clarity and confidence
                they deserve.<br></br>
                <br></br>
              </Typography.Text>
            </Flex>
          ),
          mainImgAltText: "Brickfi Assist - End to End Property Consultation",
          verticalPadding: isMobile ? 48 : 75,
        }}
      ></SectionCenter>
      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          heading: "FAQ",
          sectionMaxWidth: isMobile ? "100%" : 900,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 48 : 75,
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
