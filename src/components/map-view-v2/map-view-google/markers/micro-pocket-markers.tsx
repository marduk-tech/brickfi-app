"use client";

import React, { useEffect, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { COLORS } from "../../../../theme/style-constants";
import { MapModalContent, MapModalGeoPosition } from "../../map-modal";
import { MarkerIcon } from "../marker-icon";

const MICROPOCKET_MAX_ZOOM = 13.5;

interface MicroPocketMarkersProps {
  microPockets?: any[];
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

function useIsBelowMicroPocketZoom() {
  const map = useMap();
  const [isBelow, setIsBelow] = useState(true);

  useEffect(() => {
    if (!map) return;
    const update = () => setIsBelow((map.getZoom() ?? 0) < MICROPOCKET_MAX_ZOOM);
    update();
    const listener = map.addListener("zoom_changed", update);
    return () => listener.remove();
  }, [map]);

  return isBelow;
}

function MicroPocketPolygons({ microPockets, openModal }: MicroPocketMarkersProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !microPockets?.length) return;
    const polys: google.maps.Polygon[] = [];

    for (const microPocket of microPockets) {
      if (!microPocket.geoJson?.features?.[0]?.geometry?.coordinates) continue;
      const rawCoords: [number, number][] = microPocket.geoJson.features[0].geometry.coordinates;
      const poly = new google.maps.Polygon({
        map,
        paths: rawCoords.map(([lng, lat]) => ({ lat, lng })),
        strokeColor: COLORS.textColorMedium,
        strokeWeight: 1,
        strokeOpacity: 1,
        fillColor: COLORS.textColorMedium,
        fillOpacity: 0.1,
      });
      poly.addListener("click", (e: google.maps.PolyMouseEvent) =>
        openModal(
          {
            title: microPocket.name,
            content: microPocket.description ?? "",
            tags: [{ label: "Micro pocket", color: COLORS.textColorMedium }],
          },
          e.latLng ? { lat: e.latLng.lat(), lng: e.latLng.lng() } : undefined,
        )
      );
      polys.push(poly);
    }

    return () => { polys.forEach((p) => p.setMap(null)); };
  }, [map, microPockets, openModal]);

  return null;
}

export function MicroPocketMarkers({ microPockets, openModal }: MicroPocketMarkersProps) {
  const isBelowMicroPocketZoom = useIsBelowMicroPocketZoom();

  if (!isBelowMicroPocketZoom) return null;

  return (
    <>
      <MicroPocketPolygons microPockets={microPockets} openModal={openModal} />
      {microPockets?.map((m) => {
        if (!m.location?.lat || !m.location?.lng) return null;
        return (
          <AdvancedMarker
            key={`mp-${m._id}`}
            position={{ lat: m.location.lat, lng: m.location.lng }}
            zIndex={100}
            onClick={() =>
              openModal(
                {
                  title: m.name,
                  content: m.description ?? "",
                  tags: [{ label: "Micro pocket", color: COLORS.textColorMedium }],
                },
                { lat: m.location.lat, lng: m.location.lng },
              )
            }
          >
            <MarkerIcon
              iconName="LuMapPinned"
              iconSet="lu"
              label={m.name}
              iconBgColor={COLORS.textColorMedium}
              iconColor="white"
              borderColor={COLORS.textColorMedium}
              containerWidth={125}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}
