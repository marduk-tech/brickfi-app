"use client";

import React from "react";
import DynamicReactIcon, { IconSetKey } from "../../common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";

export type { IconSetKey };

export interface MarkerIconProps {
  iconName: string;
  iconSet: IconSetKey;
  /** Optional text label rendered to the right of the icon. */
  label?: string;
  iconBgColor?: string;
  iconColor?: string;
  borderColor?: string;
  iconSize?: number;
  /** Fixed pixel width for the container (overrides auto-sizing). */
  containerWidth?: number;
  isUnderConstruction?: boolean;
  bounce?: boolean;
}

/**
 * Mirrors the exact visual output of getIcon() from map-view-v2/utils.ts
 * but as a React component — for use as children of AdvancedMarker.
 *
 * Style contract (matches getIcon):
 *  - No label  → circle   (borderRadius 50%, fixed square size)
 *  - With label → pill    (borderRadius 24px, auto-height, 80px min-width)
 *  - containerWidth set → custom width with proportional border-radius
 *  - isUnderConstruction → dashed border, yellow tints
 *  - bounce → CSS bounceAnimation (keyframes must exist globally)
 */
export function MarkerIcon({
  iconName,
  iconSet,
  label,
  iconBgColor = "white",
  iconColor,
  borderColor,
  iconSize = 18,
  containerWidth,
  isUnderConstruction = false,
  bounce = false,
}: MarkerIconProps) {
  const effectiveIconColor =
    iconColor ?? (isUnderConstruction ? COLORS.yellowIdentifier : COLORS.textColorDark);
  const effectiveBorderColor =
    borderColor ?? (isUnderConstruction ? COLORS.yellowIdentifier : COLORS.borderColorDark);

  const dim = (iconSize || 20) * 1.4;

  const containerStyle: React.CSSProperties = {
    backgroundColor: iconBgColor,
    borderRadius: containerWidth ? containerWidth / 10 : label ? "24px" : "50%",
    padding: label ? 2 : 4,
    height: label ? "auto" : dim,
    width: containerWidth ?? (label ? 80 : dim),
    display: "flex",
    alignItems: "center",
    borderColor: effectiveBorderColor,
    borderStyle: isUnderConstruction ? "dashed" : "solid",
    borderWidth: 1,
    justifyContent: "center",
    boxShadow: "0 0 6px rgba(0,0,0,0.3)",
    whiteSpace: "nowrap",
    cursor: "pointer",
    animation: bounce ? "bounceAnimation 1s infinite" : "none",
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        size={iconSize}
        color={effectiveIconColor}
      />
      {label && (
        <span
          style={{
            marginLeft: 2,
            fontSize: FONT_SIZE.SUB_TEXT,
            fontWeight: 500,
            color: effectiveIconColor,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
