"use client";

import { Button, Flex, Typography } from "antd";
import { useRouter } from "next/navigation";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <Flex
      align="center"
      vertical
      style={{ paddingTop: 128, textAlign: "center" }}
      justify="center"
    >
      <img
        src="/images/error-img.png"
        height={150}
        alt="Access Denied"
        style={{ marginBottom: 24 }}
      />

      <Typography.Title level={4} style={{ marginBottom: 12 }}>
        Oops! Looks like you don&apos;t have access.
      </Typography.Title>

      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_3,
          color: COLORS.textColorMedium,
          maxWidth: 500,
          marginBottom: 32,
        }}
      >
        Seems like this is a restricted page. Please contact admin to provide
        access.
      </Typography.Text>

      <Button type="primary" onClick={() => router.push("/app")}>
        Return to Home
      </Button>
    </Flex>
  );
}
