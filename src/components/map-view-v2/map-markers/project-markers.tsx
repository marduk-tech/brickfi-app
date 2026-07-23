import React, { JSX } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";
import { ProjectMarkerInput } from "../types";

interface ProjectMarkersProps {
  primaryProject?: any;
  projects?: ProjectMarkerInput[];
  currentProjectMarkerIcon?: L.DivIcon | null;
  projectMarkerIcon?: L.DivIcon | null;
  projectMarkerIconsByHomeType?: Record<string, L.DivIcon>;
  highlightedHomeTypes?: string[];
  setModalContent: (content: MapModalContent, position?: MapModalGeoPosition) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const ProjectMarkers = ({
  primaryProject,
  projects,
  currentProjectMarkerIcon,
  projectMarkerIcon,
  projectMarkerIconsByHomeType,
  highlightedHomeTypes,
  setModalContent,
  setInfoModalOpen,
}: ProjectMarkersProps) => {
  const markers: JSX.Element[] = [];

  if (!currentProjectMarkerIcon) {
    return <>{markers}</>;
  }

  // Primary project marker (still consumes the legacy Project shape — fetched internally by id)
  if (
    primaryProject &&
    primaryProject?.info?.location?.lat &&
    primaryProject?.info?.location?.lng
  ) {
    markers.push(
      <Marker
        key={primaryProject._id}
        position={[
          primaryProject.info.location.lat,
          primaryProject.info.location.lng,
        ]}
        zIndexOffset={600}
        icon={currentProjectMarkerIcon}
        eventHandlers={{
          click: () => {
            setModalContent(
              {
                title: primaryProject.info.name,
                content: primaryProject.info.description || "",
                tags: [
                  ...primaryProject.info.homeType.map((h: string) => {
                    return {
                      label: capitalize(h),
                      color: COLORS.textColorDark,
                    };
                  }),
                ],
              },
              {
                // nudge north so the popup opens above the marker icon/label instead of on top of it
                lat: primaryProject.info.location.lat + 0.0008,
                lng: primaryProject.info.location.lng,
              },
            );
            setInfoModalOpen(true);
          },
        }}
      />
    );
  }

  // Caller-supplied markers — caller owns icon-type selection and modal content.
  if (projects && projects.length > 0 && projectMarkerIcon) {
    projects.forEach((p) => {
      if (!p?.location?.lat || !p?.location?.lng) {
        return;
      }

      // highlightedHomeTypes only affects icon when the marker's type isn't in the highlight set,
      // we still show it but fall back to the generic icon so highlighted ones stand out.
      const isHighlighted =
        !highlightedHomeTypes ||
        highlightedHomeTypes.length === 0 ||
        highlightedHomeTypes.includes(p.type);

      const markerIcon =
        (isHighlighted && projectMarkerIconsByHomeType?.[p.type]) ||
        projectMarkerIcon;

      markers.push(
        <Marker
          key={p.id}
          position={[p.location.lat, p.location.lng]}
          icon={markerIcon}
          eventHandlers={{
            click: () => {
              setModalContent(p.modalContent, { lat: p.location.lat, lng: p.location.lng });
              setInfoModalOpen(true);
            },
          }}
        />
      );
    });
  }

  return <>{markers}</>;
};

interface ProjectsNearbyProps {
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
    projectType?: string;
  }[];
  projectsNearbyIcons: any[];
  projectSqftPricing?: number;
  primaryProject?: any;
  setModalContent: (content: MapModalContent, position?: MapModalGeoPosition) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const ProjectsNearbyMarkers = ({
  projectsNearby,
  projectsNearbyIcons,
  projectSqftPricing,
  primaryProject,
  setModalContent,
  setInfoModalOpen,
}: ProjectsNearbyProps) => {
  if (!projectsNearby || !projectSqftPricing) {
    return null;
  }

  return (
    <>
      {projectsNearby
        .filter(
          (p) =>
            Math.abs(p.sqftCost - projectSqftPricing) / projectSqftPricing <=
            0.55
        )
        .map((project) => {
          if (!project.projectLocation?.lat || !project.projectLocation?.lng) {
            return null;
          }

          const projectIcon = projectsNearbyIcons.find(
            (p) => p.name === project.projectName && p.icon
          );

          if (!projectIcon?.icon) {
            return null;
          }

          return (
            <Marker
              key={project.projectName.toLowerCase()}
              position={[
                project.projectLocation.lat,
                project.projectLocation.lng,
              ]}
              icon={projectIcon.icon}
              eventHandlers={{
                click: () => {
                  setModalContent(
                    {
                      title: project.projectName,
                      content: "",
                      tags: [
                        {
                          label: `${capitalize(
                            project
                              ? project?.projectType || ""
                              : ""
                          )}`,
                          color: COLORS.primaryColor,
                        },
                      ],
                    },
                    {
                      lat: project.projectLocation.lat,
                      lng: project.projectLocation.lng,
                    },
                  );
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        })}
    </>
  );
};
