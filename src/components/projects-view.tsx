import { Button, Col, Flex, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import DynamicReactIcon from "./common/dynamic-react-icon";
import { ProjectCard } from "./common/project-card";
import { LocationAndPriceFilters } from "./location-price-filter";
import { MapView } from "./map-view/map-old/map-view";
import { useDevice } from "../hooks/use-device";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { Project } from "../types/Project";
import { FONT_SIZE } from "../theme/style-constants";

const ProjectsPage: React.FC<{
  projects?: any[];
  projectClick: any;
  drivers: string[];
  streaming: boolean;
}> = ({ projects, projectClick, drivers, streaming }) => {
  const { isMobile } = useDevice();
  const [categoryFilter, setCategoryFilter] = useState();
  const [priceRange, setPriceRange] = useState([300, 1000]);
  const [locationFilter, setLocationFilter] = useState<string[] | undefined>();
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);

  const [toggleMapView, setToggleMapView] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<Project[]>();

  useEffect(() => {
    if (!projects) {
      return;
    }
    captureAnalyticsEvent("app-homepage-open", {});

    let filtered = projects;

    // if (categoryFilter) {
    //   filtered = filtered.filter(
    //     (p: any) =>
    //       !p.projectCategories ||
    //       (p.projectCategories &&
    //         p.projectCategories &&
    //         p.projectCategories.includes(categoryFilter))
    //   );
    // }

    // //  price range filter
    // if (priceRange) {
    //   filtered = filtered.filter((p) => {
    //     if (!p.ui || !p.ui.costSummary) return true;

    //     try {
    //       const costSummary = JSON.parse(p.ui.costSummary);
    //       return (
    //         costSummary.sqftRate >= priceRange[0] &&
    //         costSummary.sqftRate <= priceRange[1]
    //       );
    //     } catch (error) {
    //       console.error("Invalid JSON in costSummary", p.ui.costSummary, error);
    //       return false;
    //     }
    //   });
    // }

    //  location filter
    // if (locationFilter && locationFilter.length > 0) {
    //   filtered = filtered.filter(
    //     (p) =>
    //       !p.ui ||
    //       (p.ui &&
    //         p.ui.locationFilters &&
    //         p.ui.locationFilters.some((location) =>
    //           locationFilter.includes(location)
    //         ))
    //   );
    // }

    setFilteredProjects(filtered);
  }, [categoryFilter, locationFilter, priceRange, projects]);

  const handleApplyFilters = (filters: {
    location: string[];
    priceRange: [number, number];
  }) => {
    setLocationFilter(filters.location);
    setPriceRange(filters.priceRange);
    setIsFiltersModalVisible(false);
  };

  if (filteredProjects) {
    return (
      <>
        {/* <FloatButton
          icon={
            !toggleMapView ? (
              <DynamicReactIcon
                iconName="FaMap"
                color="primary"
                iconSet="fa"
              ></DynamicReactIcon>
            ) : (
              <DynamicReactIcon
                iconName="FaRegListAlt"
                iconSet="fa"
                color="primary"
              ></DynamicReactIcon>
            )
          }
          style={{
            padding: 16,
            marginTop: 16,
            borderRadius: 12,
            cursor: "pointer",
            marginLeft: "auto",
          }}
          onClick={() => setToggleMapView(!toggleMapView)}
        >
          {isMobile ? null : toggleMapView ? "List View" : "Map View"}
        </FloatButton> */}
        <Flex
          vertical
          style={{
            width: "100%",
          }}
          gap={16}
        >
          <Flex
            align={isMobile ? "flex-start" : "center"}
            vertical
            style={{
              marginLeft: 8,
              padding: 0,
            }}
          >
            <Flex
              align="center"
              gap={8}
              justify={isMobile ? "flex-start" : "center"}
              style={{
                overflowX: "scroll",
                whiteSpace: "nowrap",
                width: "100%",
                scrollbarWidth: "none",
              }}
            >
              {/* {aiProjectsCategories.map((cat: any) => {
                return (
                  <Flex
                    vertical
                    align="center"
                    style={{
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 8,
                      backgroundColor:
                        categoryFilter == cat
                          ? COLORS.primaryColor
                          : COLORS.bgColor,
                      border: "1px solid",
                      borderColor: COLORS.borderColorMedium,
                    }}
                    onClick={() => {
                      if (cat == categoryFilter) {
                        setCategoryFilter(undefined);
                      } else {
                        setCategoryFilter(cat);
                        captureAnalyticsEvent("click-homepage-category", {
                          categoryName: cat,
                        });
                      }
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.PARA,
                        fontWeight:
                          categoryFilter && categoryFilter == cat.key
                            ? "bold"
                            : "normal",
                        color:
                          categoryFilter && categoryFilter == cat
                            ? "white"
                            : COLORS.textColorDark,
                      }}
                    >
                      {cat}
                    </Typography.Text>
                  </Flex>
                );
              })} */}
              {/* <Button
                onClick={() => setIsFiltersModalVisible(true)}
                type="default"
                size="small"
                icon={<RiListSettingsLine />}
              >
                Filters
              </Button> */}

              <Typography.Text
                style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: "bold" }}
              >
                {streaming
                  ? "Loading..."
                  : drivers && drivers.length
                  ? "See location insights on the map"
                  : projects && projects.length < 30
                  ? `${projects.length} projects matching your query`
                  : "Projects in North Bangalore"}
              </Typography.Text>
              <Button
                size="small"
                icon={
                  !toggleMapView ? (
                    <DynamicReactIcon
                      iconName="FaMap"
                      color="primary"
                      iconSet="fa"
                      size={16}
                    ></DynamicReactIcon>
                  ) : (
                    <DynamicReactIcon
                      iconName="FaRegListAlt"
                      iconSet="fa"
                      size={16}
                      color="primary"
                    ></DynamicReactIcon>
                  )
                }
                style={{
                  borderRadius: 8,
                  cursor: "pointer",
                  marginLeft: "auto",
                  fontSize: FONT_SIZE.SUB_TEXT,
                  marginRight: isMobile ? 0 : 8,
                }}
                onClick={() => {
                  setToggleMapView(!toggleMapView);
                }}
              ></Button>
            </Flex>
          </Flex>

          {toggleMapView ? (
            <Row>
              <MapView
                projects={filteredProjects}
                drivers={drivers}
                onProjectClick={(projectId: string) => {
                  projectClick(projectId);
                }}
              />
            </Row>
          ) : (
            <Flex
              style={{
                height: isMobile
                  ? "calc(100vh - 290px)"
                  : "calc(100vh - 200px)",
                overflowY: "scroll",
                scrollbarWidth: "none",
              }}
            >
              <Row gutter={[24, 24]} style={{ width: "100%", margin: 0 }}>
                {filteredProjects.length > 0 ? (
                  <>
                    {filteredProjects.map((project) => (
                      <Col
                        key={project._id}
                        xs={24}
                        md={12}
                        lg={6}
                        onClick={() => {
                          projectClick(project._id);
                        }}
                        style={{ padding: isMobile ? 0 : "0 8px" }}
                      >
                        <ProjectCard
                          project={project}
                          showClick={false}
                          key={project._id}
                        />
                      </Col>
                    ))}
                  </>
                ) : (
                  <>
                    <Typography.Text>No Projects Found</Typography.Text>
                  </>
                )}
              </Row>
            </Flex>
          )}
        </Flex>

        <LocationAndPriceFilters
          open={isFiltersModalVisible}
          onClose={() => setIsFiltersModalVisible(false)}
          onApply={handleApplyFilters}
          initialFilters={{
            location: locationFilter,
            priceRange: priceRange as any,
          }}
        />
      </>
    );
  }

  return null;
};

export default ProjectsPage;
