import React, { JSX } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent } from "../map-modal";

interface ProjectMarkersProps {
  primaryProject?: any;
  projects?: any[];
  currentProjectMarkerIcon?: L.DivIcon | null;
  projectMarkerIcon?: L.DivIcon | null;
  setModalContent: (content: MapModalContent) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const ProjectMarkers = ({
  primaryProject,
  projects,
  currentProjectMarkerIcon,
  projectMarkerIcon,
  setModalContent,
  setInfoModalOpen,
}: ProjectMarkersProps) => {
  const markers: JSX.Element[] = [];

  // Wait for icon to be loaded and verify coordinates
  if (!currentProjectMarkerIcon) {
    return <>{markers}</>;
  }

  // Primary project marker
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
            setModalContent({
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
            });
            setInfoModalOpen(true);
          },
        }}
      />
    );
  }

  // Other project markers
  if (projects && projects.length > 0 && projectMarkerIcon) {
    projects.forEach((project) => {
      if (
        project?.info?.location?.lat &&
        project?.info?.location?.lng &&
        currentProjectMarkerIcon
      ) {
        markers.push(
          <Marker
            key={project._id}
            position={[project.info.location.lat, project.info.location.lng]}
            icon={projectMarkerIcon}
            eventHandlers={{
              click: () => {
                setModalContent({
                  title: project.info?.name || "Unnamed Project",
                  content: project.info?.description || "",
                });
                setInfoModalOpen(true);
              },
            }}
          />
        );
      }
    });
  }

  return <>{markers}</>;
};

interface ProjectsNearbyProps {
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
  }[];
  projectsNearbyIcons: any[];
  projectSqftPricing?: number;
  primaryProject?: any;
  setModalContent: (content: MapModalContent) => void;
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
            0.35
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
                  setModalContent({
                    title: project.projectName,
                    content: "",
                    tags: [
                      {
                        label: `${capitalize(
                          primaryProject
                            ? primaryProject?.info?.homeType?.[0] || ""
                            : ""
                        )}`,
                        color: COLORS.primaryColor,
                      },
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        })}
    </>
  );
};