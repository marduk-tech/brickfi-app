"use client";

import React from "react";
import { APIProvider, InfoWindow, Map } from "@vis.gl/react-google-maps";

import { useFetchCorridors } from "../../../hooks/use-corridors";
import { useFetchLocalities } from "../../../hooks/use-localities";
import { useFetchProjectById } from "../../../hooks/use-project";
import { COLORS } from "../../../theme/style-constants";
import { ISurroundingElement } from "../../../types/Project";
import { CategoryFilters } from "../map-filters/category-filters";
import { DriverFilters } from "../map-filters/driver-filters";
import { SurroundingFilters } from "../map-filters/surrounding-filters";
import { MapModalBody } from "../map-modal";
import { fetchTravelDurationElement } from "../map-utils";
import {
  MapViewContextProvider,
  useMapFiltersContext,
  useMapModal,
} from "../contexts/map-view-context";
import { ProjectMarkerInput } from "../types";

import { MapCenterer, MapFocusHandler, MapReady } from "./map-camera";
import { CorridorMarkers } from "./markers/corridor-markers";
import { LocalityMarkers } from "./markers/locality-markers";
import { MicroMarketDrivers } from "./markers/micro-market-drivers";
import { ProjectMarkers } from "./markers/project-markers";
import { DriverPolygons } from "./markers/driver-polygons";
import { RoadDrivers } from "./markers/road-drivers";
import { SimpleDrivers } from "./markers/simple-drivers";
import { SurroundingMarkers } from "./markers/surrounding-markers";
import { TransitDrivers } from "./markers/transit-drivers";

export interface MapViewGoogleProps {
  lvnzyProjectId?: string;
  drivers?: any[];
  projectId?: string;
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  fullSize?: boolean;
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: {
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
    projectType?: string;
  }[];
  projectSqftPricing?: number;
  showLocalities?: boolean;
  onMapReady?: (map: google.maps.Map) => void;
  showCorridors?: boolean;
  minMapZoom?: number;
  initialZoom?: number;
  categories?: string[];
  hideAllFilters?: boolean;
  corridorIds?: string[];
  highlightedHomeTypes?: string[];
  /** "roadmap" (default) or "hybrid" (satellite + labels) */
  mapTypeId?: "roadmap" | "hybrid";
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID";

// DEMO_MAP_ID uses raster rendering, which respects the styles array and
// supports AdvancedMarkerElement. A custom vector Map ID ignores JS styles —
// for production, configure styles in Google Cloud Console and swap back
// to your real Map ID.
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // ── Remove individual business POIs entirely (icon + label + geometry) ────
  // Restaurants, grocery stores, hospitals, pharmacies, shops, etc.
  // `elementType: "all"` removes the coloured pin icons as well as text labels.
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical",  elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", elementType: "all", stylers: [{ visibility: "off" }] },
  // Schools are left as labels-only — the polygon outlines are removed but
  // the name still appears since we don't render school icons ourselves.
  { featureType: "poi.school", elementType: "all", stylers: [{ visibility: "off" }] },
  // ── Transit station base-map labels ───────────────────────────────────────
  // We render our own FaTrainSubway station markers; remove Google's defaults.
  { featureType: "transit.station", elementType: "all", stylers: [{ visibility: "off" }] },
  // ── Kept visible (intentional) ────────────────────────────────────────────
  // poi.park         → park polygons give useful green-area context
  // administrative   → neighbourhood, locality, city, region labels
  // road             → road names and geometry
  // water            → water body names
];

