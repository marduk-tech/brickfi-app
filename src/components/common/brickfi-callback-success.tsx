"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Typography } from "antd";
import { Metadata } from "next";
import { useEffect } from "react";

export const metadata: Metadata = {
  title: "Brickfi | Advisor Callback",
  description: "Brickfi advisor callback form.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrickfiCallbackSuccess() {
  const { isMobile } = useDevice();
  useEffect(() => {
    captureAnalyticsEvent("callback-form-success", {});
  });

  return (
    <Flex gap={8} vertical style={{ paddingTop: 24, paddingBottom: 16 }}>
      <>
        <LandingHeader isMobile={isMobile}></LandingHeader>
        <Flex
          vertical={isMobile}
          style={{
            marginTop: 100,
            width: isMobile ? "90%" : "100%",
            maxWidth: 1200,
            margin: "auto",
            paddingTop: 100,
          }}
          gap={64}
        >
          {!isMobile ? (
            <Flex
              style={{ width: isMobile ? "100%" : "40%", height: 600 }}
              align="center"
              justify="flex-start"
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{ height: isMobile ? 250 : 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
          <Flex
            vertical
            style={{ width: isMobile ? "100%" : "60%" }}
            align="center"
            justify="center"
          >
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1 * 1.3,
                  marginBottom: 24,
                  lineHeight: "100%",
                }}
              >
                Get in Touch with a Brickfi Advisor
              </Typography.Text>
              <Flex
                vertical
                style={{
                  backgroundColor: COLORS.bgColorBlue,
                  padding: "16px",
                  borderRadius: 16,
                }}
              >
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_2,
                    fontWeight: 500,
                    lineHeight: "120%",
                  }}
                >
                  Wohoo! Your request is submitted.
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    lineHeight: "120%",
                  }}
                >
                  Thank you for your request. A Brickfi Advisor will call you
                  back at your preferred time.
                </Typography.Text>
              </Flex>
            </Flex>
          </Flex>
          {isMobile ? (
            <Flex
              style={{
                width: isMobile ? "100" : "40%",
                height: isMobile ? 400 : 600,
              }}
              align={!isMobile ? "center" : "flex-start"}
              justify={isMobile ? "center" : "flex-start"}
            >
              <img
                src="/images/landing/callback-banner.png"
                style={{ height: isMobile ? 320 : 400, width: "auto" }}
              ></img>
            </Flex>
          ) : null}
        </Flex>
        <LandingFooter></LandingFooter>
      </>
    </Flex>
  );
}
