"use client";

import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { capitalize, rupeeAmountFormat } from "../../../../libs/lvnzy-helper";
import { HOME_TYPE_ICON, getPrimaryHomeType } from "../../../../libs/home-type-icons";
import { COLORS } from "../../../../theme/style-constants";
import { MapModalContent } from "../../map-modal";
import { ProjectMarkerInput } from "../../types";
import { MarkerIcon } from "../marker-icon";

interface ProjectMarkersProps {
  primaryProject?: any;
  projects?: ProjectMarkerInput[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
    projectType?: string;
  }[];
  projectSqftPricing?: number;
  highlightedHomeTypes?: string[];
  openModal: (content: MapModalContent) => void;
}

export function ProjectMarkers({
  primaryProject,
  projects,
  projectsNearby,
  projectSqftPricing,
  highlightedHomeTypes,
  openModal,
}: ProjectMarkersProps) {
  const primaryLat = primaryProject?.info?.location?.lat;
  const primaryLng = primaryProject?.info?.location?.lng;
  const hasNearby = !!projectsNearby?.length;

  const primaryLabel = hasNearby
    ? `₹${rupeeAmountFormat(`${projectSqftPricing}`)} /sqft`
    : primaryProject?.info?.name?.length > 20
      ? `${primaryProject.info.name.substring(0, 20)}..`
      : primaryProject?.info?.name;

  return (
    <>
      {/* ── Primary project ── */}
      {primaryLat && primaryLng && (
        <AdvancedMarker
          position={{ lat: primaryLat, lng: primaryLng }}
          zIndex={600}
          onClick={() =>
            openModal({
              title: primaryProject.info.name,
              content: primaryProject.info.description ?? "",
              tags: (primaryProject.info.homeType ?? []).map((h: string) => ({
                label: capitalize(h),
                color: COLORS.textColorDark,
              })),
            })
          }
        >
          <MarkerIcon
            iconName="IoLocation"
            iconSet="io5"
            label={primaryLabel}
            iconBgColor={COLORS.primaryColor}
            iconColor="white"
            borderColor="white"
            containerWidth={hasNearby ? 80 : 135}
            iconSize={hasNearby ? 18 : 16}
            bounce={true}
          />
        </AdvancedMarker>
      )}

      {/* ── Caller-supplied projects — home-type icon ── */}
      {projects?.map((p) => {
        if (!p.location?.lat || !p.location?.lng) return null;
        const isHighlighted =
          !highlightedHomeTypes?.length || highlightedHomeTypes.includes(p.type);
        const iconCfg = HOME_TYPE_ICON[p.type] ?? { name: "IoLocation", set: "io5" as const };
        return (
          <AdvancedMarker
            key={p.id}
            position={{ lat: p.location.lat, lng: p.location.lng }}
            onClick={() => openModal(p.modalContent)}
          >
            <MarkerIcon
              iconName={iconCfg.name}
              iconSet={iconCfg.set}
              iconBgColor="white"
              iconColor={isHighlighted ? COLORS.textColorDark : COLORS.textColorLight}
              borderColor={isHighlighted ? COLORS.primaryColor : COLORS.borderColor}
              iconSize={18}
            />
          </AdvancedMarker>
        );
      })}

      {/* ── Nearby projects — home-type icon + price label ── */}
      {projectsNearby
        ?.filter(
          (p) =>
            p.projectLocation?.lat &&
            p.projectLocation?.lng &&
            projectSqftPricing !== undefined &&
            Math.abs(p.sqftCost - projectSqftPricing) / projectSqftPricing <= 0.55
        )
        .map((p) => {
          const iconCfg = (p.projectType && HOME_TYPE_ICON[p.projectType]) || {
            name: "MdHomeWork",
            set: "md" as const,
          };
          return (
            <AdvancedMarker
              key={p.projectName}
              position={{ lat: p.projectLocation.lat, lng: p.projectLocation.lng }}
              onClick={() =>
                openModal({
                  title: p.projectName,
                  content: "",
                  tags: [{ label: capitalize(p.projectType ?? ""), color: COLORS.primaryColor }],
                })
              }
            >
              <MarkerIcon
                iconName={iconCfg.name}
                iconSet={iconCfg.set}
                label={`${p.sqftCost} /sqft`}
                iconSize={14}
              />
            </AdvancedMarker>
          );
        })}
    </>
  );
}
