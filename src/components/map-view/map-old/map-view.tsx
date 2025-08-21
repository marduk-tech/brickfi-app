import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import React, { useCallback, useEffect, useState } from "react";
import { useDevice } from "../../../hooks/use-device";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import { captureAnalyticsEvent } from "../../../libs/lvnzy-helper";
import { IProjectDriver, Project } from "../../../types/Project";
import { ConnectivityInfra } from "./connectivity-infra";
import { LivIndexMarker } from "./liv-index-marker";
import { getProjectsMapData } from "./map-util";
import { ProjectMarker } from "./project-marker";
import { useFetchProjectById } from "../../../hooks/use-project";
import { useFetchCorridors } from "../../../hooks/use-corridors";
import { Corridor } from "../../../types/Corridor";
import { Circle } from "./shapes/circle";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { Flex, Tooltip, Typography } from "antd";
import { Loader } from "../../common/loader";

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

// Bright map style
const mapStyles = [
  {
    featureType: "all",
    elementType: "all",
    stylers: [
      { saturation: "32" },
      { lightness: "-3" },
      { visibility: "on" },
      { weight: "1.18" },
    ],
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "all",
    stylers: [{ saturation: "-70" }, { lightness: "14" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ saturation: "100" }, { lightness: "-14" }],
  },
  {
    featureType: "water",
    elementType: "labels",
    stylers: [{ visibility: "off" }, { lightness: "12" }],
  },
];

