"use client";

import { Flex, Typography } from "antd";
import { CSSProperties, ReactNode } from "react";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";

// Shared stat-card styling for the brick360 tabs (Property's SCALE / UNIT
// SIZES / FLOORS, Financials' avg. sq.ft price, ...) - change the look here
// and every tab follows.

export const STAT_CARD_STYLE: CSSProperties = {
  borderRadius: 8,
  backgroundColor: "white",
  width: "fit-content",
  border: `1px solid ${COLORS.borderColor}`,
  padding: 8,
  minWidth: 100,
  // keep full size in the horizontally scrolling StatCardRow
  flexShrink: 0,
};

export const STAT_LABEL_STYLE: CSSProperties = {
  fontSize: FONT_SIZE.HEADING_2,
  marginBottom: 2,
  color: COLORS.primaryColor,
};

export const STAT_VALUE_STYLE: CSSProperties = {
  fontSize: FONT_SIZE.HEADING_2,
  color: COLORS.textColorMedium,
  fontWeight: 500,
};

// Room a StatCardRow needs (its `bottomSpace`) when any of its cards has a
// `note` - notes hang just below the card.
export const STAT_CARD_NOTE_SPACE = 22;

/** Single-line row the stat cards sit in, at the top of a tab - scrolls
 * horizontally once the cards are wider than the tab. Scrolling clips the
 * row vertically too, so anything hanging below a card (a StatCard `note`,
 * an image card's caption) must fit in `bottomSpace` - reserved INSIDE the
 * row as padding rather than as margin below it. */
export const StatCardRow = ({
  children,
  bottomSpace = 0,
  style,
}: {
  children: ReactNode;
  bottomSpace?: number;
  style?: CSSProperties;
}) => (
  <Flex
    gap={8}
    style={{
      flexWrap: "nowrap",
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
      marginBottom: 8,
      marginTop: 16,
      paddingBottom: bottomSpace,
      ...style,
    }}
  >
    {children}
  </Flex>
);

/** A labelled stat card - children are laid out in a row under the label
 * (wrap plain values in StatValue for the standard value styling). `note`
 * hangs just below the card - give the row bottomSpace={STAT_CARD_NOTE_SPACE}
 * when using it. */
export const StatCard = ({
  label,
  children,
  note,
  onClick,
  style,
}: {
  label: ReactNode;
  children?: ReactNode;
  note?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) => (
  <Flex
    vertical
    onClick={onClick}
    style={{
      ...STAT_CARD_STYLE,
      position: "relative",
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}
  >
    <Typography.Text style={STAT_LABEL_STYLE}>{label}</Typography.Text>
    {children ? (
      <Flex align="center" gap={4}>
        {children}
      </Flex>
    ) : null}
    {note ? (
      <Typography.Text
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 2,
          fontSize: FONT_SIZE.HEADING_4,
          color: COLORS.textColorMedium,
          whiteSpace: "nowrap",
        }}
      >
        {note}
      </Typography.Text>
    ) : null}
  </Flex>
);

/** A stat card's value text. */
export const StatValue = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <Typography.Text style={{ ...STAT_VALUE_STYLE, ...style }}>
    {children}
  </Typography.Text>
);
