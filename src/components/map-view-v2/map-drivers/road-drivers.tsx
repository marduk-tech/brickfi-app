import * as turf from "@turf/turf";
import { Flex, Tag, Typography } from "antd";
import L from "leaflet";
import React from "react";
import { CircleMarker, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { DRIVER_CATEGORIES, PLACE_TIMELINE } from "../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";
import { RoadDriverPlace } from "../types";
import { processRoadFeatures } from "../utils";

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

          const handleRoadDriverClick = (driver: any, feature?: any) => {
            setModalContent({
              title: (
                <Flex vertical>
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: 500 }}
                  >
                    {driver.name}
                  </Typography.Text>
                  {feature.properties &&
                  feature.properties.name &&
                  feature.properties.name.toLowerCase() !=
                    driver.name.toLowerCase() ? (
                    <Flex style={{}}>
                      <Tag
                        style={{
                          fontSize: FONT_SIZE.HEADING_4,
                        }}
                      >
                        {capitalize(feature.properties.name)}
                      </Tag>
                    </Flex>
                  ) : null}
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
                    feature.properties
                      ? feature.properties.status || driver.status
                      : driver.status,
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

          const visibleFeatures = processedFeatures.filter((feature) =>
            feature.coordinates.some(([lng, lat]) =>
              bounds.contains([lat, lng]),
            ),
          );

          type CandidateMarker = {
            coords: number[];
            angle: number;
            feature: (typeof visibleFeatures)[0];
            lineIndex: number;
          };

          // First pass: collect all candidate label points across all polylines
          const allCandidates: CandidateMarker[] = [];
          visibleFeatures.forEach((feature, lineIndex) => {
            const line = turf.lineString(feature.coordinates);
            const totalLength = turf.length(line, { units: "kilometers" });
            const numPoints = totalLength >= 2 ? Math.ceil(totalLength) / 2 : 1;
            const startOffset = 2;

            for (let i = 0; i < numPoints; i++) {
              const distance = startOffset + (i * totalLength) / numPoints;
              if (distance >= totalLength) break;
              const point = turf.along(line, distance, { units: "kilometers" });
              const coords = point.geometry.coordinates;

              const step = 0.15;
              const p1 = turf.along(line, Math.max(0, distance - step), {
                units: "kilometers",
              });
              const p2 = turf.along(
                line,
                Math.min(totalLength, distance + step),
                { units: "kilometers" },
              );
              // Convert compass bearing to CSS rotation, normalize to [-90, 90] so text is never upside-down
              let angle = turf.bearing(p1, p2) - 90;
              if (angle < -90) angle += 180;
              if (angle > 90) angle -= 180;

              allCandidates.push({ coords, angle, feature, lineIndex });
            }
          });

          // Second pass: deduplicate globally — distance threshold scales with zoom
          const zoom = map.getZoom();
          const minDistance = zoom < 13.5 ? 8 : zoom < 14.5 ? 4 : 2;
          const globalMarkers = allCandidates.reduce<CandidateMarker[]>(
            (kept, candidate) => {
              const tooClose = kept.some(
                (k) =>
                  turf.distance(candidate.coords, k.coords, {
                    units: "kilometers",
                  }) < minDistance,
              );
              return tooClose ? kept : [...kept, candidate];
            },
            [],
          );

          const entryExitMarkers =
            map.getZoom() > 12.5
              ? driver.features
                  .filter(
                    (f: any) =>
                      f.type === "Feature" &&
                      f.geometry?.type === "Point" &&
                      f.properties?.type === "entry_exit" &&
                      bounds.contains([
                        f.geometry.coordinates[1],
                        f.geometry.coordinates[0],
                      ]),
                  )
                  .map((f: any, idx: number) => {
                    const [lng, lat] = f.geometry.coordinates;
                    const name =
                      f.properties?.name || f.properties?.Name || "Entry/Exit";
                    return (
                      <CircleMarker
                        key={`entry-exit-${driver._id}-${idx}`}
                        center={[lat, lng]}
                        radius={6}
                        pathOptions={{
                          color: "#ffffff",
                          weight: 2,
                          fillColor: COLORS.LANDING.BLUISH,
                          fillOpacity: 1,
                        }}
                      >
                        <Popup>{capitalize(name)}</Popup>
                      </CircleMarker>
                    );
                  })
              : [];

          const RoadLine = [
            ...entryExitMarkers,
            ...visibleFeatures.map((feature, lineIndex) => {
              const positions = feature.coordinates.map(
                ([lng, lat]) => [lat, lng] as [number, number],
              );
              return (
                <Polyline
                  key={`${driver._id}-${lineIndex}`}
                  positions={positions}
                  pathOptions={{
                    color: COLORS.LANDING.BLUISH,
                    weight: 5,
                    opacity: 0.5,
                    dashArray:
                      isDashed || feature.properties?.status === "construction"
                        ? "10, 10"
                        : undefined,
                  }}
                  eventHandlers={{
                    click: handleRoadDriverClick,
                  }}
                />
              );
            }),
            ...(map.getZoom() > 12.5
              ? globalMarkers.map(
                  ({ coords, angle, feature, lineIndex }, pointIndex) => {
                    const labelText =
                      driver.name || feature.properties?.name || "Highway";
                    const labelIcon = L.divIcon({
                      className: "",
                      iconSize: [0, 0],
                      iconAnchor: [0, 0],
                      html: `<div style="
                      position: absolute;
                      transform: translate(-50%, -50%) rotate(${angle}deg);
                      background: ${COLORS.LANDING.BLUISH};
                      border: 1px solid rgba(0,0,0,0.18);
                      border-radius: 3px;
                      padding: 1px 4px;
                      font-size: 10px;
                      font-weight: 400;
                      white-space: nowrap;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                      color: white;
                      cursor: pointer;
                      pointer-events: auto;
                      letter-spacing: 0.3px;
                    ">${labelText}</div>`,
                    });
                    return (
                      <Marker
                        key={`road-label-${driver._id}-${lineIndex}-${pointIndex}`}
                        position={[coords[1], coords[0]]}
                        icon={labelIcon}
                        zIndexOffset={1000}
                        eventHandlers={{
                          click: () => handleRoadDriverClick(driver, feature),
                        }}
                      />
                    );
                  },
                )
              : []),
          ];

          return (
            <React.Fragment key={`road-group-${driver._id}`}>
              {RoadLine}
            </React.Fragment>
          );
        })}
    </>
  );
};
