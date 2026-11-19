"use client";

import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Typography } from "antd";
import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 7;

export default function RequestReportPage() {
    const { isMobile } = useDevice();
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

    // replace, so the back button doesn't land here and restart the countdown
    useEffect(() => {
      if (secondsLeft === 0) {
        router.replace("/app");
        return;
      }
      const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearTimeout(id);
    }, [secondsLeft, router]);

    // skips the rest of the countdown
    const redirectNow = () => setSecondsLeft(0);

    const redirectText = (
      <Flex vertical align={isMobile? "center": "flex-start"} gap={4}>
        <div style={{fontSize: FONT_SIZE.HEADING_3}}>Redirecting you in {secondsLeft}..</div>
        <Button style={{fontSize: FONT_SIZE.HEADING_4, padding: "0px px"}} size="small" type="default" onClick={redirectNow} disabled={secondsLeft === 0}>
          Redirect Now
        </Button>
      </Flex>
    );

  return (
    <Flex
      justify="center"
      align="center"
      style={{ position: "relative", width: "100%", margin: "auto" }}
      gap={32}
      
    > <LandingHeader
        contained
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      />
      <Flex gap={16} vertical={isMobile} align="center" style={{marginTop: isMobile ? 100: 125}}>
      <img
      src={isMobile ? "images/landing/brick-chat/request-report-redirect-mob.png?v=1": "images/landing/brick-chat/request-report-redirect.png?v=1"}
        width="800px"
        style={{  maxWidth: "95%" }}
      ></img>
      {redirectText}
      </Flex>
     
    </Flex>
  );
  // return (
  //   <Suspense fallback={null}>
  //     <NewReportRequestForm />
  //   </Suspense>
  // );
}
