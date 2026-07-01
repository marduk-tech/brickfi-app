"use client";

import React, { useEffect } from "react";
import * as turf from "@turf/turf";
import { Flex, Tag, Typography } from "antd";
import { AdvancedMarker, AdvancedMarkerAnchorPoint, useMap } from "@vis.gl/react-google-maps";
import { useMapZoom } from "../use-map-zoom";
import { DRIVER_CATEGORIES, PLACE_TIMELINE } from "../../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { RoadDriverPlace } from "../../types";
import { MapModalContent } from "../../map-modal";
import { processRoadFeatures } from "../../utils";

interface RoadDriversProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  openModal: (content: MapModalContent) => void;
  fetchTravelDurationElement: (distance: number, duration: number, prefix?: string) => React.ReactNode;
}

function filterRoad(
  drivers: IDriverPlace[] | undefined,
  currentSelectedCategory: string,
  noCategoriesProvided: boolean,
  isDriverMatchingFilter: (d: IDriverPlace) => boolean
): RoadDriverPlace[] {
  return (drivers ?? []).filter((d): d is RoadDriverPlace => {
    const isAllowed = noCategoriesProvided
      ? true
      : (() => {
          const cats = (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ?? [];
          return Array.isArray(cats) && cats.includes(d.driver);
        })();
    return (
      d.driver === "highway" &&
      !!(d as any).features &&
      typeof d.status === "string" &&
      isAllowed &&
      isDriverMatchingFilter(d)
    );
  });
}

// ── Polylines drawn imperatively (google.maps.Polyline) ──────────────────────
function RoadPolylines(props: RoadDriversProps) {
  const map = useMap();
  const { drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal, fetchTravelDurationElement } = props;

  useEffect(() => {
    if (!map) return;
    const lines: google.maps.Polyline[] = [];
    const filtered = filterRoad(drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter);

    for (const driver of filtered) {
      const isDashed = ![
        PLACE_TIMELINE.LAUNCHED,
        PLACE_TIMELINE.POST_LAUNCH,
        PLACE_TIMELINE.PARTIAL_LAUNCH,
      ].includes(driver.status as PLACE_TIMELINE);

      const handleClick = (featureProps?: any) =>
        openModal({
          title: (
            <Flex vertical>
              <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: 500 }}>
                {driver.name}
              </Typography.Text>
              {featureProps?.name && featureProps.name.toLowerCase() !== driver.name.toLowerCase() ? (
                <Flex>
                  <Tag style={{ fontSize: FONT_SIZE.HEADING_4 }}>{capitalize(featureProps.name)}</Tag>
                </Flex>
              ) : null}
            </Flex>
          ),
          subHeading:
            driver.distance && driver.duration
              ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
              : "",
          content: driver.details?.oneLiner || driver.details?.description || "",
          tags: [
            { label: "Highway", color: COLORS.primaryColor },
            {
              label: driverStatusLabel(featureProps?.status || driver.status),
              color:
                isDashed || featureProps?.status === "construction"
                  ? "warning"
                  : "success",
            },
          ],
        });

      const features = processRoadFeatures(
        driver.features.filter(
          (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
        )
      );

      for (const feature of features) {
        const isFeatureDashed = isDashed || feature.properties?.status === "construction";
        const line = new google.maps.Polyline({
          map,
          path: feature.coordinates.map(([lng, lat]) => ({ lat, lng })),
          strokeColor: COLORS.LANDING.BLUISH,
          strokeWeight: 5,
          strokeOpacity: 1,
          icons: isFeatureDashed
            ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3, strokeColor: "#FFFFFF" }, offset: "0", repeat: "16px" }]
            : undefined,
        });
        line.addListener("click", () => handleClick(feature.properties));
        lines.push(line);
      }
    }

    return () => { lines.forEach((l) => l.setMap(null)); };
  }, [map, drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal]);

  return null;
}

// ── React marker nodes (entry/exit circles + rotated road-name labels) ────────
type LabelCandidate = {
  coords: number[];
  angle: number;
  driver: RoadDriverPlace;
  feature: ReturnType<typeof processRoadFeatures>[0];
};

function buildLabelCandidates(filtered: RoadDriverPlace[], zoom: number): LabelCandidate[] {
  // Dedup threshold matches OpenStreet: 8 km at low zoom, tightens as user zooms in
  const minLabelDistance = zoom < 13.5 ? 8 : zoom < 14.5 ? 4 : 2;
  const all: LabelCandidate[] = [];

  for (const driver of filtered) {
    const features = processRoadFeatures(
      driver.features.filter(
        (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
      )
    );

    for (const feature of features) {
      try {
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
          const p1 = turf.along(line, Math.max(0, distance - step), { units: "kilometers" });
          const p2 = turf.along(line, Math.min(totalLength, distance + step), { units: "kilometers" });
          // Compass bearing → CSS rotation, normalised to [-90, 90] so text is never upside-down
          let angle = turf.bearing(p1, p2) - 90;
          if (angle < -90) angle += 180;
          if (angle > 90) angle -= 180;

          all.push({ coords, angle, driver, feature });
        }
      } catch {
        // skip malformed features
      }
    }
  }

  // Deduplicate — threshold scales with zoom to match OpenStreet density
  return all.reduce<LabelCandidate[]>((kept, candidate) => {
    const tooClose = kept.some(
      (k) =>
        turf.distance(candidate.coords, k.coords, { units: "kilometers" }) < minLabelDistance
    );
    return tooClose ? kept : [...kept, candidate];
  }, []);
}

