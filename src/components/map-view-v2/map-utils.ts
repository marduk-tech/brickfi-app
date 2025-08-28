import { Flex, Typography } from "antd";
import React from "react";
import * as turf from "@turf/turf";
import { FONT_SIZE, COLORS } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { ISurroundingElement } from "../../types/Project";

/**
 * Generate travel duration element with distance and time info
 */
export const fetchTravelDurationElement = (
  distance: number,
  duration: number,
  prefix?: string
) => {
  return React.createElement(
    Flex,
    { vertical: true, style: { marginBottom: 16 } },
    [
      React.createElement(
        Flex,
        { align: "center", gap: 4, key: "duration-info" },
        [
          React.createElement(DynamicReactIcon, {
            iconName: "PiClockCountdownDuotone",
            iconSet: "pi",
            size: 18,
            color: COLORS.textColorDark,
            key: "clock-icon",
          }),
          React.createElement(
            Typography.Text,
            { key: "duration-text" },
            `${prefix ? `${prefix} - ` : ""} ${duration} mins (${distance.toFixed(1)} Kms)`
          ),
        ]
      ),
      React.createElement(
        Typography.Text,
        {
          style: {
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
          },
          key: "disclaimer",
        },
        "Average time considering peak/non peak hours. Can vary 10-20% based on real time traffic."
      ),
    ]
  );
};

/**
 * Process primary project bounds for polygon rendering
 */
export const processPrimaryProjectBounds = (primaryProject?: any) => {
  return primaryProject?.info?.location?.osm?.geojson
    ? [
        {
          _id: "primary-project",
          driver: "project-bounds",
          name: primaryProject.info.name,
          details: {
            description: primaryProject.info.description || "",
            osm: {
              geojson: {
                type: "Polygon",
                coordinates: [
                  primaryProject.info.location.osm.geojson.coordinates[0],
                ],
              },
            },
          },
        },
      ]
    : [];
};

/**
 * Validate if a project has required location data
 */
export const hasValidLocationData = (project: any): boolean => {
  return !!(
    project?.info?.location?.lat &&
    project?.info?.location?.lng
  );
};

/**
 * Extract coordinates from project data
 */
export const getProjectCoordinates = (project: any): [number, number] | null => {
  if (!hasValidLocationData(project)) {
    return null;
  }
  return [project.info.location.lat, project.info.location.lng];
};

/**
 * Calculate map bounds for multiple projects
 */
export const calculateBoundsForProjects = (projects: any[]): [[number, number], [number, number]] | null => {
  const validProjects = projects.filter(hasValidLocationData);
  
  if (validProjects.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  validProjects.forEach((project) => {
    const coords = getProjectCoordinates(project);
    if (coords) {
      const [lat, lng] = coords;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  });

  return [[minLat, minLng], [maxLat, maxLng]];
};

/**
 * Format project name for display (truncate if too long)
 */
export const formatProjectName = (name: string, maxLength: number = 20): string => {
  if (!name) return "";
  return name.length > maxLength ? `${name.substring(0, maxLength)}..` : name;
};

/**
 * Check if driver has valid geometry data
 */
export const hasValidGeometry = (driver: any): boolean => {
  return !!(driver?.details?.osm?.geojson || driver?.features);
};

/**
 * Get driver display name with fallback
 */
export const getDriverDisplayName = (driver: any): string => {
  return driver?.name || driver?.driver || "Unknown Driver";
};

/**
 * Sort drivers by distance (ascending)
 */
export const sortDriversByDistance = (drivers: any[]): any[] => {
  return [...drivers].sort((a, b) => {
    const distanceA = a.distance || Infinity;
    const distanceB = b.distance || Infinity;
    return distanceA - distanceB;
  });
};

/**
 * Sort drivers by duration (ascending)
 */
export const sortDriversByDuration = (drivers: any[]): any[] => {
  return [...drivers].sort((a, b) => {
    const durationA = a.duration || Infinity;
    const durationB = b.duration || Infinity;
    return durationA - durationB;
  });
};

/**
 * Filter drivers by category
 */
export const filterDriversByCategory = (drivers: any[], category: string): any[] => {
  if (!category || !drivers) return drivers || [];
  
  return drivers.filter((driver) => {
    return driver.category === category || driver.driver === category;
  });
};

/**
 * Group drivers by type
 */
export const groupDriversByType = (drivers: any[]): Record<string, any[]> => {
  if (!drivers) return {};
  
  return drivers.reduce((groups, driver) => {
    const type = driver.driver || "unknown";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(driver);
    return groups;
  }, {} as Record<string, any[]>);
};

/**
 * Check if coordinates are within bounds
 */
export const isWithinBounds = (
  coordinates: [number, number],
  bounds: [[number, number], [number, number]]
): boolean => {
  const [lat, lng] = coordinates;
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

/**
 * Calculate center point of bounds
 */
export const getBoundsCenter = (bounds: [[number, number], [number, number]]): [number, number] => {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

/**
 * Validate surrounding element data
 */
export const isValidSurroundingElement = (element: any): boolean => {
  return !!(element?.type && element?.geometry && element?.geometry.length > 0);
};

/**
 * Extract unique surrounding element types
 */
export const getUniqueSurroundingElementTypes = (elements: any[]): string[] => {
  if (!elements) return [];
  
  return Array.from(new Set(elements.map((e) => e.type).filter(Boolean)));
};

/**
 * Process surrounding element geometry into positions for map rendering
 */
export const processSurroundingElementGeometry = (element: ISurroundingElement) => {
  if (!element.geometry) {
    return null;
  }
  
  const positions = element.geometry.map((g: any) => {
    if (Array.isArray(g)) {
      return g.map((subG) => [subG.lat, subG.lon]);
    } else {
      return [g.lat, g.lon];
    }
  });

  let isMulti = false;
  const polygonCoordinates = element.geometry.map((g: any) => {
    if (Array.isArray(g)) {
      isMulti = true;
      return g.map((subG) => [subG.lon, subG.lat]);
    } else {
      return [g.lon, g.lat];
    }
  });

  return { positions, polygonCoordinates, isMulti };
};

/**
 * Calculate center point of a surrounding element for icon placement
 */
export const calculateSurroundingElementCenter = (polygonCoordinates: any[], isMulti: boolean) => {
  try {
    const feature = isMulti
      ? turf.multiLineString(polygonCoordinates)
      : turf.lineString(polygonCoordinates);
    const center = turf.pointOnFeature(feature);
    return center?.geometry.coordinates;
  } catch (error) {
    console.error('Error calculating surrounding element center:', error);
    return null;
  }
};

/**
 * Validate if surrounding element has valid geometry data
 */
export const isValidSurroundingElementGeometry = (element: ISurroundingElement): boolean => {
  return !!(element?.geometry && element.geometry.length > 0);
};