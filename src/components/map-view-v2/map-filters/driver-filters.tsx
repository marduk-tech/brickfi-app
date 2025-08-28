import React from "react";
import { Flex, Tag, Typography } from "antd";
import {
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
} from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { useDevice } from "../../../hooks/use-device";
import { IDriverPlace } from "../../../types/Project";

interface DriverFiltersProps {
  drivers?: IDriverPlace[];
  driverFilters: any[];
  selectedDriverFilter?: string;
  setSelectedDriverFilter: (filter: string) => void;
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  categories?: string[];
  hideAllFilters?: boolean;
  showDriverFilters: boolean;
}

export const DriverFilters = ({
  drivers,
  driverFilters,
  selectedDriverFilter,
  setSelectedDriverFilter,
  currentSelectedCategory,
  noCategoriesProvided,
  categories,
  hideAllFilters,
  showDriverFilters,
}: DriverFiltersProps) => {
  const { isMobile } = useDevice();

  const renderDriverFilterItem = (filterItem: any) => {
    // custom filter objects with key and label
    if (typeof filterItem === "object" && filterItem.key && filterItem.label) {
      const isSelected = filterItem.key == selectedDriverFilter;
      return (
        <Tag
          key={filterItem.key}
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 16,
            padding: "4px 8px",
            marginRight: 4,
            backgroundColor: isSelected
              ? COLORS.textColorDark
              : " rgba(255,255,255,.9)",
            color: isSelected ? "white" : "initial",
            marginLeft: 0,
            cursor: "pointer",
            border: `1.5px solid ${COLORS.textColorDark}`,
          }}
          onClick={() => {
            setSelectedDriverFilter(filterItem.key);
          }}
        >
          <Typography.Text
            style={{
              color: isSelected ? "white" : COLORS.textColorDark,
              fontSize: FONT_SIZE.SUB_TEXT,
              fontWeight: 500,
            }}
          >
            {filterItem.label}
          </Typography.Text>
        </Tag>
      );
    }

    // Handle driver type strings (fallback behavior)
    const k = filterItem;
    if (!(LivIndexDriversConfig as any)[k]) {
      return null;
    }
    const isSelected = k == selectedDriverFilter;
    return (
      <Tag
        key={k}
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          padding: "4px 8px",
          marginRight: 4,
          backgroundColor: isSelected
            ? COLORS.textColorDark
            : " rgba(255,255,255,.5)",
          color: isSelected ? "white" : "initial",
          marginLeft: 0,
          border: `1.5px solid ${COLORS.textColorDark}`,
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedDriverFilter(k);
        }}
      >
        <Typography.Text
          style={{
            color: isSelected ? "white" : COLORS.textColorDark,
            marginLeft: 4,
            fontSize: FONT_SIZE.PARA,
            fontWeight: isSelected ? 400 : 600,
          }}
        >
          {(LivIndexDriversConfig as any)[k]
            ? capitalize((LivIndexDriversConfig as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  if (hideAllFilters) return null;
  if (!drivers || !drivers.length) return null;
  if (!showDriverFilters) return null;
  if (currentSelectedCategory === "surroundings") return null;

  return (
    <Flex
      style={{
        position: "absolute",
        zIndex: 9999,
        bottom: 24,
        paddingLeft: 8,
        width: "100%",
      }}
      align={isMobile ? "flex-start" : "center"}
      gap={8}
      vertical={isMobile}
    >
      <Flex
        style={{
          width: "100%",
          overflowX: "scroll",
          scrollbarWidth: "none",
          height: 32,
          whiteSpace: "nowrap",
        }}
      >
        {(driverFilters || [])
          .filter((d) => {
            if (!d) return false;

            // custom filter object always show it (it's already filtered by category)
            if (typeof d === "object" && d.key && d.label) {
              return true;
            }

            // If no categories provided, show all driver types
            if (noCategoriesProvided) {
              return true;
            }

            // For driver type strings, filter by currently selected category
            const categoryDrivers =
              (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers || [];
            return (
              Array.isArray(categoryDrivers) &&
              categoryDrivers.includes(d)
            );
          })
          .map((filterItem: any) => {
            return renderDriverFilterItem(filterItem);
          })}
      </Flex>
    </Flex>
  );
};