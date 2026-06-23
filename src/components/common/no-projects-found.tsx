"use client";

import { Button, Flex, Typography } from "antd";
import DynamicReactIcon from "./dynamic-react-icon";
import Link from "next/link";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LandingConstants } from "@/libs/constants";
import { safeWindow } from "@/libs/browser-utils";

export function NoProjectsFound() {
  return (
    <Flex vertical style={{ margin: 16, marginTop: 100 }} align="center">
      <DynamicReactIcon
        size={60}
        iconName="TbHomeSearch"
        iconSet="tb"
        color={COLORS.textColorLight}
      />
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          fontWeight: 500,
          marginTop: 24,
        }}
      >
        No Reports Found
      </Typography.Text>
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.PARA,
          textAlign: "center",
          color: COLORS.textColorDark,
        }}
      >
        Click reload below if you recently requested reports
      </Typography.Text>

      <Button
        style={{
          marginTop: 48,
          fontSize: FONT_SIZE.HEADING_3,
          padding: "0 16px",
        }}
        onClick={() => {
          window.location.reload();
        }}
        size="small"
      >
        Reload Page
      </Button>

      <Flex gap={16} style={{ position: "absolute", bottom: 100, padding: 16 }}>
        <Link
          style={{
            fontSize: FONT_SIZE.HEADING_4,
            color: COLORS.textColorMedium,
          }}
          onClick={() => {
            safeWindow.location.assign(LandingConstants.genReportFormLink);
          }}
          href={LandingConstants.genReportFormLink}
        >
          Request Brick360 Report
        </Link>
        <Link
          style={{
            fontSize: FONT_SIZE.HEADING_4,
            color: COLORS.textColorMedium,
          }}
          href="https://api.whatsapp.com/send?phone=919901623170"
        >
          Need help ?
        </Link>
      </Flex>
    </Flex>
  );
}
