import React, { useEffect, useState } from "react";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";
import {
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
  PLACE_TIMELINE,
} from "../../../libs/constants";
import { capitalize, driverStatusLabel } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";
import { getIcon } from "../utils";

interface SimpleDriversProps {
  bounds: L.LatLngBounds;
  drivers?: IDriverPlace[];
  simpleDriverMarkerIcons: any[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  setModalContent: (content: any) => void;
  setInfoModalOpen: (open: boolean) => void;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  fetchTravelDurationElement: (
    distance: number,
    duration: number
  ) => React.ReactNode;
}

export const SimpleDriversRenderer = ({
  bounds,
  drivers,
  simpleDriverMarkerIcons,
  currentSelectedCategory,
  noCategoriesProvided,
  setModalContent,
  setInfoModalOpen,
  isDriverMatchingFilter,
  fetchTravelDurationElement,
}: SimpleDriversProps): React.JSX.Element | null => {
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
            (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers || [];
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
          (d) => d._id === driver._id
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
                  subHeading: (driver.distance && driver.duration)
                    ? fetchTravelDurationElement(
                        driver.distance,
                        driver.duration
                      )
                    : undefined,
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