export function RoadDrivers(props: RoadDriversProps) {
  const { drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal, fetchTravelDurationElement } = props;
  const filtered = filterRoad(drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter);
  const zoom = useMapZoom();

  // Entry/exit markers and road-name labels both visible at zoom > 12.5 (matches OpenStreet)
  const showEntryAndLabels = zoom > 12.5;

  // ── Entry / exit circle markers (matches Leaflet CircleMarker) ─────────────
  const entryMarkers: React.ReactNode[] = [];
  for (const driver of filtered) {
    const entryExitFeatures = driver.features.filter(
      (f: any) =>
        f.type === "Feature" &&
        f.geometry?.type === "Point" &&
        f.properties?.type === "entry_exit"
    );
    for (const feature of entryExitFeatures) {
      const [lng, lat] = feature.geometry.coordinates;
      const name = feature.properties?.name || feature.properties?.Name || "Entry/Exit";

      entryMarkers.push(
        <AdvancedMarker
          key={`road-entry-${driver._id}-${lng}-${lat}`}
          position={{ lat, lng }}
          onClick={() =>
            openModal({
              title: (
                <Flex vertical>
                  <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: 500 }}>
                    {driver.name}
                  </Typography.Text>
                </Flex>
              ),
              subHeading:
                driver.distance && driver.duration
                  ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
                  : "",
              content: "",
              tags: [
                { label: "Highway", color: COLORS.primaryColor },
                { label: capitalize(name), color: COLORS.textColorDark },
              ],
            })
          }
        >
          {/* Filled blue circle — matches Leaflet CircleMarker fillColor/color */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: COLORS.LANDING.BLUISH,
              border: "2px solid #ffffff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          />
        </AdvancedMarker>
      );
    }
  }

  // ── Rotated road-name labels along each route ──────────────────────────────
  const labelCandidates = buildLabelCandidates(filtered, zoom);
  const labelMarkers: React.ReactNode[] = labelCandidates.map(
    ({ coords, angle, driver, feature }, idx) => {
      const labelText = driver.name || feature.properties?.name || "Highway";
      return (
        <AdvancedMarker
          key={`road-label-${driver._id}-${idx}`}
          position={{ lat: coords[1], lng: coords[0] }}
          anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
          zIndex={1000}
          onClick={() => {
            const featureProps = feature.properties;
            const isDashed = ![
              PLACE_TIMELINE.LAUNCHED,
              PLACE_TIMELINE.POST_LAUNCH,
              PLACE_TIMELINE.PARTIAL_LAUNCH,
            ].includes(driver.status as PLACE_TIMELINE);
            openModal({
              title: (
                <Flex vertical>
                  <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2, fontWeight: 500 }}>
                    {driver.name}
                  </Typography.Text>
                  {featureProps?.name && featureProps.name.toLowerCase() !== driver.name.toLowerCase() ? (
                    <Flex>
                      <Tag style={{ fontSize: FONT_SIZE.HEADING_4 }}>{capitalize(featureProps.name)}</Tag>
                    </Flex>
                  ) : null}
                </Flex>
              ),
              subHeading:
                driver.distance && driver.duration
                  ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
                  : "",
              content: driver.details?.oneLiner || driver.details?.description || "",
              tags: [
                { label: "Highway", color: COLORS.primaryColor },
                {
                  label: driverStatusLabel(featureProps?.status || driver.status),
                  color: isDashed || featureProps?.status === "construction" ? "warning" : "success",
                },
              ],
            });
          }}
        >
          <div
            style={{
              transform: `rotate(${angle}deg)`,
              background: COLORS.LANDING.BLUISH,
              border: "1px solid rgba(0,0,0,0.18)",
              borderRadius: 3,
              padding: "1px 4px",
              fontSize: 10,
              fontWeight: 400,
              whiteSpace: "nowrap",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              color: "white",
              cursor: "pointer",
              letterSpacing: "0.3px",
              userSelect: "none",
            }}
          >
            {labelText}
          </div>
        </AdvancedMarker>
      );
    }
  );

  return (
    <>
      <RoadPolylines {...props} />
      {showEntryAndLabels && entryMarkers}
      {showEntryAndLabels && labelMarkers}
    </>
  );
}
