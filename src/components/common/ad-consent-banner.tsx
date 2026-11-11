"use client";

import { getAdConsent, setAdConsent } from "@/libs/ad-attribution";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Typography } from "antd";
import { useEffect, useState } from "react";

// Asks once for consent to use the visitor's data for ads - until they
// answer, Google and Meta tags run with ad storage denied and no conversion
// is forwarded to them (see libs/ad-attribution.ts). The answer is kept for
// a year.
export default function AdConsentBanner() {
  // read after mount - the cookie isn't there during server rendering
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(getAdConsent() === null);
  }, []);

  if (!open) return null;

  const answer = (granted: boolean) => {
    setAdConsent(granted);
    setOpen(false);
  };

  return (
    <Flex
      role="dialog"
      aria-label="Cookie consent"
      wrap
      align="center"
      justify="space-between"
      gap={12}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1100,
        maxWidth: 720,
        margin: "0 auto",
        padding: "12px 16px",
        borderRadius: 12,
        backgroundColor: "#fff",
        border: `1px solid ${COLORS.borderColorMedium}`,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
      }}
    >
      <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT, flex: "1 1 280px" }}>
        We use cookies to measure our ads and show you relevant ones. You can
        allow or decline this.
      </Typography.Text>
      <Flex gap={8}>
        <Button size="small" onClick={() => answer(false)}>
          Decline
        </Button>
        <Button size="small" type="primary" onClick={() => answer(true)}>
          Allow
        </Button>
      </Flex>
    </Flex>
  );
}
