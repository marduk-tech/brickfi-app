import { Flex, Button, Row, Col } from "antd";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { LandingConstants } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

// SSR-safe responsive styles using CSS media queries
const responsiveStyles = {
  container: {
    height: "100vh",
    overflowY: "scroll" as const,
    position: "relative" as const,
    overflowX: "hidden" as const,
    scrollbarWidth: "none" as const,
    // Responsive padding using CSS
    paddingTop: "0px",
    "@media (max-width: 576px)": {
      paddingTop: "60px",
    },
  },
  whoAreWeText: {
    link: {
      fontSize: FONT_SIZE.HEADING_3,
      display: "block",
      color: COLORS.primaryColor,
      textDecoration: "none",
    },
    text: {
      fontSize: FONT_SIZE.HEADING_2,
      display: "block",
    },
  },
  dividerImage: {
    // Responsive width using CSS
    width: "30%",
    "@media (max-width: 576px)": {
      width: "80%",
    },
  },
};

// SSR-Safe Header Component
const LandingHeaderV2 = () => {
  const navItems = [
    { link: LandingConstants.genReportLink, label: "Brick360 Report" },
    { link: LandingConstants.blogLink, label: "Blog" },
    { link: LandingConstants.brickAssistLink, label: "Brickfi Assist" },
    { link: LandingConstants.aboutUsLink, label: "About Us" },
  ];

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        padding: "0 16px",
        height: "60px",
        borderBottom: `1px solid ${COLORS.borderColor}`,
      }}
    >
      <Row style={{ width: "100%", alignItems: "center" }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <img
            src="/images/brickfi-logo.png"
            alt="Brickfi Logo"
            style={{ height: "40px" }}
          />
        </Col>
        <Col xs={0} sm={16} md={18} lg={20}>
          <Flex justify="flex-end" gap="24px">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                style={{
                  color: COLORS.textColorDark,
                  textDecoration: "none",
                  fontSize: FONT_SIZE.HEADING_4,
                }}
              >
                {item.label}
              </a>
            ))}
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
};

// SSR-Safe Section Components
interface SectionData {
  id?: string;
  heading?: string;
  subHeading?: string | React.ReactNode;
  mainImgUrl?: string;
  mainImgAltText?: string;
  bgColor?: string;
  textColor?: string;
  verticalPadding?: number;
  fullHeight?: boolean;
  primaryImageSize?: string;
  mediaUrl?: string;
  btn?: {
    link?: string;
    txt: string;
  };
  imageContainerWidth?: number;
}

const SectionRightV2 = ({ sectionData }: { sectionData: SectionData }) => (
  <div
    id={sectionData.id}
    style={{
      backgroundColor: sectionData.bgColor || "white",
      padding: `${sectionData.verticalPadding || 60}px 16px`,
      minHeight: sectionData.fullHeight ? "100vh" : "auto",
    }}
  >
    <Row gutter={[32, 32]} align="middle">
      <Col xs={24} md={12} order={2}>
        <Flex vertical gap="24px">
          {sectionData.heading && (
            <Title
              level={1}
              style={{
                color: sectionData.textColor || COLORS.textColorDark,
                fontSize: FONT_SIZE.HEADING_1,
                margin: 0,
              }}
            >
              {sectionData.heading}
            </Title>
          )}
          {sectionData.subHeading && (
            <div style={{ color: sectionData.textColor || COLORS.textColorDark }}>
              {sectionData.subHeading}
            </div>
          )}
          {sectionData.btn && (
            <Button
              type="primary"
              size="large"
              href={sectionData.btn.link}
              style={{ alignSelf: "flex-start" }}
            >
              {sectionData.btn.txt}
            </Button>
          )}
        </Flex>
      </Col>
      <Col xs={24} md={12} order={1}>
        <Flex justify="center">
          <img
            src={sectionData.mainImgUrl}
            alt={sectionData.mainImgAltText}
            style={{
              width: sectionData.primaryImageSize || "100%",
              maxWidth: "100%",
            }}
          />
        </Flex>
      </Col>
    </Row>
  </div>
);

