"use client";

import { forwardRef } from "react";
import { BRICK360_CATEGORY } from "@/libs/constants";
import { DeveloperPillar } from "./developer-pillar";
import { FinancialsPillar } from "./financials-pillar";
import { LocationPillar } from "./location-pillar";
import { PillarProps } from "./pillar-base";
import { PropertyPillar } from "./property-pillar";

export { Brick360Highlights } from "./highlights";
export { FloorplansTab } from "./floorplans-tab";
export { TimelineTab } from "./timeline-tab";
export type { PillarMapConfig, PillarProps } from "./pillar-base";

// One component per pillar tab, keyed by BRICK360_CATEGORY.
const PILLAR_COMPONENTS: Record<
  string,
  typeof LocationPillar | typeof DeveloperPillar
> = {
  [BRICK360_CATEGORY.areaConnectivity]: LocationPillar,
  [BRICK360_CATEGORY.developer]: DeveloperPillar,
  [BRICK360_CATEGORY.property]: PropertyPillar,
  [BRICK360_CATEGORY.financials]: FinancialsPillar,
};

interface Brick360PillarProps extends PillarProps {
  /** Which pillar (BRICK360_CATEGORY key) to render. */
  categoryKey: string;
}

// Renders the tab component for categoryKey - lets brick360-inline.tsx keep
// one generic <Brick360Pillar categoryKey=...> per pillar tab while each
// pillar's own logic lives in its own file.
export const Brick360Pillar = forwardRef<any, Brick360PillarProps>(
  ({ categoryKey, ...props }, ref) => {
    const Pillar = PILLAR_COMPONENTS[categoryKey];
    return Pillar ? <Pillar {...props} ref={ref} /> : null;
  },
);
Brick360Pillar.displayName = "Brick360Pillar";
