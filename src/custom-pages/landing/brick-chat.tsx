"use client";

import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import {
  Button,
  Carousel,
  Collapse,
  CollapseProps,
  Divider,
  Flex,
  Input,
  Tag,
  Typography,
} from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import type { CarouselRef } from "antd/es/carousel";
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

// Unique icons from SAMPLE_QUERIES, in order of first appearance.
const CTA_ICONS = SAMPLE_QUERIES.flatMap((q) => q.icons).filter(
  (icon, i, all) =>
    all.findIndex(
      (other) =>
        other.iconName === icon.iconName && other.iconSet === icon.iconSet,
    ) === i,
);
const CTA_ICON_FLIP_MS = 1500;

// Cycles through CTA_ICONS, `count` at a time, with a flip. Its own component
// so the ticks only re-render the icons, not the page.
function FlippingIcons({
  count,
  size,
  color,
}: {
  count: number;
  size: number;
  color: string;
}) {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStartIndex((i) => (i + count) % CTA_ICONS.length),
      CTA_ICON_FLIP_MS,
    );
    return () => clearInterval(id);
  }, [count]);

  const gap = 6;
  // white circle around each icon
  const circle = size + 10;
  return (
    // fixed box (and fixed slots) so loading/swapping icons never shifts the
    // button width
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        width: count * circle + (count - 1) * gap,
        height: circle,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }, (_, slot) => {
        const iconIndex = (startIndex + slot) % CTA_ICONS.length;
        const icon = CTA_ICONS[iconIndex];
        return (
          // the circle stays put; only the icon inside it flips
          <span
            key={slot}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: circle,
              height: circle,
              borderRadius: "50%",
              backgroundColor: "white",
            }}
          >
            {/* key remounts on every change, replaying the flip; later slots
                flip slightly after earlier ones */}
            <span
              key={iconIndex}
              className={styles.flipIcon}
              style={{
                width: size,
                height: size,
                animationDelay: `${slot * 120}ms`,
              }}
            >
              <DynamicReactIcon
                iconName={icon.iconName}
                iconSet={icon.iconSet}
                size={size}
                color={color}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const TYPE_DELAY_MS = 20;
const DELETE_DELAY_MS = 15;
const HOLD_DELAY_MS = 1800;

