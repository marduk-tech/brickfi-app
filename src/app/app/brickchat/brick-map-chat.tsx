"use client";

import { Flex, Typography } from "antd";
import { useMemo } from "react";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { IDriverPlace } from "../../../types/Project";
import dynamic from "next/dynamic";
import type { ProjectMarkerInput } from "../../../components/map-view-v2/map-view-v2";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import type { LvnzyProject } from "../../../types/LvnzyProject";
import type { PillarMapConfig } from "../../../components/brick-360/brick360-pillar";
import type { ProjectResult } from "./brickchat-client";
const MapViewWrapper = dynamic(
  () => import("@/components/map-view-v2/map-view-google/map-view-wrapper"),
  { ssr: false },
);

const MapViewV2 = dynamic(
  () => import("../../../components/map-view-v2/map-view-v2"),
  { ssr: false },
);

const EXCLUDED_CATEGORIES = ["surroundings", "conveniences", "growth potential"];

interface BrickMapChatProps {
  projects: ProjectResult[];
  focusedProjectId?: string | null;
  hideAllFilters?: boolean;
  /**
   * When set, switches the map from the multi-project search-results view to
   * a single project's connectivity detail view - the same data brick360-v2's
   * (now-removed) Map tab used to render, reusing this already-mounted map
   * instead of spinning up a second one. See Brick360Inline/brickchat-client.
   */
  detailedProject?: LvnzyProject | null;
  /**
   * Narrows the detail view further to whatever a single expanded Brick360Pillar
   * data point is about (e.g. just school/office drivers, or just the corridor
   * pricing projects for the price-point data point) instead of the whole
   * project's connectivity. Only meaningful alongside detailedProject; ignored
   * otherwise. See brick360-pillar.tsx.
   */
  pillarMapConfig?: PillarMapConfig | null;
  /**
   * Specific driver/infra records to plot on the map - e.g. a chat answer's
   * referred-location chip, clicked in brickchat-client, which already has
   * these fetched (via useFetchAllLivindexPlaces) for the chip labels. Only
   * meaningful in the non-detailedProject view. No default "every driver"
   * fetch happens here - empty/undefined means no drivers are plotted.
   */
  focusedDrivers?: IDriverPlace[];
  /**
   * A chat answer's locality/corridor/micropocket-type referred-location
   * chip, clicked in brickchat-client (see getReferredLocationItems/
   * ReferredLocationChips there) - each narrows the map to just that one
   * record via MapViewWrapper's showLocalities/showCorridors/showMicroPockets
   * (ids, not booleans - see map-view-google.tsx). Only meaningful in the
   * non-detailedProject view; empty/undefined shows none, same as today.
   */
  focusedLocalityIds?: string[];
  focusedCorridorIds?: string[];
  focusedMicroPocketIds?: string[];
}

export function BrickMapChat({
  projects,
  focusedProjectId,
  hideAllFilters,
  detailedProject,
  pillarMapConfig,
  focusedDrivers,
  focusedLocalityIds,
  focusedCorridorIds,
  focusedMicroPocketIds,
}: BrickMapChatProps) {
  // No default "every driver in Bangalore" fetch - the base search-results
  // map only ever shows drivers when a caller explicitly supplies them (e.g.
  // brickchat-client's focusedDrivers, fetched there for a brickfiDriverIds
  // chip selection). Empty otherwise.
  const mapDrivers = useMemo(() => {
    if (!focusedDrivers?.length) return [];
    return focusedDrivers.map((p) => ({
      ...p,
      duration: p.distance ? Math.round(p.distance / 60) : 0,
    }));
  }, [focusedDrivers]);

  const projectMarkers = useMemo<ProjectMarkerInput[]>(() => {
    return projects
      .filter((p) => !!p.projectLocation?.lat && !!p.projectLocation?.lng)
      .map((p) => ({
        id: p.projectId,
        location: p.projectLocation,
        type: "apartment",
        modalContent: {
          title: (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_1 * 0.9,
                lineHeight: "100%",
                marginBottom: 8,
              }}
            >
              {p.projectName}
            </Typography.Text>
          ),
          content: p.oneLiner || "",
        },
      }));
  }, [projects]);

  // Mirrors the derivation MapTab (components/brick-360/map-tab.tsx) does
  // for the standalone brick360-v2 page's Map tab.
  const detailDrivers = useMemo(() => {
    if (!detailedProject) return [];
    return [
      ...(detailedProject.connectivity?.drivers || []),
      ...(detailedProject.neighborhood?.drivers || []),
    ].map((d: any) => ({
      ...d.driverId,
      distance: d.distanceKms,
      comments: d.comments,
      duration: d.durationMins
        ? d.durationMins
        : Math.round(d.mapsDurationSeconds / 60),
    }));
  }, [detailedProject]);

  const detailSurroundingElements = detailedProject?.property?.surroundings || [];
  const detailCorridorIds = (
    detailedProject?.originalProjectId?.info?.corridors || []
  ).map((c: any) => c.corridorId);
  const allDriverCategories = Object.keys(DRIVER_CATEGORIES);

  // Only relevant for the pricePoint pillar (projectsNearby set) - mirrors
  // Brick360Chat's own calculation for its (now-removed) internal map.
  const rate = detailedProject?.originalProjectId?.info?.rate;
  const pillarProjectSqftPricing =
    pillarMapConfig?.projectsNearby?.length && rate?.minimumUnitCost && rate?.minimumUnitSize
      ? Math.round(rate.minimumUnitCost / rate.minimumUnitSize)
      : undefined;

  return (
    <Flex vertical style={{ height: "100%", width: "100%" }}>
      {detailedProject ? (
        <MapViewWrapper
          key={`brick-map-chat-detail-${detailedProject._id}`}
          fullSize={false}
          projectId={detailedProject.originalProjectId?._id}
          lvnzyProjectId={detailedProject._id}
          drivers={pillarMapConfig ? pillarMapConfig.drivers : detailDrivers}
          showCorridors={detailCorridorIds}
          surroundingElements={
            pillarMapConfig
              ? pillarMapConfig.surroundingElements || []
              : detailSurroundingElements
          }
          projectsNearby={pillarMapConfig?.projectsNearby}
          projectSqftPricing={pillarProjectSqftPricing}
          categories={pillarMapConfig ? pillarMapConfig.categories : allDriverCategories}
        />
      ) : (
        <MapViewWrapper
          key="brick-map-chat"
          drivers={mapDrivers}
          projects={projectMarkers}
          focusedProjectId={focusedProjectId}
          fullSize={false}
          showLocalities={focusedLocalityIds ?? []}
          showCorridors={focusedCorridorIds ?? []}
          showMicroPockets={focusedMicroPocketIds ?? []}
          hideAllFilters={hideAllFilters}
          minMapZoom={10}
          categories={Object.keys(DRIVER_CATEGORIES).filter(
            (k) => !EXCLUDED_CATEGORIES.includes(k),
          )}
        />
      )}
    </Flex>
  );
}
