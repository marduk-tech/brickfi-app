import { IDriverPlace } from "../types/Project";

export const envMode = import.meta.env.VITE_ENV;

export const baseApiUrl = import.meta.env.VITE_API_URL;

export const queryKeys = {
  projects: "projects",
  getProjectById: "getProjectById",
  getLvnzyProjectById: "getLvnzyProjectById",
  getLvnzyProjectsByIds: "getLvnzyProjectsByIds",
  getAllLvnzyProjects: "getAllLvnzyProjects",
  projectsMapView: "projectsMapView",
  getAllPlaces: "getAllPlaces",
  getAllCorridors: "getAllCorridors",
  getAllLocalities: "getAllLocalities",
  user: "user",
  paymentById: "paymentById",
};

export const LocalStorageKeys = {
  authToken: "authToken",
  user: "user",
  tour: "tour",
};

export const env = import.meta.env.VITE_ENV;
export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
export const auth0CallbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL;
export const posthogkey = import.meta.env.VITE_POSTHOG_KEY;

export const LivIndexMegaDriverConfig = {
  macro: { label: "Macro Infra" },
  connectivity: { label: "Connectivity" },
  livability: { label: "Livability" },
};

export const enum PLACE_TIMELINE {
  ANNOUNCED = "announced",
  PRE_CONSTRUCTION = "pre-construction",
  CONSTRUCTION = "construction",
  PARTIAL_LAUNCH = "partial-launch",
  LAUNCHED = "launched",
  POST_LAUNCH = "post-launch",
}

