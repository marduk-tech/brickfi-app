"use client";

import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";
import { useFetchAllLivindexPlaces } from "@/hooks/use-livindex-places";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Tag, Typography } from "antd";
import {
  capitalize
} from "@/libs/lvnzy-helper";
import { useBrick360FontSize } from "./brick360/use-font-size";
export type ReferredLocationType =
  | "driver"
  | "locality"
  | "corridor"
  | "micropocket"
  | "";

export interface ReferredLocationChipItem {
  /** Unique per-item key for React/selection - distinct from `id` since a landmark has no id of its own (see brickchat-client's getReferredLocationItems). */
  key: string;
  /** Underlying entity id - empty for a direct-maps-geocoded landmark with no catalog/driver match. */
  id: string;
  type: ReferredLocationType;
  /** Already-known label (from resolvedLocations) - a bare brickfiDriverIds entry has none and gets one via useFetchAllLivindexPlaces below instead. */
  name?: string;
  /** Chip icon - defaults to the map icon (DEFAULT_CHIP_ICON). */
  icon?: { name: string; set: IconSetKey };
  /** Show the label as-is instead of title-casing it (e.g. "See on Map", or place names with acronyms). */
  keepLabelCase?: boolean;
  /** Text after the label that's never truncated (e.g. "6 mins") - only the label gets the ellipsis. */
  suffix?: string;
}

// chips never grow past this - the label is cut with an ellipsis instead
// (full label in a tooltip); icon and suffix always stay whole
const CHIP_MAX_WIDTH = 250;

const DEFAULT_CHIP_ICON: { name: string; set: IconSetKey } = {
  name: "FaMapMarkedAlt",
  set: "fa",
};

interface ReferredLocationChipsProps {
  items: ReferredLocationChipItem[];
  /** Currently map-focused item's key (single-select) - highlights the matching chip. */
  selectedKey?: string | null;
  /** Toggles a chip - selecting it again clears the focus. Not called for a landmark chip (no id, nothing to focus). */
  onToggle: (item: ReferredLocationChipItem) => void;
}

// Combines a chat answer's brickfiDriverIds (raw LivIndexPlace ids, no label
// of their own) with its resolvedLocations (driver/locality/corridor/
// micropocket/landmark hits, already labeled - see summarizeResolvedLocation
// in shared.js) into one "See on Map" chip row - see getReferredLocationItems
// in brickchat-client.tsx for how the combined+deduped item list is built.
export default function ReferredLocationChips({
  items,
  selectedKey,
  onToggle,
}: ReferredLocationChipsProps) {
  const unlabeledDriverIds = items
    .filter((item) => item.type === "driver" && !item.name)
    .map((item) => item.id);
  const { data: drivers, isLoading } = useFetchAllLivindexPlaces(
    unlabeledDriverIds.length ? unlabeledDriverIds : undefined,
    undefined,
    !!unlabeledDriverIds.length,
  );
    const fs = useBrick360FontSize();
  

  // A bare brickfiDriverIds entry (no name of its own - see
  // ReferredLocationChipItem) that useFetchAllLivindexPlaces couldn't find a
  // matching record for (stale/deleted id) has no identifiable label -
  // previously fell back to showing the raw id, now just dropped. Still kept
  // while the lookup is in flight (isLoading) since it may yet resolve.
  const visibleItems = items.filter((item) => {
    if (item.name) return true;
    if (item.type !== "driver") return false;
    if (isLoading) return true;
    return !!drivers?.find((d) => d._id === item.id);
  });

  if (!visibleItems.length) {
    return null;
  }

  return (
    <Flex gap={4} style={{ padding: 4, flexShrink: 0 }}>
      <Flex align="center" gap={4}>
        {/* <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4, color: COLORS.textColorMedium }}>
          See on Map
        </Typography.Text> */}
      </Flex>
      <Flex gap={6} style={{ marginTop: 4, marginBottom: 4, flexWrap: "nowrap" }}>
        {visibleItems.map((item) => {
          const label =
            item.name ||
            (isLoading ? "…" : drivers?.find((d) => d._id === item.id)?.name);
          const isSelected = selectedKey === item.key;
          // a landmark (no id) has no map layer to populate - show it for
          // context but don't make it look/act clickable
          const clickable = !!item.id;
          const icon = item.icon || DEFAULT_CHIP_ICON;
          const displayLabel = item.keepLabelCase
            ? label || ""
            : capitalize(label || "");
          return (
            <Flex
              key={item.key}
              align="center"
              gap={8}
              onClick={clickable ? () => onToggle(item) : undefined}
              style={{
                padding: "2px 10px",
                borderRadius: 12,
                width: "auto",
                maxWidth: CHIP_MAX_WIDTH,
                flexShrink: 0,
                whiteSpace: "nowrap",
                cursor: clickable ? "pointer" : "default",
                opacity: clickable ? 1 : 0.7,
                backgroundColor: isSelected
                  ? COLORS.primaryColor
                  : COLORS.bgColorLightBlue,
                color: isSelected ? "white" : COLORS.textColorDark,
                border: `1px solid ${
                  isSelected ? COLORS.primaryColor : COLORS.borderColorMedium
                }`,
              }}
            >
              <span style={{ display: "flex", flexShrink: 0 }}>
                <DynamicReactIcon
                  iconName={icon.name}
                  iconSet={icon.set}
                  size={12}
                  color={isSelected ? "white" : COLORS.textColorDark}
                ></DynamicReactIcon>
              </span>
              <Flex align="center" gap={4} style={{ minWidth: 0 }}>
                <Typography.Text
                  ellipsis={{ tooltip: displayLabel }}
                  style={{
                    minWidth: 0,
                    fontSize: fs.HEADING_4,
                    color: isSelected ? "white" : COLORS.textColorDark,
                  }}
                >
                  {displayLabel}
                </Typography.Text>
                {item.suffix ? (
                  <Typography.Text
                    style={{
                      flexShrink: 0,
                      fontSize: fs.HEADING_4,
                      color: isSelected ? "white" : COLORS.textColorDark,
                    }}
                  >
                    {item.suffix}
                  </Typography.Text>
                ) : null}
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