// Cycles through SAMPLE_QUERIES, typing each one out character by character.
// Kept as its own component so the per-character ticks don't re-render the page.
function TypingPlaceholder({ isMobile }: { isMobile: boolean }) {
  const [queryIndex, setQueryIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const query = SAMPLE_QUERIES[queryIndex];

  useEffect(() => {
    if (reduceMotion) {
      const t = setTimeout(
        () => setQueryIndex((i) => (i + 1) % SAMPLE_QUERIES.length),
        HOLD_DELAY_MS * 2,
      );
      return () => clearTimeout(t);
    }

    let t: ReturnType<typeof setTimeout>;
    if (!isDeleting && charCount < query.text.length) {
      t = setTimeout(() => setCharCount((c) => c + 1), TYPE_DELAY_MS);
    } else if (!isDeleting) {
      t = setTimeout(() => setIsDeleting(true), HOLD_DELAY_MS);
    } else if (charCount > 0) {
      t = setTimeout(() => setCharCount((c) => c - 1), DELETE_DELAY_MS);
    } else {
      setIsDeleting(false);
      setQueryIndex((i) => (i + 1) % SAMPLE_QUERIES.length);
      return;
    }
    return () => clearTimeout(t);
  }, [charCount, isDeleting, query, reduceMotion]);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: 8,
        padding: "0 24px",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Flex gap={4} style={{ flexShrink: 0 }}>
        {query.icons.map((icon) => (
          <Flex
            key={`${icon.iconSet}-${icon.iconName}`}
            style={{
              backgroundColor: COLORS.LANDING.PINK,
              borderRadius: "50%",
              padding: 3,
            }}
          >
            <DynamicReactIcon
              iconName={icon.iconName}
              iconSet={icon.iconSet}
              size={isMobile ? 12 : 14}
              color="white"
            />
          </Flex>
        ))}
      </Flex>
      <span
        style={{
          fontSize: isMobile ? FONT_SIZE.HEADING_3 : FONT_SIZE.HEADING_3,
          lineHeight: "120%",
          color: COLORS.textColorDark,
          opacity: 0.8,
          fontWeight: 500,
          textAlign: "left",
          display: "-webkit-box",
          WebkitLineClamp: isMobile ? 3 : 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {reduceMotion ? query.text : query.text.slice(0, charCount)}
        <span className={styles.typingCaret} />
      </span>
    </div>
  );
}

const REPORT_FEATURES: {
  label: string;
  iconName: string;
  iconSet: IconSetKey;
  title: string;
  headingMarginBottom?: number;
  subHeading: string;
  mainImgUrl: string;
}[] = [
  {
    label: "Property Layout",
    iconName: "SiHomebridge",
    iconSet: "si",
    title: "Property Layout & Design",
    subHeading:
      "Don't judge a property by its brochure (said someone); Brick360 looks at numbers like open space, unit density, unit distribution, amenities mix and more to give a deeper insights into property layout.",
    mainImgUrl: "/images/landing/report-feature-layout.png",
  },
  {
    label: "Location Dissection",
    iconName: "FaMapLocation",
    iconSet: "fa6",
    title: "Location Dissection to Assess Livability & Future Growth.",
    subHeading:
      "Analysing livability is more than just checking the nearest mall. We go deeper to understand road connectivity, workplace distribution, type of schools nearby and more.",
    mainImgUrl: "/images/landing/report-feature-location.png",
  },
  {
    label: "Builder Credibility",
    iconName: "TbBuildingBank",
    iconSet: "tb",
    title: "Builder Track Records, Complaints & Delays",
    headingMarginBottom: 16,
    subHeading:
      "Trust more than builder's words; look at their past projects, customer complaint, timely delivery, scale, diversity to get a sense of execution risks and credibility.",
    mainImgUrl: "/images/landing/report-feature-builder.png",
  },
  {
    label: "Financials Assessment",
    iconName: "FaMoneyBills",
    iconSet: "fa6",
    title: "Financials Assessment including Price Point, Rental Yield.",
    subHeading:
      "Making the right financial decisions becomes all the more necessary. Assess the price point, rental yield and growth potential with upto date pricing information. ",
    mainImgUrl: "/images/landing/report-feature-financials.png",
  },
];

export default function BrickChat({
  initialIsMobile = false,
}: {
  initialIsMobile?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  const featureCarouselRef = useRef<CarouselRef>(null);
  const [activeFeature, setActiveFeature] = useState(0);
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Needs at least two words before the query is worth sending.
  const isSearchQueryValid = /\S+\s+\S+/.test(searchQuery);

  const submitSearch = () => {
    if (!isSearchQueryValid) return;
    const query = searchQuery.trim();
    captureAnalyticsEvent("brickchat-landing-search", { query });
    safeWindow.location.href = `/app/brickchat?q=${encodeURIComponent(query)}`;
  };

  const getSearchInput = () => {
    // Animated sample queries stand in for the placeholder until the user
    // focuses the box or starts typing.
    const showTypingPlaceholder = !searchQuery && !isSearchFocused;
    return (
      <div
        style={{
          position: "relative",
          marginTop: 32,
          marginBottom: isMobile ? 32 : 0,
          width: "100%",
          maxWidth: 800,
        }}
      >
        <Input
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={submitSearch}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder={showTypingPlaceholder ? "" : "Start Searching Today"}
          aria-label="Search properties"
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
            height: isMobile ? 112 : 64,
            borderRadius: 24,
            backgroundColor: "white",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            padding: "0 12px 0 24px",
            width: "100%",
          }}
          styles={{
            input: {
              fontSize: FONT_SIZE.HEADING_2,
              color: COLORS.textColorDark,
              textAlign: "center",
            },
          }}
        />
        {showTypingPlaceholder && <TypingPlaceholder isMobile={isMobile} />}
      </div>
    );
  };

  const getMarqueeText = () => {
    return null;
    return (
      <div
        className={styles.marquee}
        style={{
          marginTop: 64,
          backgroundColor: COLORS.textColorDark,
          padding: "16px 0",
        }}
      >
        {/* Cards rendered twice so the -50% translate loops seamlessly */}
        <div className={styles.marqueeTrack}>
          {[...SAMPLE_QUERIES, ...SAMPLE_QUERIES].map((q, i) => (
            <div
              key={i}
              aria-hidden={i >= SAMPLE_QUERIES.length}
              style={{
                flexShrink: 0,
                width: isMobile ? 225 : 275,
                padding: "8px 16px",
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
              <Flex gap={8} justify="flex-start" style={{ marginTop: 4 }}>
                {q.icons.map((icon) => (
                  <Flex
                    style={{
                      backgroundColor: COLORS.LANDING.PINK,
                      borderRadius: "50%",
                      padding: 4,
                    }}
                  >
                    <DynamicReactIcon
                      key={`${icon.iconSet}-${icon.iconName}`}
                      iconName={icon.iconName}
                      iconSet={icon.iconSet}
                      size={20}
                      color="white"
                    />
                  </Flex>
                ))}
              </Flex>
              <Typography.Text
                style={{
                  backgroundColor: COLORS.LANDING.LIGHT_PINK,
                  padding: "4px 8px",
                  fontSize: FONT_SIZE.HEADING_3,
                  borderRadius: 8,
                  border: `2px solid ${COLORS.LANDING.MEDIUM_PINK}`,
                  marginBottom: 8,
                  marginTop: 8,
                  lineHeight: "130%",
                }}
              >
                {q.text}
              </Typography.Text>
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
          fontSize: FONT_SIZE.HEADING_3,
          textAlign: "left",
          color: COLORS.textColorDark,
          margin: 0,
          fontWeight: 400,
          lineHeight: "120%",
        }}
      >
        {text}
      </h3>
    );
  };

  const getFaqText = (text: string | ReactNode) => {
    return (
      <p style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_4 }}>
        {typeof text == "string" ? text : <>{text}</>}
      </p>
    );
  };
  const faqPanelStyle = {
    background: "transparent",
    borderRadius: 0,
    color: COLORS.textColorMedium,
    border: "none",
    borderBottom: `1px solid ${COLORS.textColorVeryLight}`,
  };
  const faqs: CollapseProps["items"] = [
    {
      key: "1",
      label: getFaqHeading("How do I search for a home on Brickfi?"),
      style: faqPanelStyle,
      children: getFaqText(
        "Describe what you're looking for in plain English — budget, location, priorities, anything that matters to you and your family. No filters, no forms.",
      ),
    },
    {
      key: "2",
      label: getFaqHeading("How does the AI decide what to recommend?"),
      style: faqPanelStyle,
      children: getFaqText(
        "It matches your stated priorities against live projects across Bangalore and shortlists what genuinely fits — not what's being pushed the hardest.",
      ),
    },
    {
      // TODO: confirm this claim is fully accurate before shipping.
      key: "3",
      label: getFaqHeading(
        "Do you have any tie-up with builders or brokers that affects recommendations?",
      ),
      style: faqPanelStyle,
      children: getFaqText(
        "No — recommendations are matched to your criteria, not to any builder or broker arrangement.",
      ),
    },
    {
      key: "4",
      label: getFaqHeading("Is the Discovery tool free to use?"),
      style: faqPanelStyle,
      children: getFaqText(
        "Yes, searching and getting shortlisted recommendations is free.",
      ),
    },
    {
      key: "5",
      label: getFaqHeading(
        "What is the Brick360 Report, and where does the data come from?",
      ),
      style: faqPanelStyle,
      children: getFaqText(
        "An independent report for any RERA-registered property in Bangalore, covering legal standing, pricing, builder history, layout, and location — sourced from verified government and public records like RERA, BBMP, Open City, and Open Street, not brochures.",
      ),
    },
    {
      // TODO: add the current free-report limit and turnaround time before shipping.
      key: "6",
      label: getFaqHeading("Is the report free, and how long does it take?"),
      style: faqPanelStyle,
      children: getFaqText(
        "You can generate free reports for RERA-registered properties in Bangalore.",
      ),
    },
    {
      key: "7",
      label: getFaqHeading("What kind of red flags can the report reveal?"),
      style: faqPanelStyle,
      children: getFaqText(
        "Legal issues like disputed land or unclear title, past builder delays and complaints, pricing out of line with the market, and location concerns no listing would mention — like nearby drains, high-tension lines, or transit noise.",
      ),
    },
    {
      key: "8",
      label: getFaqHeading("Can I compare multiple properties side by side?"),
      style: faqPanelStyle,
      children: getFaqText(
        "Yes — generate reports for different projects and compare them directly on price, legal standing, builder history, and location.",
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
          verticalPadding: 24,
          centerSectionTextAlign: "left",
          sectionMaxWidth: isMobile ? "100%" : 1000,
          marginTop: 75,
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
          primaryImageSize: isMobile ? "100%" : "100%",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  marginTop: 8,
                  marginBottom: 0,
                  lineHeight: "120%",
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

      <Flex
        vertical
        align="center"
        justify="center"
        style={{ width: "100%", marginTop: 32 }}
      >
        {/* <Typography.Text>Have a Real Estate Query ? Just Brickfi it!</Typography.Text> */}
        {isMobile ? (
          <img
            width="90%"
            style={{ marginTop: 16, marginBottom: "64px" }}
            src="/images/landing/brick-chat/landing-demo-mob.png"
          />
        ) : (
          // muted + playsInline are what let browsers autoplay it, like the GIF it replaces
          <video
            width="80%"
            style={{ marginTop: 16, marginBottom: "64px" }}
            src="/images/landing/brick-chat/landing-demo.mp4"
            poster="/images/landing/brick-chat/landing-demo.png"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Brickfi AI demo"
          />
        )}
      </Flex>
      <Flex vertical>
        <Flex
          vertical={isMobile}
          style={{
            maxWidth: isMobile ? "90%" : "80%",
            margin: "auto",
            marginBottom: isMobile ? 32 : 0,
          }}
          gap={isMobile ? 16 : 40}
        >
          {isMobile && (
            <img
              width={isMobile ? 125 : 250}
              style={{
                margin: isMobile ? 16 : "auto",
                marginTop: isMobile ? 0 : 64,
              }}
              src={
                isMobile
                  ? "/images/landing/brick-chat/brickchat-stats.png"
                  : "/images/landing/brick-chat/brickchat-stats.png"
              }
            />
          )}
          <Flex vertical style={{ width: "100%", margin: "auto" }}>
            <h2
              style={{
                fontSize: isMobile ? 40 : 54,
                color: COLORS.textColorDark,
                lineHeight: "100%",
                fontWeight: 800,
                margin: 0,
              }}
            >
              Brickfi is Redefining.
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
              How You Explore Real Estate
            </h2>
          </Flex>
          {!isMobile && (
            <img
              width={isMobile ? 175 : 250}
              style={{ margin: "auto", marginBottom: 100, marginTop: 64 }}
              src={
                isMobile
                  ? "/images/landing/brick-chat/brickchat-stats.png"
                  : "/images/landing/brick-chat/brickchat-stats.png"
              }
            />
          )}
        </Flex>
        <Flex vertical align="center">
          <Typography.Text
            style={{
              textTransform: "uppercase",
              fontSize: FONT_SIZE.HEADING_1 * 0.8,
              color: COLORS.LANDING.PINK,
              marginRight: isMobile ? "auto" : "initial",
              marginLeft: isMobile ? 24 : 0,
              marginBottom: 32,
            }}
          >
            DATA BACKED & UNBIASED {isMobile ? <br></br> : null}REAL ESTATE
            PLATFORM
          </Typography.Text>
          <img
            width={isMobile ? "90%" : "70%"}
            style={{ margin: "auto", marginBottom: 100 }}
            src={
              isMobile
                ? "/images/landing/brick-chat/brickchat-stats-2-mob.png"
                : "/images/landing/brick-chat/brickchat-stats-2.png"
            }
          />
        </Flex>
      </Flex>
      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: isMobile ? "100%" : 1400,
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
                Finding the Right Home can be Risky & Confusing.
              </h2>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 50,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  marginTop: 24,
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
          primaryImageSize: isMobile ? "90%" : "80%",
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
                  fontSize: isMobile ? 40 : 54,
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: 0,
                  color: COLORS.primaryColor,
                }}
              >
                With The Research ToolSet
              </h2>
              <h2
                style={{
                  fontSize: isMobile ? 40 : 54,
                  color: "white",
                  lineHeight: "100%",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                To Make it Easy & Efficient
              </h2>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/features-1-mob.png"
            : "/images/landing/brick-chat/features-1.png",
          primaryImageSize: isMobile ? "110%" : "75%",
        }}
      ></SectionCenter>
      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: "100%",
          heading: null,
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: 32,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/features-2-mob.png"
            : "/images/landing/brick-chat/features-2.png",
          primaryImageSize: isMobile ? "110%" : "75%",
        }}
      ></SectionCenter>

      <Flex
        align="flex-start"
        justify="flex-start"
        style={{
          backgroundColor: COLORS.LANDING.LIGHT_PINK,
          padding: "100px 0",
          fontWeight: 200,
          width: isMobile ? "90%:" : "80%",
          margin: "auto",
        }}
      >
        <Flex
          vertical
          style={{ maxWidth: 1400, padding: "0 16px", margin: "auto" }}
        >
          <Flex align="center" justify="center">
            <h2
              style={{
                fontSize: isMobile
                  ? FONT_SIZE.HEADING_1 * 1.25
                  : FONT_SIZE.HEADING_1 * 1.75,
                lineHeight: "100%",
                fontWeight: 300,
                margin: 0,
                marginBottom: isMobile ? 32 : 64,
              }}
            >
              <span style={{ color: COLORS.LANDING.PINK, fontWeight: 200 }}>
                What makes Brickfi different ?
              </span>{" "}
            </h2>
          </Flex>
          <Flex vertical={isMobile} justify="center" gap={16} align="center">
            <Flex>
              <img
                src="/images/landing/brick-chat/brick360-emblem.png"
                height={90}
                width="auto"
              ></img>
            </Flex>
            <Flex vertical justify="center">
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 1.25,
                  lineHeight: "100%",
                  maxWidth: 800,
                  fontWeight: 500,
                  marginBottom: 8,
                  marginTop: 16,
                  color: COLORS.primaryColor,
                }}
              >
                BRICK360 FRAMEWORK
              </Typography.Text>

              <Typography.Text
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_3
                    : FONT_SIZE.HEADING_2,
                  lineHeight: "100%",
                  maxWidth: 800,
                }}
              >
                The most comprehensive, intelligent and verified-data backed
                framework to rate and analyse real estate.
              </Typography.Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        gap={isMobile ? 16 : 8}
        wrap={isMobile ? "wrap" : undefined}
        justify="center"
        align="center"
        style={{
          padding: isMobile ? "16px" : "16px 0",
          marginBottom: 32,
          flexShrink: 0,
        }}
      >
        {REPORT_FEATURES.map((feature, index) => {
          const isActive = index === activeFeature;
          return (
            <Button
              key={feature.label}
              shape="round"
              onClick={() => featureCarouselRef.current?.goTo(index)}
              style={{
                flexShrink: 0,
                height: 32,
                padding: "0 14px",
                fontSize: 13,
                backgroundColor: isActive ? COLORS.textColorDark : "white",
                border: 0,
                fontWeight: 500,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                borderColor: isActive
                  ? COLORS.textColorDark
                  : COLORS.textColorVeryLight,
                color: isActive ? "#fff" : COLORS.textColorMedium,
              }}
            >
              <Flex align="center" gap={6}>
                <DynamicReactIcon
                  iconName={feature.iconName}
                  iconSet={feature.iconSet}
                  size={14}
                  color={isActive ? "#fff" : COLORS.textColorMedium}
                />
                {feature.label}
              </Flex>
            </Button>
          );
        })}
      </Flex>

      <Carousel
        ref={featureCarouselRef}
        autoplay
        autoplaySpeed={4000}
        dots={false}
        beforeChange={(_, next) => setActiveFeature(next)}
      >
        {REPORT_FEATURES.map(
          ({ title, headingMarginBottom, subHeading, mainImgUrl }) => (
            <div key={title}>
              <div
                className={`${styles.featureFrame} ${
                  isMobile ? styles.featureFrameMobile : ""
                }`}
              >
                <div className={styles.featureCell}>
                  <img src={mainImgUrl} alt={title} style={{ width: "100%" }} />
                </div>
                <div className={styles.featureCell}>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_1,
                      lineHeight: "100%",
                      margin: 0,
                      marginBottom: headingMarginBottom ?? 0,
                    }}
                  >
                    {title}
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      color: COLORS.textColorMedium,
                      fontWeight: 300,
                    }}
                  >
                    {subHeading}
                  </Typography.Text>
                </div>
                {/* dots where the frame lines meet */}
                <span className={`${styles.frameDot} ${styles.dotTopLeft}`} />
                <span className={`${styles.frameDot} ${styles.dotTopMid}`} />
                <span className={`${styles.frameDot} ${styles.dotTopRight}`} />
                <span
                  className={`${styles.frameDot} ${styles.dotBottomLeft}`}
                />
                <span className={`${styles.frameDot} ${styles.dotBottomMid}`} />
                <span
                  className={`${styles.frameDot} ${styles.dotBottomRight}`}
                />
              </div>
            </div>
          ),
        )}
      </Carousel>

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
                When we started out,{" "}
                <span
                  style={{
                    backgroundColor: COLORS.LANDING.PINK,
                    color: "white",
                    padding: "0 4px",
                    borderRadius: 4,
                  }}
                >
                  {" "}
                  buying a home in Bangalore felt like navigating a maze
                </span>
                . Exploring, research, assessment, all things that we take for
                given before buying; in this market, that felt almost
                impossible.<br></br>
                <br></br>
                The brokers were no help. There were far too many of them, the
                spam was relentless, and no one was qualified or unbiased enough
                to actually guide us through the process.{" "}
                <span
                  style={{
                    backgroundColor: COLORS.LANDING.PINK,
                    color: "white",
                    padding: "0 4px",
                    borderRadius: 4,
                  }}
                >
                  Everyone was only interested in making a sale.
                </span>{" "}
                The most shocking part was realizing just how comfortable they
                were with lying—even though this was the biggest financial
                decision of our lives.<br></br>
                <br></br>
                Despite our initial motivation, stepping into the field made one
                thing clear: no one was solving for the buyer.{" "}
                <span
                  style={{
                    backgroundColor: COLORS.LANDING.PINK,
                    color: "white",
                    padding: "0 4px",
                    borderRadius: 4,
                  }}
                >
                  No one seemed curious enough to dig deep into the real estate
                </span>{" "}
                ecosystem to build a genuinely data- and research-driven
                platform.<br></br>
                <br></br>
                That is why we set out to solve this problem. We are building a
                research-oriented platform designed to empower home buyers. Our
                <span
                  style={{
                    backgroundColor: COLORS.LANDING.PINK,
                    color: "white",
                    padding: "0 4px",
                    borderRadius: 4,
                  }}
                >
                  mission is to create the most objective, data-backed
                </span>{" "}
                real estate evaluation platform—giving buyers the clarity and
                confidence they deserve.<br></br>
                <br></br>
              </Typography.Text>
              <Flex justify="center" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  shape="round"
                  href="/app"
                  style={{
                    alignSelf: "flex-start",
                    padding: "32px",
                    fontSize: FONT_SIZE.HEADING_2,
                    marginTop: 32,
                  }}
                >
                  <Flex align="center" gap={16}>
                    Try Brickfi Today
                    <FlippingIcons
                      count={2}
                      size={16}
                      color={COLORS.primaryColor}
                    />
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          ),
          mainImgAltText: "Brickfi Assist - End to End Property Consultation",
          verticalPadding: isMobile ? 48 : 75,
        }}
      ></SectionCenter>

      <SectionCenter
        isMobile={isMobile}
        sectionData={{
          heading: (
            <Flex align="flex-start">
              <Flex align="center" gap={8}>
                <DynamicReactIcon
                  color={COLORS.textColorMedium}
                  size={26}
                  iconName="FaRegCircleQuestion"
                  iconSet="fa6"
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    color: COLORS.textColorMedium,
                    fontSize: FONT_SIZE.HEADING_1,
                    fontWeight: 300,
                  }}
                >
                  Frequently Asked Questions
                </Typography.Text>
              </Flex>
            </Flex>
          ),
          sectionMaxWidth: isMobile ? "100%" : 900,
          bgColor: COLORS.LANDING.LIGHT_PINK,
          verticalPadding: isMobile ? 32 : 32,
          subHeading: (
            <Flex style={{ marginTop: 32 }}>
              <Collapse
                ghost
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                  // "+" turns into "×" when open
                  <PlusOutlined
                    style={{
                      color: COLORS.textColorDark,
                      fontSize: FONT_SIZE.HEADING_4,
                      marginTop: 4,
                      transition: "transform 0.2s",
                    }}
                    rotate={isActive ? 45 : 0}
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
