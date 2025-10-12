import { Flex, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import {
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
} from "../../../libs/constants";
import { capitalize } from "../../../libs/lvnzy-helper";
import { IDriverPlace } from "../../../types/Project";
import { Loader } from "../../common/loader";
import { getProjectTypeIcon } from "../../map-view/map-old/project-type-icon";
import dynamic from "next/dynamic";
import { useUser } from "@/hooks/use-user";
import { useFetchProjects } from "@/hooks/use-project";
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

  // const projectOptions =
  //   allProjects?.map((project) => ({
  //     value: project._id,
  //     label: project.info.name,
  //     projectId: project._id,
  //   })) || [];

  if (livindexPlacesLoading) {
    return (
      <Flex vertical align="center" justify="center" style={{ width: "100%", marginTop: 100 }}>
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
            <MapViewV2
              key="stable-map-view"
              drivers={filteredDrivers.map((p) => ({
                ...p,
                duration: p.distance ? Math.round(p.distance / 60) : 0,
              }))}
              projects={allProjects}
              fullSize={false}
              showLocalities={false}
              minMapZoom={11}
              categories={Object.keys(DRIVER_CATEGORIES).filter(
                (k) =>
                  !excludeMapCategories || !excludeMapCategories.includes(k)
              )}
            />
          </>
        </Flex>
      </Flex>
    );
  }
}
