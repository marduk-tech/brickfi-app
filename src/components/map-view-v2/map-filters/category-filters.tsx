import React from "react";
import { Flex, Typography } from "antd";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import DynamicReactIcon from "../../common/dynamic-react-icon";

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
  if (!showCategorySelection || hideAllFilters || !categories) {
    return null;
  }

  return (
    <Flex
      style={{
        overflowX: "auto",
        scrollbarWidth: "none",
        flexShrink: 0,
        marginBottom: 20,
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
                ? COLORS.primaryColor
                : COLORS.borderColor
            }`,
            marginRight: 0,
            padding: "4px 12px",
            borderRadius: 16,
            backgroundColor:
              selectedCategory === category ? COLORS.primaryColor : "white",
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
            }}
          >
            {capitalize(category)}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
};