import { useState, useEffect, useCallback } from "react";
import { DRIVER_CATEGORIES } from "../../libs/constants";
import { IDriverPlace, ISurroundingElement } from "../../types/Project";

export interface FilterState {
  selectedDriverFilter?: string;
  selectedCategory: string;
  selectedSurroundingElementType?: string;
  driverFilters: any[];
  uniqueSurroundingElements: ISurroundingElement[];
}

export interface UseMapFiltersReturn extends FilterState {
  // Computed states
  showCategorySelection: boolean;
  noCategoriesProvided: boolean;
  hasCategories: boolean;
  showDriverFilters: boolean;
  // Actions
  setSelectedDriverFilter: (filter?: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedSurroundingElementType: (type?: string) => void;
  // Utilities
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  getDefaultCategory: () => string;
}

export const useMapFilters = (
  drivers?: IDriverPlace[],
  categories?: string[],
  surroundingElements?: ISurroundingElement[]
): UseMapFiltersReturn => {
  // Core filter states
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSurroundingElementType, setSelectedSurroundingElementType] = useState<string>();
  const [driverFilters, setDriverFilters] = useState<any[]>([]);
  const [uniqueSurroundingElements, setUniqueSurroundingElements] = useState<ISurroundingElement[]>([]);

  // Computed states
  const showCategorySelection = Boolean(categories && categories.length > 1);
  const noCategoriesProvided = Boolean(!categories || categories.length === 0);
  const hasCategories = Boolean(categories && categories.length > 0);
  const showDriverFilters = driverFilters.length > 1;

  // Get default category helper
  const getDefaultCategory = useCallback(() => {
    if (hasCategories && categories!.length > 0) return categories![0];
    const allCategories = Object.keys(DRIVER_CATEGORIES);
    return allCategories[0];
  }, [hasCategories, categories]);

  // Driver matching logic
  const isDriverMatchingFilter = useCallback((driver: IDriverPlace): boolean => {
    if (!selectedDriverFilter) return true;

    // Check for custom filter
    if (hasCategories) {
      for (const category of categories!) {
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
  }, [selectedDriverFilter, hasCategories, categories]);

  // Helper function to find valid filter that has matching drivers
  const findValidFilter = useCallback((
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
  }, []);

  // Initialize default category
  useEffect(() => {
    const defaultCategory = getDefaultCategory();
    setSelectedCategory(defaultCategory);
  }, [getDefaultCategory]);

  // Reset selected driver filter when category changes
  useEffect(() => {
    setSelectedDriverFilter(undefined);
  }, [selectedCategory]);

  // Update category when categories prop changes
  useEffect(() => {
    if (hasCategories && categories!.length > 0) {
      setSelectedCategory(categories![0]);
    }
  }, [categories, hasCategories]);

  // Update driver filters based on drivers and categories
  useEffect(() => {
    if (drivers && drivers.length) {
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
            (driverType: string) => drivers.some((d) => d.driver === driverType)
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
  }, [drivers, categories, selectedCategory, hasCategories, findValidFilter]);

  // Update unique surrounding elements for filters
  useEffect(() => {
    const uniqueElements: ISurroundingElement[] = [];

    if (surroundingElements && surroundingElements.length) {
      surroundingElements.forEach((e: ISurroundingElement) => {
        if (!uniqueElements.map((ue) => ue.type).includes(e.type)) {
          uniqueElements.push(e);
        }
      });
      setUniqueSurroundingElements(uniqueElements);
      if (uniqueElements.length === 1) {
        setSelectedSurroundingElementType(uniqueElements[0].type);
      }
    }
  }, [surroundingElements]);

  return {
    // State
    selectedDriverFilter,
    selectedCategory,
    selectedSurroundingElementType,
    driverFilters,
    uniqueSurroundingElements,
    // Computed states
    showCategorySelection,
    noCategoriesProvided,
    hasCategories,
    showDriverFilters,
    // Actions
    setSelectedDriverFilter,
    setSelectedCategory,
    setSelectedSurroundingElementType,
    // Utilities
    isDriverMatchingFilter,
    getDefaultCategory,
  };
};