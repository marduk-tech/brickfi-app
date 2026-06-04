"use client";

import React, { useEffect } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { COLORS } from "../../../../theme/style-constants";
import { MapModalContent } from "../../map-modal";
import { MarkerIcon } from "../marker-icon";

interface CorridorMarkersProps {
  corridors?: any[];
  openModal: (content: MapModalContent) => void;
}

function CorridorPolygons({ corridors, openModal }: CorridorMarkersProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !corridors?.length) return;
    const polys: google.maps.Polygon[] = [];

    for (const corridor of corridors) {
      if (!corridor.geoJson?.features?.[0]?.geometry?.coordinates) continue;
      const rawCoords: [number, number][] = corridor.geoJson.features[0].geometry.coordinates;
      const poly = new google.maps.Polygon({
        map,
        paths: rawCoords.map(([lng, lat]) => ({ lat, lng })),
        strokeColor: COLORS.textColorMedium,
        strokeWeight: 1,
        strokeOpacity: 1,
        fillColor: COLORS.textColorDark,
        fillOpacity: 0.1,
      });
      poly.addListener("click", () =>
        openModal({
          title: corridor.name,
          content: corridor.description ?? "",
          tags: [{ label: "Growth corridor", color: COLORS.textColorDark }],
        })
      );
      polys.push(poly);
    }

    return () => { polys.forEach((p) => p.setMap(null)); };
  }, [map, corridors, openModal]);

  return null;
}

export function CorridorMarkers({ corridors, openModal }: CorridorMarkersProps) {
  return (
    <>
      <CorridorPolygons corridors={corridors} openModal={openModal} />
      {corridors?.map((c) => {
        if (!c.location?.lat || !c.location?.lng) return null;
        return (
          <AdvancedMarker
            key={`corr-${c._id}`}
            position={{ lat: c.location.lat, lng: c.location.lng }}
            zIndex={100}
            onClick={() =>
              openModal({
                title: c.name,
                content: c.description ?? "",
                tags: [{ label: "Growth corridor", color: COLORS.textColorDark }],
              })
            }
          >
            <MarkerIcon
              iconName="LuMilestone"
              iconSet="lu"
              label={c.name}
              iconBgColor={COLORS.bgColorDark}
              iconColor="white"
              borderColor={COLORS.bgColorDark}
              containerWidth={125}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
