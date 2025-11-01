import React from "react";
import * as turf from "@turf/turf";
import L from "leaflet";
import { Marker, Polyline, useMap } from "react-leaflet";
import { DRIVER_CATEGORIES, PLACE_TIMELINE } from "../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";
import { RoadDriverPlace } from "../types";
import { processRoadFeatures } from "../utils";
import { Flex, Tag, Typography } from "antd";

interface RoadDriversProps {
  bounds: L.LatLngBounds;
  drivers?: IDriverPlace[];
  roadIcon: L.DivIcon | null;
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  categories?: string[];
  selectedDriverFilter?: string;
  setModalContent: (content: any) => void;
  setInfoModalOpen: (open: boolean) => void;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
}

export const RoadDriversComponent = ({
  bounds,
  drivers,
  roadIcon,
  currentSelectedCategory,
  noCategoriesProvided,
  categories,
  selectedDriverFilter,
  setModalContent,
  setInfoModalOpen,
  isDriverMatchingFilter,
}: RoadDriversProps) => {
  const map = useMap();

  if (!drivers || !drivers.length || !roadIcon) {
    return null;
  }

  return (
    <>
      {drivers
        ?.filter((driver): driver is RoadDriverPlace => {
          const isDriverAllowed = noCategoriesProvided
            ? true
            : (() => {
                const categoryDrivers =
                  (DRIVER_CATEGORIES as any)[currentSelectedCategory]
                    ?.drivers || [];
                return (
                  Array.isArray(categoryDrivers) &&
                  categoryDrivers.includes(driver.driver)
                );
              })();
          return (
            driver.driver === "highway" &&
            !!driver.features &&
            typeof driver.status === "string" &&
            isDriverAllowed &&
            isDriverMatchingFilter(driver)
          );
        })
        .flatMap((driver) => {
          const processedFeatures = processRoadFeatures(driver.features);

          const isDashed = ![
            PLACE_TIMELINE.LAUNCHED,
            PLACE_TIMELINE.POST_LAUNCH,
            PLACE_TIMELINE.PARTIAL_LAUNCH,
          ].includes(driver.status as PLACE_TIMELINE);

          const handleRoadDriverClick = (feature?: any) => {
            setModalContent({
              title: (
                <Flex vertical>
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: 500 }}
                  >
                    {driver.name}
                  </Typography.Text>
                  <Flex style={{}}>
                    <Tag
                      style={{
                        fontSize: FONT_SIZE.HEADING_4,
                      }}
                    >
                      {capitalize(
                        feature.properties && feature.properties.name
                          ? feature.properties.name
                          : ""
                      )}
                    </Tag>
                  </Flex>
                </Flex>
              ),
              content: driver.details?.description || "",
              tags: [
                {
                  label: "Highway",
                  color: COLORS.primaryColor,
                },
                {
                  label: driverStatusLabel(
                    feature.properties.status || driver.status
                  ),
                  color:
                    isDashed ||
                    (feature.properties &&
                      feature.properties.status &&
                      feature.properties.status == "construction")
                      ? "warning"
                      : "success",
                },
              ],
            });
            setInfoModalOpen(true);
          };

          let totalMarkers = 0;
          const RoadLine = processedFeatures
            .filter((feature) => {
              return feature.coordinates.some(([lng, lat]) =>
                bounds.contains([lat, lng])
              );
            })
            .map((feature, lineIndex) => {
              const positions = feature.coordinates.map(
                ([lng, lat]) => [lat, lng] as [number, number]
              );

              const line = turf.lineString(feature.coordinates);
              const totalLength = turf.length(line, { units: "kilometers" });

              const numPoints =
                totalLength >= 4
                  ? Math.floor(totalLength / 4)
                  : lineIndex == processedFeatures.length - 1 && !totalMarkers
                  ? 1
                  : 0;
              totalMarkers += numPoints;

              const points = [];
              for (let i = 0; i < numPoints; i++) {
                const distance = (i * totalLength) / numPoints;
                const point = turf.along(line, distance, {
                  units: "kilometers",
                });
                points.push(point.geometry.coordinates);
              }

              return (
                <React.Fragment key={`road-line-${driver._id}-${lineIndex}`}>
                  {map.getZoom() > 11.5
                    ? points.map((p, pointIndex) => (
                        <Marker
                          key={`road-${driver._id}-${lineIndex}-${pointIndex}`}
                          position={[p![1], p![0]]}
                          icon={roadIcon}
                          eventHandlers={{
                            click: () => {
                              handleRoadDriverClick(feature);
                            },
                          }}
                        />
                      ))
                    : null}
                  <Polyline
                    key={`${driver._id}-${lineIndex}`}
                    positions={positions}
                    pathOptions={{
                      color:
                        feature.properties?.strokeColor || COLORS.textColorDark,
                      weight: 5,
                      opacity: 0.5,
                      dashArray:
                        isDashed ||
                        (feature.properties &&
                        feature.properties.status &&
                        feature.properties.status == "construction"
                          ? true
                          : false)
                          ? "10, 10"
                          : undefined,
                    }}
                    eventHandlers={{
                      click: handleRoadDriverClick,
                    }}
                  />
                </React.Fragment>
              );
            });

          return (
            <React.Fragment key={`road-group-${driver._id}`}>
              {RoadLine}
            </React.Fragment>
          );
        })}
    </>
  );
};
