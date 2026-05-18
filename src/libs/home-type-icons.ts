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

// Picks one icon per project regardless of filters: built/specific beats raw land.
export const HOME_TYPE_PRIORITY: string[] = [
  "penthouse",
  "villa",
  "rowhouse",
  "villament",
  "apartment",
  "plot",
  "farmland",
];

export const getPrimaryHomeType = (
  homeTypes: string[] | undefined | null,
): string | undefined => {
  if (!Array.isArray(homeTypes) || homeTypes.length === 0) return undefined;
  return HOME_TYPE_PRIORITY.find(
    (t) => homeTypes.includes(t) && !!HOME_TYPE_ICON[t],
  );
};
