"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// long enough to read the notice, short enough not to feel stuck
const REDIRECT_DELAY_MS = 2000;

export default function Brick360Redirect({ target }: { target: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(target), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router, target]);

  const { isMobile } = useDevice();


  return (
    <Flex
      vertical
      gap={16}
      style={{ marginTop: isMobile ? 100:200 }}
      align="center"
      justify="center"
    >
    
      <Flex vertical={isMobile} align="center" gap={8} style={{padding: isMobile ? "0 16px": 0}}>
        
        <DynamicReactIcon
          iconName="TbNorthStar"
          iconSet="tb"
          size={64}
          color={COLORS.primaryColor}
        ></DynamicReactIcon>
        <Flex vertical>
         <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1 * .9, fontWeight: 500, color: COLORS.primaryColor }}
        >
          Your Property Research is Becoming Smarter
        </Typography.Text>
        
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, color: COLORS.textColorDark }}
        >
          Hang Tight. We are redirecting to a new Brick360 experience..
        </Typography.Text>
        </Flex>
      </Flex>
        <Loader />
    </Flex>
  );
}
