"use client";

import React, { useState } from "react";
import { Button, Card, Flex, Modal, Typography } from "antd";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { ISurroundingElement } from "../../../types/Project";
import { ProjectMarkerInput } from "../types";
import { MapViewGoogle } from "./map-view-google";
import MapViewV2 from "../map-view-v2";
import { useDevice } from "@/hooks/use-device";

const { Text } = Typography;

type GoogleMapType = "roadmap" | "hybrid";
type MapDisplayType = GoogleMapType | "street";

const MAP_TYPE_OPTIONS: { key: MapDisplayType; label: string; description: string; icon: string }[] = [
  {
    key: "roadmap",
    label: "Default",
    description: "Standard google map",
    icon: "LuMap",
  },
  {
    key: "hybrid",
    label: "Satellite",
    description: "Sattelite view",
    icon: "LuGlobe",
  },
  {
    key: "street",
    label: "Street Detail",
    description: "Street level detailed map",
    icon: "LuSignpost",
  },
];

interface MapViewWrapperProps {
  lvnzyProjectId?: string;
  drivers?: any[];
  projectId?: string;
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  fullSize: boolean;
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
    projectType?: string;
  }[];
  projectSqftPricing?: number;
  showLocalities?: boolean;
  onMapReady?: (map: any) => void;
  showCorridors?: boolean;
  minMapZoom?: number;
  initialZoom?: number;
  categories?: string[];
  hideAllFilters?: boolean;
  corridorIds?: string[];
  highlightedHomeTypes?: string[];
  /** Kept for backwards-compatibility with existing callers — no longer used. */
  defaultMode?: string;
}

export function MapViewWrapper({ defaultMode: _defaultMode, ...props }: MapViewWrapperProps) {
  const [mapType, setMapType] = useState<MapDisplayType>("roadmap");
  const [dialogOpen, setDialogOpen] = useState(false);
  const {isMobile} = useDevice();

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {mapType === "street" ? (
        <MapViewV2 {...props} />
      ) : (
        <MapViewGoogle {...props} mapTypeId={mapType} />
      )}

      {/* Map type toggle button */}
      <div style={{ position: "absolute", bottom: mapType == "street" ? 100: 80, right: 12, zIndex: 2000 }}>
        <Button
          type="link"
          onClick={() => setDialogOpen(true)}
          style={{
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 4,
            boxShadow: "0 2px 2px rgba(0,0,0,0.25)",
          }}
          icon={
              <DynamicReactIcon
                iconSet="lu"
                iconName="LuLayers3"
                size={22}
                color={COLORS.textColorMedium}
              />
            }
        >
        </Button>
      </div>

      {/* Map type selection dialog */}
      <Modal
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        footer={null}
        width={isMobile ? "100%": 750}
        zIndex={3000}
        closeIcon={<></>}
      >
        <Flex vertical={isMobile} gap={12} style={{ marginTop: 8 }} align="center">
          {MAP_TYPE_OPTIONS.map((option) => {
            const isSelected = mapType === option.key;
            return (
              <Card
                key={option.key}
                hoverable
                onClick={() => { setMapType(option.key); setDialogOpen(false); }}
                style={{
                  flex: 1,
                  borderColor: isSelected ? COLORS.primaryColor : COLORS.borderColor,
                  borderWidth: isSelected ? 2 : 1,
                  cursor: "pointer",
                  boxShadow: "none",
                  width: 225
                }}
              >
                <Flex vertical align="center" gap={10}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: isSelected ? COLORS.primaryColor : COLORS.bgColorMedium,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DynamicReactIcon
                      iconSet="lu"
                      iconName={option.icon}
                      size={22}
                      color={isSelected ? "white" : COLORS.textColorDark}
                    />
                  </div>
                  <Flex vertical align="center" gap={2}>
                    <Text
                      strong
                      style={{
                        fontSize: FONT_SIZE.PARA,
                        color: isSelected ? COLORS.primaryColor : COLORS.textColorDark,
                        textAlign: "center",
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: FONT_SIZE.SUB_TEXT, textAlign: "center", lineHeight: 1.3 }}
                    >
                      {option.description}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Modal>
    </div>
  );
}

export default MapViewWrapper;