export const LivIndexDriversConfig = {
  highway: { label: "Roads", icon: { name: "FaRoad", set: "fa" } },
  school: { label: "School", icon: { name: "IoMdSchool", set: "io" } },
  university: {
    label: "University",
    icon: { name: "IoMdSchool", set: "io" },
  },
  hospital: { label: "Hospital", icon: { name: "FaRegHospital", set: "fa" } },
  leisure: {
    label: "Leisure/Tourism",
    icon: { name: "GiMountainRoad", set: "gi" },
  },
  commercial: {
    label: "Commercial",
    icon: { name: "FaStore", set: "fa" },
  },
  "industrial-hitech": {
    label: "Tech Parks",
    icon: { name: "BiSolidFactory", set: "bi" },
  },
  "industrial-general": {
    label: "Industrial Area",
    icon: { name: "RiStore3Fill", set: "ri" },
  },
  airport: {
    label: "International Airport",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  transit: {
    label: "Transit",
    icon: { name: "MdOutlineDirectionsTransit", set: "md" },
  },
  food: {
    label: "Dining",
    icon: { name: "IoFastFood", set: "io5" },
  },
  "micro-market": {
    label: "Micro Market",
    icon: { name: "RiFundsFill", set: "ri" },
  },
};

export const LivestIndexConfig = [
  {
    key: "metroCityScore",
    type: "metro",
    heading: "Metro",
    icon: { name: "PiCityBold", set: "fa" },
  },
  {
    key: "tier2CityScore",
    type: "tier2",
    heading: "Town",
    icon: { name: "FaMountainCity", set: "fa" },
  },
  {
    key: "touristCityScore",
    type: "tourist",
    heading: "Tourist Spot",
    icon: { name: "MdModeOfTravel", set: "md" },
  },
  {
    key: "schoolsScore",
    type: "school",
    heading: "School",
    icon: { name: "IoMdSchool", set: "io" },
  },
  {
    key: "hospitalsScore",
    type: "hospital",
    heading: "Hospital",
    icon: { name: "FaRegHospital", set: "fa" },
  },
  {
    key: "airportScore",
    type: "airport",
    heading: "Airport",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  {
    key: "roadsScore",
    heading: "Highway",
    type: "road",
    icon: { name: "FaRoad", set: "fa" },
  },
  {
    key: "futureInfraScore",
    heading: "Future Infra",
    type: "futureInfra",
    icon: { name: "BsBuildingCheck", set: "bs" },
  },
];

export const ProjectCategories = [
  {
    key: "bo",
    label: "Bangalore Outskirts",
    icon: {
      name: "FaMountainCity",
      set: "fa6",
    },
  },
  {
    key: "hh",
    label: "Holiday Homes",
    icon: {
      name: "FaPersonWalkingLuggage",
      set: "fa6",
    },
  },
  {
    key: "lf",
    label: "Luxury Farmhouses",
    icon: {
      name: "RiMoneyCnyCircleFill",
      set: "ri",
    },
  },
  {
    key: "he",
    label: "Harvest & Earn",
    icon: {
      name: "GiPlantSeed",
      set: "gi",
    },
  },
  {
    key: "tp",
    label: "Themed Projects",
    icon: {
      name: "GiLockedFortress",
      set: "gi",
    },
  },
  {
    key: "bl",
    label: "Bigger Lands",
    icon: {
      name: "PiFarm",
      set: "pi",
    },
  },
  {
    key: "pf",
    label: "Pocket Friendly",
    icon: {
      name: "GiTakeMyMoney",
      set: "gi",
    },
  },
];

export const LocationFilters = [
  {
    value: "chikkaballapur",
    label: "Chikkaballapur",
  },
  {
    value: "doddaballapura",
    label: "Doddaballapura",
  },
  {
    value: "sakleshpur",
    label: "Sakleshpur",
  },
  {
    value: "kanakpura",
    label: "Kanakpura",
  },
  {
    value: "mysuru",
    label: "Mysuru",
  },
];

export const LivIQPredefinedQuestions = [
  "Tell me about the team behind this project",
  "Any idea about the plot availability?",
  "What about the water supply?",
];

export enum ProjectHomeType {
  FARMLAND = "farmland",
  PLOT = "plot",
  VILLA = "villa",
  ROWHOUSE = "rowhouse",
  VILLAMENT = "villament",
  APARTMENT = "apartment",
  PENTHOUSE = "penthouse",
}

export const PlaceholderContent = `# Liv is the AI Agent for Real Estate.

**Liv** is here to make your property search effortless for North Bengaluru which is rapidly emerging as a real estate hotspot, fueled by its proximity to the **Airport, KIADB Hi-Tech Park, Metro, Highways, the upcoming Foxconn Factory** and more.  


### 💡 Ask Liv anything
`;

export enum BRICK360_CATEGORY {
  areaConnectivity = "areaConnectivity",
  developer = "developer",
  property = "property",
  financials = "financials",
}

export const Brick360CategoryInfo: Record<
  BRICK360_CATEGORY,
  {
    title: string;
    iconName: string;
    iconSet: string;
    disabled?: boolean;
    note?: string;
  }
> = {
  property: {
    title: "Property",
    iconName: "MdOutlineMapsHomeWork",
    iconSet: "md",
  },
  areaConnectivity: {
    title: "Location",
    iconName: "BiMapPin",
    iconSet: "bi",
    note: "Most of the data here explains the location profile in its current form. Refer growth potential for more details about upcoming infra.",
  },
  developer: {
    title: "Developer",
    iconName: "FaPeopleGroup",
    iconSet: "fa6",
    note: "Only projects from the developer registered under RERA in the state of Karnataka are taken up for analysis.",
  },
  financials: {
    title: "Financials",
    iconName: "TbPigMoney",
    iconSet: "tb",
  },
};

export const Brick360DataPoints = {
  property: {
    amenities: {
      label: "Amenities",
      note: "The amenities list here are as marketed by the developer. Final list should be reviewed before final agreement.",
      prompts: [
        "Outdoor amenities",
        "Any kid specific amenities?",
        "Most unique amenity",
      ],
    },
    density: {
      label: "Density",
      prompts: [
        "Total units?",
        "Breakup units by size/bhk",
        "What's the usual open space?",
      ],
    },
    surroundings: { label: "Surroundings" },
    designAndBuildQuality: { label: "Design/Build Quality" },
  },
  areaConnectivity: {
    schoolsOffices: {
      label: "Schools/Offices",
      prompts: [
        "List international schools",
        "Nearest tech park?",
        "Type of companies",
      ],
    },
    conveniences: {
      label: "Conveniences",
      prompts: ["Dining options in walking distance?", "Nearest hospital?"],
    },
    transport: {
      label: "Connectivity",
    },
  },
  developer: {
    experience: {
      label: "Experience",
      prompts: ["All past projects", "Largest project"],
    },
    timeCommitment: {
      label: "Time Committment",
      prompts: ["Delayed projects", ""],
    },
    customerSatisfaction: {
      label: "Customer Satisfaction",
      prompts: ["Describe few complaints", "Most common complaint"],
    },
  },
  financials: {
    pricePoint: {
      label: "Price Point",
      prompts: ["Projects priced higher", "Is this price high or low?"],
      note: "The final price may vary as per negotitation and other charges applied (usually 10-15% extra)",
    },
    rentalIncome: {
      label: "Rental Income",
      prompts: ["Highest rental nearby", "Rental price distribution"],
    },
    growthPotential: { label: "Growth Potential" },
  },
};

export const SurroundingElementLabels = {
  runway_strip: {
    label: "Airport/Runwway Strip",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  lake: { label: "Lake/Waterbody", icon: { name: "FaWater", set: "fa" } },
  railway: { label: "Railway Line", icon: { name: "MdTrain", set: "md" } },
  power: {
    label: "High Tension Line",
    icon: { name: "MdElectricBolt", set: "md" },
  },
  highway: { label: "Highway/Expressway", icon: { name: "GiRoad", set: "gi" } },
  forest: { label: "Forest Area", icon: { name: "GiPalmTree", set: "gi" } },
  cemetery: {
    label: "Cemetery/Graveyard",
    icon: { name: "TbGrave", set: "tb" },
  },
  sewageDrainage: {
    label: "Sewage/Drainage",
    icon: { name: "FaHouseFloodWater", set: "fa6" },
  },
};

export const LandingConstants = {
  brickAssistLink: "/brickassist",
  instaLink: "https://www.instagram.com/brickfi.in/",
  blogLink: "https://blog.brickfi.in/",
  genReportLink: "/",
  genReportFormLink: "/requestreport",
  appLink: "/app",
  sampleReport: "/app/brick360/67e6534e1336dda74a5f0502",
};

export const DRIVER_CATEGORIES = {
  schools: {
    icon: { name: "IoMdSchool", set: "io" },
    drivers: ["school", "university"],
    filters: [
      { label: "CBSE", key: "cbse" },
      { label: "ICSE", key: "icse" },
      { label: "International", key: "international" },
      { label: "Pre School", key: "pre-school" },
      { label: "University", key: "university" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "international") {
        return (
          driver.tags?.includes("ib") ||
          driver.tags?.includes("cambridge-igcse")
        );
      }
      if (filter == "pre-school") {
        return (
          driver.tags?.includes("pre-school") &&
          driver.distance &&
          driver.distance <= 5
        );
      }
      if (filter == "cbse") {
        return driver.tags?.includes("cbse");
      }
      if (filter == "icse") {
        return driver.tags?.includes("icse");
      }
      if (filter == "university") {
        return driver.driver === "university";
      }
      return false;
    },
  },
  workplace: {
    icon: { name: "BiSolidFactory", set: "bi" },
    drivers: ["industrial-hitech", "industrial-general"],
  },
  conveniences: {
    icon: { name: "FaStore", set: "fa" },
    drivers: ["food", "hospital", "commercial", "micro-market"],
    filters: [
      { key: "pop-dining", label: "Popular Dining" },
      { key: "hospital", label: "Hospital" },
      { key: "malls", label: "Large Mall" },
      { key: "market", label: "Market Area" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "pop-dining") {
        return (
          ["food"].includes(driver.driver) &&
          driver.tags &&
          driver.tags.some((t) => ["popular brand", "fine dining"].includes(t))
        );
      }
      if (filter == "hospital") {
        return driver.driver == "hospital";
      }
      if (filter == "malls") {
        return driver.driver == "commercial";
      }
      if (filter == "market") {
        return driver.driver == "micro-market";
      }
      return false;
    },
  },
  connectivity: {
    drivers: ["highway", "transit"],
    icon: { name: "FaRoad", set: "fa" },
  },
  "growth potential": {
    icon: { name: "TbChartAreaLineFilled", set: "tb" },
    drivers: [
      "industrial-hitech",
      "industrial-general",
      "highway",
      "transit",
      "micro-market",
    ],
    filters: [
      { label: "Infra Push", key: "major-infra" },
      { label: "Upcoming Tech Park", key: "upcoming-tech" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "major-infra") {
        return (
          ["highway", "industrial-general", "transit"].includes(
            driver.driver
          ) &&
          driver.status !== "post-launch" &&
          driver.distance &&
          driver.distance <= 6
        );
      }
      if (filter == "upcoming-tech") {
        return (
          ["industrial-hitech"].includes(driver.driver) &&
          driver.status !== "post-launch"
        );
      }
      return false;
    },
  },
  surroundings: {
    icon: { name: "TbMapPlus", set: "tb" },
    drivers: [],
  },
};
