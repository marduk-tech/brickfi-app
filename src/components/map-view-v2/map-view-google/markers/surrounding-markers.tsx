"use client";

import React, { useEffect } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { SurroundingElementLabels } from "../../../../libs/constants";
import { COLORS } from "../../../../theme/style-constants";
import { ISurroundingElement } from "../../../../types/Project";
import { MapModalContent } from "../../map-modal";
import {
  calculateSurroundingElementCenter,
  isValidSurroundingElementGeometry,
  processSurroundingElementGeometry,
} from "../../map-utils";
import { MarkerIcon } from "../marker-icon";

interface SurroundingMarkersProps {
  surroundingElements?: ISurroundingElement[];
  selectedSurroundingElementType?: string;
  openModal: (content: MapModalContent) => void;
}

function SurroundingPolylines({ surroundingElements, selectedSurroundingElementType, openModal }: SurroundingMarkersProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !surroundingElements?.length) return;
    const lines: google.maps.Polyline[] = [];

    for (const el of surroundingElements) {
      if (selectedSurroundingElementType && el.type !== selectedSurroundingElementType) continue;
      if (!isValidSurroundingElementGeometry(el)) continue;
      const geo = processSurroundingElementGeometry(el);
      if (!geo) continue;

      const color = el.impact > 0 ? COLORS.darkGreenIdentifier : COLORS.redIdentifier;
      const typeLabel = (SurroundingElementLabels as Record<string, { label: string }>)[el.type]?.label ?? "";
      const rawPositions: any[] = geo.positions;
      const segments: [number, number][][] = geo.isMulti
        ? (rawPositions as [number, number][][])
        : [rawPositions as [number, number][]];

      const handleClick = () =>
        openModal({
          title: el.description || typeLabel,
          content: el.approxDistanceMeters
            ? `(Approximately ${Math.round(el.approxDistanceMeters / 25) * 25} mtrs away)`
            : "",
          tags: [{ label: typeLabel, color: COLORS.primaryColor }],
        });

      for (const seg of segments) {
        const line = new google.maps.Polyline({
          map,
          path: seg.map(([lat, lon]) => ({ lat, lng: lon })),
          strokeColor: color,
          strokeWeight: 8,
          strokeOpacity: 0.8,
        });
        line.addListener("click", handleClick);
        lines.push(line);
      }
    }

    return () => { lines.forEach((l) => l.setMap(null)); };
  }, [map, surroundingElements, selectedSurroundingElementType, openModal]);

  return null;
}

export function SurroundingMarkers(props: SurroundingMarkersProps) {
  const { surroundingElements, selectedSurroundingElementType, openModal } = props;
  const centerMarkers: React.ReactNode[] = [];

  for (const el of surroundingElements ?? []) {
    if (selectedSurroundingElementType && el.type !== selectedSurroundingElementType) continue;
    if (!isValidSurroundingElementGeometry(el)) continue;
    const geo = processSurroundingElementGeometry(el);
    if (!geo) continue;
    const center = calculateSurroundingElementCenter(geo.polygonCoordinates, geo.isMulti);
    if (!center) continue;

    const labelCfg = (SurroundingElementLabels as Record<string, { label: string; icon: { name: string; set: string } }>)[el.type];
    const typeLabel = labelCfg?.label ?? el.type;
    const iconCfg = labelCfg?.icon ?? { name: "MdPlace", set: "md" };
    const iconColor = el.impact > 0 ? COLORS.greenIdentifier : COLORS.redIdentifier;

    centerMarkers.push(
      <AdvancedMarker
        key={`surr-${el.type}-${center[0]}-${center[1]}`}
        position={{ lat: center[1], lng: center[0] }}
        onClick={() =>
          openModal({
            title: el.description || typeLabel,
            content: el.approxDistanceMeters
              ? `(Approximately ${Math.round(el.approxDistanceMeters / 25) * 25} mtrs away)`
              : "",
            tags: [{ label: typeLabel, color: COLORS.primaryColor }],
          })
        }
      >
        <MarkerIcon
          iconName={iconCfg.name}
          iconSet={iconCfg.set as any}
          iconBgColor="white"
          iconColor={iconColor}
          borderColor={iconColor}
          iconSize={16}
        />
      </AdvancedMarker>
    );
  }

  return (
    <>
      <SurroundingPolylines {...props} />
      {centerMarkers}
    </>
  );
}
