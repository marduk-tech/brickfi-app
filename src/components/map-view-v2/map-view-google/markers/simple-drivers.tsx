"use client";

import React, { useEffect, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import {
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
  PLACE_TIMELINE,
} from "../../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../../libs/lvnzy-helper";
import { COLORS } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { MapModalContent, MapModalGeoPosition } from "../../map-modal";
import { MarkerIcon } from "../marker-icon";
import { fetchTravelDurationElement } from "../../map-utils";

interface SimpleDriversProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
    fetchTravelDurationElement: (distance: number, duration: number, prefix?: string) => React.ReactNode;
  
}

export function SimpleDrivers({
  drivers,
  currentSelectedCategory,
  noCategoriesProvided,
  isDriverMatchingFilter,
  openModal,
}: SimpleDriversProps) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map?.getZoom() ?? 0);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("zoom_changed", () => {
      setZoom(map.getZoom() ?? 0);
    });
    return () => listener.remove();
  }, [map]);

  const showDuration = zoom > 12;

  const filtered = (drivers ?? []).filter((d) => {
    if (!d.location?.lat || !d.location?.lng) return false;
    if (["highway", "transit"].includes(d.driver)) return false;
    const isAllowed = noCategoriesProvided
      ? true
      : (() => {
          const cats = (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ?? [];
          return Array.isArray(cats) && cats.includes(d.driver);
        })();
    return isAllowed && isDriverMatchingFilter(d);
  });

  return (
    <>
      {filtered.map((driver) => {
        const cfg = (LivIndexDriversConfig as any)[driver.driver];
        const iconCfg = cfg?.icon ?? { name: "MdPlace", set: "md" };
        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

        return (
          <AdvancedMarker
            key={driver._id}
            position={{ lat: driver.location!.lat, lng: driver.location!.lng }}
            onClick={() =>
              openModal(
                {
                  title: driver.name,
                  content: driver.details?.oneLiner || driver.details?.description || "",
                  subHeading:
              driver.distance && driver.duration
                ? fetchTravelDurationElement(driver.distance, driver.duration, driver.comments)
                : "",
                  tags: [
                    { label: cfg?.label ?? capitalize(driver.driver), color: COLORS.primaryColor },
                    { label: driverStatusLabel(driver.status), color: isDashed ? COLORS.yellowIdentifier : COLORS.greenIdentifier },
                    ...(driver.tags ?? []).map((t: string) => ({ label: capitalize(t), color: COLORS.textColorDark })),
                  ],
                },
                { lat: driver.location!.lat, lng: driver.location!.lng },
              )
            }
          >
            <MarkerIcon
              iconName={iconCfg.name}
              iconSet={iconCfg.set}
              iconBgColor="white"
              iconSize={18}
              isUnderConstruction={isDashed}
              label={showDuration && driver.duration ? `${driver.duration} mins` : undefined}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
