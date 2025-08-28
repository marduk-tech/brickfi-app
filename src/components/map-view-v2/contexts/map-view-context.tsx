import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { MapModalContent } from "../map-modal";
import { useMapIcons, UseMapIconsReturn } from "../use-map-icons";
import { useMapFilters, UseMapFiltersReturn } from "../use-map-filters";
import { IDriverPlace, ISurroundingElement } from "../../../types/Project";

// Bounds state interface
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Modal state interface
export interface ModalState {
  infoModalOpen: boolean;
  modalContent?: MapModalContent;
}

// Complete context state interface
export interface MapViewContextState {
  // Modal state
  modal: ModalState;
  
  // Icon state and actions
  icons: UseMapIconsReturn;
  
  // Filter state and actions
  filters: UseMapFiltersReturn;
  
  // Bounds state
  bounds?: MapBounds;
  
  // Actions
  openModal: (content: MapModalContent) => void;
  closeModal: () => void;
  updateBounds: (bounds: MapBounds) => void;
}

// Context props interface for the provider
export interface MapViewContextProps {
  children: ReactNode;
  drivers?: IDriverPlace[];
  categories?: string[];
  surroundingElements?: ISurroundingElement[];
  primaryProject?: any;
  projectsNearby?: Array<{
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
  }>;
  projectSqftPricing?: number;
}

// Create context
const MapViewContext = createContext<MapViewContextState | undefined>(undefined);

// Context provider component
export const MapViewContextProvider: React.FC<MapViewContextProps> = ({
  children,
  drivers,
  categories,
  surroundingElements,
  primaryProject,
  projectsNearby,
  projectSqftPricing,
}) => {
  // Modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<MapModalContent>();
  
  // Bounds state
  const [bounds, setBounds] = useState<MapBounds>();

  // Use custom hooks for icons and filters
  const icons = useMapIcons(drivers, primaryProject, projectsNearby, projectSqftPricing);
  const filters = useMapFilters(drivers, categories, surroundingElements);

  // Modal actions
  const openModal = useCallback((content: MapModalContent) => {
    setModalContent(content);
    setInfoModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setInfoModalOpen(false);
    setModalContent(undefined);
  }, []);

  // Bounds actions
  const updateBounds = useCallback((newBounds: MapBounds) => {
    setBounds(newBounds);
  }, []);

  // Context value
  const contextValue: MapViewContextState = {
    modal: {
      infoModalOpen,
      modalContent,
    },
    icons,
    filters,
    bounds,
    openModal,
    closeModal,
    updateBounds,
  };

  return (
    <MapViewContext.Provider value={contextValue}>
      {children}
    </MapViewContext.Provider>
  );
};

// Custom hook to use the context
export const useMapViewContext = (): MapViewContextState => {
  const context = useContext(MapViewContext);
  if (!context) {
    throw new Error("useMapViewContext must be used within a MapViewContextProvider");
  }
  return context;
};

// Individual hooks for specific parts of the context
export const useMapModal = () => {
  const { modal, openModal, closeModal } = useMapViewContext();
  return {
    isOpen: modal.infoModalOpen,
    content: modal.modalContent,
    openModal,
    closeModal,
  };
};

export const useMapBounds = () => {
  const { bounds, updateBounds } = useMapViewContext();
  return {
    bounds,
    updateBounds,
  };
};

export const useMapIconsContext = () => {
  const { icons } = useMapViewContext();
  return icons;
};

export const useMapFiltersContext = () => {
  const { filters } = useMapViewContext();
  return filters;
};