import { Flex, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { LandingFooter } from "./footer";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { SectionLeft, SectionRight } from "./section";
import LandingHeader from "./header";

export function AboutUs() {
  const { isMobile } = useDevice();
  const highlightStyle = {
    fontWeight: 500,
    color: COLORS.primaryColor,
    backgroundColor: "rgba(43, 203, 242, 0.1)",
    padding: "0 4px",
  };
  const aboutusText = (
    <Typography.Text
      style={{ marginTop: 16, fontSize: FONT_SIZE.HEADING_3, display: "block" }}
    >
      Brickfi's journey started with a single motivation.{" "}
      <span style={highlightStyle}>
        To upgrade how people buy & invest in homes.
      </span>
      What we saw was a clear gap in how bias and manipulated information is out
      there and how people feel intimidated and confused of it. Brickfi's aims
      to be a customer focused platform to demystify this industry for the
      everyday consumer.
    </Typography.Text>
  );

  const whoAreWeText = (
    <Typography.Text
      style={{ fontSize: FONT_SIZE.HEADING_3, display: "block" }}
    >
      We are a team of engineeers, research analysts, designers and most
      important passionate home buyers with experience from institutions like
      <span style={highlightStyle}>
        Google, Quickr Homes, Goldman Sachs and BITS
      </span>
      .
    </Typography.Text>
  );

  const renderCharterItem = (charterProps: any) => {
    return (
      <Flex vertical style={{ maxWidth: 800, alignSelf: "center" }}>
        <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
          {charterProps.heading}
        </Typography.Text>
        <Typography.Text>{charterProps.content}</Typography.Text>
      </Flex>
    );
  };
  return (
    <Flex
      vertical
      style={{
        height: window.innerHeight,
        overflowY: "scroll",
        position: "relative",
        paddingTop: isMobile ? 60 : 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      <LandingHeader bgColor="white"></LandingHeader>
      <SectionLeft
        sectionData={{
          heading: "Home Ownership for the New India",
          mainImgAltText: "About Brickfi",
          subHeading: aboutusText as any,
          primaryImageSize: "60%",
          fullHeight: true,
          mainImgUrl: "/images/landing/aboutus-1.png",
        }}
      ></SectionLeft>
      <Flex
        vertical
        style={{
          backgroundColor: "#fdf7f6",
          padding: "80px 0",
          width: "100vw",
        }}
      >
        <Flex
          justify={isMobile ? "left" : "center"}
          style={{ paddingLeft: isMobile ? 16 : 0 }}
        >
          <Typography.Text style={{ fontSize: 60, fontWeight: 500 }}>
            Our Charter
          </Typography.Text>
        </Flex>
        <Flex
          vertical
          gap={24}
          style={{ padding: isMobile ? "0 16px" : "0 100px", marginTop: 32 }}
        >
          {renderCharterItem({
            heading: "Buyer Side. Always.",
            content: (
              <Typography.Text>
                Our driving philosophy is to help the home buyer who has to
                navigate the complexities of housing market alone. We{" "}
                <span style={highlightStyle}>
                  don't market selected projects nor do we present bias
                  information
                </span>{" "}
                to buyers. We strongly believe in providing the most intelligent
                way to buy a home whether it be curating the most relevant
                projects, providing completing and legit information or guiding
                the buyer in making the right decision.
              </Typography.Text>
            ),
          })}
          {renderCharterItem({
            align: "flex-end",
            heading: "Data Backed. Legit & Verified.",
            content: (
              <Typography.Text>
                Data is the backbone of how we operate and make decisions. In an
                industry, where there is
                <span style={highlightStyle}>
                  {" "}
                  tremendous noise & marketing bias
                </span>
                , we put lot of effort in finding the right data, be it{" "}
                <span style={highlightStyle}>
                  property level, location and other contextul data
                </span>
                . More importantly, we pay attention to where the data is coming
                from, how biased it can be and how we can make it useful for our
                users.
              </Typography.Text>
            ),
          })}
          {renderCharterItem({
            heading: "Technology Driven. Seamless Experience.",
            content: (
              <Typography.Text>
                "Technology is what brings everything together for us. We use
                latest tech including AI to collect data, refine it,{" "}
                <span style={highlightStyle}>
                  generate insights and create a seamless experience
                </span>{" "}
                making it easier for us and for our end users to make effective
                decisions. In a space where digital experiences are often broken
                or lacking, we strive to deliver one that doesn’t overwhelm, but
                simplifies things for the user.
              </Typography.Text>
            ),
          })}
        </Flex>
      </Flex>
      <SectionRight
        sectionData={{
          heading: "Who Are We",
          mainImgAltText: "About Brickfi",
          subHeading: whoAreWeText as any,
          primaryImageSize: "100%",
          mainImgUrl: "/images/landing/aboutus-2.png",
          verticalPadding: 120,
        }}
      ></SectionRight>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
