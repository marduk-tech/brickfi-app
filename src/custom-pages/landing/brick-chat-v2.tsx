"use client";

import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
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
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { CarouselRef } from "antd/es/carousel";
import type { TextAreaRef } from "antd/es/input/TextArea";
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

const FAQs = [
  {
    question:
      "How is Brickfi different from other brokers and channel partners?",
    answer:
      "\nTraditional brokers and channel partners typically work with a limited set of builders and projects, and their recommendations are often influenced by the inventory they represent and associated commissions or incentives. Property listing portals offer wider catalogues, but their visibility is often driven by paid promotions and advertising rather than buyer requirements.\n\nBrickfi takes a different approach by starting with your budget, preferred locations, lifestyle, and investment objectives, using custom-trained AI to scan all RERA registered projects. Shortlisted projects are then evaluated through our Brick360 intelligence engine, covering:\n* Builder credibility\n* Neighbourhood potential\n* Pricing\n* Project specifications\n* Potential risks\n\nInstead of restricting you to an agent's inventory or marketing budgets, Brickfi gives you a comprehensive, buyer-first view of the market to help you find and evaluate properties that make sense for you.\n",
  },
  {
    question:
      "Is Brickfi free for customers? What is included in the services?",
    answer:
      "\nYes, customers can use Brickfi to discover properties, explore recommendations, and access property insights without paying for the discovery experience.\n\nOur services include:\n* **Personalised property discovery:** Find properties based on your budget, preferred locations, configuration, workplace, and other requirements.\n* **Property shortlisting:** Get recommendations with clear explanations of how each property matches your requirements.\n* **Brick360 Property Reports:** Understand a project's strengths, limitations, and important considerations through detailed research on the builder, location, pricing, and project.\n* **Expert consultation:** Speak to our team to clarify doubts, discuss shortlisted properties, and plan site visits.\n* **End-to-end buying assistance:** Get support throughout the buying journey from shortlisting to site visits, legal checks, home loan assistance, cost assessment, and more.\n\nAny charges applicable to specific services or third-party engagements (like legal checks in specific cases) will be communicated upfront.\n",
  },
  {
    question: "How do you evaluate a neighbourhood?",
    answer:
      "\nEvaluating a neighbourhood requires looking at multiple parameters to understand how suitable an area is for your lifestyle and daily needs:\n\n* **Connectivity:** Access to major roads, metro stations, public transport, and important employment hubs.\n* **Social infrastructure:** Proximity to schools, hospitals, supermarkets, shopping areas, and other essential facilities.\n* **Liveability:** Traffic conditions, road access, water availability, surrounding development, noise, and other factors that influence everyday living.\n* **Infrastructure and development:** Existing infrastructure as well as planned roads, metro connectivity, and other developments that could influence the area.\n* **Surrounding environment:** Land use, nearby commercial or industrial activity, open spaces, and potential environmental concerns.\n\nWe bring these insights together to help you understand the advantages and disadvantages of a neighbourhood, rather than judging it on its popularity or marketing claims alone.\n",
  },
  {
    question: "How do you know if an area has good growth potential?",
    answer:
      "\nAn area's growth potential depends on factors that influence its future demand, connectivity, and liveability, rather than just past price increases. Our assessment considers:\n\n* **Upcoming infrastructure:** Planned metro lines, road expansions, expressways, and other connectivity improvements.\n* **Employment cluster:** Existing and emerging IT parks, business districts, and employment hubs that drive housing demand.\n* **Social infrastructure:** Development of schools, hospitals, retail, and other facilities making an area more attractive to residents.\n* **Residential development:** New projects, developer activity, supply pipeline, and overall pace of development.\n* **Price trends:** Historical price movement and comparison with neighbouring micro-markets to understand if current prices already reflect expected growth.\n* **Rental demand:** Tenant demand, proximity to employment hubs, and potential rental yields.\n\nGrowth potential is an assessment, not a guarantee of future price appreciation. Planned infrastructure and proposed developments are also distinguished from projects already operational.\n",
  },
  {
    question: "How do you check the credibility of a builder?",
    answer:
      "\nA builder's reputation is critical before purchasing a property. We evaluate developers by examining:\n\n* **Delivery track record:** Whether earlier projects were delivered on time or experienced significant delays, and the ratio of on-time vs. delayed projects.\n* **Customer complaints:** Available complaints, disputes, and litigation involving the builder or its projects.\n* **Regulatory compliance:** Relevant RERA registrations, project approvals, and regulatory records.\n* **Construction and project quality:** The quality of completed developments, maintenance standards, and overall execution.\n* **Financial and business background:** Available information about the promoter, associated entities, and business track record.\n\nWe pull information from legitimate sources like RERA, public documents, and project disclosures to help you understand a builder's track record and identify potential red or green flags.\n",
  },
  {
    question: "How do I know if the price quoted for a flat is fair?",
    answer:
      "\nA property's quoted price should be evaluated against comparable properties and the value it offers, rather than just the price per square foot. What we analyse includes:\n\n* **Comparable properties:** Prices of similar projects in the same micro-market, considering configuration, size, development stage, and positioning.\n* **Location premium:** Whether the property commands a reasonable premium based on connectivity, infrastructure, and neighbourhood quality.\n* **Builder premium:** Whether the developer's reputation, construction quality, and delivery track record justify the price.\n* **Project specifications:** Amenities, open spaces, density, construction quality, and other features influencing property value.\n* **Price trends:** How the quoted price compares with historical trends and competing projects in the area.\n* **All-inclusive cost:** Base price, floor rise, preferential location charges, parking, taxes, registration, and other applicable costs.\n\nThe goal is to help you understand what you are paying for, whether any premium is justified, and where there is room to negotiate.\n",
  },
];

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
    text: "I need apartment community for kids outdoor activities in less than 2 crore",
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

