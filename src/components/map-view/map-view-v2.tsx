import * as turf from "@turf/turf";
import { Flex, Modal, Tag, Typography } from "antd";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { renderToString } from "react-dom/server";
const { Paragraph } = Typography;

import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFetchCorridors } from "../../hooks/use-corridors";
import { useDevice } from "../../hooks/use-device";
import { useFetchLocalities } from "../../hooks/use-localities";
import { useFetchProjectById } from "../../hooks/use-project";
import {
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
  PLACE_TIMELINE,
  SurroundingElementLabels,
} from "../../libs/constants";
import {
  capitalize,
  driverStatusLabel,
  renderCitations,
  rupeeAmountFormat,
} from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace, ISurroundingElement } from "../../types/Project";
import DynamicReactIcon, {
  dynamicImportMap,
} from "../common/dynamic-react-icon";
import useStore from "../metro-mapper/store";
import { LocalityMarkerIcon } from "./locality-marker-icon";
import { MapPolygons } from "./map-polygons";
import { FlickerPolyline } from "./shapes/flicker-polyline";

type GeoJSONCoordinate = [number, number];
type GeoJSONLineString = GeoJSONCoordinate[];
type GeoJSONMultiLineString = GeoJSONLineString[];

interface GeoJSONGeometry {
  type: "Point" | "LineString" | "MultiLineString";
  coordinates: GeoJSONCoordinate | GeoJSONLineString | GeoJSONMultiLineString;
}

interface GeoJSONFeature {
  type: "Feature";
  properties?: {
    strokeColor?: string;
    name?: string;
    Name?: string;
    status?: string;
  };
  geometry: GeoJSONGeometry;
}

interface GeoJSONPointFeature extends GeoJSONFeature {
  geometry: {
    type: "Point";
    coordinates: GeoJSONCoordinate;
  };
}

type RoadDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
};

type TransitDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
};

/**
 * Gets the icon for map.
 * @param iconName - React Icons -  icon name
 * @param iconSet - React Icons - icon set
 * @param toBounce - Whether icon should bounce.
 * @param text - Text to display alongside icon (optional)
 * @param driver - Driver object.
 * @param style - style of the icon including color, bg color, size
 * @returns
 */
async function getIcon(
  iconName?: string,
  iconSet?: any,
  toBounce?: boolean,
  text?: string,
  driver?: IDriverPlace,
  style?: {
    iconColor?: string;
    iconBgColor?: string;
    iconSize?: number;
    borderColor?: string;
    containerWidth?: number;
  }
) {
  let IconComp = null;
  if (!dynamicImportMap[iconSet]) {
    console.warn(`Icon set ${iconSet} not found.`);
    return null;
  }
  let isUnderConstruction = false;
  if (driver) {
    isUnderConstruction = ![
      PLACE_TIMELINE.LAUNCHED,
      PLACE_TIMELINE.PARTIAL_LAUNCH,
      PLACE_TIMELINE.POST_LAUNCH,
    ].includes(driver.status as any);
  }

  try {
    const iconSetModule = iconName ? await dynamicImportMap[iconSet]() : null;
    IconComp = iconName ? (iconSetModule as any)[iconName] || null : null;
  } catch (error) {
    console.error(`Error loading icon ${iconName} from ${iconSet}`, error);
  }
  const iconMarkup = renderToString(
    <div
      style={{
        backgroundColor: style?.iconBgColor || "white",
        borderRadius: style?.containerWidth
          ? style.containerWidth / 10
          : text
          ? "24px"
          : "50%",
        padding: text ? 2 : 0,
        height: text ? "auto" : (style?.iconSize || 20) * 1.4,
        width: style?.containerWidth
          ? style.containerWidth
          : text
          ? 80
          : (style?.iconSize || 20) * 1.4,
        display: "flex",
        alignItems: "center",
        borderColor: style?.borderColor
          ? style.borderColor
          : isUnderConstruction
          ? COLORS.yellowIdentifier
          : COLORS.borderColorDark,
        borderStyle: isUnderConstruction ? "dashed" : "solid",

        justifyContent: "center",
        animation: toBounce ? "bounceAnimation 1s infinite" : "none",
        boxShadow: "0 0 6px rgba(0,0,0,0.3)",
        textWrap: "nowrap",
      }}
    >
      <IconComp
        size={style?.iconSize || 14}
        color={
          style?.iconColor
            ? style.iconColor
            : isUnderConstruction
            ? COLORS.yellowIdentifier
            : COLORS.textColorDark
        }
      />
      {text ? (
        <Flex style={{ marginLeft: 2 }}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.SUB_TEXT,
              fontWeight: 500,
              color: style?.iconColor || COLORS.textColorDark,
            }}
          >
            {text}
          </Typography.Text>
        </Flex>
      ) : null}
    </div>
  );
  const leafletIcon = L.divIcon({
    html: iconMarkup,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  return leafletIcon!;
}

//  handle map resizing
const MapCenterHandler = ({
  projectData,
  projects,
}: {
  projectData: any;
  projects?: any[];
}) => {
  const map = useMap();
  useEffect(() => {
    if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        13
      );
    } else if (projects && projects.length && projects.length < 10) {
      const projectsLoc = turf.points(
        projects
          .filter((p) => !!p.info.location && !!p.info.location.lat)
          .map((p) => {
            return [p.info.location.lng, p.info.location.lat];
          })
      );

      const center = turf.center(projectsLoc);
      map.setView(center.geometry.coordinates.reverse() as LatLngTuple, 12);
      console.warn("Project data missing location:", projectData);
    }
  }, [projectData, map, projects]);

  return null;
};

/**
 * Only renders drivers when they are in the view window.
 * @param param
 * @returns
 */
