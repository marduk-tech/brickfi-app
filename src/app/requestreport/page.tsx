"use client";

import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { COLORS } from "@/theme/style-constants";
import { Flex, Typography } from "antd";
import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REDIRECT_SECONDS = 3;

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

    const redirectText = (
      <div style={{fontSize: 24}}>Redirecting you in {secondsLeft}..</div>
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
      <Flex gap={16} vertical={isMobile} align="center" style={{marginTop: isMobile ? 150: 125}}>
            {isMobile ? redirectText : null}

      <img
        src="images/landing/brick-chat/request-report-redirect.png"
        width="600px"
        style={{  maxWidth: "95%" }}
      ></img>
      {!isMobile ? redirectText : null}
      </Flex>
     
    </Flex>
  );
  // return (
  //   <Suspense fallback={null}>
  //     <NewReportRequestForm />
  //   </Suspense>
  // );
}