export const MapView = ({
  projectId,
  projects,
  drivers,
  onProjectClick,
  mapTitle,
}: {
  projectId?: string;
  projects: Project[];
  drivers: string[];
  onProjectClick?: any;
  mapTitle?: string;
}) => {
  const { data: livIndexPlaces } = useFetchAllLivindexPlaces(drivers);
  const { data: projectData } = useFetchProjectById(projectId!);
  const [mapDrivers, setMapDrivers] = useState<string[]>();
  const { data: corridors, isLoading: isCorridorsDataLoading } =
    useFetchCorridors();

  const [projectsData, setProjectsData] = useState<any[]>([]);

  useEffect(() => {
    if (projects && projects.length) {
      setProjectsData(
        getProjectsMapData({ projects: projects })
          .sort((a, b) => b.position!.lat - a.position!.lat)
          .map((dataItem, index) => ({ ...dataItem, zIndex: index }))
      );
    }
  }, [projects]);

  useEffect(() => {
    if (drivers && drivers.length) {
      setMapDrivers(drivers);
    } else if (projectId) {
      if (projectData) {
        if (!drivers || !drivers.length) {
          // If no drivers are passed, show project drivers.
          let projectDrivers: string[] = [];
          if (projectData.livIndexScore && projectData.livIndexScore.score) {
            projectData.livIndexScore.scoreBreakup.forEach((scoreBreakup) => {
              projectDrivers = [
                ...projectDrivers,
                ...scoreBreakup.drivers
                  .sort((d1: IProjectDriver, d2: IProjectDriver) => {
                    return (
                      (d1.mapsDurationSeconds + d1.mapsDistanceMetres) / 2 -
                      (d2.mapsDurationSeconds + d2.mapsDistanceMetres) / 2
                    );
                  })
                  .slice(0, 4)
                  .map((driver) => driver.place._id),
              ];
            });
            setMapDrivers(projectDrivers);
          }
        }
      }
    }
  }, [projectId, drivers, projectData]);

  const [anchorPoint] = useState<AnchorPointName>("BOTTOM");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLivIndexId, setExpandedLivIndexId] = useState<string | null>(
    null
  );

  const onMouseEnter = useCallback((id: string | null) => setHoverId(id), []);
  const onMouseLeave = useCallback(() => setHoverId(null), []);
  const { isMobile } = useDevice();

  const onMapClick = useCallback(() => {
    setSelectedId(null);
    setExpandedId(null);
    setExpandedLivIndexId(null);
  }, []);

  const handleCardExpand = useCallback((id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  const handleLivIndexExpand = useCallback((id: string) => {
    setExpandedLivIndexId((prevId) => (prevId === id ? null : id));
  }, []);

  if (!livIndexPlaces) {
    return (
      <Flex align="center" style={{ width: "100%" }} justify="center" gap={8}>
        <Loader size="small"></Loader>
        <Typography.Text>Loading map..</Typography.Text>
      </Flex>
    );
  }

  if (projectsData && projects && livIndexPlaces) {
    const connectivityData = livIndexPlaces
      .filter(
        (place) => place.driver === "highway" || place.driver === "transit"
      )
      .filter((place) => mapDrivers && mapDrivers.includes(place._id));

    return (
      <APIProvider
        apiKey={API_KEY}
        libraries={["marker"]}
        onLoad={() => {
          captureAnalyticsEvent("projects-map-view-loaded", {});
        }}
      >
        <Map
          styles={mapStyles}
          mapTypeId={"roadmap"}
          mapId={"bf51a910020fa25a"}
          style={{
            width: "100%",
          }}
          defaultZoom={12}
          minZoom={7}
          defaultCenter={
            projectId &&
            projectData &&
            projectData.info.location &&
            projectData.info.location.lat
              ? {
                  lat: projectData.info.location.lat,
                  lng: projectData.info.location.lng,
                }
              : { lat: 13.201304, lng: 77.602374 }
          }
          gestureHandling={"greedy"}
          onClick={onMapClick}
          clickableIcons={false}
          disableDefaultUI
        >
          {/* Sub Area Polygons */}
          {/* {livIndexPlaces
            ?.filter((place) => place.driver == "sub-area")
            .map((area) => {
              return (
                <Polygon
                  key={area.name}
                  paths={[
                    area.features.coordinates[0].map((coord: number[]) => ({
                      lat: coord[1],
                      lng: coord[0],
                    })),
                  ]}
                  fillColor="#808080"
                  fillOpacity={0.1}
                  strokeColor="#808080"
                  strokeWeight={1}
                />
              );
            })} */}

          {/* Corridors */}
          {corridors &&
            corridors
              .filter((c) =>
                projectData?.info.corridors
                  .map((cc: any) => cc.corridorId)
                  .includes(c._id)
              )
              .map((c: Corridor) => {
                return (
                  <Circle
                    fillOpacity={0.2}
                    strokeColor="transparent"
                    center={{ lat: c.location.lat, lng: c.location.lng }}
                    radius={10000}
                    zIndex={-999}
                  />
                );
              })}

          {/* Corridors */}
          {corridors &&
            corridors
              .filter((c) =>
                projectData?.info.corridors
                  .map((cc: any) => cc.corridorId)
                  .includes(c._id)
              )
              .map((c: Corridor) => {
                return (
                  <React.Fragment key={c._id}>
                    <Tooltip
                      title={
                        <Flex vertical>
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.HEADING_4,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {c.name}
                          </Typography.Text>
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.PARA,
                              color: COLORS.bgColor,
                            }}
                          >
                            {c.description}
                          </Typography.Text>
                        </Flex>
                      }
                    >
                      <AdvancedMarkerWithRef
                        anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
                        className="custom-marker boun"
                        position={c.location}
                        zIndex={1}
                        onMarkerClick={() => {}}
                        onMouseEnter={() => onMouseEnter(c._id)}
                        onMouseLeave={onMouseLeave}
                        style={{
                          transform: `scale(${hoverId === c._id ? 1.05 : 1})`,
                          animation: "bounceAnimation 1s infinite",
                        }}
                      >
                        <DynamicReactIcon
                          iconName="FaMapLocation"
                          iconSet="fa6"
                          size={24}
                          color={COLORS.borderColorDark}
                        ></DynamicReactIcon>
                      </AdvancedMarkerWithRef>
                    </Tooltip>
                  </React.Fragment>
                );
              })}

          {/** Current Project Marker */}
          {projectData && (
            <AdvancedMarkerWithRef
              anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
              className="custom-marker boun"
              position={projectData?.info.location}
              zIndex={1}
              onMarkerClick={() => {}}
              onMouseEnter={() => onMouseEnter(projectData._id)}
              onMouseLeave={onMouseLeave}
              style={{
                transform: `scale(${hoverId === projectData._id ? 1.05 : 1})`,
                animation: "bounceAnimation 1s infinite",
              }}
            >
              <DynamicReactIcon
                iconName="IoLocation"
                iconSet="io5"
                size={48}
                color={COLORS.textColorDark}
              ></DynamicReactIcon>
            </AdvancedMarkerWithRef>
          )}

          {/* Project Markers */}
          {projectsData.map(
            ({ id, zIndex: zIndexDefault, position, project }) => {
              let zIndex = zIndexDefault;

              if (hoverId === id) {
                zIndex = projectsData.length + 1;
              }

              if (selectedId === id) {
                zIndex = projectsData.length;
              }

              return (
                <React.Fragment key={id}>
                  <AdvancedMarkerWithRef
                    anchorPoint={AdvancedMarkerAnchorPoint[anchorPoint]}
                    className="custom-marker"
                    position={position}
                    zIndex={zIndex}
                    onMarkerClick={(
                      marker: google.maps.marker.AdvancedMarkerElement
                    ) => {
                      console.log(id, marker);
                    }}
                    onMouseEnter={() => onMouseEnter(id)}
                    onMouseLeave={onMouseLeave}
                    style={{
                      transform: `scale(${
                        [hoverId, selectedId].includes(id) ? 1.05 : 1
                      })`,
                      animation: projectId
                        ? "none bounceAnimation 1s infinite"
                        : "none",
                    }}
                  >
                    <ProjectMarker
                      disableModal={!!projectId}
                      project={project}
                      isExpanded={expandedId === id}
                      showClick={projects && projects.length > 1}
                      onProjectClick={() => {
                        onProjectClick(project._id);
                      }}
                    />
                  </AdvancedMarkerWithRef>
                </React.Fragment>
              );
            }
          )}

          {/* LivIndex Markers */}
          {livIndexPlaces
            ?.filter(
              (place) =>
                place.driver !== "highway" &&
                place.driver !== "transit" &&
                mapDrivers &&
                mapDrivers.includes(place._id)
            )
            .map((place) => (
              <React.Fragment key={place._id}>
                <AdvancedMarkerWithRef
                  anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
                  className="custom-marker"
                  position={place.location}
                  zIndex={1}
                  onMarkerClick={() => {}}
                  onMouseEnter={() => onMouseEnter(place._id)}
                  onMouseLeave={onMouseLeave}
                  style={{
                    transform: `scale(${hoverId === place._id ? 1.05 : 1})`,
                  }}
                >
                  <LivIndexMarker place={place} />
                </AdvancedMarkerWithRef>
              </React.Fragment>
            ))}

          {connectivityData &&
            connectivityData.map((driver) => {
              return (
                <ConnectivityInfra
                  connectivityData={driver}
                ></ConnectivityInfra>
              );
            })}
        </Map>
      </APIProvider>
    );
  }
};

export const AdvancedMarkerWithRef = (
  props: AdvancedMarkerProps & {
    onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement) => void;
  }
) => {
  const { children, onMarkerClick, ...advancedMarkerProps } = props;
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      onClick={() => {
        if (marker) {
          onMarkerClick(marker);
        }
      }}
      ref={markerRef}
      {...advancedMarkerProps}
    >
      {children}
    </AdvancedMarker>
  );
};
