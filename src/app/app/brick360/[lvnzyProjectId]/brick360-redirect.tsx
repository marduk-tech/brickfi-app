"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
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

  return (
    <Flex
      vertical
      gap={16}
      style={{ marginTop: 200 }}
      align="center"
      justify="center"
    >
      <Loader />
      <Flex align="center" gap={8}>
        
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
    </Flex>
  );
}