const BoundsAwareDrivers = ({
  renderRoadDrivers,
  renderTransitDrivers,
  renderSimpleDrivers,
}: {
  renderRoadDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderTransitDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderSimpleDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useEffect(() => {
    const updateBounds = () => {
      setBounds(map.getBounds());
    };

    // Update
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);

  return (
    <>
      {renderRoadDrivers(bounds)}
      {renderTransitDrivers(bounds)}
      {renderSimpleDrivers(bounds)}
    </>
  );
};

// TODO: Why do we need this?
const MapResizeHandler = () => {
  const map = useMap();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // handle map refresh
  const handleMapRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      map.invalidateSize();
      map.setView(map.getCenter(), map.getZoom());
    }, 100);
  }, [map]);

  useEffect(() => {
    map.on("layeradd layerremove", handleMapRefresh);
    return () => {
      map.off("layeradd layerremove", handleMapRefresh);
    };
  }, [map, handleMapRefresh]);

  useEffect(() => {
    containerRef.current = map.getContainer();
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleMapRefresh);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [map, handleMapRefresh]);

  return null;
};

/**
 * Process driver data into polygon format
 */
const processDriversToPolygons = (
  data: any[],
  filterByDriverTypes = true,
  selectedDriverFilters: string[] = []
) => {
  return data
    .filter((driver) => {
      const hasGeojson = driver.details?.osm?.geojson;
      const matchesType =
        !filterByDriverTypes ||
        selectedDriverFilters.length === 0 ||
        selectedDriverFilters.includes(driver.driver);
      return hasGeojson && matchesType;
    })
    .map((driver) => {
      try {
        const geojson =
          typeof driver.details.osm.geojson === "string"
            ? JSON.parse(driver.details.osm.geojson)
            : driver.details.osm.geojson;

        if (!geojson || geojson.type !== "Polygon") {
          return null;
        }

        return {
          id: driver._id,
          positions: geojson.coordinates[0].map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          ),
          name: driver.name,
          description: driver.details?.description || "",
        };
      } catch (error) {
        console.error("Error processing polygon data:", error);
        return null;
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
};

// Helper component to capture map instance
const MapInstanceCapture = ({
  onMapReady,
}: {
  onMapReady: (map: any) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

const MapViewV2 = ({
  drivers,
  projectId,
  projects,
  fullSize,
  surroundingElements,
  projectsNearby,
  projectSqftPricing,
  showLocalities,
  onMapReady,
  showCorridors = true,
  minMapZoom = 12,
  categories,
  hideAllFilters,
}: {
  drivers?: any[];
  projectId?: string;
  projects?: any[];
  fullSize: boolean;
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
  }[];
  projectSqftPricing?: number;
  showLocalities?: boolean;
  onMapReady?: (map: any) => void;
  showCorridors?: boolean;
  minMapZoom?: number;
  categories?: string[];
  hideAllFilters?: boolean;
}) => {
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [driverFilters, setDriverFilters] = useState<any[]>([]);

  //repetitive category checks
  const showCategorySelection = categories && categories.length > 1;
  const noCategoriesProvided = !categories || categories.length === 0;
  const hasCategories = categories && categories.length > 0;
  const showDriverFilters = driverFilters.length > 1;

  const { data: corridors, isLoading: isCorridorsDataLoading } =
    useFetchCorridors();
  const { data: localities, isLoading: isLocalitiesDataLoading } =
    useFetchLocalities();
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>();

  // first available category from DRIVER_CATEGORIES
  const getDefaultCategory = () => {
    if (hasCategories && categories.length > 0) return categories[0];
    const allCategories = Object.keys(DRIVER_CATEGORIES);
    return allCategories[0];
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(
    getDefaultCategory()
  );
  const currentSelectedCategory = selectedCategory;

  const { isMobile } = useDevice();

  useEffect(() => {
    if (hasCategories && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, hasCategories]);

  // Reset selected driver filter when category changes
  useEffect(() => {
    setSelectedDriverFilter(undefined);
  }, [selectedCategory]);
  const [uniqueSurroundingElements, setUniqueSurroundingElements] = useState<
    ISurroundingElement[]
  >([]);
  const [selectedSurroundingElementType, setSelectedSurroundingElementType] =
    useState<string>();

  const [modalContent, setModalContent] = useState<{
    title: string;
    tags?: { label: string; color: string }[];
    titleIcon?: ReactNode;
    content: string;
    subHeading?: ReactNode;
    footerContent?: ReactNode;
  }>();

  // Get primary project from projects array instead of fetching
  const { data: primaryProject } = useFetchProjectById(projectId || "");

  /**
   * Icons for simple drivermarkers
   */
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<any[]>(
    []
  );

  /**
   * Icons for simple drivermarkers
   */
  const [surroundingElementIcons, setSurroundingElementIcons] = useState<any[]>(
    []
  );

  const [projectsNearbyIcons, setProjectsNearbyIcons] = useState<any[]>([]);
  const [currentProjectMarkerIcon, setCurrentProjectMarkerIcon] =
    useState<L.DivIcon | null>(null);
  const [projectMarkerIcon, setProjectMarkerIcon] = useState<L.DivIcon | null>(
    null
  );
  const [transitStationIcon, setTransitStationIcon] =
    useState<L.DivIcon | null>(null);

  const [roadIcon, setRoadIcon] = useState<L.DivIcon | null>(null);

  const highlightedDrivers = useStore(
    (state) => state.values["highlightDrivers"]
  );

  const isDriverMatchingFilter = (driver: IDriverPlace): boolean => {
    if (!selectedDriverFilter) return true;

    // Check for custom filter
    if (hasCategories) {
      for (const category of categories) {
        const categoryData =
          DRIVER_CATEGORIES[category as keyof typeof DRIVER_CATEGORIES];
        const customFilters = (categoryData as any)?.filters;
        const onFilterFunc = (categoryData as any)?.onFilter;

        if (customFilters && onFilterFunc) {
          // Check if selectedDriverFilter is a custom filter key
          const isCustomFilter = customFilters.some(
            (filter: any) => filter.key === selectedDriverFilter
          );
          if (isCustomFilter) {
            const result = onFilterFunc(selectedDriverFilter, driver);
            return result;
          }
        }
      }
    }

    // Fallback to driver type matching
    const result = selectedDriverFilter === driver.driver;
    return result;
  };

  // Setting icons for simple drivermarkers
  useEffect(() => {
    async function fetchDriverIcons() {
      const icons = await Promise.all(
        drivers!.map(async (driver) => {
          const iconConfig = (LivIndexDriversConfig as any)[driver.driver];

          if (!iconConfig) {
            console.warn(
              `No icon config found for driver type: ${driver.driver}`
            );
            return null;
          }

          const baseIcon = await getIcon(
            iconConfig.icon.name,
            iconConfig.icon.set,
            false,
            undefined,
            driver
          );

          return baseIcon
            ? {
                icon: baseIcon,
                driverId: driver._id,
                duration: driver?.duration,
              }
            : null;
        })
      );

      const validIcons = icons.filter(Boolean);
      setSimpleDriverMarkerIcons(validIcons);
    }

    // filter that has matching drivers
    const findValidFilter = (
      filters: any[],
      drivers: any[],
      categoryData: any
    ) => {
      for (const filter of filters) {
        if (
          typeof filter === "object" &&
          filter.key &&
          categoryData?.onFilter
        ) {
          const hasMatchingDrivers = drivers.some((driver) =>
            categoryData.onFilter(filter.key, driver)
          );
          if (hasMatchingDrivers) {
            return filter.key;
          }
        } else if (typeof filter === "string") {
          const hasMatchingDrivers = drivers.some(
            (driver) => driver.driver === filter
          );
          if (hasMatchingDrivers) {
            return filter;
          }
        }
      }
      return null;
    };

    // Fetch icons, set unique driver types based on categories
    if (drivers && drivers?.length) {
      fetchDriverIcons();

      // Set driver filters - use custom filters if available, otherwise use driver types
      if (hasCategories && selectedCategory) {
        // Get data for the currently selected category only
        const categoryData =
          DRIVER_CATEGORIES[selectedCategory as keyof typeof DRIVER_CATEGORIES];
        const customFilters = (categoryData as any)?.filters || [];

        if (customFilters.length > 0) {
          // Use custom filters for the selected category
          setDriverFilters(customFilters);

          // Find the first filter that has matching drivers
          const validFilter = findValidFilter(
            customFilters,
            drivers,
            categoryData
          );
          setSelectedDriverFilter(validFilter || customFilters[0].key);
        } else {
          // Fallback to driver types for the selected category
          const driverTypes = (categoryData?.drivers || []).filter(
            (driverType) => drivers.some((d) => d.driver === driverType)
          );
          setDriverFilters(driverTypes);

          // Find the first driver type that has matching drivers
          const validDriverType = findValidFilter(driverTypes, drivers, null);
          setSelectedDriverFilter(validDriverType || driverTypes[0]);
        }
      } else {
        // use unique driver types - no categories provided
        const uniqueDriverTypes = Array.from(
          new Set(drivers.map((d) => d.driver))
        );
        setDriverFilters(uniqueDriverTypes);
      }
    }
  }, [drivers, categories, selectedCategory, hasCategories]);

  // Setting the unique surrounding elements for filters
  useEffect(() => {
    const uniqueElements: ISurroundingElement[] = [];

    async function setElementIcons(elements: ISurroundingElement[]) {
      const elementIcons = [];
      for (const element of elements) {
        const icon = (SurroundingElementLabels as any)[element.type].icon;
        const elementIcon = await getIcon(
          icon.name,
          icon.set,
          false,
          undefined,
          undefined,
          {
            iconSize: 16,
            iconBgColor: "white",
            iconColor:
              element.impact > 0
                ? COLORS.greenIdentifier
                : COLORS.redIdentifier,
          }
        );
        elementIcons.push({ type: element.type, icon: elementIcon });
      }
      setSurroundingElementIcons(elementIcons);
    }

    if (surroundingElements && surroundingElements.length) {
      surroundingElements.forEach((e: ISurroundingElement) => {
        if (!uniqueElements.map((ue) => ue.type).includes(e.type)) {
          uniqueElements.push(e);
        }
      });
      setUniqueSurroundingElements(uniqueElements);
      if (uniqueElements.length == 1) {
        setSelectedSurroundingElementType(uniqueElements[0].type);
      }
      setElementIcons(uniqueElements);
    }
  }, [surroundingElements]);

  // Setting icon for project marker
  useEffect(() => {
    async function updateProjectIcons() {
      const currentProjectIcon = await getIcon(
        "IoLocation",
        "io5",
        true,
        projectsNearby && projectsNearby.length
          ? `₹${rupeeAmountFormat(`${projectSqftPricing}`)} /sqft`
          : primaryProject?.info.name.length > 20
          ? `${primaryProject?.info.name.substring(0, 20)}..`
          : primaryProject?.info.name,
        undefined,
        {
          iconBgColor: COLORS.primaryColor,
          iconColor: "white",
          borderColor: "white",
          containerWidth: projectsNearby && projectsNearby.length ? 80 : 135,
          iconSize: projectsNearby && projectsNearby.length ? 18 : 16,
        }
      );
      setCurrentProjectMarkerIcon(currentProjectIcon);
      const projectIcon = await getIcon(
        "IoLocation",
        "io5",
        false,
        undefined,
        undefined,
        {
          iconBgColor: "white",
          iconColor: COLORS.textColorDark,
          iconSize: 24,
          borderColor: COLORS.primaryColor,
        }
      );
      setProjectMarkerIcon(projectIcon);

      const transitStationIcon = await getIcon(
        "FaTrainSubway",
        "fa6",
        false,
        undefined,
        undefined,
        {
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: 12,
        }
      );
      setTransitStationIcon(transitStationIcon);

      const roadIcon = await getIcon(
        "FaRoad",
        "fa",
        false,
        undefined,
        undefined,
        {
          iconBgColor: COLORS.textColorDark,
          iconColor: "white",
          iconSize: 14,
        }
      );
      setRoadIcon(roadIcon);
    }
    updateProjectIcons();
  }, [primaryProject]);

  // Settings icons for nearby projects
  useEffect(() => {
    async function setIcons() {
      const icons = [];
      for (const project of projectsNearby!) {
        const icon = await getIcon(
          "MdHomeWork",
          "md",
          false,
          `${project.sqftCost} /sqft`
        );
        icons.push({
          name: project.projectName,
          icon,
        });
      }
      setProjectsNearbyIcons(icons);
    }
    if (projectsNearby && projectsNearby.length) {
      setIcons();
    }
  }, [projectsNearby]);

  const processRoadFeatures = (features: GeoJSONFeature[]) => {
    return features.flatMap((feature) => {
      if (feature.type === "Feature" && feature.geometry) {
        if (feature.geometry.type === "LineString") {
          const coords = feature.geometry.coordinates as [number, number][];
          return [
            {
              coordinates: coords,
              properties: feature.properties,
            },
          ];
        } else if (feature.geometry.type === "MultiLineString") {
          const coords = feature.geometry.coordinates as [number, number][][];
          return coords.map((line) => ({
            coordinates: line,
            properties: feature.properties,
          }));
        }
      }
      return [];
    });
  };

  const renderLocalities = () => {
    if (!localities) {
      return null;
    }

    const LocalityIcon = L.divIcon({
      className: "", // prevent default icon styles
      html: renderToString(<LocalityMarkerIcon />),
      iconSize: [100, 100],
      iconAnchor: [50, 50],
    });
    return localities!
      .filter((l) => !!l.location && !!l.location.lat)
      .map((c) => {
        return (
          <>
            <Marker
              key={`rpple-${c._id}`}
              icon={LocalityIcon}
              position={[c.location.lat, c.location.lng]}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: c.name,
                    content: "",
                    tags: [
                      { label: "Growth corridor", color: COLORS.textColorDark },
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          </>
        );
      });
  };

  const CorridorsComponent = () => {
    const [corridorsElements, setCorridorElements] = useState();

    useEffect(() => {
      if (!corridors) {
        return;
      }
      const loadIcons = async () => {
        const elements = await Promise.all(
          corridors.map(async (c) => {
            const CorridorIcon = await getIcon(
              "LuMilestone",
              "lu",
              false,
              c.name,
              undefined,
              {
                iconColor: COLORS.textColorDark,
                borderColor: COLORS.textColorMedium,
                iconBgColor: COLORS.bgColorMedium,
                containerWidth: 125,
              }
            );

            return (
              <React.Fragment key={`corridor-${c._id}`}>
                <Marker
                  icon={CorridorIcon!}
                  zIndexOffset={100}
                  position={[c.location.lat, c.location.lng]}
                  eventHandlers={{
                    click: () => {
                      setModalContent({
                        title: c.name,
                        content: c.description || "",
                        titleIcon: (
                          <DynamicReactIcon
                            iconName="LuMilestone"
                            iconSet="lu"
                            size={20}
                            color={COLORS.textColorDark}
                          ></DynamicReactIcon>
                        ),
                        tags: [
                          {
                            label: "Growth corridor",
                            color: COLORS.textColorDark,
                          },
                        ],
                      });
                      setInfoModalOpen(true);
                    },
                  }}
                />
              </React.Fragment>
            );
          })
        );

        setCorridorElements(elements as any); // now it's JSX[], not Promise[]
      };

      loadIcons();
    }, [corridors]);

    if (!corridors) {
      return null;
    }

    return corridorsElements || null;
  };

  const SurroundingsComponent = () => {
    const map = useMap();
    if (
      !surroundingElements ||
      !surroundingElements.length ||
      !surroundingElementIcons ||
      !surroundingElementIcons.length
    ) {
      map.setZoom(12, {
        animate: true,
      });
      return null;
    }

    map.setZoom(15, {
      animate: true,
    });

    return surroundingElements
      ?.filter(
        (e: ISurroundingElement) =>
          !selectedSurroundingElementType ||
          e.type == selectedSurroundingElementType
      )
      .map((element: ISurroundingElement, index: number) => {
        let plygn;
        if (!element.geometry) {
          return null;
        }
        const positions = element.geometry.map((g: any) => {
          if (Array.isArray(g)) {
            return g.map((subG) => {
              return [subG.lat, subG.lon];
            });
          } else {
            return [g.lat, g.lon];
          }
        });

        let isMulti = false;
        const plgynCoordinates = element.geometry.map((g: any) => {
          if (Array.isArray(g)) {
            isMulti = true;
            return g.map((subG) => {
              return [subG.lon, subG.lat];
            });
          } else {
            return [g.lon, g.lat];
          }
        });

        // Finding the center of the surrounding element to render a symbol icon
        let feature, center, cc, icon;
        try {
          feature = isMulti
            ? turf.multiLineString(plgynCoordinates)
            : turf.lineString(plgynCoordinates);
          center = turf.pointOnFeature(feature!);
          cc = center!.geometry.coordinates;
          icon = surroundingElementIcons.find(
            (i) => i.type == element.type
          ).icon;
        } catch (Err) {
          console.log(Err);
        }

        const handleElementClick = () => {
          const typeLabel = (SurroundingElementLabels as any)[element.type]
            ? (SurroundingElementLabels as any)[element.type].label
            : "";
          setModalContent({
            title: element.description || typeLabel || "",
            content: "",
            tags: [
              {
                label: typeLabel || "",
                color: COLORS.primaryColor,
              },
            ],
          });
          setInfoModalOpen(true);
        };
        return (
          <>
            <Polyline
              key={index}
              positions={positions}
              pathOptions={{
                color:
                  element.impact > 0
                    ? COLORS.greenIdentifier
                    : COLORS.redIdentifier,
                weight: 8,
                opacity: 0.8,
              }}
              eventHandlers={{
                click: handleElementClick,
              }}
            />
            <Marker
              key={`srr-m-${index}`}
              position={[cc![1], cc![0]]}
              icon={icon}
              eventHandlers={{
                click: handleElementClick,
              }}
            />
          </>
        );
      });
  };

  const fetchTravelDurationElement = (
    distance: number,
    duration: number,
    prefix?: string
  ) => {
    return (
      <Flex vertical style={{ marginBottom: 16 }}>
        <Flex align="center" gap={4}>
          <DynamicReactIcon
            iconName="PiClockCountdownDuotone"
            iconSet="pi"
            size={18}
            color={COLORS.textColorDark}
          ></DynamicReactIcon>
          <Typography.Text>
            {prefix ? `${prefix} - ` : ""} {duration} mins (
            {distance.toFixed(1)} Kms)
          </Typography.Text>
        </Flex>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorLight,
          }}
        >
          Average time considering peak/non peak hours. Can vary 10-20% based on
          real time traffic.
        </Typography.Text>
      </Flex>
    );
  };
  /**
   * Renders the road drivers
   */
  const RoadDriversComponent = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();

    if (!drivers || !drivers.length || !roadIcon) {
      return null;
    }

    return drivers
      ?.filter((driver): driver is RoadDriverPlace => {
        const isDriverAllowed = noCategoriesProvided
          ? true
          : (() => {
              const categoryDrivers =
                (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ||
                [];
              return (
                Array.isArray(categoryDrivers) &&
                categoryDrivers.includes(driver.driver)
              );
            })();
        return (
          driver.driver === "highway" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          isDriverAllowed &&
          isDriverMatchingFilter(driver)
        );
      })
      .flatMap((driver) => {
        const processedFeatures = processRoadFeatures(driver.features);

        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

        const handleRoadDriverClick = () => {
          setModalContent({
            title: driver.name,
            content: driver.details?.description || "",
            tags: [
              {
                label: "Road",
                color: COLORS.primaryColor,
              },
              {
                label: driverStatusLabel(driver.status),
                color: isDashed ? "warning" : "success",
              },
            ],
          });
          setInfoModalOpen(true);
        };

        const RoadLine = processedFeatures
          .filter((feature) => {
            return feature.coordinates.some(([lng, lat]) =>
              bounds.contains([lat, lng])
            );
          })
          .map((feature, lineIndex) => {
            const positions = feature.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );

            const line = turf.lineString(feature.coordinates);
            const totalLength = turf.length(line, { units: "kilometers" });

            const numPoints =
              totalLength >= 4 ? Math.floor(totalLength / 4) : 0; // including start and end

            if (!numPoints) {
              return null;
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
              const distance = (i * totalLength) / numPoints;
              const point = turf.along(line, distance, { units: "kilometers" });
              points.push(point.geometry.coordinates);
            }
            return (
              <>
                {map.getZoom() > 12.5
                  ? points.map((p) => (
                      <Marker
                        key={`road-${Math.round(Math.random() * 1000)}`}
                        position={[p![1], p![0]]}
                        icon={roadIcon}
                        eventHandlers={{
                          click: handleRoadDriverClick,
                        }}
                      />
                    ))
                  : null}
                <Polyline
                  key={`${driver._id}-${lineIndex}`}
                  positions={positions}
                  pathOptions={{
                    color:
                      feature.properties?.strokeColor || COLORS.textColorDark,
                    weight: 5,
                    opacity: 0.5,
                    dashArray: isDashed ? "10, 10" : undefined,
                  }}
                  eventHandlers={{
                    click: handleRoadDriverClick,
                  }}
                />
              </>
            );
          });

        return (
          <React.Fragment key={`road-group-${Math.random()}`}>
            {RoadLine}
          </React.Fragment>
        );
      });
  };

  const TransitDriversComponent = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();

    function getTransitContent(info: any) {
      return `${info.intro}\n#### Timeline\n${info.timeline} \n #### Updates\n${info.updates}`;
    }

    function getFooterContent(info: any) {
      return (
        <Flex vertical style={{ marginBottom: 16 }}>
          <Flex>{renderCitations(info.citations)}</Flex>
        </Flex>
      );
    }
    if (!drivers || !drivers.length || !transitStationIcon) {
      return null;
    }

    return drivers
      ?.filter((driver): driver is TransitDriverPlace => {
        const isDriverAllowed = noCategoriesProvided
          ? true
          : (() => {
              const categoryDrivers =
                (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ||
                [];
              return (
                Array.isArray(categoryDrivers) &&
                categoryDrivers.includes(driver.driver)
              );
            })();
        return (
          driver.driver === "transit" &&
          !!driver.features &&
          typeof driver.status === "string" &&
          isDriverAllowed &&
          isDriverMatchingFilter(driver)
        );
      })
      .flatMap((driver) => {
        //  points from lines
        const pointFeatures = driver.features.filter(
          (f: any): f is GeoJSONPointFeature =>
            f.type === "Feature" && f.geometry.type === "Point"
        );

        const lineFeatures = processRoadFeatures(
          driver.features.filter(
            (f: any) => f.type === "Feature" && f.geometry?.type !== "Point"
          )
        );

        const isDashed = ![
          PLACE_TIMELINE.LAUNCHED,
          PLACE_TIMELINE.POST_LAUNCH,
          PLACE_TIMELINE.PARTIAL_LAUNCH,
        ].includes(driver.status as PLACE_TIMELINE);

        const transitLines = lineFeatures.map((feature, lineIndex) => {
          const positions = feature.coordinates.map(
            ([lng, lat]) => [lat, lng] as [number, number]
          );

          // if at least one point of the line is within bounds
          const hasPointInBounds = positions.some(([lat, lng]) =>
            bounds.contains([lat, lng])
          );

          if (!hasPointInBounds) {
            return null;
          }

          return (
            <FlickerPolyline
              toFlicker={
                !!highlightedDrivers &&
                !!highlightedDrivers.length &&
                highlightedDrivers.includes(driver._id)
              }
              key={`${driver._id}-line-${lineIndex}`}
              positions={positions}
              pathOptions={{
                color: feature.properties?.strokeColor || COLORS.textColorDark,
                weight: 6,
                opacity: 0.8,
                dashArray: isDashed ? "10, 10" : undefined,
              }}
            />
          );
        });

        let stations = null;
        if (map.getZoom() > 12.5) {
          stations = pointFeatures
            .filter((feature: any) => {
              // render stations within bounds
              const [lng, lat] = feature.geometry.coordinates;
              return bounds.contains([lat, lng]);
            })
            .map((feature: any, pointIndex: number) => (
              <Marker
                key={`${driver._id}-point-${pointIndex}`}
                position={[
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ]}
                icon={transitStationIcon!}
                eventHandlers={{
                  click: () => {
                    setModalContent({
                      title: driver.name,
                      subHeading:
                        driver.distance && driver.duration
                          ? fetchTravelDurationElement(
                              driver.distance!,
                              driver.duration,
                              "Nearest station "
                            )
                          : "",
                      content: driver.details
                        ? driver.details.info
                          ? getTransitContent(driver.details.info)
                          : driver.details?.description
                        : "",

                      footerContent: getFooterContent(driver.details?.info),
                      tags: [
                        {
                          label:
                            "Station: " +
                            (feature.properties?.name ||
                              feature.properties?.Name),
                          color: COLORS.primaryColor,
                        },
                        {
                          label: driverStatusLabel(driver.status),
                          color: isDashed ? "warning" : "success",
                        },
                        ...(driver.tags || []).map((t: string) => {
                          return {
                            label: capitalize(t),
                            color: "info",
                          };
                        }),
                      ],
                    });
                    setInfoModalOpen(true);
                  },
                }}
              />
            ));
        }
        return (
          <React.Fragment key={`transit-${driver._id}`}>
            {transitLines}
            {stations}
          </React.Fragment>
        );
      });
  };

  const MicroMarketDriversComponent = () => {
    if (!drivers || !drivers.length || !roadIcon) {
      return null;
    }

    const microMarketFiltered = drivers.filter((driver) => {
      const isDriverAllowed = noCategoriesProvided
        ? true
        : (() => {
            const categoryDrivers =
              (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ||
              [];
            return (
              Array.isArray(categoryDrivers) &&
              categoryDrivers.includes(driver.driver)
            );
          })();
      const isMicroMarket = driver.driver == "micro-market";
      return isMicroMarket && isDriverAllowed && isDriverMatchingFilter(driver);
    });

    return microMarketFiltered.map((d) => {
      return (
        <Polygon
          key={`polygon-${d._id}`}
          positions={d.features[0].geometry.coordinates[0].map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          )}
          eventHandlers={{
            click: () => {
              setModalContent({
                title: d.name,
                subHeading: fetchTravelDurationElement(d.distance, d.duration),
                content: d.details?.info
                  ? d.details.info.summary
                  : d.details?.description || "",
                tags: [
                  {
                    label: "Micro Market",
                    color: COLORS.primaryColor,
                  },
                ],
              });
              setInfoModalOpen(true);
            },
          }}
          pathOptions={{
            color: COLORS.redIdentifier,
            weight: 1,
            fillOpacity: 0.2,
            fillColor: COLORS.yellowIdentifier,
          }}
        />
      );
    });
  };

  /**
   * Component to render simple drivers with zoom-dependent duration display
   */
  const SimpleDriversRenderer = ({
    bounds,
  }: {
    bounds: L.LatLngBounds;
  }): JSX.Element | null => {
    const map = useMap();
    const showDuration = map.getZoom() > 12;
    const [markerIcons, setMarkerIcons] = useState<{
      [key: string]: L.DivIcon;
    }>({});

    useEffect(() => {
      if (!drivers?.length) {
        return;
      }

      const updateIcons = async () => {
        const newIcons: { [key: string]: L.DivIcon } = {};

        for (const driver of drivers) {
          if (!driver.location?.lat || !driver.location?.lng) continue;

          const driverIcon = simpleDriverMarkerIcons.find(
            (icon) => icon.driverId === driver._id
          );

          if (driverIcon?.icon) {
            if (showDuration && driverIcon.duration) {
              const iconConfig = (LivIndexDriversConfig as any)[driver.driver]
                ?.icon;
              if (iconConfig) {
                const icon = await getIcon(
                  iconConfig.name,
                  iconConfig.set,
                  false,
                  `${driverIcon.duration} mins`,
                  driver
                );
                if (icon) {
                  newIcons[driver._id] = icon;
                }
              }
            } else {
              newIcons[driver._id] = driverIcon.icon;
            }
          }
        }

        setMarkerIcons(newIcons);
      };

      updateIcons();
    }, [drivers, showDuration, simpleDriverMarkerIcons]);

    if (!drivers?.length) {
      return null;
    }

    const filteredDrivers = drivers.filter((driver) => {
      if (!driver.location?.lat || !driver.location?.lng) return false;
      const isDriverAllowed = noCategoriesProvided
        ? true
        : (() => {
            const categoryDrivers =
              (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ||
              [];
            return (
              Array.isArray(categoryDrivers) &&
              categoryDrivers.includes(driver.driver)
            );
          })();
      return (
        isDriverAllowed &&
        isDriverMatchingFilter(driver) &&
        bounds.contains([driver.location.lat, driver.location.lng])
      );
    });

    return (
      <>
        {filteredDrivers.map((driver) => {
          if (!driver.location?.lat || !driver.location?.lng) return null;
          const markerIcon = markerIcons[driver._id];
          if (!markerIcon) return null;

          const isDashed = ![
            PLACE_TIMELINE.LAUNCHED,
            PLACE_TIMELINE.POST_LAUNCH,
            PLACE_TIMELINE.PARTIAL_LAUNCH,
          ].includes(driver.status as PLACE_TIMELINE);

          const projectSpecificDetails = drivers?.find(
            (d) => d.id === driver._id
          );

          return (
            <Marker
              key={driver._id}
              position={[driver.location.lat, driver.location.lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: driver.name,
                    subHeading: fetchTravelDurationElement(
                      driver.distance,
                      driver.duration
                    ),
                    content: driver.details?.info
                      ? driver.details.info.summary
                      : driver.details?.description || "",
                    tags: [
                      {
                        label: (LivIndexDriversConfig as any)[driver.driver]
                          .label,
                        color: COLORS.primaryColor,
                      },
                      {
                        label: driverStatusLabel(driver.status),
                        color: isDashed
                          ? COLORS.yellowIdentifier
                          : COLORS.greenIdentifier,
                      },
                      ...(projectSpecificDetails?.duration
                        ? [
                            {
                              label: `${projectSpecificDetails.duration} mins`,
                              color: COLORS.textColorDark,
                            },
                          ]
                        : []),
                      ...(driver.tags || []).map((t: string) => {
                        return {
                          label: capitalize(t),
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
        })}
      </>
    );
  };

  /**Renders marker for all projects */
  const renderProjectMarkers = () => {
    const markers: JSX.Element[] = [];

    // Wait for icon to be loaded and verify coordinates
    if (!currentProjectMarkerIcon) {
      return markers;
    }

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

    return markers;
  };

  /**Renders marker for the nearby projects */
  const renderProjectsNearby = () => {
    return projectsNearby!
      .filter(
        (p) =>
          Math.abs(p.sqftCost - projectSqftPricing!) / projectSqftPricing! <=
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
      });
  };

  /** Filter for driver types and custom filters */
  const renderDriverFilters = (filterItem: any) => {
    // custom filter objects with key and label
    if (typeof filterItem === "object" && filterItem.key && filterItem.label) {
      const isSelected = filterItem.key == selectedDriverFilter;
      return (
        <Tag
          key={filterItem.key}
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 16,
            padding: "4px 8px",
            marginRight: 4,
            backgroundColor: isSelected
              ? COLORS.textColorDark
              : " rgba(255,255,255,.9)",
            color: isSelected ? "white" : "initial",
            marginLeft: 0,
            cursor: "pointer",
            border: `1.5px solid ${COLORS.textColorDark}`,
          }}
          onClick={() => {
            setSelectedDriverFilter(filterItem.key);
          }}
        >
          <Typography.Text
            style={{
              color: isSelected ? "white" : COLORS.textColorDark,
              fontSize: FONT_SIZE.SUB_TEXT,
              fontWeight: 500,
            }}
          >
            {filterItem.label}
          </Typography.Text>
        </Tag>
      );
    }

    // Handle driver type strings (fallback behavior)
    const k = filterItem;
    if (!(LivIndexDriversConfig as any)[k]) {
      return null;
    }
    const isSelected = k == selectedDriverFilter;
    return (
      <Tag
        key={k}
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          padding: "4px 8px",
          marginRight: 4,
          backgroundColor: isSelected
            ? COLORS.textColorDark
            : " rgba(255,255,255,.5)",
          color: isSelected ? "white" : "initial",
          marginLeft: 0,
          border: `1.5px solid ${COLORS.textColorDark}`,
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedDriverFilter(k);
        }}
      >
        <Typography.Text
          style={{
            color: isSelected ? "white" : COLORS.textColorDark,
            marginLeft: 4,
            fontSize: FONT_SIZE.PARA,
            fontWeight: isSelected ? 400 : 600,
          }}
        >
          {(LivIndexDriversConfig as any)[k]
            ? capitalize((LivIndexDriversConfig as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  /** Filter for surrounding element types */
  const renderSurroundingElementTypes = (k: string) => {
    if (!(SurroundingElementLabels as any)[k]) {
      return null;
    }
    const icon = (SurroundingElementLabels as any)[k].icon;
    return (
      <Tag
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 16,
          padding: "4px 8px",
          backgroundColor:
            k == selectedSurroundingElementType
              ? COLORS.textColorDark
              : "white",
          color: k == selectedSurroundingElementType ? "white" : "initial",
          marginLeft: 4,
          fontSize: FONT_SIZE.HEADING_3,
          cursor: "pointer",
        }}
        onClick={() => {
          setSelectedSurroundingElementType(k);
        }}
      >
        <DynamicReactIcon
          iconName={icon.name}
          iconSet={icon.set}
          size={20}
          color={
            k == selectedSurroundingElementType ? "white" : COLORS.textColorDark
          }
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            color:
              k == selectedSurroundingElementType
                ? "white"
                : COLORS.textColorDark,
            marginLeft: 4,
            fontSize: FONT_SIZE.SUB_TEXT,
          }}
        >
          {(SurroundingElementLabels as any)[k]
            ? capitalize((SurroundingElementLabels as any)[k].label)
            : ""}
        </Typography.Text>
      </Tag>
    );
  };

  // Process primary project polygon if available
  const primaryProjectBounds = primaryProject?.info?.location?.osm?.geojson
    ? [
        {
          _id: "primary-project",
          driver: "project-bounds",
          name: primaryProject.info.name,
          details: {
            description: primaryProject.info.description || "",
            osm: {
              geojson: {
                type: "Polygon",
                coordinates: [
                  primaryProject.info.location.osm.geojson.coordinates[0],
                ],
              },
            },
          },
        },
      ]
    : [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "hidden",
        borderRadius: 8,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Category Selection Tags  */}
      {showCategorySelection && !hideAllFilters ? (
        <Flex
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            flexShrink: 0,
            marginBottom: 20,
          }}
          gap={8}
        >
          {categories.map((category) => (
            <Flex
              key={category}
              onClick={(checked) => {
                if (checked) {
                  setSelectedCategory(category);
                }
              }}
              align="center"
              gap={4}
              style={{
                textTransform: "capitalize",
                border: `1px solid ${
                  selectedCategory === category
                    ? COLORS.primaryColor
                    : COLORS.borderColor
                }`,
                marginRight: 0,
                padding: "4px 12px",
                borderRadius: 16,
                backgroundColor:
                  selectedCategory === category ? COLORS.primaryColor : "white",

                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <DynamicReactIcon
                color={
                  selectedCategory === category ? "white" : COLORS.textColorDark
                }
                iconName={(DRIVER_CATEGORIES as any)[category].icon.name}
                iconSet={(DRIVER_CATEGORIES as any)[category].icon.set}
                size={16}
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  color:
                    selectedCategory === category
                      ? "white"
                      : COLORS.textColorDark,
                }}
              >
                {capitalize(category)}
              </Typography.Text>
            </Flex>
          ))}
        </Flex>
      ) : null}

      {!hideAllFilters ? (
        <Flex
          style={{
            position: "absolute",
            zIndex: 9999,
            bottom: 24,
            paddingLeft: 8,
            width: "100%",
          }}
          align={isMobile ? "flex-start" : "center"}
          gap={8}
          vertical={isMobile}
        >
          {/* Drivers filters */}
          {drivers &&
          drivers.length &&
          showDriverFilters &&
          currentSelectedCategory !== "surroundings" ? (
            <Flex
              style={{
                width: "100%",
                overflowX: "scroll",
                scrollbarWidth: "none",
                height: 32,
                whiteSpace: "nowrap",
              }}
            >
              {(driverFilters || [])
                .filter((d) => {
                  if (!d) return false;

                  // custom filter object always show it (it's already filtered by category)
                  if (typeof d === "object" && d.key && d.label) {
                    return true;
                  }

                  // If no categories provided, show all driver types
                  if (noCategoriesProvided) {
                    return true;
                  }

                  // For driver type strings, filter by currently selected category
                  const categoryDrivers =
                    (DRIVER_CATEGORIES as any)[selectedCategory]?.drivers || [];
                  return (
                    Array.isArray(categoryDrivers) &&
                    categoryDrivers.includes(d)
                  );
                })
                .map((filterItem: any) => {
                  return renderDriverFilters(filterItem);
                })}
            </Flex>
          ) : null}
        </Flex>
      ) : null}

      {/* Surrounding Elements Filters */}
      {surroundingElements &&
      surroundingElements.length &&
      currentSelectedCategory === "surroundings" ? (
        <Flex
          style={{
            width: "100%",
            overflowX: "scroll",
            scrollbarWidth: "none",
            height: 32,
            position: "absolute",
            zIndex: 9999,
            bottom: 32,
            paddingLeft: 8,
          }}
        >
          {uniqueSurroundingElements.map((k: ISurroundingElement) => {
            return renderSurroundingElementTypes(k.type);
          })}
        </Flex>
      ) : null}

      {/* Map container */}
      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <MapContainer
          key={`map-v2`}
          center={[12.969999, 77.587841]}
          zoom={16}
          minZoom={minMapZoom || 12}
          maxZoom={19}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <MapResizeHandler />
          <MapCenterHandler projectData={primaryProject} projects={projects} />
          {onMapReady && <MapInstanceCapture onMapReady={onMapReady} />}
          <TileLayer
            url="https://tile.jawg.io/9a737f1f-005e-423b-be7f-34aae5cf303f/{z}/{x}/{y}{r}.png?access-token=vXg5mvnWlqLoFPMM5htJQQcAKJeRjV691UPWRPir3UDzYb6o6q9aX7ymowUgB9s7"
            attribution=""
          />
          {/* Process and render polygon data */}
          {(() => {
            // Process primary project bounds
            const projectPolygons = processDriversToPolygons(
              primaryProjectBounds,
              false,
              driverFilters
            );

            // Render all components
            return (
              <>
                <MapPolygons polygons={projectPolygons} />

                {renderProjectMarkers()}
                {showLocalities && localities ? renderLocalities() : null}
                {/* {renderSurroundings()} */}
                {showCorridors && <CorridorsComponent></CorridorsComponent>}
                {currentSelectedCategory === "surroundings" ||
                (!drivers?.length && !!surroundingElements?.length) ? (
                  <SurroundingsComponent></SurroundingsComponent>
                ) : null}
                <MicroMarketDriversComponent></MicroMarketDriversComponent>
                {projectsNearby?.length && projectsNearbyIcons?.length
                  ? renderProjectsNearby()
                  : null}
                {drivers && drivers.length ? (
                  <>
                    <BoundsAwareDrivers
                      renderRoadDrivers={(bounds) => (
                        <RoadDriversComponent bounds={bounds} />
                      )}
                      renderTransitDrivers={(bounds) => (
                        <TransitDriversComponent bounds={bounds} />
                      )}
                      renderSimpleDrivers={(bounds) => (
                        <SimpleDriversRenderer bounds={bounds} />
                      )}
                    />
                    <MapPolygons
                      polygons={processDriversToPolygons(
                        drivers || [],
                        true,
                        driverFilters
                      )}
                    />
                  </>
                ) : null}
              </>
            );
          })()}
        </MapContainer>
      </div>

      {/* Dynamic modal to show map click content */}
      <Modal
        title={null}
        closable={true}
        open={infoModalOpen}
        footer={null}
        onCancel={() => setInfoModalOpen(false)}
        zIndex={2000}
      >
        <Flex
          vertical
          style={{
            maxHeight: 500,
            minHeight: 50,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          {modalContent?.tags ? (
            <Flex
              style={{ marginTop: 32, width: "100%", flexWrap: "wrap" }}
              gap={8}
            >
              {modalContent?.tags.map((t) => (
                <Tag
                  style={{
                    margin: 0,
                    fontSize: FONT_SIZE.SUB_TEXT,
                    borderColor: COLORS.textColorDark,
                    padding: "0 4px",
                  }}
                >
                  {t.label}
                </Tag>
              ))}
            </Flex>
          ) : null}
          <Flex align="center" gap={4}>
            {modalContent?.titleIcon && modalContent.titleIcon}
            <Paragraph
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                fontWeight: 500,
                marginBottom: 8,
                marginTop: 8,
                paddingBottom: 1,
                minHeight: 32,
              }}
              ellipsis={{
                rows: 2,
              }}
            >
              {modalContent?.title}
            </Paragraph>
          </Flex>
          {modalContent?.subHeading && modalContent.subHeading}

          {modalContent?.footerContent && modalContent.footerContent}
          {modalContent && modalContent.content ? (
            <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
              {modalContent?.content}
            </Markdown>
          ) : null}
        </Flex>
      </Modal>
    </div>
  );
};
export default MapViewV2;
