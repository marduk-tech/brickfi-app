import L from "leaflet";
import { useCallback, useEffect, useState } from "react";
import { IconSetKey } from "../common/dynamic-react-icon";
import {
  LivIndexDriversConfig,
  SurroundingElementLabels,
} from "../../libs/constants";
import { HOME_TYPE_ICON } from "../../libs/home-type-icons";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS } from "../../theme/style-constants";
import { IDriverPlace, ISurroundingElement } from "../../types/Project";
import { getIcon } from "./utils";

export interface IconState {
  simpleDriverMarkerIcons: Array<{
    icon: L.DivIcon;
    driverId: string;
    duration?: number;
  }>;
  surroundingElementIcons: Array<{
    type: string;
    icon: L.DivIcon;
  }>;
  projectsNearbyIcons: Array<{
    name: string;
    icon: L.DivIcon;
  }>;
  currentProjectMarkerIcon: L.DivIcon | null;
  projectMarkerIcon: L.DivIcon | null;
  projectMarkerIconsByHomeType: Record<string, L.DivIcon>;
  transitStationIcon: L.DivIcon | null;
  roadIcon: L.DivIcon | null;
}

export interface UseMapIconsReturn extends IconState {
  isLoadingIcons: boolean;
  refreshDriverIcons: () => Promise<void>;
  refreshProjectIcons: () => Promise<void>;
  refreshSurroundingElementIcons: (
    elements: ISurroundingElement[],
  ) => Promise<void>;
  refreshProjectsNearbyIcons: (
    projects: Array<{ projectName: string; sqftCost: number; projectType?: string }>,
  ) => Promise<void>;
}

