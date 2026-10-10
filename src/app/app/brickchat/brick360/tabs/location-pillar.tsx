"use client";

import { forwardRef } from "react";
import { BRICK360_CATEGORY, LivIndexDriversConfig } from "@/libs/constants";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import { LvnzyProject } from "@/types/LvnzyProject";
import ReferredLocationChips from "../../referred-location-chips";
import {
  PillarBase,
  PillarMapConfig,
  PillarMapFocus,
  PillarProps,
  driversOfCategories,
} from "./pillar-base";

// Driver categories (DRIVER_CATEGORIES keys) each Location data point is
// about - drives both what the map plots and which places its nearest-places
// cards are picked from.
const DATA_POINT_CATEGORIES: Record<string, string[]> = {
  schoolsOffices: ["schools", "workplace"],
  conveniences: ["dining", "hospital", "commercial"],
  transport: ["metro", "roads"],
};

// Driver types in order of relevance for the nearest-places cards - types
// not listed here (e.g. university, micro-market) rank after all of these.
const DRIVER_TYPE_RANK = [
  "industrial-hitech",
  "industrial-general",
  "commercial",
  "highway",
  "transit",
  "school",
  "food",
  "hospital",
];

// how many nearest-place cards to show per data point
const RELEVANT_DRIVER_COUNT = 4;
// only places strictly under this commute time (minutes) are ranked at all -
// a data point with none in range shows no cards
const RELEVANT_DRIVER_MAX_MINUTES = 30;

const driverTypeRank = (type: string) => {
  const i = DRIVER_TYPE_RANK.indexOf(type);
  return i === -1 ? DRIVER_TYPE_RANK.length : i;
};

// The RELEVANT_DRIVER_COUNT most relevant places for a data point: its
// categories' drivers under RELEVANT_DRIVER_MAX_MINUTES away, grouped by
// driver type (each group nearest-first),
// picked round by round - the nearest of each type in DRIVER_TYPE_RANK order,
// then the second-nearest of each, and so on - so a high-ranked type
// (e.g. tech parks) can't crowd out every other type in the data point.
const getRelevantDrivers = (
  lvnzyProject: LvnzyProject,
  dataPointKey: string,
) => {
  const seen = new Set<string>();
  const byType = new Map<string, any[]>();
  driversOfCategories(lvnzyProject, DATA_POINT_CATEGORIES[dataPointKey] || [])
    .filter(
      (d: any) =>
        typeof d.duration === "number" &&
        d.duration < RELEVANT_DRIVER_MAX_MINUTES,
    )
    .sort((a: any, b: any) => a.duration - b.duration)
    .forEach((d: any) => {
      // the same place can appear in both neighborhood and connectivity
      const id = String(d._id || d.name);
      if (seen.has(id)) return;
      seen.add(id);
      byType.set(d.driver, [...(byType.get(d.driver) || []), d]);
    });

  const typeOrder = Array.from(byType.keys()).sort(
    (a, b) =>
      driverTypeRank(a) - driverTypeRank(b) ||
      // unranked types: nearest first
      byType.get(a)![0].duration - byType.get(b)![0].duration,
  );

  const picked: any[] = [];
  for (let round = 0; picked.length < RELEVANT_DRIVER_COUNT; round++) {
    let added = false;
    for (const type of typeOrder) {
      const driver = byType.get(type)![round];
      if (!driver) continue;
      picked.push(driver);
      added = true;
      if (picked.length === RELEVANT_DRIVER_COUNT) break;
    }
    if (!added) break;
  }
  return picked;
};

const getMapConfig = (
  dataPointKey: string,
  lvnzyProject: LvnzyProject,
): PillarMapConfig => {
  const categories = DATA_POINT_CATEGORIES[dataPointKey] || [];
  return { categories, drivers: driversOfCategories(lvnzyProject, categories) };
};

export const LocationPillar = forwardRef<any, PillarProps>((props, ref) => {
  const { lvnzyProject } = props;

  // Same chip treatment and behaviour as ReferredLocationChips: clicking a
  // place focuses the map on just that place (clicking it again clears it),
  // with each place's own driver icon and commute time. Its details are a
  // marker click away on the map itself.
  const renderRelevantDrivers = (
    dataPointKey: string,
    mapFocus: PillarMapFocus,
  ) => {
    if (!lvnzyProject) return null;
    const drivers = getRelevantDrivers(lvnzyProject, dataPointKey);
    if (!drivers.length) return null;

    // scoped to the data point - the same place can show under several
    const keyOf = (d: any) => `${dataPointKey}::${d._id || d.name}`;
    return (
      <ReferredLocationChips
        items={drivers.map((d: any) => {
          const driverCfg = (LivIndexDriversConfig as any)[d.driver];
          return {
            key: keyOf(d),
            id: keyOf(d),
            type: "driver" as const,
            name: d.name,
            suffix: `${d.duration} mins`,
            icon: driverCfg?.icon
              ? { name: driverCfg.icon.name, set: driverCfg.icon.set }
              : { name: "MdPlace", set: "md" as const },
            keepLabelCase: true,
          };
        })}
        selectedKey={mapFocus.focusedKey ?? null}
        onToggle={(item) => {
          const driver = drivers.find((d: any) => keyOf(d) === item.key);
          if (!driver) return;
          // empty categories = show every supplied driver (see useMapFilters)
          mapFocus.toggleFocus(item.key, { categories: [], drivers: [driver] });
          captureAnalyticsEvent("driver-map-focus", {
            driverName: driver.name,
            driverType: driver.driver,
            projectName: lvnzyProject?.meta?.projectName,
            projectId: lvnzyProject?._id,
          });
        }}
      />
    );
  };

  return (
    <PillarBase
      {...props}
      ref={ref}
      categoryKey={BRICK360_CATEGORY.areaConnectivity}
      getMapConfig={getMapConfig}
      renderDataPointActions={renderRelevantDrivers}
    />
  );
});
LocationPillar.displayName = "LocationPillar";
