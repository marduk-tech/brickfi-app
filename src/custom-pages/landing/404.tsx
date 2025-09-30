"use client";

import { Flex } from "antd";
import { useDevice } from "../../hooks/use-device";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { SectionCenter } from "./section";
import LandingHeader from "./header";
import LandingFooter from "./footer";
import { COLORS } from "@/theme/style-constants";

export default function FourOFour() {
  const { isMobile } = useDevice();
  const { height } = useWindowDimensions();
  return (
    <Flex
      vertical
      style={{
        height: height,
        overflowY: "scroll",
        position: "relative",
        paddingTop: isMobile ? 60 : 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      <LandingHeader
        bgColor="transparent"
        logo="/images/brickfi-logo.png"
        color={COLORS.textColorMedium}
      ></LandingHeader>
      <SectionCenter
        sectionData={{
          mainImgUrl: "/images/landing/404.png",
          primaryImageSize: isMobile ? "120%": "50%",
          verticalPadding: 125,
        }}
      ></SectionCenter>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
