"use client";

import { useBrick360FontSize } from "../use-font-size";
import { Flex, Typography } from "antd";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { useDevice } from "@/hooks/use-device";
import { parseProConHtml } from "@/libs/html-utils";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";

interface Brick360HighlightsProps {
  lvnzyProject?: LvnzyProject;
  /** Stack cards top-to-bottom instead of a horizontal scroll strip - used
   * when this renders as its own tab (brick360-inline.tsx) rather than the
   * condensed strip above the tab bar. */
  vertical?: boolean;
}

// The "360 HIGHLIGHTS" pros/cons strip - the Highlights tab in
// brick360-inline.tsx (copied from components/brick-360/brick360-pillar.tsx).
export function Brick360Highlights({
  lvnzyProject,
  vertical,
}: Brick360HighlightsProps) {
  const { isMobile } = useDevice();
  const fs = useBrick360FontSize();

  // Each pro/con card shows its full content inline - no truncation, "Read
  // more" link or click-to-open dialog.
  function renderSummaryPoint(pt: string, isPro: boolean) {
    const { title, content } = parseProConHtml(pt);

    return (
      <Flex
        align="flex-start"
        style={{
          padding: "0px",
          borderRadius: 8,
          width: vertical ? "100%" : undefined,
        }}
        gap={4}
        vertical
      >
        <Flex vertical style={{ padding: "8px 4px" }}>
          <Flex align="center" gap={4}>
            <DynamicReactIcon
              size={isPro ? 20 : 24}
              iconName={isPro ? "FaRegLaugh" : "PiSmileySadBold"}
              iconSet={isPro ? "fa" : "pi"}
              color={isPro ? COLORS.primaryColor : COLORS.redIdentifier}
            ></DynamicReactIcon>
            <Typography.Text
              style={{
                fontWeight: 500,
                fontSize: fs.HEADING_2,
                lineHeight: "110%",
                marginTop: 2
              }}
            >
              {title}
            </Typography.Text>
          </Flex>
          {content ? (
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className={`reasoning ${isPro ? "" : "con"}`}
              style={{
                fontSize: fs.HEADING_3,
                margin: 0,
                width: vertical ? "100%" : 275,
                color: COLORS.textColorMedium,
                textWrap: "wrap",
                marginTop: 8
              }}
            ></div>
          ) : null}
        </Flex>
      </Flex>
    );
  }

  if (
    !lvnzyProject?.score?.summary ||
    !(lvnzyProject.score.summary.pros || lvnzyProject.score.summary.cons)
  ) {
    return null;
  }

  const cards = (
    <>
      {(lvnzyProject.score.summary.pros || []).map((p: any, i: number) => (
        <div
          key={`pro-${i}`}
          style={vertical ? { width: "100%" } : undefined}
        >
          {renderSummaryPoint(p, true)}
        </div>
      ))}
      {(lvnzyProject.score.summary.cons || []).map((p: any, i: number) => (
        <div
          key={`con-${i}`}
          style={vertical ? { width: "100%" } : undefined}
        >
          {renderSummaryPoint(p, false)}
        </div>
      ))}
    </>
  );

  return (
    <>
      <Flex vertical style={{ marginBottom: 0 }}>
        {/* <Typography.Text
          style={{
            fontSize: fs.HEADING_4,
            marginBottom: 4,
            color: COLORS.textColorMedium,
            fontWeight: 600
          }}
        >
          360° HIGHLIGHTS
        </Typography.Text> */}
        {vertical ? (
          isMobile ? (
            <Flex vertical gap={0} style={{ width: "100%" }}>
              {cards}
            </Flex>
          ) : (
            <Flex
            gap={16}
              style={{
                maxWidth: 800
              }}
              vertical
            >
              {cards}
            </Flex>
          )
        ) : (
          <div style={{ position: "relative" }}>
            <Flex
              gap={16}
              style={{
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {cards}
            </Flex>
            {/* fade mask - signals there's more to scroll instead of an abrupt clip */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 32,
                pointerEvents: "none",
                background:
                  "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))",
              }}
            />
          </div>
        )}
      </Flex>
    </>
  );
}
