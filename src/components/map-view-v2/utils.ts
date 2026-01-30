import { Flex, Typography } from "antd";
import L from "leaflet";
import React from "react";
import { renderToString } from "react-dom/server";
import { DRIVER_CATEGORIES, PLACE_TIMELINE } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import { dynamicImportMap } from "../common/dynamic-react-icon";
import { GeoJSONFeature } from "./types";

/**
 * Gets the icon for map.
 */
export async function getIcon(
  iconName?: string,
  iconSet?: any,
  toBounce?: boolean,
  text?: string,
  driver?: IDriverPlace,
  style?: {
    iconColor?: string;
    iconBgColor?: string;
    iconSize?: number;
    borderColor?: string;
    containerWidth?: number;
  },
) {
  let IconComp = null;
  if (!dynamicImportMap[iconSet]) {
    console.warn(`Icon set ${iconSet} not found.`);
    return null;
  }
  let isUnderConstruction = false;
  if (driver) {
    isUnderConstruction = ![
      PLACE_TIMELINE.LAUNCHED,
      PLACE_TIMELINE.PARTIAL_LAUNCH,
      PLACE_TIMELINE.POST_LAUNCH,
    ].includes(driver.status as any);
  }

  try {
    const iconSetModule = iconName ? await dynamicImportMap[iconSet]() : null;
    IconComp = iconName ? (iconSetModule as any)[iconName] || null : null;
  } catch (error) {
    console.error(`Error loading icon ${iconName} from ${iconSet}`, error);
  }

  const iconMarkup = renderToString(
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: style?.iconBgColor || "white",
          borderRadius: style?.containerWidth
            ? style.containerWidth / 10
            : text
              ? "24px"
              : "50%",
          padding: text ? 2 : 0,
          height: text ? "auto" : (style?.iconSize || 20) * 1.4,
          width: style?.containerWidth
            ? style.containerWidth
            : text
              ? 80
              : (style?.iconSize || 20) * 1.4,
          display: "flex",
          alignItems: "center",
          borderColor: style?.borderColor
            ? style.borderColor
            : isUnderConstruction
              ? COLORS.yellowIdentifier
              : COLORS.borderColorDark,
          borderStyle: isUnderConstruction ? "dashed" : "solid",
          justifyContent: "center",
          animation: toBounce ? "bounceAnimation 1s infinite" : "none",
          boxShadow: "0 0 6px rgba(0,0,0,0.3)",
          textWrap: "nowrap",
        },
      },
      [
        IconComp &&
          React.createElement(IconComp, {
            key: "icon",
            size: style?.iconSize || 14,
            color: style?.iconColor
              ? style.iconColor
              : isUnderConstruction
                ? COLORS.yellowIdentifier
                : COLORS.textColorDark,
          }),
        text
          ? React.createElement(
              Flex,
              {
                key: "text-container",
                style: { marginLeft: 2 },
              },
              React.createElement(
                Typography.Text,
                {
                  key: "text",
                  style: {
                    fontSize: FONT_SIZE.SUB_TEXT,
                    fontWeight: 500,
                    color: style?.iconColor || COLORS.textColorDark,
                  },
                },
                text,
              ),
            )
          : null,
      ].filter(Boolean),
    ),
  );

  const leafletIcon = L.divIcon({
    html: iconMarkup,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  return leafletIcon!;
}

/**
 * Process road features from GeoJSON
 */
export const processRoadFeatures = (features: GeoJSONFeature[]) => {
  return features.flatMap((feature) => {
    if (feature.type === "Feature" && feature.geometry) {
      if (feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates as [number, number][];
        return [
          {
            coordinates: coords,
            properties: feature.properties,
          },
        ];
      } else if (feature.geometry.type === "MultiLineString") {
        const coords = feature.geometry.coordinates as [number, number][][];
        return coords.map((line) => ({
          coordinates: line,
          properties: feature.properties,
        }));
      }
    }
    return [];
  });
};

/**
 * Process driver data into polygon format
 * Supports both Polygon and MultiPolygon geometries
 */
export const processDriversToPolygons = (
  data: any[],
  filterByDriverTypes = true,
  selectedDriverFilter?: string,
  filterFunc?: (driver: IDriverPlace) => boolean,
  category?: string,
) => {
  const polygons = data
    .filter((driver) => {
      const hasGeojson = driver.details?.osm?.geojson;

      if (!hasGeojson) {
        return false;
      }

      // no filtering needed show all polygons
      if (!filterByDriverTypes) {
        return true;
      }

      // if category is provided but no specific filter selected,
      // show all drivers that belong to the category
      if (!selectedDriverFilter && category) {
        const categoryData = DRIVER_CATEGORIES[category];
        if (categoryData && categoryData.drivers) {
          return categoryData.drivers.includes(driver.driver);
        }
      }

      // filtering required but no filter or category - hide all polygons
      if (!selectedDriverFilter) {
        return false;
      }

      // custom filter function if provided (custom filters like "tech-hubs")
      const matchesType = filterFunc
        ? filterFunc(driver)
        : selectedDriverFilter === driver.driver;

      // ensure driver belongs to the selected category
      // prevnt drivers from other categories in the drivers array from showing
      if (matchesType && category) {
        const categoryData = DRIVER_CATEGORIES[category];
        if (categoryData && categoryData.drivers) {
          return categoryData.drivers.includes(driver.driver);
        }
        // If we can't verify category membership, reject by default
        return false;
      }

      return matchesType;
    })
    .flatMap((driver) => {
      try {
        const geojson =
          typeof driver.details.osm.geojson === "string"
            ? JSON.parse(driver.details.osm.geojson)
            : driver.details.osm.geojson;

        if (!geojson || !["Polygon", "MultiPolygon"].includes(geojson.type)) {
          return [];
        }

        // multiPolygon flatten into multiple polygon objects
        if (geojson.type === "MultiPolygon") {
          return geojson.coordinates.map(
            (polygonCoords: [number, number][][], index: number) => ({
              id: `${driver._id}-section-${index}`,
              driverId: driver._id,
              sectionIndex: index,
              positions: polygonCoords[0].map(
                ([lng, lat]: [number, number]) =>
                  [lat, lng] as [number, number],
              ),
              name: driver.name,
              description: driver.details?.description || "",
              driverType: driver.driver,
              category: category,
            }),
          );
        }

        // single Polygon
        return [
          {
            id: driver._id,
            driverId: driver._id,
            positions: geojson.coordinates[0].map(
              ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
            ),
            name: driver.name,
            description: driver.details?.description || "",
            driverType: driver.driver,
            category: category,
          },
        ];
      } catch (error) {
        console.error("Error processing polygon data:", error);
        return [];
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return polygons;
};
