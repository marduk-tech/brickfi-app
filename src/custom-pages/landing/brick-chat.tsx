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
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import styles from "./brick-chat.module.css";

const SAMPLE_QUERIES = [
  "I work in Bellandur, have a ₹1.5 Cr budget, and want the best schools nearby",
  "I am confused between Prestige Glenpark and Sattva Ecocity",
  "Where can I get the best rental in East Bangalore for 1.5 crore ?",
  "I need a community for kids outdoor activities in less than 2 crore",
  "How is Jakkur as an area from an investment perspective ?",
  "Are there any red flags for Shanti Lakeview ?",
  "Show me properties under 3 crore within 10 mins of Prestige Tech Park",
];

// TODO: swap placeholder images for framework-specific ones.
const DATA_FRAMEWORK_ITEMS = [
  {
    label: "Builder",
    imageUrl: "/images/landing/brick-chat/data-1.png",
    text: "Track record, past deliveries, delays and litigation history of the developer, verified from RERA and public records.",
  },
  {
    label: "Property",
    imageUrl: "/images/landing/brickassistv2/3-2.png",
    text: "Layout, density, open space, amenities and construction quality, so you know exactly what you're buying.",
  },
  {
    label: "Location",
    imageUrl: "/images/landing/brickassistv2/3-3.png",
    text: "Connectivity, schools, hospitals, tech parks and upcoming infrastructure around the project.",
  },
  {
    label: "Financials",
    imageUrl: "/images/landing/brickassistv2/4-v2.png",
    text: "Pricing against nearby projects, price trends and appreciation potential to judge if the deal is fair.",
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
      <div className={styles.marquee} style={{ marginTop: 64 }}>
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
                backgroundColor: COLORS.LANDING.PINK,
                color: "white",
                fontSize: FONT_SIZE.HEADING_3,
                lineHeight: "130%",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
              }}
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [selectedFrameworkIndex, setSelectedFrameworkIndex] = useState(0);

  const getDataFrameworkTabs = () => {
    const selected = DATA_FRAMEWORK_ITEMS[selectedFrameworkIndex];
    return (
      <Flex align="center" vertical gap={24} style={{ marginTop: 32 }}>
        <Flex wrap gap={8}>
          {DATA_FRAMEWORK_ITEMS.map((item, i) => {
            const isSelected = i === selectedFrameworkIndex;
            return (
              <Button
                key={item.label}
                onClick={() => setSelectedFrameworkIndex(i)}
                style={{
                  borderRadius: 24,
                  padding: "4px 20px",
                  height: "auto",
                  fontSize: FONT_SIZE.HEADING_3,
                  fontWeight: 500,
                  border: `1px solid ${COLORS.textColorDark}`,
                  backgroundColor: isSelected
                    ? COLORS.textColorDark
                    : "transparent",
                  color: isSelected
                    ? COLORS.LANDING.LIGHT_PINK
                    : COLORS.textColorDark,
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Flex>
        <Flex align="center" style={{width: isMobile ? "90%": "80%"}} gap={16}>
          <img
            src={selected.imageUrl}
            alt={`Brick360 ${selected.label} analysis`}
            style={{ width: 600, borderRadius: 16 }}
          />
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_2,
              color: COLORS.textColorDark,
              textAlign: "left",
            }}
          >
            {selected.text}
          </Typography.Text>
        </Flex>
      </Flex>
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
              {/* <Flex align="center" gap={4}>
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
              </Flex> */}
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
          verticalPadding: isMobile ? 100 : 100,
          primaryImageSize: isMobile ? "100%" : "100%",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  marginTop: 8,
                  marginBottom: 0,
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
                      backgroundColor: COLORS.textColorDark,
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
      <SectionRight
        isMobile={isMobile}
        sectionData={{
          sectionMaxWidth: "100%",
          heading: (
            <Flex vertical>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 54,
                  color: COLORS.textColorDark,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Home Buying can be Risky & Confusing.
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
          primaryImageSize: isMobile ? "90%" : "90%",
        }}
      ></SectionRight>


 <SectionLeft
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: "90%",
          heading: (
            <Flex vertical>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 54,
                  color: "white",
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  maxWidth: 600
                }}
              >
               The Complete Research Tool You Need
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
          primaryImageSize: isMobile ? "90%" : "80%",
        }}
      ></SectionLeft>


        <SectionCenter
        isMobile={isMobile}
        sectionData={{
          heading:
              <h2
                style={{
                  fontSize: isMobile ? 40 : 54,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  color: "white"
                }}
              >
              The 360 Data Framework You can Trust
              </h2>,
          subHeading: getDataFrameworkTabs(),
          bgColor: COLORS.textColorDark,
          mainImgAltText: "Testimonials from Brickfi Customers",
          verticalPadding: isMobile ? 32 : 100,
        }}
      ></SectionCenter>
         
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
      <SectionLeft
        isMobile={isMobile}
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
              recommendations, confusing property decisions and broken advise,
              our founders (ex-Google engineer) realized: Real estate is the
              only major industry without organized, accessible data and trusted
              approach. That had to change. Brickfi Assist applies the same data
              infrastructure principles that power modern tech platforms to an
              industry desperately lacking them and radical transparency where
              its needed the most.
            </Typography.Text>
          ),
        }}
      ></SectionLeft>

      <SectionCenter
        isMobile={isMobile}
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
