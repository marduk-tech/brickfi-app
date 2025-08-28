import React from "react";
import L from "leaflet";
import { Flex } from "antd";
import { Marker, useMap } from "react-leaflet";
import {
  DRIVER_CATEGORIES,
  PLACE_TIMELINE,
} from "../../../libs/constants";
import {
  capitalize,
  driverStatusLabel,
  renderCitations,
} from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";
import { TransitDriverPlace, GeoJSONPointFeature } from "../types";
import { processRoadFeatures } from "../utils";
import { FlickerPolyline } from "../shapes/flicker-polyline";
import DynamicReactIcon from "../../common/dynamic-react-icon";

interface TransitDriversProps {
  bounds: L.LatLngBounds;
  drivers?: IDriverPlace[];
  transitStationIcon: L.DivIcon | null;
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  categories?: string[];
  highlightedDrivers?: string[];
  setModalContent: (content: any) => void;
  setInfoModalOpen: (open: boolean) => void;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  fetchTravelDurationElement: (distance: number, duration: number, prefix?: string) => React.ReactNode;
}

function getTransitContent(info: any) {
  return `${info.intro}\n#### Timeline\n${info.timeline} \n #### Updates\n${info.updates}`;
}

function getFooterContent(info: any) {
  return (
    <Flex vertical style={{ marginBottom: 16 }}>
      <Flex>{renderCitations(info.citations)}</Flex>
    </Flex>
  );
}

export const TransitDriversComponent = ({
  bounds,
  drivers,
  transitStationIcon,
  currentSelectedCategory,
  noCategoriesProvided,
  categories,
  highlightedDrivers,
  setModalContent,
  setInfoModalOpen,
  isDriverMatchingFilter,
  fetchTravelDurationElement,
}: TransitDriversProps) => {
  const map = useMap();

  if (!drivers || !drivers.length || !transitStationIcon) {
    return null;
  }

  return (
    <>
      {drivers
        ?.filter((driver): driver is TransitDriverPlace => {
          const isDriverAllowed = noCategoriesProvided
            ? true
            : (() => {
                const categoryDrivers =
                  (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ||
                  [];
                return (
                  Array.isArray(categoryDrivers) &&
                  categoryDrivers.includes(driver.driver)
                );
              })();
          return (
            driver.driver === "transit" &&
            !!driver.features &&
            typeof driver.status === "string" &&
            isDriverAllowed &&
            isDriverMatchingFilter(driver)
          );
        })
        .flatMap((driver) => {
          const pointFeatures = driver.features.filter(
            (f: any): f is GeoJSONPointFeature =>
              f.type === "Feature" && f.geometry.type === "Point"
          );

          const lineFeatures = processRoadFeatures(
            driver.features.filter(
              (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
            )
          );

          const isDashed = ![
            PLACE_TIMELINE.LAUNCHED,
            PLACE_TIMELINE.POST_LAUNCH,
            PLACE_TIMELINE.PARTIAL_LAUNCH,
          ].includes(driver.status as PLACE_TIMELINE);

          const transitLines = lineFeatures.map((feature, lineIndex) => {
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

            const hasPointInBounds = positions.some(([lat, lng]) =>
              bounds.contains([lat, lng])
            );

            if (!hasPointInBounds) {
              return null;
            }

            return (
              <FlickerPolyline
                toFlicker={
                  !!highlightedDrivers &&
                  !!highlightedDrivers.length &&
                  highlightedDrivers.includes(driver._id)
                }
                key={`${driver._id}-line-${lineIndex}`}
                positions={positions}
                pathOptions={{
                  color: feature.properties?.strokeColor || COLORS.textColorDark,
                  weight: 6,
                  opacity: 0.8,
                  dashArray: isDashed ? "10, 10" : undefined,
                }}
              />
            );
          });

          let stations = null;
          if (map.getZoom() > 12.5) {
            stations = pointFeatures
              .filter((feature: any) => {
                const [lng, lat] = feature.geometry.coordinates;
                return bounds.contains([lat, lng]);
              })
              .map((feature: any, pointIndex: number) => (
                <Marker
                  key={`${driver._id}-point-${pointIndex}`}
                  position={[
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0],
                  ]}
                  icon={transitStationIcon!}
                  eventHandlers={{
                    click: () => {
                      setModalContent({
                        title: driver.name,
                        subHeading:
                          driver.distance && driver.duration
                            ? fetchTravelDurationElement(
                                driver.distance!,
                                driver.duration,
                                "Nearest station "
                              )
                            : "",
                        content: driver.details
                          ? driver.details.info
                            ? getTransitContent(driver.details.info)
                            : driver.details?.description
                          : "",

                        footerContent: getFooterContent(driver.details?.info),
                        tags: [
                          {
                            label:
                              "Station: " +
                              (feature.properties?.name ||
                                feature.properties?.Name),
                            color: COLORS.primaryColor,
                          },
                          {
                            label: driverStatusLabel(driver.status),
                            color: isDashed ? "warning" : "success",
                          },
                          ...(driver.tags || []).map((t: string) => {
                            return {
                              label: capitalize(t),
                              color: "info",
                            };
                          }),
                        ],
                      });
                      setInfoModalOpen(true);
                    },
                  }}
                />
              ));
          }
          return (
            <React.Fragment key={`transit-${driver._id}`}>
              {transitLines}
              {stations}
            </React.Fragment>
          );
        })}
    </>
  );
};