const SectionCenterV2 = ({ sectionData }: { sectionData: SectionData }) => (
  <div
    id={sectionData.id}
    style={{
      backgroundColor: sectionData.bgColor || "white",
      padding: `${sectionData.verticalPadding || 60}px 16px`,
      minHeight: sectionData.fullHeight ? "100vh" : "auto",
    }}
  >
    <Flex vertical align="center" gap="32px">
      {sectionData.heading && (
        <Title
          level={1}
          style={{
            color: sectionData.textColor || COLORS.textColorDark,
            fontSize: FONT_SIZE.HEADING_1,
            textAlign: "center",
            margin: 0,
          }}
        >
          {sectionData.heading}
        </Title>
      )}
      {sectionData.subHeading && (
        <Text
          style={{
            color: sectionData.textColor || COLORS.textColorDark,
            fontSize: FONT_SIZE.HEADING_2,
            textAlign: "center",
          }}
        >
          {sectionData.subHeading}
        </Text>
      )}
      {sectionData.mediaUrl ? (
        <video
          autoPlay
          muted
          loop
          style={{
            width: sectionData.primaryImageSize || "80%",
            maxWidth: "100%",
          }}
        >
          <source src={sectionData.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        sectionData.mainImgUrl && (
          <img
            src={sectionData.mainImgUrl}
            alt={sectionData.mainImgAltText}
            style={{
              width: sectionData.primaryImageSize || "80%",
              maxWidth: "100%",
            }}
          />
        )
      )}
    </Flex>
  </div>
);

const SectionLeftV2 = ({ sectionData }: { sectionData: SectionData }) => (
  <div
    id={sectionData.id}
    style={{
      backgroundColor: sectionData.bgColor || "white",
      padding: `${sectionData.verticalPadding || 60}px 16px`,
      minHeight: sectionData.fullHeight ? "100vh" : "auto",
    }}
  >
    <Row gutter={[32, 32]} align="middle">
      <Col xs={24} md={12}>
        <Flex vertical gap="24px">
          {sectionData.heading && (
            <Title
              level={1}
              style={{
                color: sectionData.textColor || COLORS.textColorDark,
                fontSize: FONT_SIZE.HEADING_1,
                margin: 0,
              }}
            >
              {sectionData.heading}
            </Title>
          )}
          {sectionData.subHeading && (
            <Text
              style={{
                color: sectionData.textColor || COLORS.textColorDark,
                fontSize: FONT_SIZE.HEADING_2,
              }}
            >
              {sectionData.subHeading}
            </Text>
          )}
          {sectionData.btn && (
            <Button
              type="primary"
              size="large"
              href={sectionData.btn.link}
              style={{ alignSelf: "flex-start" }}
            >
              {sectionData.btn.txt}
            </Button>
          )}
        </Flex>
      </Col>
      <Col xs={24} md={12}>
        <Flex justify="center">
          <img
            src={sectionData.mainImgUrl}
            alt={sectionData.mainImgAltText}
            style={{
              width: sectionData.primaryImageSize || "100%",
              maxWidth: "100%",
            }}
          />
        </Flex>
      </Col>
    </Row>
  </div>
);

// SSR-Safe Footer Component
const LandingFooterV2 = () => (
  <div style={{ backgroundColor: COLORS.textColorDark, padding: "60px 16px" }}>
    <Row gutter={[32, 32]}>
      <Col xs={24} md={8}>
        <img
          src="/images/brickfi-logo-white.png"
          alt="Brickfi Logo"
          style={{ height: "40px", marginBottom: "16px" }}
        />
        <Text style={{ color: "white", display: "block" }}>
          The smartest way to buy real estate. Get comprehensive property insights.
        </Text>
      </Col>
      <Col xs={24} md={16}>
        <Row gutter={[24, 24]}>
          <Col xs={12} md={8}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Company
            </Text>
            <Flex vertical gap="8px" style={{ marginTop: "16px" }}>
              <a href={LandingConstants.aboutUsLink} style={{ color: "white" }}>
                About Us
              </a>
              <a href={LandingConstants.blogLink} style={{ color: "white" }}>
                Blog
              </a>
            </Flex>
          </Col>
          <Col xs={12} md={8}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Services
            </Text>
            <Flex vertical gap="8px" style={{ marginTop: "16px" }}>
              <a href={LandingConstants.genReportLink} style={{ color: "white" }}>
                Brick360 Report
              </a>
              <a href={LandingConstants.brickAssistLink} style={{ color: "white" }}>
                Brickfi Assist
              </a>
            </Flex>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
);

// Main SSR-Safe Landing Component
export function MainLandingV2() {
  // Static content - same as original but without hooks
  const whoAreWeText = (
    <Flex vertical>
      <a
        href={LandingConstants.sampleReport}
        style={responsiveStyles.whoAreWeText.link}
      >
        SEE SAMPLE BRICK360 REPORT
      </a>
      <Text style={responsiveStyles.whoAreWeText.text}>
        Get the exclusive Brick360 Report on new & under construction properties
        across Bangalore. Verified, unbiased, marketing free insights you won&apos;t
        find anywhere else.
      </Text>
    </Flex>
  );

  return (
    <Flex vertical style={responsiveStyles.container}>
      <LandingHeaderV2 />
      
      <SectionRightV2
        sectionData={{
          heading: "The Only Report That Safeguards Your Home Investment",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText,
          primaryImageSize: "100%",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/brick360-landing-2.png",
          btn: {
            link: "/requestreport",
            txt: "Generate Free Report",
          },
          imageContainerWidth: 50,
          fullHeight: true,
          verticalPadding: 32,
        }}
      />

      <SectionCenterV2
        sectionData={{
          id: "demo-brkfi",
          heading: "",
          mediaUrl: "/images/landing/demo-landing-small-2.mp4?v=1",
          bgColor: "#32495e",
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "80%",
        }}
      />

      <Flex
        style={{ backgroundColor: "#32495e", paddingTop: 100 }}
        justify="center"
      >
        <img
          src="/images/landing/divider.png"
          alt="Divider"
          style={responsiveStyles.dividerImage}
        />
      </Flex>

      <SectionCenterV2
        sectionData={{
          heading: "The Intelligent Real Estate",
          mainImgAltText:
            "Brickfi is a customer focused real estate platform & advisory in Bangalore. Our difference lies in being buyer focused & our technology driven research",
          mainImgUrl: "/images/landing/slide-2.png",
          bgColor: "#32495e",
          textColor: "white",
          verticalPadding: 60,
          primaryImageSize: "50%",
        }}
      />

      <SectionCenterV2
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
      />

      <SectionLeftV2
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
      />

      <SectionCenterV2
        sectionData={{
          heading: "Nuanced Location Intelligence",
          subHeading: "",
          bgColor: "#fdf7f6",
          mainImgUrl: "/images/landing/slide-7.png",
          mainImgAltText:
            "See location insights visually on a map with Brickfi.",
        }}
      />

      <SectionLeftV2
        sectionData={{
          heading: "The BrickFi Difference",
          fullHeight: true,
          subHeading:
            "A combination of technology driven, data backed and personalized experience. ",
          mainImgUrl: "/images/landing/slide-4.png",
          mainImgAltText:
            "Brickfi offers personalized curation vs biased marketing, 360 reports vs lack of transparency, end to end strategic assistance vs limited guidance.",
        }}
      />

      <SectionCenterV2
        sectionData={{
          verticalPadding: 100,
          heading: "Our Happy Home Buyers",
          subHeading: "",
          bgColor: COLORS.textColorDark,
          textColor: "white",
          mainImgUrl: "/images/landing/slide-9.png",
          mainImgAltText: "List of happy home buyers at Brickfi.",
        }}
      />

      <SectionCenterV2
        sectionData={{
          verticalPadding: 100,
          heading: "",
          primaryImageSize: "75%",
          subHeading: "",
          mainImgUrl: "/images/landing/slide-10.png",
          mainImgAltText:
            "Brickfi covers 6 micro markets, 100+ developers and 400+ projects across Bengaluru",
        }}
      />

      <SectionRightV2
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
      />

      <LandingFooterV2 />
    </Flex>
  );
}