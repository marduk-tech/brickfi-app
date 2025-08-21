import { ProjectHomeType } from "../../../libs/constants";
import DynamicReactIcon from "../../common/dynamic-react-icon";

export function getProjectTypeIcon(homeType: ProjectHomeType, color?: string) {
  let iconName = "IoHome",
    iconSet: any = "io5",
    overrideIcon;
  if (homeType == ProjectHomeType.APARTMENT) {
    iconName = "PiBuildingApartmentDuotone";
    iconSet = "pi";
  } else if (
    homeType == ProjectHomeType.FARMLAND ||
    homeType == ProjectHomeType.PLOT
  ) {
    iconName = "PiFarm";
    iconSet = "pi";
  } else if (homeType == ProjectHomeType.VILLA) {
    iconName = "MdOutlineVilla";
    iconSet = "md";
  } else if (
    homeType == ProjectHomeType.ROWHOUSE ||
    homeType == ProjectHomeType.VILLAMENT
  ) {
    iconName = "GiFamilyHouse";
    iconSet = "gi";
  }

  return (
    <DynamicReactIcon
      size={20}
      color={color || "white"}
      iconName={iconName}
      iconSet={iconSet}
    ></DynamicReactIcon>
  );
}