// SAMPLE_QUERIES split across the two scrolling rows under the search input.
const QUERY_ROWS = [0, 1].map((r) =>
  SAMPLE_QUERIES.filter((_, i) => i % 2 === r),
);

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

export default function BrickChatv2({
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

  // Mobile: the stats image is wider than the screen, so it sits in a
  // horizontally scrollable container that auto-scrolls left in a seamless
  // loop (the image is rendered twice; we wrap back by one copy's width).
  // Auto-scroll pauses while the user is touching it.
  const statsScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobile) return;
    const el = statsScrollRef.current;
    if (!el) return;

    let frame: number;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;
    let pos = el.scrollLeft;

    const step = () => {
      const loopWidth = el.scrollWidth / 2;
      if (!paused && loopWidth > el.clientWidth) {
        pos += 0.8;
        if (pos >= loopWidth) pos -= loopWidth;
        el.scrollLeft = pos;
      }
      frame = requestAnimationFrame(step);
    };

    const pause = () => {
      paused = true;
      clearTimeout(resumeTimer);
    };
    const resume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        pos = el.scrollLeft;
        paused = false;
      }, 2000);
    };

    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resumeTimer);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [isMobile]);

  const [requestCallbackDialogOpen, setRequestCallbackDialogOpen] =
    useState(false);

  useEffect(() => {
    captureAnalyticsEvent("brickassist-landing", {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextAreaRef>(null);
  // Needs at least two words before the query is worth sending.
  const isSearchQueryValid = /\S+\s+\S+/.test(searchQuery);

  const submitSearch = () => {
    // the button is always enabled - send the user back to the input instead
    if (!isSearchQueryValid) {
      searchInputRef.current?.focus();
      return;
    }
    const query = searchQuery.trim();
    captureAnalyticsEvent("brickchat-landing-search", { query });
    safeWindow.location.href = `/app/brickchat?q=${encodeURIComponent(query)}`;
  };

  const getSearchInput = () => {
    return (
      // desktop: button beside the input; mobile: on its own line below it
      <Flex
        vertical={isMobile}
        gap={16}
        align={isMobile ? "stretch" : "flex-end"}
        style={{
          marginTop: 32,
          width: "100%",
          maxWidth: 900,
        }}
      >
        <Input.TextArea
          ref={searchInputRef}
          className={styles.searchInput}
          rows={3}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onPressEnter={(e) => {
            // Enter submits; Shift+Enter adds a new line
            if (e.shiftKey) return;
            e.preventDefault();
            submitSearch();
          }}
          placeholder="What kind of home are you looking for?"
          aria-label="Search properties"
          variant="borderless"
          style={{
            borderRadius: 24,
            backgroundColor: "white",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            padding: "16px 24px",
            width: "100%",
            resize: "none",
            fontSize: isMobile ? FONT_SIZE.HEADING_4 : FONT_SIZE.HEADING_3,
            lineHeight: "140%",
            color: COLORS.textColorDark,
            textAlign: "left",
            fontWeight: 500,
          }}
        />
        <Button
          type="primary"
          shape="round"
          icon={<ArrowRightOutlined />}
          iconPosition="end"
          onClick={() => {
            // nothing typed - the button is then just the way into the app,
            // same as the bottom "Explore Brickfi" button
            if (!searchQuery.trim()) {
              safeWindow.location.href = "/app";
              return;
            }
            submitSearch();
          }}
          style={{ flexShrink: 0 }}
        >
          <Flex align="center" gap={8} style={{ padding: "12px 4px" }}>
            Explore Brickfi
            <FlippingIcons count={2} size={14} color={COLORS.primaryColor} />
          </Flex>
        </Button>
      </Flex>
    );
  };

  // Sample queries in two full-width scrolling rows; clicking one fills the
  // search input. Rendered outside the (left-aligned, capped-width) hero
  // section so it can span the page edge to edge.
  const getSampleQueryRows = () => {
    return (
      <div
        className={styles.queryMarquee}
        style={{
          // pull up into the section's bottom padding: 16px below the input
          marginTop: 16,
          marginBottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          // continues the hero section's light pink behind the chips
          padding: "24px 0",
          backgroundColor: COLORS.LANDING.LIGHT_PINK,
        }}
      >
        {QUERY_ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={styles.queryMarqueeRow}
            style={{
              // keep both rows moving at the same speed despite different
              // widths (chips are two lines, so about half the text wide)
              animationDuration: `${
                row.reduce((n, q) => n + q.text.length, 0) * 0.1
              }s`,
            }}
          >
            {/* Rendered twice so the -50% translate loops seamlessly */}
            {[...row, ...row].map((q, i) => (
              <button
                key={i}
                type="button"
                aria-hidden={i >= row.length}
                tabIndex={i >= row.length ? -1 : undefined}
                onClick={() => {
                  setSearchQuery(q.text);
                  searchInputRef.current?.focus();
                }}
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  // icons stacked below the text
                  flexDirection: "column-reverse",
                  alignItems: "flex-start",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 20,
                  // white on the near-white band - the border keeps the chip's
                  // edge visible
                  border: `1px solid ${COLORS.textColorVeryLight}`,
                  backgroundColor: "white",
                  // PINK at ~25% opacity (hex alpha "40")
                  boxShadow: `0 2px 8px ${COLORS.LANDING.PINK}40`,
                  color: COLORS.textColorDark,
                  fontSize: FONT_SIZE.PARA,
                  fontWeight: 500,
                  lineHeight: "130%",
                  textAlign: "left",
                  whiteSpace: "normal",
                  cursor: "pointer",
                }}
              >
                {/* icons on the left, arrow on the bottom right */}
                <Flex
                  align="center"
                  justify="space-between"
                  style={{ flexShrink: 0, alignSelf: "stretch" }}
                >
                  <Flex gap={4}>
                    {q.icons.map((icon) => (
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
                          size={12}
                          color="white"
                        />
                      </Flex>
                    ))}
                  </Flex>
                  <ArrowRightOutlined
                    style={{ fontSize: 12, color: COLORS.textColorDark }}
                  />
                </Flex>
                <span
                  style={{
                    // sized to about half the text so it wraps to two lines
                    // without cutting anything off
                    width: `${Math.ceil(q.text.length / 2) + 2}ch`,
                  }}
                >
                  {q.text}
                </span>
              </button>
            ))}
          </div>
        ))}
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

  // FAQ answers are markdown (paragraphs, bullet lists, bold) - a div, not a
  // p, since the rendered markdown brings its own p/ul elements
  const getFaqText = (markdown: string) => {
    return (
      <div
        className={styles.faqAnswer}
        style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_4 }}
      >
        <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
      </div>
    );
  };
  const faqPanelStyle = {
    background: "transparent",
    borderRadius: 0,
    color: COLORS.textColorMedium,
    border: "none",
    borderBottom: `1px solid ${COLORS.textColorVeryLight}`,
  };
  const faqs: CollapseProps["items"] = FAQs.map((faq, i) => ({
    key: String(i + 1),
    label: getFaqHeading(faq.question),
    style: faqPanelStyle,
    children: getFaqText(faq.answer),
  }));

  const renderProcessStep = (data: any) => {
    const padding = isMobile ? 8 : 16;
    const sectionMaxWidth = 625;
    return (
      <Flex
        vertical={isMobile || !data.fullWidth}
        style={{
          width: isMobile
            ? `calc(100% - ${padding * 2}px - 16px)`
            : `calc(${sectionMaxWidth * (data.fullWidth ? 2 : 1)}px - ${
                padding * 2
              }px - 32px)`,
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
                Find The Home You Need<br></br> Without Brokers or Spam
              </h1>
            </Flex>
          ),
          bgColor: COLORS.LANDING.LIGHT_PINK,
          primaryImageSize: isMobile ? "100%" : "100%",
          subHeading: (
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: isMobile
                    ? FONT_SIZE.HEADING_3
                    : FONT_SIZE.HEADING_2,
                  marginTop: 8,
                  marginBottom: 0,
                  lineHeight: "120%",
                }}
              >
                Tell Brickfi what you're looking for. Discover matching
                properties across Bangalore and get 360 assessment around
                builder, property, location and pricing.
              </Typography.Text>
              <Flex wrap gap={8} style={{ marginTop: 16 }}>
                {(
                  [
                    {
                      label: "2000+ Properties",
                      iconName: "PiMagicWand",
                      iconSet: "pi",
                    },
                    {
                      label: "Verified Data",
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
                      backgroundColor: COLORS.LANDING.PINK,
                      border: 0,
                      borderRadius: 8,
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
      {getSampleQueryRows()}

      <SectionLeft
        isMobile={isMobile}
        sectionData={{
          bgColor: COLORS.textColorDark,
          sectionMaxWidth: isMobile ? "100%" : 1400,
          heading: (
            <Flex align="flex-start" gap={isMobile ? 0 : 32} vertical>
              <img
                width={isMobile ? 200 : 225}
                style={{
                  margin: 16,
                  marginTop: 0,
                }}
                src={
                  isMobile
                    ? "/images/landing/brick-chat/brickchat-stats.png"
                    : "/images/landing/brick-chat/brickchat-stats.png"
                }
              />

              <Flex vertical style={{ width: "100%", margin: "auto" }}>
                <h2
                  style={{
                    fontSize: isMobile ? 40 : 50,
                    color: "white",
                    lineHeight: "100%",
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  The Platform That Works For You,
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
                  The Modern Indian Home Buyer
                </h2>
              </Flex>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: isMobile ? 100 : 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/platform-usps.png"
            : "/images/landing/brick-chat/platform-usps.png",
          primaryImageSize: isMobile ? "100%" : "90%",
        }}
      ></SectionLeft>
      <Flex vertical gap={isMobile ? 16 : 32} style={{ marginTop: 32 }}>
        
        
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
        <Flex vertical align="center">
          {/* <Typography.Text
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
          </Typography.Text> */}
          {isMobile ? (
            <div
              ref={statsScrollRef}
              style={{
                width: "100%",
                margin: "auto",
                marginBottom: 100,
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
            >
              <div style={{ display: "flex", width: "max-content" }}>
                {[0, 1].map((i) => (
                  <img
                    key={i}
                    aria-hidden={i === 1}
                    style={{
                      height: 240,
                      width: "auto",
                      maxWidth: "none",
                      display: "block",
                    }}
                    src="/images/landing/brick-chat/brickchat-stats-2.png"
                  />
                ))}
              </div>
            </div>
          ) : (
            <img
              width="70%"
              style={{ margin: "auto", marginBottom: 100 }}
              src="/images/landing/brick-chat/brickchat-stats-2.png"
            />
          )}
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
                  fontSize: isMobile ? 40 : 54,
                  color: COLORS.LANDING.LIGHT_PINK,
                  lineHeight: "120%",
                  fontWeight: 200,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                What makes Brickfi{" "}
                <span
                  style={{
                    color: "white",
                    backgroundColor: COLORS.primaryColor,
                    padding: "0 4px",
                  }}
                >
                  Different ?
                </span>
              </h2>
              <Typography.Text
                style={{ fontSize: FONT_SIZE.HEADING_3, color: "white", lineHeight: "130%" }}
              >
                Traditional brokers show you what earns them a fee. Listing sites rank whoever pays the most. Brickfi searches the entire market for what actually fits your needs—unbiased data, intelligent insights, zero spam 
                <br></br><br></br>Stop choosing from just 5 broker options or ad-boosted listings. Brickfi scans every available property in the market to deliver personalized, 100% unbiased matches—backed by data, not commissions. 

              </Typography.Text>
            </Flex>
          ),
          subHeading: "",
          centerSectionTextAlign: "left",
          verticalPadding: isMobile ? 48 : 100,
          textColor: COLORS.LANDING.LIGHT_PINK,
          mainImgUrl: isMobile
            ? "/images/landing/brick-chat/brickchat-vs-broker.png"
            : "/images/landing/brick-chat/brickchat-vs-broker.png",
          primaryImageSize: isMobile ? "100%" : "80%",
        }}
      ></SectionLeft>
      <Flex
        align="flex-start"
        justify="flex-start"
        style={{
          backgroundColor: COLORS.LANDING.LIGHT_PINK,
          padding: "100px 0 32px 0",
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
                What makes Brickfi{" "}
                <span
                  style={{
                    color: "white",
                    backgroundColor: COLORS.LANDING.PINK,
                    padding: "0 4px",
                  }}
                >
                  Possible?
                </span>
              </span>{" "}
            </h2>
          </Flex>
          <Flex
            justify={isMobile ? "flex-start" : "center"}
            gap={16}
            align={isMobile ? "flex-start" : "center"}
          >
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
                  marginTop: 0,
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
                  lineHeight: "120%",
                  maxWidth: 800,
                }}
              >
                The Heart of Brickfi is the Brick360 Data Framework, a 4-pillar
                based assessment platform. It collects data from verified
                government, public data and open source platforms and builds a
                standardizing rating framework for every property out there.
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
                  fontSize: FONT_SIZE.HEADING_3,
                  margin: 0,
                }}
              >
                A NOTE FROM OUR FOUNDER
              </h2>
              <h1
                style={{
                  color: COLORS.textColorDark,
                  textAlign: "left",
                  fontSize: isMobile ? FONT_SIZE.HEADING_1*.9 : FONT_SIZE.HEADING_1,
                  margin: 0,
                  fontWeight: 300
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
                    Explore Brickfi
                    <FlippingIcons
                      count={2}
                      size={16}
                      color={COLORS.primaryColor}
                    />
                    <ArrowRightOutlined />
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
                    fontSize: isMobile ? FONT_SIZE.HEADING_1 * .8: FONT_SIZE.HEADING_1,
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
