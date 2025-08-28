import React from "react";
import { Polygon } from "react-leaflet";
import { DRIVER_CATEGORIES } from "../../../libs/constants";
import { COLORS } from "../../../theme/style-constants";
import { IDriverPlace } from "../../../types/Project";

interface MicroMarketDriversProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  categories?: string[];
  setModalContent: (content: any) => void;
  setInfoModalOpen: (open: boolean) => void;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  fetchTravelDurationElement: (distance: number, duration: number) => React.ReactNode;
}

export const MicroMarketDriversComponent = ({
  drivers,
  currentSelectedCategory,
  noCategoriesProvided,
  categories,
  setModalContent,
  setInfoModalOpen,
  isDriverMatchingFilter,
  fetchTravelDurationElement,
}: MicroMarketDriversProps) => {
  if (!drivers || !drivers.length) {
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

  return (
    <>
      {microMarketFiltered.map((d) => {
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
                  subHeading: d.distance && d.duration ? fetchTravelDurationElement(d.distance, d.duration) : undefined,
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
      })}
    </>
  );
};