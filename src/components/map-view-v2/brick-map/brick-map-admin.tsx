import { AutoComplete, Flex, Select, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../hooks/use-livindex-places";
import { useFetchProjects } from "../../../hooks/use-project";
import {
  useFetchProjectsForMapView,
  useProjectSearch,
} from "../../../hooks/use-project-search";
import {
  LivIndexDriversConfig,
  ProjectHomeType,
} from "../../../libs/constants";
import { getPrimaryHomeType } from "../../../libs/home-type-icons";
import { capitalize } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";
import { Loader } from "../../common/loader";
import dynamic from "next/dynamic";
import type { ProjectMarkerInput } from "../map-view-v2";
const MapViewV2 = dynamic(() => import("../map-view-v2"), { ssr: false });

export function BrickMapAdmin() {
  const [homeTypeFilter, setHomeTypeFilter] = useState("");

  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [searchValue, setSearchValue] = useState("");

  // Use different hooks based on whether there's a selected project (search mode)
  const isSearchMode = !!selectedProjectId;
  const { data: allProjects, isLoading: allProjectsLoading } = useFetchProjects(
    {
      homeType: homeTypeFilter,
      searchKeyword: searchValue,
    }
  );

  const [driverFilters, setDriverFilters] = useState<string[]>([
    "industrial-hitech",
    "airport",
  ]);

  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<IDriverPlace[]>([]);

  useEffect(() => {
    if (allProjects && allProjects.length) {
      console.log("Total projects from API:", allProjects.length);
      console.log("Projects filtered by homeType:", homeTypeFilter);
      console.log(
        "Search mode:",
        isSearchMode,
        "Selected project ID:",
        selectedProjectId
      );

      if (isSearchMode && selectedProjectId) {
        // In search mode, show only the selected project
        const selectedProject = allProjects.find(
          (p) => p._id === selectedProjectId
        );
        if (selectedProject) {
          setFilteredProjects([selectedProject]);
        } else {
          setFilteredProjects([]);
        }
      } else {
        // Normal mode - show all projects (API already filters by type)
        setFilteredProjects(allProjects);
      }
    } else {
      setFilteredProjects([]);
    }
  }, [allProjects, homeTypeFilter, isSearchMode, selectedProjectId]);

  // update filtered drivers when places or filters change
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      console.log("Updating filtered drivers with filters:", driverFilters);
      const drivers = livindexPlaces.filter((p) =>
        driverFilters.includes(p.driver)
      );
      console.log("Filtered drivers count:", drivers.length);
      setFilteredDrivers(drivers);
    }
  }, [livindexPlaces, driverFilters]);

  // log when filtered drivers change
  useEffect(() => {
    console.log("FilteredDrivers updated:", filteredDrivers?.length);
  }, [filteredDrivers]);

  const handleHomeTypeSelect = (value: string) => {
    setHomeTypeFilter(value);
    // Clear project search when dropdown is used (exit search mode)
    setSearchValue("");
    setSelectedProjectId(null);
  };
  const handleDriverSelect = (value: string[]) => {
    setDriverFilters(value);
  };

  const handleProjectSelect = (_: any, option: any) => {
    setSelectedProjectId(option.projectId);
    setSearchValue(option.label);

    // When a project is selected, we switch to search mode
    // This will use the allProjects data and filter to show only the selected project
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (!value) {
      setSelectedProjectId(null);
      // When search is cleared, we exit search mode and return to normal filtering
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSelectedProjectId(null);
  };

  const projectOptions =
    allProjects?.map((project) => ({
      value: project._id,
      label: project.info.name,
      projectId: project._id,
    })) || [];

  const projectMarkers = useMemo<ProjectMarkerInput[]>(() => {
    return filteredProjects
      .filter((p) => p?.info?.location?.lat && p?.info?.location?.lng)
      .map((p) => {
        const homeTypes: string[] = Array.isArray(p.info?.homeType)
          ? p.info.homeType
          : [];
        return {
          id: p._id,
          location: { lat: p.info.location.lat, lng: p.info.location.lng },
          type: getPrimaryHomeType(homeTypes) || homeTypes[0] || "apartment",
          modalContent: {
            title: p.info?.name || "Project",
            content: "",
          },
        };
      });
  }, [filteredProjects]);

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces) {

    return (
      <Flex vertical style={{ height: "calc(100vh - 64px)" }}>
        <Flex
          gap={16}
          style={{ padding: 8, backgroundColor: "white", zIndex: 1 }}
        >
          <AutoComplete
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
          />
          <Select
            value={homeTypeFilter}
            style={{ width: 200 }}
            loading={allProjectsLoading}
            disabled={isSearchMode}
            onChange={handleHomeTypeSelect}
            options={Object.keys(ProjectHomeType).map((k: string) => {
              return {
                value: (ProjectHomeType as any)[k],
                label: (
                  <Flex gap={4}>
                    {/* {getProjectTypeIcon(
                      (ProjectHomeType as any)[k],
                      COLORS.primaryColor
                    )} */}
                    <Typography.Text>
                      {capitalize((ProjectHomeType as any)[k])}
                    </Typography.Text>
                  </Flex>
                ),
              };
            })}
          />
          <Select
            style={{ width: 350 }}
            mode="multiple"
            defaultValue={["industrial-hitech", "airport"]}
            showSearch
            maxTagCount="responsive"
            onChange={handleDriverSelect}
            options={Object.keys(LivIndexDriversConfig).map((k: string) => {
              return {
                value: k,
                label: capitalize((LivIndexDriversConfig as any)[k].label),
              };
            })}
          />
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
              <Typography.Text
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
              </Typography.Text>
            </Flex>
            <MapViewV2
              key="stable-map-view"
              drivers={filteredDrivers.map((p) => ({
                ...p,
                duration: p.distance ? Math.round(p.distance / 60) : 0,
              }))}
              projects={projectMarkers}
              projectId={selectedProjectId || undefined}
              fullSize={false}
              showLocalities={true}
              showCorridors={true}
            />
          </>
        </Flex>
      </Flex>
    );
  }
}
