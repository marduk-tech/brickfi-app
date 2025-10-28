import React from "react";
import { Flex, Typography } from "antd";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { useDevice } from "@/hooks/use-device";

interface CategoryFiltersProps {
  categories?: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  hideAllFilters?: boolean;
  showCategorySelection: boolean;
}

export const CategoryFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  hideAllFilters,
  showCategorySelection,
}: CategoryFiltersProps) => {

  const {isMobile} = useDevice();

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
        top: 8,
        zIndex: 1000,
        left: 8,
        width: "100%",
        paddingRight: 125
      }}
      gap={8}
    >
      {categories.map((category) => (
        <Flex
          key={category}
          onClick={() => setSelectedCategory(category)}
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
                selectedCategory === category
                  ? "white"
                  : COLORS.textColorDark,
                  fontSize: FONT_SIZE.SUB_TEXT
            }}
          >
            {capitalize(category)}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
};