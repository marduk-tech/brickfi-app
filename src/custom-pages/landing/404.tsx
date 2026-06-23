"use client";

import { Flex } from "antd";
import { useState, useEffect } from "react";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { SectionCenter } from "./section";
import LandingHeader from "./header";
import LandingFooter from "./footer";
import { COLORS } from "@/theme/style-constants";

export default function FourOFour({ initialIsMobile = false }: { initialIsMobile?: boolean }) {
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
        isMobile={isMobile}
      ></LandingHeader>
      <SectionCenter
        isMobile={isMobile}
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
