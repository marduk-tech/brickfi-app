import { Flex, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { getPrimaryHomeType } from "../../../libs/home-type-icons";
import { IDriverPlace } from "../../../types/Project";
import { Loader } from "../../common/loader";
import dynamic from "next/dynamic";
import { useFetchProjects } from "@/hooks/use-project";
import type { ProjectMarkerInput } from "../map-view-v2";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import moment from "moment";
import { capitalize, getMinMaxPrices } from "@/libs/lvnzy-helper";
import MapViewWrapper from "../map-view-google/map-view-wrapper";
const MapViewV2 = dynamic(() => import("../map-view-v2"), { ssr: false });

export function BrickMapCustomer({
  projectIds,
  excludeMapCategories,
}: {
  projectIds: string[];
  excludeMapCategories?: string[];
}) {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const [driverFilters, setDriverFilters] = useState<string[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<IDriverPlace[]>([]);

  const {
    data: allProjects,
    isLoading: allProjectsLoading,
    refetch: refetchProjects,
  } = useFetchProjects({
    projectIds: projectIds.join(","),
  });

  // update filtered drivers when places or filters change
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      console.log("Updating filtered drivers with filters:", driverFilters);
      // const drivers = livindexPlaces.filter((p) =>
      //   driverFilters.includes(p.driver)
      // );
      // console.log("Filtered drivers count:", drivers.length);
      setFilteredDrivers(livindexPlaces);
    }
  }, [livindexPlaces, driverFilters]);
  // log when filtered drivers change
  useEffect(() => {
    console.log("FilteredDrivers updated:", filteredDrivers?.length);
  }, [filteredDrivers]);

  const handleDriverSelect = (value: string[]) => {
    setDriverFilters(value);
  };

  const getCompletionDate = (timeline: any[]) => {
    const lastEntry = timeline[timeline.length - 1];
    return `${moment(timeline[0].startDate, "DD-MM-YYYY").format(
      "ll",
    )} - ${moment(lastEntry.completionDate, "DD-MM-YYYY").format("ll")}`;
  };

  const getProjectMakerContent = (p: any) => {
    return (
      <Flex vertical gap={0}>
        {p.info?.reraProjectId?.projectDetails
          ?.listOfRegistrationsExtensions ? (
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              color: COLORS.textColorMedium,
            }}
          >
            {getCompletionDate(
              p.info.reraProjectId.projectDetails.listOfRegistrationsExtensions,
            )}
          </Typography.Text>
        ) : null}

        <Flex style={{ marginBottom: 16 }}>
          {(p.info.homeType || []).map((t: string) => (
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorMedium,
                marginRight: 3,
              }}
            >
              {capitalize(t)} ·{" "}
            </Typography.Text>
          ))}
          {p.info.unitConfigWithPricing &&
          p.info.unitConfigWithPricing.length &&
          p.info.rate ? (
            <Flex>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginLeft: 2,
                  color: COLORS.textColorMedium,
                }}
              >
                {getMinMaxPrices(
                  p.info.unitConfigWithPricing.map((c: any) => c.price),
                )}{" "}
                ·{" "}
              </Typography.Text>

              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginLeft: 2,
                  color: COLORS.textColorMedium,
                }}
              >
                ₹
                {Math.round(
                  (p.info.rate.minimumUnitCost /
                    (p.info.rate.minimumUnitSize * 1000)) *
                    10,
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
            {(p.media || [])
              .filter(
                (i: any) =>
                  !!i.image &&
                  !!i.image.url &&
                  i.image.tags.length &&
                  !i.image.tags.includes("na"),
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
      </Flex>
    );
  };

  const projectMarkers = useMemo<ProjectMarkerInput[]>(() => {
    return (allProjects || [])
      .filter((p) => p.info?.location?.lat && p.info?.location?.lng)
      .map((p) => {
        const homeTypes: string[] = Array.isArray(p.info?.homeType)
          ? (p.info.homeType as string[])
          : [];

        return {
          id: p._id,
          location: {
            lat: p.info!.location!.lat as number,
            lng: p.info!.location!.lng as number,
          },
          type: getPrimaryHomeType(homeTypes) || homeTypes[0] || "apartment",
          modalContent: {
            title: (
              <Flex vertical style={{ marginBottom: 0 }}>
                {p.info.developerId ? (
                  <Typography.Text
                    style={{
                      color: COLORS.primaryColor,
                      textTransform: "uppercase",
                      fontSize: FONT_SIZE.PARA,
                    }}
                  >
                    {p.info.developerId.name}
                  </Typography.Text>
                ) : null}

                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1 * 0.9,
                    lineHeight: "100%",
                    marginBottom: 8,
                  }}
                >
                  {p.info.name}
                </Typography.Text>
              </Flex>
            ),
            content: getProjectMakerContent(p),
          },
        };
      });
  }, [allProjects]);

  // const projectOptions =
  //   allProjects?.map((project) => ({
  //     value: project._id,
  //     label: project.info.name,
  //     projectId: project._id,
  //   })) || [];

  if (livindexPlacesLoading) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        style={{ width: "100%", marginTop: 100 }}
      >
        <Loader />
        <Typography.Text>Initializing Map..</Typography.Text>
      </Flex>
    );
  }

  if (livindexPlaces) {
    return (
      <Flex vertical style={{ height: "calc(100vh - 120px)", width: "100%" }}>
        <Flex
          gap={16}
          style={{ padding: 8, backgroundColor: "white", zIndex: 1 }}
        >
          {/* <AutoComplete
            style={{ width: 300 }}
            options={projectOptions}
            value={searchValue}
            onChange={handleSearchChange}
            onSelect={handleProjectSelect}
            allowClear={true}
            filterOption={(inputValue, option) =>
              option!.label.toLowerCase().includes(inputValue.toLowerCase())
            }
            placeholder="Search for project name..."
          /> */}
          {/* <Select
            value={homeTypeFilter}
            style={{ width: 200 }}
            loading={false}
            disabled={isSearchMode}
            onChange={handleHomeTypeSelect}
            options={Object.keys(ProjectHomeType).map((k: string) => {
              return {
                value: (ProjectHomeType as any)[k],
                label: (
                  <Flex gap={4}>
                    {getProjectTypeIcon(
                      (ProjectHomeType as any)[k],
                      COLORS.primaryColor
                    )}
                    <Typography.Text>
                      {capitalize((ProjectHomeType as any)[k])}
                    </Typography.Text>
                  </Flex>
                ),
              };
            })}
          /> */}
          {/* <Select
            style={{ width: 350 }}
            mode="multiple"
            showSearch
            placeholder="Select a driver"
            maxTagCount="responsive"
            onChange={handleDriverSelect}
            options={Object.keys(LivIndexDriversConfig).map((k: string) => {
              return {
                value: k,
                label: capitalize((LivIndexDriversConfig as any)[k].label),
              };
            })}
          /> */}
        </Flex>
        <Flex style={{ flex: 1, position: "relative", minHeight: "600px" }}>
          <>
            <Flex
              gap={8}
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                right: 8,
                zIndex: 1000,
                padding: "0 8px",
              }}
            >
              {/* <Typography.Text
                style={{
                  backgroundColor: "white",
                  padding: "4px 8px",
                  borderRadius: 4,
                  marginLeft: "auto",
                }}
              >
                {allProjects
                  ? "Loading projects..."
                  : isSearchMode
                  ? `Showing search result: ${filteredProjects.length} project`
                  : `${filteredProjects.length} projects`}
              </Typography.Text> */}
            </Flex>
            <MapViewWrapper
              key="stable-map-view"
              drivers={filteredDrivers.map((p) => ({
                ...p,
                duration: p.distance ? Math.round(p.distance / 60) : 0,
              }))}
              projects={projectMarkers}
              fullSize={false}
              showLocalities={false}
              showCorridors={true}
              minMapZoom={11}
              categories={Object.keys(DRIVER_CATEGORIES).filter(
                (k) =>
                  !excludeMapCategories || !excludeMapCategories.includes(k),
              )}
            />
          </>
        </Flex>
      </Flex>
    );
  }
}
