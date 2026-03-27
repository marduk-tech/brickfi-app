import React, { JSX } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import { capitalize, getMinMaxPrices } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { MapModalContent } from "../map-modal";
import { Flex, Tag, Typography } from "antd";
import moment from "moment";
import Link from "next/link";

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

  const getCompletionDate = (timeline: any[]) => {
    const lastEntry = timeline[timeline.length - 1];
    return `${moment(timeline[0].startDate, "DD-MM-YYYY").format(
      "ll"
    )} - ${moment(lastEntry.completionDate, "DD-MM-YYYY").format("ll")}`;
  };

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
                  title: (
                    <Flex vertical style={{ marginBottom: 0 }}>
                      {project.info.developerId ? (
                        <Typography.Text
                          style={{
                            color: COLORS.primaryColor,
                            textTransform: "uppercase",
                            fontSize: FONT_SIZE.PARA,
                          }}
                        >
                          {project.info.developerId.name}
                        </Typography.Text>
                      ) : null}

                      <Typography.Text
                        style={{ fontSize: FONT_SIZE.HEADING_1*.9, lineHeight: "100%", marginBottom: 8 }}
                      >
                        {project.info.name}
                      </Typography.Text>
                    </Flex>
                  ),
                  content: (
                    <Flex vertical gap={0}>
                      {project.info?.reraProjectId?.projectDetails?.listOfRegistrationsExtensions ? <Typography.Text style={{fontSize: FONT_SIZE.HEADING_4, color: COLORS.textColorMedium}}>
                          {getCompletionDate(
                            project.info.reraProjectId.projectDetails
                              .listOfRegistrationsExtensions
                          )}
                        </Typography.Text>: null}
                        
                      <Flex style={{ marginBottom: 16 }}>
                        {(project.info.homeType || []).map((t: string) => (
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.HEADING_4,
                              color: COLORS.textColorMedium,
                              marginRight: 3
                            }}
                          >
                            {capitalize(t)} ·{" "}
                          </Typography.Text>
                        ))}
                        {project.info.unitConfigWithPricing &&
                        project.info.unitConfigWithPricing.length && project.info.rate ? (
                          <Flex>
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                marginLeft: 2,
                                color: COLORS.textColorMedium
                              }}
                            >
                              {getMinMaxPrices(
                                project.info.unitConfigWithPricing.map(
                                  (c: any) => c.price
                                )
                              )}{" "}
                              ·{" "}
                            </Typography.Text>

                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                marginLeft: 2,
                                color: COLORS.textColorMedium
                              }}
                            >
                              ₹
                              {Math.round(
                                (project.info.rate.minimumUnitCost /
                                  (project.info.rate.minimumUnitSize * 1000)) *
                                  10
                              ) / 10}
                              k per sq.ft
                            </Typography.Text>
                          </Flex>
                        ) : null}
                      </Flex>
                      <Flex
                        gap={8}
                        style={{
                          overflowX: "scroll",
                          whiteSpace: "nowrap",
                          width: "100%",
                          scrollbarWidth: "none",
                        }}
                      >
                        <Flex gap={8}>
                          {(project.media || [])
                            .filter(
                              (i: any) =>
                                !!i.image &&
                                !!i.image.url &&
                                i.image.tags.length &&
                                !i.image.tags.includes("na")
                            )
                            .map((i: any) => {
                              return (
                                <div
                                  style={{
                                    backgroundImage: `url('${i.image.url}')`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    width: 200,
                                    height: 200,
                                    borderRadius: 8,
                                    border: `1px solid ${COLORS.borderColor}`,
                                  }}
                                ></div>
                              );
                            })}
                        </Flex>
                      </Flex>
                      <Link
                        href={`/app/brick360/${project.slug || project._id}`}
                        prefetch={false}
                        style={{
                          display: "block",
                          textAlign: "center",
                          padding: "10px 0",
                          marginTop: 16,
                          backgroundColor: COLORS.primaryColor,
                          color: "#fff",
                          borderRadius: 8,
                          fontSize: FONT_SIZE.HEADING_4,
                          textDecoration: "none",
                        }}
                      >
                        Open Report
                      </Link>
                    </Flex>
                  ),
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
    projectType?: string;
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
                  setModalContent({
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
