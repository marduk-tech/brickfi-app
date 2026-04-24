import { IconSetKey } from "@/components/common/dynamic-react-icon";

// filter dropdown and the map view project markers.
export const HOME_TYPE_ICON: Record<string, { set: IconSetKey; name: string }> =
  {
    apartment: { set: "pi", name: "PiBuildingApartment" },
    villament: { set: "pi", name: "PiBuildingApartment" },
    penthouse: { set: "pi", name: "PiBuildingApartment" },
    villa: { set: "md", name: "MdOutlineVilla" },
    rowhouse: { set: "md", name: "MdHomeWork" },
    plot: { set: "lu", name: "LuLandPlot" },
  };
