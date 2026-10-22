import React from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface ProjectNameLabelProps {
  name: string;
  /** false dims the label, same as the home-type icon does for non-highlighted types */
  highlighted?: boolean;
}

/**
 * Pill with the project's name, used in place of the home-type icon for
 * project markers that have a `name` (see ProjectMarkerInput). Rendered as a
 * React child of the Google AdvancedMarker, and to an HTML string for the
 * Leaflet divIcon (getProjectNameIcon below), so both maps look the same.
 */
export function ProjectNameLabel({ name, highlighted = true }: ProjectNameLabelProps) {
  return (
    <div
      title={name}
      style={{
        backgroundColor: "white",
        border: `1px solid ${highlighted ? COLORS.primaryColor : COLORS.borderColor}`,
        borderRadius: 24,
        padding: "2px 8px",
        maxWidth: 160,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: FONT_SIZE.SUB_TEXT,
        fontWeight: 500,
        color: highlighted ? COLORS.textColorDark : COLORS.textColorLight,
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      {name}
    </div>
  );
}

const leafletIconCache = new Map<string, L.DivIcon>();

// Cached per name/highlight so re-renders don't swap every marker's icon.
export const getProjectNameIcon = (name: string, highlighted = true): L.DivIcon => {
  const key = `${highlighted ? 1 : 0}|${name}`;
  let icon = leafletIconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      // empty className drops leaflet-div-icon's default white square
      className: "",
      // no iconSize - the pill sizes to its text, centred on the point
      iconSize: undefined,
      html: `<div style="transform: translate(-50%, -50%); display: inline-block">${renderToString(
        <ProjectNameLabel name={name} highlighted={highlighted} />,
      )}</div>`,
    });
    leafletIconCache.set(key, icon);
  }
  return icon;
};
