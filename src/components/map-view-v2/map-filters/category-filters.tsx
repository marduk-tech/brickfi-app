import { useDevice } from "@/hooks/use-device";
import { Flex, Typography } from "antd";
import React from "react";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import DynamicReactIcon from "../../common/dynamic-react-icon";

interface CategoryFiltersProps {
  categories?: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  hideAllFilters?: boolean;
  showCategorySelection: boolean;
  projectName?: string;
  projectId?: string;
}

export const CategoryFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  hideAllFilters,
  showCategorySelection,
  projectName,
  projectId
}: CategoryFiltersProps) => {
  const { isMobile } = useDevice();

  if (!showCategorySelection || hideAllFilters || !categories) {
    return null;
  }

  return (
    <Flex
      style={{
        overflowX: "auto",
        scrollbarWidth: "none",
        flexShrink: 0,
        position: "absolute",
        top: isMobile ? 24: 8,
        zIndex: 1000,
        // spans exactly the map's width (a 100% width plus the 8px offset
        // ran past the map's right edge, so the end of the row - and any
        // padding there - was clipped out of view)
        left: 8,
        right: 0,
        boxSizing: "border-box",
      }}
      gap={8}
    >
      {categories.map((category) => (
        <Flex
          key={category}
          onClick={() => {
            setSelectedCategory(category);
          }}
          align="center"
          gap={4}
          style={{
            textTransform: "capitalize",
            border: `1px solid ${
              selectedCategory === category
                ? COLORS.textColorDark
                : COLORS.borderColor
            }`,
            marginRight: 0,
            padding: "4px 8px",
            borderRadius: 4,
            backgroundColor:
              selectedCategory === category ? COLORS.textColorDark : "white",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          <DynamicReactIcon
            color={
              selectedCategory === category ? "white" : COLORS.textColorDark
            }
            iconName={(DRIVER_CATEGORIES as any)[category].icon.name}
            iconSet={(DRIVER_CATEGORIES as any)[category].icon.set}
            size={16}
          />
          <Typography.Text
            style={{
              color:
                selectedCategory === category ? "white" : COLORS.textColorDark,
              fontSize: FONT_SIZE.SUB_TEXT,
            }}
          >
            {capitalize(category)}
          </Typography.Text>
        </Flex>
      ))}
      {/* empty space after the last chip, so the row scrolls far enough
          to clear what sits in the map's top-right corner - on mobile the
          map drawer's 40px close button, 12px from the edge. A spacer
          rather than padding-right, which scroll containers don't
          reliably include at the end. */}
      <div aria-hidden style={{ flexShrink: 0, width: isMobile ? 56 : 117 }} />
    </Flex>
  );
};
