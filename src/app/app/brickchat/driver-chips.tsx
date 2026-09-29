"use client";

import { useFetchAllLivindexPlaces } from "@/hooks/use-livindex-places";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Tag } from "antd";

interface DriverChipsProps {
  /** brickfiDriverIds from a chat answer - the drivers/infra records referenced in that answer. */
  driverIds: string[];
  /** Currently map-focused driver id (single-select) - highlights the matching chip. */
  selectedDriverId?: string | null;
  /** Toggles a chip - selecting it again clears the focus back to showing every driver. */
  onToggle: (driverId: string) => void;
}

// Resolves brickfiDriverIds (raw LivIndexPlace ids from the chat answer) to
// their names for display - useFetchAllLivindexPlaces caches by the id list,
// so repeated renders with the same ids across messages don't refetch.
export default function DriverChips({
  driverIds,
  selectedDriverId,
  onToggle,
}: DriverChipsProps) {
  const { data: drivers, isLoading } = useFetchAllLivindexPlaces(driverIds);

  if (!driverIds.length) {
    return null;
  }

  return (
    <Flex wrap="wrap" gap={6} style={{ marginTop: 4, marginBottom: 4 }}>
      {driverIds.map((id) => {
        const driver = drivers?.find((d) => d._id === id);
        const isSelected = selectedDriverId === id;
        return (
          <Tag
            key={id}
            onClick={() => onToggle(id)}
            style={{
              cursor: "pointer",
              fontSize: FONT_SIZE.SUB_TEXT,
              padding: "2px 10px",
              borderRadius: 12,
              backgroundColor: isSelected
                ? COLORS.primaryColor
                : COLORS.bgColorLightBlue,
              color: isSelected ? "white" : COLORS.textColorDark,
              border: `1px solid ${
                isSelected ? COLORS.primaryColor : COLORS.borderColor
              }`,
            }}
          >
            {driver?.name || (isLoading ? "…" : id)}
          </Tag>
        );
      })}
    </Flex>
  );
}
