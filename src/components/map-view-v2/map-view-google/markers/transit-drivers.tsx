"use client";

import React, { useEffect } from "react";
import * as turf from "@turf/turf";
import { AdvancedMarker, AdvancedMarkerAnchorPoint, useMap } from "@vis.gl/react-google-maps";
import { useMapZoom } from "../use-map-zoom";
import { DRIVER_CATEGORIES, PLACE_TIMELINE } from "../../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../../libs/lvnzy-helper";
import { COLORS } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { GeoJSONPointFeature, TransitDriverPlace } from "../../types";
import { MapModalContent } from "../../map-modal";
import { processRoadFeatures } from "../../utils";
import { MarkerIcon } from "../marker-icon";

interface TransitDriversProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  openModal: (content: MapModalContent) => void;
  fetchTravelDurationElement: (distance: number, duration: number, prefix?: string) => React.ReactNode;
}

function filterTransit(
  drivers: IDriverPlace[] | undefined,
  currentSelectedCategory: string,
  noCategoriesProvided: boolean,
  isDriverMatchingFilter: (d: IDriverPlace) => boolean
): TransitDriverPlace[] {
  return (drivers ?? []).filter((d): d is TransitDriverPlace => {
    const isAllowed = noCategoriesProvided
      ? true
      : (() => {
          const cats = (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ?? [];
          return Array.isArray(cats) && cats.includes(d.driver);
        })();
    return (
      d.driver === "transit" &&
      !!(d as any).features &&
      typeof d.status === "string" &&
      isAllowed &&
      isDriverMatchingFilter(d)
    );
  });
}

// ── Polylines drawn imperatively ─────────────────────────────────────────────
function TransitPolylines(props: TransitDriversProps) {
  const map = useMap();
  const { drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal, fetchTravelDurationElement } = props;

  useEffect(() => {
    if (!map) return;
    const lines: google.maps.Polyline[] = [];
    const filtered = filterTransit(drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter);

    for (const driver of filtered) {
      const isDashed = ![
        PLACE_TIMELINE.LAUNCHED,
        PLACE_TIMELINE.POST_LAUNCH,
        PLACE_TIMELINE.PARTIAL_LAUNCH,
      ].includes(driver.status as PLACE_TIMELINE);

      const handleClick = () =>
        openModal({
          title: driver.name,
          subHeading:
            driver.distance && driver.duration
              ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
              : "",
          content: driver.details?.oneLiner || driver.details?.description || "",
          tags: [
            { label: driverStatusLabel(driver.status), color: isDashed ? "warning" : "success" },
            ...(driver.tags ?? []).map((t: string) => ({ label: capitalize(t), color: "info" })),
          ],
        });

      const lineFeatures = processRoadFeatures(
        driver.features.filter(
          (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
        )
      );

      for (const feature of lineFeatures) {
        const color = feature.properties?.strokeColor || COLORS.textColorDark;
        const line = new google.maps.Polyline({
          map,
          path: feature.coordinates.map(([lng, lat]) => ({ lat, lng })),
          strokeColor: color,
          strokeWeight: 6,
          strokeOpacity: 0.8,
          icons: isDashed
            ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3, strokeColor: "#FFFFFF" }, offset: "0", repeat: "16px" }]
            : undefined,
        });
        line.addListener("click", handleClick);
        lines.push(line);
      }
    }

    return () => { lines.forEach((l) => l.setMap(null)); };
  }, [map, drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal]);

  return null;
}

// ── Label candidate calculation ───────────────────────────────────────────────
type LabelCandidate = {
  coords: number[];
  angle: number;
  labelColor: string;
  driver: TransitDriverPlace;
  feature: ReturnType<typeof processRoadFeatures>[0];
};

