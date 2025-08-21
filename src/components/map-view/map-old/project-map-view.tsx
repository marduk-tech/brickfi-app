import { CloseOutlined } from "@ant-design/icons";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Flex, Tag, Tooltip, Typography } from "antd";
import React, { useCallback, useState } from "react";
import { LivIndexDriversConfig, PLACE_TIMELINE } from "../../../libs/constants";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import {
  IDriverPlace,
  IProjectDriver,
  IScoreBreakup,
  Project,
} from "../../../types/Project";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { ConnectivityInfra } from "./connectivity-infra";
const { Paragraph } = Typography;

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint;

const API_KEY = "AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ";

export const ProjectMapView = ({
  project,
  livIndexPlaces,
}: {
  project?: Project;
  livIndexPlaces: IDriverPlace[];
}) => {
  const LivIndexMarker: React.FC<any> = ({
    coordinates,
    zIndex,
    markerId,
    place,
    icon,
    isProject,
  }) => {
    return (
      <React.Fragment key={markerId}>
        <AdvancedMarkerWithRef
          anchorPoint={AdvancedMarkerAnchorPoint[anchorPoint]}
          className="custom-marker"
          position={coordinates}
          zIndex={expandedId === markerId ? 1000 : zIndex}
          onMarkerClick={(marker: google.maps.marker.AdvancedMarkerElement) =>
            console.log(markerId, marker)
          }
        >
          <PlaceCard icon={icon} place={place} isProject={isProject} />
        </AdvancedMarkerWithRef>
      </React.Fragment>
    );
  };

  const [anchorPoint, setAnchorPoint] = useState("BOTTOM" as AnchorPointName);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardExpand = useCallback((id: string) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  }, []);

  if (project && project.livIndexScore && project.livIndexScore.score > 0) {
    const allProjectDrivers: any = [];

    project.livIndexScore.scoreBreakup.map(
      (scoreBreakup: IScoreBreakup, index: number) => {
        scoreBreakup.drivers.map((driver: IProjectDriver) => {
          allProjectDrivers.push(driver);
        });
      }
    );
    return (
      <APIProvider apiKey={API_KEY} libraries={["marker"]}>
        <Map
          style={{
            width: "100%",
            height: "100%",
          }}
          mapId={"bf51a910020fa25a"}
          defaultZoom={project ? 8.8 : 7}
          defaultCenter={
            project
              ? project.metadata.location
              : { lat: 14.5638117, lng: 77.8884163 }
          }
          gestureHandling={"greedy"}
          clickableIcons={false}
          disableDefaultUI
        >
          {allProjectDrivers.map(
            (projectDriver: IProjectDriver, index: number) => {
              const originalLivIndexPlace = projectDriver.place;

              const driverConfig = (LivIndexDriversConfig as any)[
                originalLivIndexPlace!.driver
              ];

              if (
                originalLivIndexPlace!.driver == "highway" ||
                originalLivIndexPlace!.driver == "transit"
              ) {
                return (
                  <ConnectivityInfra
                    connectivityData={originalLivIndexPlace}
                  ></ConnectivityInfra>
                );
              } else {
                let zIndex = index + 1;
                const coordinates = originalLivIndexPlace!.location!;
                if (!coordinates.lat || !coordinates.lng) {
                  return null;
                }

                return (
                  <LivIndexMarker
                    coordinates={originalLivIndexPlace!.location}
                    icon={driverConfig.icon}
                    zIndex={allProjectDrivers.length + 1}
                    place={{
                      ...originalLivIndexPlace,
                      distance: Math.round(
                        projectDriver.mapsDistanceMetres / 1000
                      ),
                    }}
                    markerId={projectDriver._id}
                    isProject={false}
                  ></LivIndexMarker>
                );
              }
            }
          )}
        </Map>
        <LivIndexMarker
          coordinates={project?.metadata!.location}
          icon={{
            name: "FaMapMarkerAlt",
            set: "fa",
          }}
          zIndex={1}
          place={{
            name: project.metadata.name,
            status: "launched",
            description: "",
          }}
          markerId={project!._id}
          isProject={true}
        ></LivIndexMarker>
      </APIProvider>
    );
  }
};

export const PlaceCard = ({
  place,
  icon,
  isProject,
}: {
  place: IDriverPlace;
  icon: {
    name: string;
    set: any;
  };
  isProject: boolean;
}) => {
  const isUnderConstruction = ![
    PLACE_TIMELINE.LAUNCHED,
    PLACE_TIMELINE.POST_LAUNCH,
  ].includes(place.status as any);
  return (
    <Tooltip
      style={{ width: 300 }}
      title={
        <Flex vertical style={{ padding: 2 }}>
          <Flex gap={4} style={{ marginTop: 4 }} align="flex-start">
            <Typography.Text
              style={{
                color: "white",
                fontSize: FONT_SIZE.HEADING_3,
                lineHeight: "100%",
              }}
            >
              {place.name}
            </Typography.Text>
          </Flex>
          <Flex style={{ marginTop: 8 }}>
            {place.distance && (
              <Tag
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                {Math.round(place.distance)} kms away
              </Tag>
            )}
            {isUnderConstruction ? (
              <Tag
                color={COLORS.yellowIdentifier}
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                Under Construction
              </Tag>
            ) : null}
          </Flex>

          {place.details && place.details.oneLiner ? (
            <Paragraph
              style={{
                color: "white",
                height: 130,
                overflowY: "scroll",
                marginTop: 8,
              }}
              ellipsis={{
                rows: 4,
                expandable: true,
              }}
            >
              {place.details?.oneLiner}
            </Paragraph>
          ) : null}
        </Flex>
      }
      trigger="click"
    >
      <Flex
        style={{
          backgroundColor: "white",
          borderRadius: "50%",
          padding: 8,
          borderWidth: "2px",
          borderColor: isUnderConstruction
            ? COLORS.borderColorDark
            : COLORS.borderColor,
          borderStyle: isUnderConstruction ? "dotted" : "solid",
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={18}
          color={isProject ? COLORS.primaryColor : "black"}
        ></DynamicReactIcon>
      </Flex>
    </Tooltip>
  );
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

export const CloseButton: React.FC<{ onClick: (e: any) => void }> = ({
  onClick,
}) => {
  return (
    <div
      style={{
        fontSize: "14px",
        cursor: "pointer",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        marginLeft: "auto",
      }}
      onClick={onClick}
    >
      <CloseOutlined />
    </div>
  );
};
