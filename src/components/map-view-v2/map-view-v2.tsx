"use client";
import * as turf from "@turf/turf";
import { Typography } from "antd";
import "leaflet/dist/leaflet.css";
import React from "react";

import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import { useFetchCorridors } from "../../hooks/use-corridors";
import { useFetchLocalities } from "../../hooks/use-localities";
import { useFetchProjectById } from "../../hooks/use-project";
import {
  SurroundingElementLabels,
} from "../../libs/constants";
import { COLORS } from "../../theme/style-constants";
import { ISurroundingElement } from "../../types/Project";
import useStore from "../metro-mapper/store";
import { MapPolygons } from "./map-polygons";
import { MapViewContextProvider, useMapModal, useMapIconsContext, useMapFiltersContext } from "./contexts/map-view-context";
import { fetchTravelDurationElement, processPrimaryProjectBounds } from "./map-utils";

// New imports for extracted components
import { RoadDriversComponent } from "./map-drivers/road-drivers";
import { TransitDriversComponent } from "./map-drivers/transit-drivers";
import { SimpleDriversRenderer } from "./map-drivers/simple-drivers";
import { MicroMarketDriversComponent } from "./map-drivers/micro-market-drivers";
import { CategoryFilters } from "./map-filters/category-filters";
import { DriverFilters } from "./map-filters/driver-filters";
import { SurroundingFilters } from "./map-filters/surrounding-filters";
import { MapModal } from "./map-modal";
import { MapCenterHandler, MapResizeHandler, MapInstanceCapture } from "./map-utils/map-handlers";
import { BoundsAwareDrivers } from "./map-utils/bounds-aware-drivers";
import { ProjectMarkers, ProjectsNearbyMarkers } from "./map-markers/project-markers";
import { LocalityMarkers } from "./map-markers/locality-markers";
import { CorridorMarkers } from "./map-markers/corridor-markers";
import { SurroundingMarkers } from "./map-markers/surrounding-markers";
import { processDriversToPolygons } from "./utils";

// Types moved to ./types.ts

// getIcon function moved to ./utils.ts

// Map handlers moved to ./map-utils/map-handlers.tsx

// BoundsAwareDrivers moved to ./map-utils/bounds-aware-drivers.tsx

// MapResizeHandler moved to ./map-utils/map-handlers.tsx

// processDriversToPolygons moved to ./utils.ts

// MapInstanceCapture moved to ./map-utils/map-handlers.tsx

interface MapViewV2Props {
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
}

