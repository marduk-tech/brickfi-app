import React from "react";
import { Flex, Tag, Typography } from "antd";
import { SurroundingElementLabels } from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { ISurroundingElement } from "../../../types/Project";
import DynamicReactIcon from "../../common/dynamic-react-icon";

interface SurroundingFiltersProps {
  surroundingElements?: ISurroundingElement[];
  uniqueSurroundingElements: ISurroundingElement[];
  selectedSurroundingElementType?: string;
  setSelectedSurroundingElementType: (type: string) => void;
  currentSelectedCategory: string;
}

export const SurroundingFilters = ({
  surroundingElements,
  uniqueSurroundingElements,
  selectedSurroundingElementType,
  setSelectedSurroundingElementType,
  currentSelectedCategory,
}: SurroundingFiltersProps) => {
  const renderSurroundingElementTypes = (k: string) => {
    if (!(SurroundingElementLabels as any)[k]) {
      return null;
    }
    const icon = (SurroundingElementLabels as any)[k].icon;
    return (
      <Tag
        key={k}
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          padding: "4px 8px",
          backgroundColor:
            k == selectedSurroundingElementType
              ? COLORS.textColorDark
              : "white",
          color: k == selectedSurroundingElementType ? "white" : "initial",
          marginLeft: 4,
          fontSize: FONT_SIZE.HEADING_3,
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedSurroundingElementType(k);
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={20}
          color={
            k == selectedSurroundingElementType ? "white" : COLORS.textColorDark
          }
        />
        <Typography.Text
          style={{
            color:
              k == selectedSurroundingElementType
                ? "white"
                : COLORS.textColorDark,
            marginLeft: 4,
            fontSize: FONT_SIZE.SUB_TEXT,
          }}
        >
          {(SurroundingElementLabels as any)[k]
            ? capitalize((SurroundingElementLabels as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  if (!surroundingElements || !surroundingElements.length) return null;
  if (currentSelectedCategory !== "surroundings") return null;

  return (
    <Flex
      style={{
        width: "100%",
        overflowX: "scroll",
        scrollbarWidth: "none",
        height: 32,
        position: "absolute",
        zIndex: 9999,
        bottom: 32,
        paddingLeft: 8,
      }}
    >
      {uniqueSurroundingElements.map((k: ISurroundingElement) => {
        return renderSurroundingElementTypes(k.type);
      })}
    </Flex>
  );
};