import React from "react";
import { Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { ISurroundingElement } from "../../../types/Project";
import { SurroundingElementLabels } from "../../../libs/constants";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent } from "../map-modal";
import {
  processSurroundingElementGeometry,
  calculateSurroundingElementCenter,
  isValidSurroundingElementGeometry
} from "../map-utils";

export interface SurroundingMarkersProps {
  surroundingElements?: ISurroundingElement[];
  surroundingElementIcons: Array<{ type: string; icon: L.DivIcon }>;
  selectedSurroundingElementType?: string;
  openModal: (content: MapModalContent) => void;
}

export const SurroundingMarkers = ({
  surroundingElements,
  surroundingElementIcons,
  selectedSurroundingElementType,
  openModal,
}: SurroundingMarkersProps) => {
  const map = useMap();
  
  // Check if we have surrounding elements to render
  if (!surroundingElements || !surroundingElements.length) {
    map.setZoom(12, { animate: true });
    return null;
  }
  
  // Check if icons are loaded
  if (!surroundingElementIcons || !surroundingElementIcons.length) {
    // Icons might still be loading, don't adjust zoom yet
    return null;
  }

  map.setZoom(15, { animate: true });

  return (
    <>
      {surroundingElements
        ?.filter(
          (e: ISurroundingElement) =>
            (!selectedSurroundingElementType || e.type === selectedSurroundingElementType) &&
            e.geometry && e.geometry.length > 0 // Ensure element has valid geometry
        )
        .map((element: ISurroundingElement, index: number) => {
          // Validate element has valid geometry
          if (!isValidSurroundingElementGeometry(element)) {
            return null;
          }

          // Process geometry using utility functions
          const geometryData = processSurroundingElementGeometry(element);
          if (!geometryData) {
            return null;
          }

          const { positions, polygonCoordinates, isMulti } = geometryData;

          // Calculate center point for icon placement
          const centerCoordinates = calculateSurroundingElementCenter(polygonCoordinates, isMulti);
          if (!centerCoordinates) {
            return null;
          }

          // Find icon for this element type
          const iconData = surroundingElementIcons.find(
            (i) => i.type === element.type
          );
          
          if (!iconData?.icon) {
            console.warn(`No icon found for surrounding element type: ${element.type}`);
            return null;
          }

          const handleElementClick = () => {
            const typeLabel = (SurroundingElementLabels as any)[element.type]
              ? (SurroundingElementLabels as any)[element.type].label
              : "";
            openModal({
              title: element.description || typeLabel || "",
              content: "",
              tags: [
                {
                  label: typeLabel || "",
                  color: COLORS.primaryColor,
                },
              ],
            });
          };
          
          return (
            <React.Fragment key={`surrounding-${index}`}>
              <Polyline
                key={`polyline-${index}`}
                positions={positions}
                pathOptions={{
                  color:
                    element.impact > 0
                      ? COLORS.greenIdentifier
                      : COLORS.redIdentifier,
                  weight: 8,
                  opacity: 0.8,
                }}
                eventHandlers={{
                  click: handleElementClick,
                }}
              />
              <Marker
                key={`marker-${index}`}
                position={[centerCoordinates[1], centerCoordinates[0]]}
                icon={iconData.icon}
                eventHandlers={{
                  click: handleElementClick,
                }}
              />
            </React.Fragment>
          );
        })}
    </>
  );
};