// ── Inner component (lives inside APIProvider so it can use vis.gl hooks) ─────
function MapViewGoogleInner({
  lvnzyProjectId,
  drivers,
  projects,
  focusedProjectId,
  surroundingElements,
  projectsNearby,
  projectSqftPricing,
  showLocalities,
  onMapReady,
  showCorridors = true,
  minMapZoom,
  initialZoom,
  categories,
  hideAllFilters,
  mapTypeId = "roadmap",
  corridorIds,
  highlightedHomeTypes,
  primaryProject,
}: MapViewGoogleProps & { primaryProject?: any }) {
  const { isOpen, content: modalContent, position: modalPosition, openModal, closeModal } = useMapModal();

  const {
    selectedCategory,
    setSelectedCategory,
    selectedDriverFilter,
    setSelectedDriverFilter,
    selectedSurroundingElementType,
    setSelectedSurroundingElementType,
    driverFilters,
    uniqueSurroundingElements,
    showCategorySelection,
    noCategoriesProvided,
    showDriverFilters,
    isDriverMatchingFilter,
  } = useMapFiltersContext();

  const { data: corridors } = useFetchCorridors();
  const { data: localities } = useFetchLocalities();

  const filteredCorridors = corridorIds
    ? corridors?.filter((c) => corridorIds.includes(c._id))
    : corridors;

  const showSurroundings =
    selectedCategory === "surroundings" ||
    (!drivers?.length && !!surroundingElements?.length);

  const showDriverLayers = selectedCategory !== "surroundings";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        border: `0.4px solid ${COLORS.borderColorMedium}`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        hideAllFilters={hideAllFilters}
        showCategorySelection={showCategorySelection}
        projectName={primaryProject?.info?.name}
        projectId={lvnzyProjectId}
      />
      <DriverFilters
        drivers={drivers}
        driverFilters={driverFilters}
        selectedDriverFilter={selectedDriverFilter}
        setSelectedDriverFilter={setSelectedDriverFilter}
        currentSelectedCategory={selectedCategory}
        noCategoriesProvided={noCategoriesProvided}
        categories={categories}
        hideAllFilters={hideAllFilters}
        showDriverFilters={showDriverFilters}
        projectName={primaryProject?.info?.name}
        projectId={lvnzyProjectId}
      />
      <SurroundingFilters
        surroundingElements={surroundingElements}
        uniqueSurroundingElements={uniqueSurroundingElements}
        selectedSurroundingElementType={selectedSurroundingElementType}
        setSelectedSurroundingElementType={setSelectedSurroundingElementType}
        currentSelectedCategory={selectedCategory}
        projectName={primaryProject?.info?.name}
        projectId={lvnzyProjectId}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <Map
          mapId={MAP_ID}
          defaultCenter={{ lat: 12.969999, lng: 77.587841 }}
          defaultZoom={12}
          minZoom={minMapZoom ?? 11}
          maxZoom={19}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId={mapTypeId}
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <MapCenterer
            primaryProject={primaryProject}
            projects={projects}
            initialZoom={initialZoom}
          />
          <MapFocusHandler
            projects={projects}
            focusedProjectId={focusedProjectId}
            openModal={openModal}
          />
          {onMapReady && <MapReady onMapReady={onMapReady} />}

          {/* ── Point markers ── */}
          <ProjectMarkers
            primaryProject={primaryProject}
            projects={projects}
            projectsNearby={projectsNearby}
            projectSqftPricing={projectSqftPricing}
            highlightedHomeTypes={highlightedHomeTypes}
            openModal={openModal}
          />

          {showLocalities && localities && (
            <LocalityMarkers localities={localities} openModal={openModal} />
          )}

          {showCorridors && (
            <CorridorMarkers corridors={filteredCorridors} openModal={openModal} />
          )}

          {showSurroundings && (
            <SurroundingMarkers
              surroundingElements={surroundingElements}
              selectedSurroundingElementType={selectedSurroundingElementType}
              openModal={openModal}
            />
          )}

          {/* ── Driver layers ── */}
          {showDriverLayers && drivers?.length && (
            <>
              <MicroMarketDrivers
                drivers={drivers}
                currentSelectedCategory={selectedCategory}
                noCategoriesProvided={noCategoriesProvided}
                isDriverMatchingFilter={isDriverMatchingFilter}
                openModal={openModal}
              />
              <TransitDrivers
                drivers={drivers}
                currentSelectedCategory={selectedCategory}
                noCategoriesProvided={noCategoriesProvided}
                isDriverMatchingFilter={isDriverMatchingFilter}
                openModal={openModal}
                fetchTravelDurationElement={fetchTravelDurationElement}
              />
              <RoadDrivers
                drivers={drivers}
                currentSelectedCategory={selectedCategory}
                noCategoriesProvided={noCategoriesProvided}
                isDriverMatchingFilter={isDriverMatchingFilter}
                openModal={openModal}
                fetchTravelDurationElement={fetchTravelDurationElement}
              />
              <SimpleDrivers
                drivers={drivers}
                currentSelectedCategory={selectedCategory}
                noCategoriesProvided={noCategoriesProvided}
                isDriverMatchingFilter={isDriverMatchingFilter}
                openModal={openModal}
                                fetchTravelDurationElement={fetchTravelDurationElement}

              />
              <DriverPolygons
                drivers={drivers}
                currentSelectedCategory={selectedCategory}
                noCategoriesProvided={noCategoriesProvided}
                isDriverMatchingFilter={isDriverMatchingFilter}
                openModal={openModal}
                selectedDriverFilter={selectedDriverFilter}
              />
            </>
          )}

          {isOpen && modalPosition && (
            <InfoWindow
              position={modalPosition}
              onCloseClick={closeModal}
              onClose={closeModal}
              pixelOffset={[0, -10]}
              style={{ width: 320 }}
            >
              <MapModalBody content={modalContent} onClose={closeModal} />
            </InfoWindow>
          )}
        </Map>
      </div>
    </div>
  );
}

// ── Public export (adds APIProvider + context) ─────────────────────────────────
export function MapViewGoogle(props: MapViewGoogleProps) {
  const { data: primaryProject } = useFetchProjectById(props.projectId ?? "");

  return (
    <APIProvider apiKey={API_KEY} libraries={["marker"]}>
      <MapViewContextProvider
        drivers={props.drivers}
        categories={props.categories}
        surroundingElements={props.surroundingElements}
        primaryProject={primaryProject}
        projectsNearby={props.projectsNearby}
        projectSqftPricing={props.projectSqftPricing}
      >
        <MapViewGoogleInner {...props} primaryProject={primaryProject} />
      </MapViewContextProvider>
    </APIProvider>
  );
}

export default MapViewGoogle;