const MapViewV2Inner = ({
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
  primaryProject,
}: MapViewV2Props & { primaryProject?: any }) => {
  // Use context hooks instead of local state
  const { isOpen: infoModalOpen, content: modalContent, openModal, closeModal } = useMapModal();
  const {
    simpleDriverMarkerIcons,
    surroundingElementIcons,
    projectsNearbyIcons,
    currentProjectMarkerIcon,
    projectMarkerIcon,
    transitStationIcon,
    roadIcon,
    refreshSurroundingElementIcons,
  } = useMapIconsContext();
  const {
    selectedDriverFilter,
    selectedCategory,
    selectedSurroundingElementType,
    driverFilters,
    uniqueSurroundingElements,
    showCategorySelection,
    noCategoriesProvided,
    showDriverFilters,
    setSelectedDriverFilter,
    setSelectedCategory,
    setSelectedSurroundingElementType,
    isDriverMatchingFilter,
  } = useMapFiltersContext();

  // Keep only non-state related hooks
  const { data: corridors } = useFetchCorridors();
  const { data: localities } = useFetchLocalities();
  const currentSelectedCategory = selectedCategory;

  // Primary project is now passed from the wrapper component via context
  
  // Trigger surrounding element icon generation when surroundingElements changes
  React.useEffect(() => {
    if (surroundingElements && surroundingElements.length && uniqueSurroundingElements.length) {
      refreshSurroundingElementIcons(uniqueSurroundingElements);
    }
  }, [surroundingElements, uniqueSurroundingElements, refreshSurroundingElementIcons]);

  const highlightedDrivers = useStore(
    (state) => state.values["highlightDrivers"]
  );

  // Icon and filter logic now handled by custom hooks

  // All icon and filter state management now handled by custom hooks and context

  // processRoadFeatures moved to ./utils.ts

  // renderLocalities moved to ./map-markers/locality-markers.tsx

  // CorridorsComponent moved to ./map-markers/corridor-markers.tsx

  // SurroundingsComponent extracted to ./map-markers/surrounding-markers.tsx

  // fetchTravelDurationElement now imported from map-utils.ts
  // Old RoadDriversComponent removed - now using extracted component from map-drivers/road-drivers.tsx

  // Old TransitDriversComponent removed - now using extracted component from map-drivers/transit-drivers.tsx

  // Remaining TransitDriversComponent content removed

  // Old MicroMarketDriversComponent removed - now using extracted component from map-drivers/micro-market-drivers.tsx

  // Old SimpleDriversRenderer removed - now using extracted component from map-drivers/simple-drivers.tsx
  // Remaining SimpleDriversRenderer content removed

  // renderProjectMarkers moved to ./map-markers/project-markers.tsx

  // renderProjectsNearby moved to ./map-markers/project-markers.tsx

  // Old renderDriverFilters function removed - now using extracted DriverFilters component

  // Old renderSurroundingElementTypes function removed - now using extracted SurroundingFilters component

  // Process primary project bounds using imported utility
  const primaryProjectBounds = processPrimaryProjectBounds(primaryProject);

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
      {/* Category Selection Filters */}
      <CategoryFilters 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        hideAllFilters={hideAllFilters}
        showCategorySelection={showCategorySelection}
      />

      {/* Driver Filters */}
      <DriverFilters
        drivers={drivers}
        driverFilters={driverFilters}
        selectedDriverFilter={selectedDriverFilter}
        setSelectedDriverFilter={setSelectedDriverFilter}
        currentSelectedCategory={currentSelectedCategory}
        noCategoriesProvided={noCategoriesProvided}
        categories={categories}
        hideAllFilters={hideAllFilters}
        showDriverFilters={showDriverFilters}
      />

      {/* Surrounding Elements Filters */}
      <SurroundingFilters
        surroundingElements={surroundingElements}
        uniqueSurroundingElements={uniqueSurroundingElements}
        selectedSurroundingElementType={selectedSurroundingElementType}
        setSelectedSurroundingElementType={setSelectedSurroundingElementType}
        currentSelectedCategory={currentSelectedCategory}
      />

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

                <ProjectMarkers
                  primaryProject={primaryProject}
                  projects={projects}
                  currentProjectMarkerIcon={currentProjectMarkerIcon}
                  projectMarkerIcon={projectMarkerIcon}
                  setModalContent={openModal}
                  setInfoModalOpen={() => {}}
                />
                {showLocalities && localities ? (
                  <LocalityMarkers
                    localities={localities}
                    setModalContent={openModal}
                    setInfoModalOpen={() => {}}
                  />
                ) : null}
                {/* {renderSurroundings()} */}
                {showCorridors && (
                  <CorridorMarkers
                    corridors={corridors}
                    setModalContent={openModal}
                    setInfoModalOpen={() => {}}
                  />
                )}
                {currentSelectedCategory === "surroundings" ||
                (!drivers?.length && !!surroundingElements?.length) ? (
                  <SurroundingMarkers
                    surroundingElements={surroundingElements}
                    surroundingElementIcons={surroundingElementIcons}
                    selectedSurroundingElementType={selectedSurroundingElementType}
                    openModal={openModal}
                  />
                ) : null}
                <MicroMarketDriversComponent
                  drivers={drivers}
                  currentSelectedCategory={currentSelectedCategory}
                  noCategoriesProvided={noCategoriesProvided}
                  categories={categories}
                  setModalContent={openModal}
                  setInfoModalOpen={() => {}}
                  isDriverMatchingFilter={isDriverMatchingFilter}
                  fetchTravelDurationElement={fetchTravelDurationElement}
                />
                {projectsNearby?.length && projectsNearbyIcons?.length ? (
                  <ProjectsNearbyMarkers
                    projectsNearby={projectsNearby}
                    projectsNearbyIcons={projectsNearbyIcons}
                    projectSqftPricing={projectSqftPricing}
                    primaryProject={primaryProject}
                    setModalContent={openModal}
                    setInfoModalOpen={() => {}}
                  />
                ) : null}
                {drivers && drivers.length ? (
                  <>
                    <BoundsAwareDrivers
                      renderRoadDrivers={(bounds) => (
                        <RoadDriversComponent 
                          bounds={bounds}
                          drivers={drivers}
                          roadIcon={roadIcon}
                          currentSelectedCategory={currentSelectedCategory}
                          noCategoriesProvided={noCategoriesProvided}
                          categories={categories}
                          setModalContent={openModal}
                          setInfoModalOpen={() => {}}
                          isDriverMatchingFilter={isDriverMatchingFilter}
                        />
                      )}
                      renderTransitDrivers={(bounds) => (
                        <TransitDriversComponent 
                          bounds={bounds}
                          drivers={drivers}
                          transitStationIcon={transitStationIcon}
                          currentSelectedCategory={currentSelectedCategory}
                          noCategoriesProvided={noCategoriesProvided}
                          categories={categories}
                          highlightedDrivers={highlightedDrivers}
                          setModalContent={openModal}
                          setInfoModalOpen={() => {}}
                          isDriverMatchingFilter={isDriverMatchingFilter}
                          fetchTravelDurationElement={fetchTravelDurationElement}
                        />
                      )}
                      renderSimpleDrivers={(bounds) => (
                        <SimpleDriversRenderer 
                          bounds={bounds}
                          drivers={drivers}
                          simpleDriverMarkerIcons={simpleDriverMarkerIcons}
                          currentSelectedCategory={currentSelectedCategory}
                          noCategoriesProvided={noCategoriesProvided}
                          setModalContent={openModal}
                          setInfoModalOpen={() => {}}
                          isDriverMatchingFilter={isDriverMatchingFilter}
                          fetchTravelDurationElement={fetchTravelDurationElement}
                        />
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

      {/* Map info modal */}
      <MapModal
        isOpen={infoModalOpen}
        onClose={closeModal}
        content={modalContent}
      />
    </div>
  );
};

// Main component wrapper with context provider  
const MapViewV2 = (props: MapViewV2Props) => {
  // Fetch primary project data at the wrapper level
  const { data: primaryProject } = useFetchProjectById(props.projectId || "");
  
  return (
    <MapViewContextProvider
      drivers={props.drivers}
      categories={props.categories}
      surroundingElements={props.surroundingElements}
      primaryProject={primaryProject}
      projectsNearby={props.projectsNearby}
      projectSqftPricing={props.projectSqftPricing}
    >
      <MapViewV2Inner {...props} primaryProject={primaryProject} />
    </MapViewContextProvider>
  );
};

export default MapViewV2;