export const useMapIcons = (
  drivers?: IDriverPlace[],
  primaryProject?: any,
  projectsNearby?: Array<{
    projectName: string;
    sqftCost: number;
    projectLocation: { lat: number; lng: number };
    projectType?: string;
  }>,
  projectSqftPricing?: number,
): UseMapIconsReturn => {
  // Icon state
  const [simpleDriverMarkerIcons, setSimpleDriverMarkerIcons] = useState<
    Array<{
      icon: L.DivIcon;
      driverId: string;
      duration?: number;
    }>
  >([]);

  const [surroundingElementIcons, setSurroundingElementIcons] = useState<
    Array<{
      type: string;
      icon: L.DivIcon;
    }>
  >([]);

  const [projectsNearbyIcons, setProjectsNearbyIcons] = useState<
    Array<{
      name: string;
      icon: L.DivIcon;
    }>
  >([]);

  const [currentProjectMarkerIcon, setCurrentProjectMarkerIcon] =
    useState<L.DivIcon | null>(null);
  const [projectMarkerIcon, setProjectMarkerIcon] = useState<L.DivIcon | null>(
    null,
  );
  const [projectMarkerIconsByHomeType, setProjectMarkerIconsByHomeType] =
    useState<Record<string, L.DivIcon>>({});
  const [transitStationIcon, setTransitStationIcon] =
    useState<L.DivIcon | null>(null);
  const [roadIcon, setRoadIcon] = useState<L.DivIcon | null>(null);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);

  // Driver icons generation
  const refreshDriverIcons = useCallback(async () => {
    if (!drivers || !drivers.length) {
      setSimpleDriverMarkerIcons([]);
      return;
    }

    setIsLoadingIcons(true);
    try {
      const icons = await Promise.all(
        drivers.map(async (driver) => {
          const iconConfig = (LivIndexDriversConfig as any)[driver.driver];

          if (!iconConfig) {
            console.warn(
              `No icon config found for driver type: ${driver.driver}`,
            );
            return null;
          }

          const baseIcon = await getIcon(
            iconConfig.icon.name,
            iconConfig.icon.set,
            false,
            undefined,
            driver,
          );

          return baseIcon
            ? {
                icon: baseIcon,
                driverId: driver._id,
                duration: driver?.duration,
              }
            : null;
        }),
      );

      const validIcons = icons.filter(Boolean) as Array<{
        icon: L.DivIcon;
        driverId: string;
        duration?: number;
      }>;
      setSimpleDriverMarkerIcons(validIcons);
    } catch (error) {
      console.error("Error generating driver icons:", error);
    } finally {
      setIsLoadingIcons(false);
    }
  }, [drivers]);

  // Project icons generation
  const refreshProjectIcons = useCallback(async () => {
    setIsLoadingIcons(true);
    try {
      // Current project marker icon
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
        },
      );
      setCurrentProjectMarkerIcon(currentProjectIcon);

      // Regular project marker icon (fallback for unknown home types)
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
        },
      );
      setProjectMarkerIcon(projectIcon);

      // One marker icon per home type
      const homeTypeEntries = await Promise.all(
        Object.entries(HOME_TYPE_ICON).map(async ([homeType, cfg]) => {
          const icon = await getIcon(
            cfg.name,
            cfg.set,
            false,
            undefined,
            undefined,
            {
              iconBgColor: "white",
              iconColor: COLORS.textColorDark,
              iconSize: 18,
              borderColor: COLORS.primaryColor,
            },
          );
          return icon ? ([homeType, icon] as const) : null;
        }),
      );
      const homeTypeIcons: Record<string, L.DivIcon> = {};
      for (const entry of homeTypeEntries) {
        if (entry) homeTypeIcons[entry[0]] = entry[1];
      }
      setProjectMarkerIconsByHomeType(homeTypeIcons);

      // Transit station icon
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
        },
      );
      setTransitStationIcon(transitStationIcon);

      // Road icon
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
        },
      );
      setRoadIcon(roadIcon);
    } catch (error) {
      console.error("Error generating project icons:", error);
    } finally {
      setIsLoadingIcons(false);
    }
  }, [primaryProject, projectsNearby, projectSqftPricing]);

  // Surrounding element icons generation
  const refreshSurroundingElementIcons = useCallback(
    async (elements: ISurroundingElement[]) => {
      if (!elements || !elements.length) {
        setSurroundingElementIcons([]);
        return;
      }

      setIsLoadingIcons(true);
      try {
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
            },
          );
          if (elementIcon) {
            elementIcons.push({ type: element.type, icon: elementIcon });
          }
        }
        setSurroundingElementIcons(elementIcons);
      } catch (error) {
        console.error("Error generating surrounding element icons:", error);
      } finally {
        setIsLoadingIcons(false);
      }
    },
    [],
  );

  // Nearby projects icons generation
  const refreshProjectsNearbyIcons = useCallback(
    async (projects: Array<{ projectName: string; sqftCost: number; projectType?: string }>) => {
      if (!projects || !projects.length) {
        setProjectsNearbyIcons([]);
        return;
      }

      setIsLoadingIcons(true);
      try {
        const icons = [];
        for (const project of projects) {
          // pick icon by home type; fall back to a generic home icon when type is missing/unknown
          const iconCfg = (project.projectType && HOME_TYPE_ICON[project.projectType]) || {
            set: "md" as IconSetKey,
            name: "MdHomeWork",
          };
          const icon = await getIcon(
            iconCfg.name,
            iconCfg.set,
            false,
            `${project.sqftCost} /sqft`,
          );
          if (icon) {
            icons.push({
              name: project.projectName,
              icon,
            });
          }
        }
        setProjectsNearbyIcons(icons);
      } catch (error) {
        console.error("Error generating nearby project icons:", error);
      } finally {
        setIsLoadingIcons(false);
      }
    },
    [],
  );

  // Auto-refresh driver icons when drivers change
  useEffect(() => {
    refreshDriverIcons();
  }, [refreshDriverIcons]);

  // Auto-refresh project icons when primary project changes
  useEffect(() => {
    refreshProjectIcons();
  }, [refreshProjectIcons]);

  // Auto-refresh nearby projects icons when projectsNearby changes
  useEffect(() => {
    if (projectsNearby && projectsNearby.length) {
      refreshProjectsNearbyIcons(projectsNearby);
    }
  }, [projectsNearby, refreshProjectsNearbyIcons]);

  return {
    // State
    simpleDriverMarkerIcons,
    surroundingElementIcons,
    projectsNearbyIcons,
    currentProjectMarkerIcon,
    projectMarkerIcon,
    projectMarkerIconsByHomeType,
    transitStationIcon,
    roadIcon,
    isLoadingIcons,
    // Actions
    refreshDriverIcons,
    refreshProjectIcons,
    refreshSurroundingElementIcons,
    refreshProjectsNearbyIcons,
  };
};
