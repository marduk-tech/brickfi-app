"use client";

import { Flex, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { IDriverPlace } from "../../../types/Project";
import { Loader } from "../../../components/common/loader";
import dynamic from "next/dynamic";
import type { ProjectMarkerInput } from "../../../components/map-view-v2/map-view-v2";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import type { ProjectResult } from "./brickchat-client";

const MapViewV2 = dynamic(
  () => import("../../../components/map-view-v2/map-view-v2"),
  { ssr: false },
);

const EXCLUDED_CATEGORIES = ["surroundings", "conveniences", "growth potential"];

interface BrickMapChatProps {
  projects: ProjectResult[];
}

export function BrickMapChat({ projects }: BrickMapChatProps) {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const [filteredDrivers, setFilteredDrivers] = useState<IDriverPlace[]>([]);

  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      setFilteredDrivers(livindexPlaces);
    }
  }, [livindexPlaces]);

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

  if (livindexPlacesLoading) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ width: "100%", marginTop: 100 }}
      >
        <Loader />
        <Typography.Text>Initializing Map..</Typography.Text>
      </Flex>
    );
  }

  if (!livindexPlaces) return null;

  return (
    <Flex vertical style={{ height: "100%", width: "100%" }}>
      <MapViewV2
        key="brick-map-chat"
        drivers={filteredDrivers.map((p) => ({
          ...p,
          duration: p.distance ? Math.round(p.distance / 60) : 0,
        }))}
        projects={projectMarkers}
        fullSize={false}
        showLocalities={false}
        showCorridors={false}
        minMapZoom={10}
        categories={Object.keys(DRIVER_CATEGORIES).filter(
          (k) => !EXCLUDED_CATEGORIES.includes(k),
        )}
      />
    </Flex>
  );
}