function buildTransitLabelCandidates(filtered: TransitDriverPlace[], zoom: number): LabelCandidate[] {
  // Dedup threshold matches OpenStreet: 6 km at low zoom, tightens as user zooms in
  const minLabelDistance = zoom < 13.5 ? 6 : zoom < 14.5 ? 3 : 1.5;
  const all: LabelCandidate[] = [];

  for (const driver of filtered) {
    const lineFeatures = processRoadFeatures(
      driver.features.filter(
        (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
      )
    );

    // Station coords for the 0.4 km exclusion zone
    const stationCoords: number[][] = driver.features
      .filter((f: any): f is GeoJSONPointFeature => f.type === "Feature" && f.geometry.type === "Point")
      .map((f: any) => f.geometry.coordinates as number[]);

    for (const feature of lineFeatures) {
      const labelColor = feature.properties?.strokeColor || COLORS.textColorDark;
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
          let angle = turf.bearing(p1, p2) - 90;
          if (angle < -90) angle += 180;
          if (angle > 90) angle -= 180;

          all.push({ coords, angle, labelColor, driver, feature });
        }
      } catch {
        // skip malformed features
      }
    }
  }

  // Deduplicate — distance threshold scales with zoom, 0.4 km exclusion around stations
  const kept: LabelCandidate[] = [];
  for (const candidate of all) {
    const tooCloseToLabel = kept.some(
      (k) => turf.distance(candidate.coords, k.coords, { units: "kilometers" }) < minLabelDistance
    );
    // gather all station coords for this driver
    const tooCloseToStation = filtered
      .find((d) => d._id === candidate.driver._id)
      ?.features.filter(
        (f: any): f is GeoJSONPointFeature =>
          f.type === "Feature" && f.geometry.type === "Point"
      )
      .some(
        (f: any) =>
          turf.distance(candidate.coords, f.geometry.coordinates, { units: "kilometers" }) < 0.4
      ) ?? false;

    if (!tooCloseToLabel && !tooCloseToStation) kept.push(candidate);
  }
  return kept;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function TransitDrivers(props: TransitDriversProps) {
  const { drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal, fetchTravelDurationElement } = props;
  const filtered = filterTransit(drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter);
  const zoom = useMapZoom();

  // Station markers visible at zoom > 13.5 (matches OpenStreet)
  const showStations = zoom > 13.5;
  // Line-name labels visible at zoom > 13 (matches OpenStreet)
  const showLabels = zoom > 13.5;

  // ── Station markers (FaTrainSubway, matches transitStationIcon from OpenStreet) ──
  const stationMarkers: React.ReactNode[] = [];
  for (const driver of filtered) {
    const isDashed = ![
      PLACE_TIMELINE.LAUNCHED,
      PLACE_TIMELINE.POST_LAUNCH,
      PLACE_TIMELINE.PARTIAL_LAUNCH,
    ].includes(driver.status as PLACE_TIMELINE);

    const pointFeatures = driver.features.filter(
      (f: any): f is GeoJSONPointFeature =>
        f.type === "Feature" && f.geometry.type === "Point"
    );

    for (const feature of pointFeatures) {
      const [lng, lat] = feature.geometry.coordinates;
      const stationName = feature.properties?.name || feature.properties?.Name || driver.name;

      stationMarkers.push(
        <AdvancedMarker
          key={`transit-station-${driver._id}-${lng}-${lat}`}
          position={{ lat, lng }}
          onClick={() =>
            openModal({
              title: driver.name,
              subHeading:
                driver.distance && driver.duration
                  ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
                  : "",
              content: driver.details?.oneLiner || driver.details?.description || "",
              tags: [
                { label: `Station: ${stationName}`, color: COLORS.primaryColor },
                { label: driverStatusLabel(driver.status), color: isDashed ? "warning" : "success" },
                ...(driver.tags ?? []).map((t: string) => ({ label: capitalize(t), color: "info" })),
              ],
            })
          }
        >
          <MarkerIcon
            iconName="FaTrainSubway"
            iconSet="fa6"
            iconBgColor={COLORS.textColorDark}
            iconColor="white"
            iconSize={14}
            isUnderConstruction={isDashed}
          />
        </AdvancedMarker>
      );
    }
  }

  // ── Rotated transit-line name labels (matches OpenStreet zoom > 14 behaviour) ──
  const labelCandidates = buildTransitLabelCandidates(filtered, zoom);
  const labelMarkers: React.ReactNode[] = labelCandidates.map(
    ({ coords, angle, labelColor, driver }, idx) => {
      const isDashed = ![
        PLACE_TIMELINE.LAUNCHED,
        PLACE_TIMELINE.POST_LAUNCH,
        PLACE_TIMELINE.PARTIAL_LAUNCH,
      ].includes(driver.status as PLACE_TIMELINE);
      return (
      <AdvancedMarker
        key={`transit-label-${driver._id}-${idx}`}
        position={{ lat: coords[1], lng: coords[0] }}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        zIndex={1000}
        onClick={() =>
          openModal({
            title: driver.name,
            subHeading:
              driver.distance && driver.duration
                ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
                : "",
            content: driver.details?.oneLiner || driver.details?.description || "",
            tags: [
              { label: driverStatusLabel(driver.status), color: isDashed ? "warning" : "success" },
              ...(driver.tags ?? []).map((t: string) => ({ label: capitalize(t), color: "info" })),
            ],
          })
        }
      >
        <div
          style={{
            transform: `rotate(${angle}deg)`,
            background: labelColor,
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
          {driver.name}
        </div>
      </AdvancedMarker>
    );
    }
  );

  return (
    <>
      <TransitPolylines {...props} />
      {showStations && stationMarkers}
      {showLabels && labelMarkers}
    </>
  );
}
