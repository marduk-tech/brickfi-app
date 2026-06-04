"use client";

import React from "react";
import { COLORS } from "../../../theme/style-constants";

const BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// ── Primary project pin ───────────────────────────────────────────────────────
// Large solid-colour pill — stands out against all other markers.
export function PrimaryPin({ label }: { label: string }) {
  return (
    <div
      style={{
        ...BASE,
        background: COLORS.primaryColor,
        color: "white",
        border: `2.5px solid ${COLORS.primaryColor}`,
        borderRadius: 20,
        padding: "5px 12px",
        fontSize: 12,
        maxWidth: 180,
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
      }}
    >
      {truncate(label, 18)}
    </div>
  );
}

// ── Pill pin (project name / nearby project label) ────────────────────────────
interface PillPinProps {
  label: string;
  borderColor?: string;
  textColor?: string;
  bgColor?: string;
  dashed?: boolean;
}
export function PillPin({
  label,
  borderColor = COLORS.textColorDark,
  textColor = COLORS.textColorDark,
  bgColor = "white",
  dashed = false,
}: PillPinProps) {
  return (
    <div
      style={{
        ...BASE,
        background: bgColor,
        color: textColor,
        border: `2px ${dashed ? "dashed" : "solid"} ${borderColor}`,
        borderRadius: 16,
        padding: "3px 8px",
        fontSize: 10,
        maxWidth: 130,
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
      }}
    >
      {truncate(label, 15)}
    </div>
  );
}

// ── Circle monogram pin (surrounding elements, driver POIs) ───────────────────
interface CirclePinProps {
  abbr: string;
  borderColor?: string;
  textColor?: string;
  bgColor?: string;
  dashed?: boolean;
}
export function CirclePin({
  abbr,
  borderColor = COLORS.textColorDark,
  textColor = COLORS.textColorDark,
  bgColor = "white",
  dashed = false,
}: CirclePinProps) {
  return (
    <div
      style={{
        ...BASE,
        background: bgColor,
        color: textColor,
        border: `2px ${dashed ? "dashed" : "solid"} ${borderColor}`,
        borderRadius: "50%",
        width: 32,
        height: 32,
        fontSize: 10,
        flexShrink: 0,
        boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
      }}
    >
      {abbr.slice(0, 2).toUpperCase()}
    </div>
  );
}
