import { Button, Flex, Modal, Typography } from "antd";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { useFetchAllLivindexPlaces } from "../../hooks/use-livindex-places";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import MapViewV2 from "../map-view/map-view-v2";
import { LineFilters } from "./line-filters";
import { SearchSidebar } from "./search-sidebar";
import useStore from "./store";

export function MetroMapper() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces(undefined, ["transit"]);

  const [transitDrivers, setTransitDrivers] = useState<IDriverPlace[]>([]);
  const [filteredTransitDrivers, setFilteredTransitDrivers] = useState<
    IDriverPlace[]
  >([]);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef(mapInstance);

  const temporaryMarkerRef = useRef<L.Marker | null>(null);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  const { isMobile } = useDevice();
  const setValue = useStore((state) => state.setValue);

  // Filter only transit drivers from all places
  useEffect(() => {
    if (livindexPlaces && livindexPlaces.length) {
      const transitOnly = livindexPlaces.filter(
        (place) => place.driver === "transit"
      );
      setTransitDrivers(transitOnly);
      setFilteredTransitDrivers(transitOnly);
    }
  }, [livindexPlaces]);

  useEffect(() => {
    mapRef.current = mapInstance;
  }, mapInstance);

  // Update filtered drivers based on selected lines
  useEffect(() => {
    if (selectedLines.length === 0) {
      setFilteredTransitDrivers(transitDrivers);
    } else {
      const filtered = transitDrivers.filter((driver) =>
        selectedLines.includes(driver.name)
      );
      setFilteredTransitDrivers(filtered);
    }
  }, [selectedLines, transitDrivers]);

  const handleLineToggle = (lineName: string) => {
    setSelectedLines((prev) => {
      if (prev.includes(lineName)) {
        return prev.filter((name) => name !== lineName);
      } else {
        return [...prev, lineName];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedLines([]);
  };

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  const addPersistentMarker = (result: SearchResult) => {
    if (!mapRef.current) return;

    // Remove existing marker (replace previous marker)
    if (temporaryMarkerRef.current) {
      mapRef.current.removeLayer(temporaryMarkerRef.current);
    }

    const markerIcon = L.divIcon({
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: ${COLORS.primaryColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(56, 182, 255, 0.6);
          animation: pulse 1.5s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: "persistent-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // persistent marker with popup
    const marker = L.marker(result.coordinates, { icon: markerIcon })
      .bindPopup(
        `
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <strong style="color: #333; font-size: 14px;">${
            result.name
          }</strong><br/>
          <span style="color: #666; font-size: 12px;">${
            result.description || ""
          }</span>
        </div>
      `,
        {
          closeButton: false,
          className: "persistent-popup",
        }
      )
      .addTo(mapRef.current);

    marker.openPopup();

    temporaryMarkerRef.current = marker;
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    if (!mapInstance) return;

    // IMP
    // conditionally reset line filters when a location is selected
    // clear filters if they are currently active (selectedLines.length > 0)
    // This ensures:
    // User sees all nearby transit stations for the new location when filters were active
    // Allows "Nearest Transit Stations" sidebar to display properly by not interfering with unfiltered data
    if (selectedLines.length > 0) {
      setSelectedLines([]);
    }

    // Add persistent highlight marker
    setTimeout(() => {
      // mapRef.current.flyTo(result.coordinates, 17, { animate: true });
      mapRef.current.setView(result.coordinates, 15, {
        animate: true, // optional
      });
      addPersistentMarker(result);
    }, 1000);
  };

  const handleSearchClear = () => {
    mapInstance.removeLayer(temporaryMarkerRef.current);
    mapInstance.setZoom(14, {
      duration: 1,
    });
  };

  const SearchContainer = () => {
    return (
      <Flex
        vertical
        style={{
          width: isMobile ? "100%" : "30%",
          height: isMobile ? "auto" : "100%",
        }}
      >
        <SearchSidebar
          onResultSelect={handleSearchResultSelect}
          transitDrivers={filteredTransitDrivers}
          onSearchClear={handleSearchClear}
          onFetchedTransitDrivers={(nearestUniqueStations) => {
            setValue(
              "highlightDrivers",
              nearestUniqueStations && nearestUniqueStations.length
                ? nearestUniqueStations.map((s) => s.driverId)
                : []
            );
          }}
        />
      </Flex>
    );
  };

  return (
    <Flex
      vertical
      style={{
        height: "calc(100vh - 104px)",
        marginTop: 8,
        marginBottom: 16,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Flex
        vertical
        style={{ marginBottom: 0, padding: isMobile ? "0 16px" : 0 }}
      >
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_1 * 1.3,
            lineHeight: "120%",
            fontWeight: 500,
          }}
        >
          Where's my Metro ?
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_3,
            marginBottom: isMobile ? 16 : 0,
            color: COLORS.textColorMedium,
            lineHeight: "120%",
          }}
        >
          Find any nearest metro (operational or upcoming) for any location in
          Bangalore.
        </Typography.Text>
      </Flex>

      {!isMobile && (
        <Flex style={{ marginBottom: 16, width: "100%", minWidth: 0 }}>
          <LineFilters
            transitDrivers={transitDrivers}
            selectedLines={selectedLines}
            onLineToggle={handleLineToggle}
            onClearFilters={handleClearFilters}
          />
        </Flex>
      )}

      {/* Main Content Area */}
      <Flex style={{ flex: 1 }} vertical={isMobile} gap={0}>
        {/* Mobile: Search at top */}
        {isMobile && (
          <>
            <SearchContainer />
            {/* Mobile: Line Filters below search */}
            <Flex
              style={{
                padding: "0 16px",
                width: "100%",
                minWidth: 0,
              }}
            >
              <LineFilters
                transitDrivers={transitDrivers}
                selectedLines={selectedLines}
                onLineToggle={handleLineToggle}
                onClearFilters={handleClearFilters}
              />
            </Flex>
          </>
        )}

        {/* Map Container */}
        <Flex
          style={{
            width: isMobile ? "100%" : "70%",
            position: "relative",
            height: isMobile ? 600 : "100%",
            flex: isMobile ? "none" : 1,
          }}
        >
          {!isMapFullScreen && (
            <Flex
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 8998,
              }}
            >
              <Button
                size="small"
                icon={
                  <DynamicReactIcon
                    iconName="FaExpand"
                    color="white"
                    iconSet="fa"
                    size={16}
                  />
                }
                style={{
                  marginLeft: "auto",
                  marginBottom: 8,
                  borderRadius: 8,
                  cursor: "pointer",
                  backgroundColor: COLORS.textColorDark,
                  color: "white",
                  fontSize: FONT_SIZE.HEADING_4,
                  height: 28,
                }}
                onClick={() => {
                  setIsMapFullScreen(true);
                }}
              ></Button>
            </Flex>
          )}

          <MapViewV2
            key="metro-mapper-view"
            drivers={filteredTransitDrivers.map((driver) => ({
              ...driver,
              // Add duration calculation for consistency with other map usages
              duration: driver.distance ? Math.round(driver.distance / 60) : 0,
            }))}
            fullSize={true}
            showLocalities={false}
            onMapReady={setMapInstance}
            showCorridors={false}
            minMapZoom={10}
          />
        </Flex>

        {/* Desktop: Search sidebar on right */}
        {!isMobile && <SearchContainer />}
      </Flex>

      {/* Full map view modal */}
      <Modal
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setIsMapFullScreen(false);
        }}
        mask={true}
        forceRender
        footer={null}
        width={isMobile ? "100%" : 900}
        style={{ top: 10 }}
        styles={{
          content: {
            backgroundColor: COLORS.bgColorMedium,
            borderRadius: 8,
            padding: 0,
            overflowY: "hidden",
          },
        }}
      >
        <Flex
          style={{ height: Math.min(window.innerHeight - 20, 800) }}
          vertical
          gap={8}
        >
          <MapViewV2
            key="metro-mapper-fullscreen"
            drivers={filteredTransitDrivers.map((driver) => ({
              ...driver,
            }))}
            fullSize={true}
            showLocalities={false}
            showCorridors={false}
          />
        </Flex>
      </Modal>
    </Flex>
  );
}
