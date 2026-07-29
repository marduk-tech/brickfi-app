import { IDriverPlace } from "../types/Project";

export const envMode = process.env.NEXT_PUBLIC_ENV;

export const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const apiKey = process.env.NEXT_PUBLIC_API_KEY;
export const sitemapApiKey = process.env.SITEMAP_API_KEY;

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
  getRealEstateDeveloperById: "getRealEstateDeveloperById",
  glossary: "glossary",
};

export const LocalStorageKeys = {
  authToken: "authToken",
  user: "user",
  tour: "tour",
  utmHistory: "utm_history",
};

export const env = process.env.NEXT_PUBLIC_ENV;
export const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
export const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
export const auth0CallbackUrl = process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL;
export const posthogkey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

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
    icon: { name: "PiBuildingOfficeFill", set: "pi" },
  },
  "industrial-general": {
    label: "Industrial Area",
    icon: { name: "FaIndustry", set: "fa" },
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
    sources?: any[];
  }
> = {
  areaConnectivity: {
    title: "Location",
    iconName: "BiMapPin",
    iconSet: "bi",
    sources: [
      { label: "Open Street", url: "https://www.openstreetmap.org" },
      { label: "Namma Metro", url: "https://www.bmrc.co.in/" },
      { label: "Suburban Rail", url: "https://kride.in/" },
    ],
    note: "You can also refer to growth potential for details about upcoming infra.",
  },
  developer: {
    title: "Developer",
    iconName: "FaPeopleGroup",
    iconSet: "fa6",
    sources: [
      { url: "https://rera.karnataka.gov.in/", label: "RERA" },
      { label: "Builder Website" },
    ],
    note: "Projects registered under RERA are considered for time committment & complaint analysis.",
  },
  property: {
    title: "Property",
    iconName: "MdOutlineMapsHomeWork",
    sources: [
      { url: "https://rera.karnataka.gov.in/", label: "RERA" },
      { label: "Open Street", url: "https://www.openstreetmap.org" },
      { label: "Official Brochure" },
    ],
    iconSet: "md",
  },
  financials: {
    title: "Financials",
    iconName: "TbPigMoney",
    iconSet: "tb",
    sources: [
      { label: "Open Street", url: "https://www.openstreetmap.org" },
      { url: "https://opencity.in/", label: "Open City" },
      { label: "Live Listings" },
    ],
  },
};

export const Brick360DataPoints = {
  property: {
    futureProjectNoDataPlaceholder:
      "Property assessment is currently not available since the project is yet to be launched. Full assessment will be available on launch.",
    oldProjectNoDataPlaceholder:
      "Property assessment is not available since the project is pre-RERA i.e was completed before RERA.",
    amenities: {
      label: "Amenities",
      note: "The amenities list here are as marketed by the developer and should be reviewed in agreement.",
      prompts: [
        "Outdoor amenities",
        "Kid specific amenities",
        "Most unique amenity",
      ],
    },
    density: {
      label: "Layout",
      note: "The numbers below are as per the approved layout plan on RERA.",
      prompts: [
        "Total units?",
        "Breakup units by size/bhk",
        "What's the usual open space?",
      ],
    },
    surroundings: { label: "Surroundings" },
    landProfile: {
      label: "Land Profile",
      note: "Survey numbers are analysed as per details posted on RERA.",
      prompts: ["All land parcels", "Land Owners"],
    },
    designAndBuildQuality: { label: "Design/Build Quality" },
  },
  areaConnectivity: {
    noDataPlaceholder:
      "Insufficient data is available to rate the area and connectivity for this project.",
    schoolsOffices: {
      label: "Schools/Offices",
      prompts: ["International schools", "Type of companies"],
    },
    conveniences: {
      label: "Conveniences",
      prompts: ["Nearest dining", "Largest mall nearby"],
    },
    transport: {
      label: "Commute",
      prompts: ["Nearest metro", "Roads Nearby"],
    },
  },
  developer: {
    noDataPlaceholder:
      "Due to the absence of a meaningful track record of RERA-registered projects, a rating cannot be provided for this developer.",
    experience: {
      label: "Experience",
      prompts: ["All RERA projects", "More about management"],
    },
    timeCommitment: {
      label: "Time Committment",
    },
    customerSatisfaction: {
      label: "Customer Complaints",
    },
  },
  financials: {
    noDataPlaceholder:
      "Insufficient data is available to assess the financial metrics for this project.",
    pricePoint: {
      label: "Price Point",
      prompts: ["Projects priced higher", "Price vs distance"],
      note: "The final price may vary as per negotitation and other charges applied (usually 7-15% extra)",
    },
    rentalIncome: {
      label: "Rental Income",
      prompts: ["Highest rental nearby", "Rentals vs distance"],
    },
    growthPotential: {
      label: "Growth Potential",
      prompts: ["Future Infra", "Current demand drivers"],
    },
  },
};

export const SurroundingElementLabels = {
  runway_strip: {
    label: "Airport/Runwway Strip",
    icon: { name: "MdLocalAirport", set: "md" },
  },
  lake: { label: "Lake", icon: { name: "FaWater", set: "fa" } },
  railway: { label: "Railway Line", icon: { name: "MdTrain", set: "md" } },
  power: {
    label: "High Tension Line",
    icon: { name: "MdElectricBolt", set: "md" },
  },
  highway: { label: "Highway/Expressway", icon: { name: "GiRoad", set: "gi" } },
  forest: { label: "Forest Area", icon: { name: "GiPalmTree", set: "gi" } },
  cemetery: {
    label: "Cemetery",
    icon: { name: "TbGrave", set: "tb" },
  },
  sewageDrainage: {
    label: "Sewage/Drainage",
    icon: { name: "FaHouseFloodWater", set: "fa6" },
  },
  depot: {
    label: "Industrial Depot",
    icon: { name: "MdOutlineLineStyle", set: "md" },
  },
  landfill: {
    label: "Landfill / Dumpsite",
    icon: { name: "FaDumpster", set: "fa" },
  }
};

export const LandingConstants = {
  brickAssistLink: "/brickassist",
  callbackSuccessLink: "/callback-request-success",
  callbackLink: "/callback-request",
  aboutUsLink: "/aboutus",
  instaLink: "https://www.instagram.com/brickfi.online/",
  twitterLink: "https://x.com/brickfi_in",
  blogLink: "https://blog.brickfi.in/",
  reportLink: "/brick360",
  genReportFormLink: "/requestreport",
  appLink: "/app",
  sampleReport: "/app/brick360/nambiar-district-25-832",
  brick360Descr:
    "Get a comprehensive Brick360 Report around property layout, financial assessment, builder credibility and more for any property in Bangalore.",
};

export const CATEGORY_COLORS: Record<string, string> = {
  schools: "#4A90E2",
  workplace: "#FF8080",
  metro: "#9B59B6",
  roads: "#34495E",
  "growth potential": "#27AE60",
  dining: "#E67E22",
  hospital: "#E74C3C",
  commercial: "#F39C12",
  surroundings: "#95A5A6",
};

export const DRIVER_TYPE_COLORS: Record<string, string> = {
  school: "#4A90E2",
  university: "#5DADE2",
  "industrial-hitech": "#FF8080",
  "industrial-general": "#E57373",
  transit: "#9B59B6",
  highway: "#34495E",
  hospital: "#E74C3C",
  food: "#E67E22",
  commercial: "#F39C12",
  "micro-market": "#FFA726",
};

interface DriverCategory {
  icon: { name: string; set: string };
  drivers: string[];
  filters?: Array<{ label: string; key: string }>;
  onFilter?: (filter: string, driver: IDriverPlace) => boolean;
}

export const DRIVER_CATEGORIES: Record<string, DriverCategory> = {
  roads: {
    drivers: ["highway"],
    icon: { name: "FaRoad", set: "fa" },
  },
  metro: {
    drivers: ["transit"],
    filters: [
      { label: "Namma Metro", key: "metro" },
      { label: "Suburban Rail", key: "kride" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "metro") {
        return !!(
          driver && driver.name && driver.name.toLowerCase().includes("metro")
        );
      }
      if (filter == "kride") {
        return !!(
          driver &&
          driver.name &&
          driver.name.toLowerCase().includes("suburban")
        );
      }
      return false;
    },
    icon: { name: "FaTrain", set: "fa" },
  },
  workplace: {
    icon: { name: "MdOutlineWork", set: "md" },
    drivers: ["industrial-hitech", "industrial-general"],
    filters: [
      { label: "Tech Hubs", key: "tech-hubs" },
      { label: "Industrial Zones", key: "ind-zones" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "tech-hubs") {
        return ["industrial-hitech"].includes(driver.driver);
      }
      if (filter == "ind-zones") {
        return ["industrial-general"].includes(driver.driver);
      }
      return false;
    },
  },
  "growth potential": {
    icon: { name: "TbChartAreaLineFilled", set: "tb" },
    drivers: [
      "industrial-hitech",
      "industrial-general",
      "highway",
      "transit",
      "micro-market",
      "commercial",
    ],
    filters: [
      { label: "Established Demand", key: "est-infra" },
      { label: "Infra Push", key: "major-infra" },
      { label: "Upcoming Tech Park", key: "upcoming-tech" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "est-infra") {
        return (
          (["industrial-hitech", "transit", "micro-market"].includes(
            driver.driver
          ) &&
          (driver.status === "post-launch" || driver.status === "launched") &&
          (!driver.distance || driver.distance <= 30)) ||
          (["industrial-general", "highway", "transit"].includes(driver.driver) &&
          (driver.status === "post-launch") && 
            (!driver.distance || driver.distance <= 60))
        );
      }
      if (filter == "major-infra") {
        return (
          (["highway", "transit", "commercial"].includes(driver.driver) &&
            driver.status !== "post-launch" &&
            (!driver.distance || driver.distance <= 25)) ||
          (["industrial-general"].includes(driver.driver) &&
          (driver.status !== "post-launch") &&
            (!driver.distance || driver.distance <= 60))
        );
      }
      if (filter == "upcoming-tech") {
        return (
          ["industrial-hitech"].includes(driver.driver) &&
          driver.status !== "post-launch" &&
          driver.status !== "launched"
        );
      }
      return false;
    },
  },
  schools: {
    icon: { name: "IoMdSchool", set: "io" },
    drivers: ["school", "university"],
    filters: [
      { label: "Primary & Secondary", key: "k12" },
      { label: "Pre School", key: "pre-school" },
      { label: "University", key: "university" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "k12") {
        return (
          !driver.tags?.includes("pre-school") && driver.driver !== "university"
        );
      }
      if (filter == "pre-school") {
        return !!(
          driver.tags?.includes("pre-school") &&
          driver.distance &&
          driver.distance <= 5
        );
      }
      if (filter == "university") {
        return driver.driver === "university";
      }
      return false;
    },
  },

  dining: {
    icon: { name: "MdFoodBank", set: "md" },
    drivers: ["food"],
    filters: [
      { key: "high-rated", label: "Highly Rated" },
      { key: "pop-dining", label: "Popular Dining" },
      { key: "cafe", label: "Cafes" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "pop-dining") {
        return !!(
          driver.tags && driver.tags.some((t) => ["popular brand"].includes(t))
        );
      }

      if (filter == "high-rated") {
        return !!(
          driver.tags &&
          driver.tags.some((t) => ["fine dining", "highly rated"].includes(t))
        );
      }

      if (filter == "cafe") {
        return !!(
          driver.tags &&
          driver.tags.some((t) => ["highly rated"].includes(t)) &&
          driver.tags.some((t) => ["cafe"].includes(t))
        );
      }

      return false;
    },
  },

  hospital: {
    icon: { name: "FaRegHospital", set: "fa" },
    drivers: ["hospital"],
    filters: [
      { label: "NABH accredited", key: "nabh" },
      { label: "Medical Care", key: "medical" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "nabh") {
        return !!(
          driver.tags &&
          driver.tags.some((t) => t.toLowerCase().indexOf("nabh") > -1)
        );
      }
      if (filter == "medical") {
        return (
          !driver.tags ||
          !driver.tags.some((t) => t.toLowerCase().indexOf("nabh") > -1)
        );
      }
      return false;
    },
  },

  commercial: {
    icon: { name: "FaStore", set: "fa" },
    drivers: ["commercial", "micro-market"],
    filters: [
      { label: "Large Malls", key: "mall" },
      { label: "Market Hub", key: "mkt" },
    ],
    onFilter: (filter: string, driver: IDriverPlace) => {
      if (filter == "mall") {
        return driver.driver == "commercial";
      }
      if (filter == "mkt") {
        return driver.driver == "micro-market";
      }
      return false;
    },
  },

  surroundings: {
    icon: { name: "TbMapPlus", set: "tb" },
    drivers: [],
  },
};

export const SEO_CONTENT = {
  companyName: "Brickfi",
  companyUrl: "https://www.brickfi.in/",
  companyLogo: "https://www.brickfi.in/images/brickfi-logo.png",
  companyDescription:
    "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
};

export const FAQ_360 = [
  {
    question: "What is Brick360 Report?",
    answer: `Brick360 provides a consolidated and comprehensive report about any
          property in Bangalore covering information builder credibility,
          location insights, property profile, price point evaluation and more.
          We collect data over 200+ data points from sources like RERA, Open
          City, BBMP, City info and then do an end to end analysis using AI to
          create a report that enables you to analyse the property and make a
          confident decision.`,
  },
  {
    question: "Is this report free ?",
    answer: `You can request upto 3 Brick360 reports for FREE to do a thorough
          analysis and make an informed decision. This service is completely
          free.`,
  },
  {
    question: "Does the report compare multiple properties?",
    answer: `You can download report for multiple properties and do a side by side
          comparison across different data points.`,
  },
  {
    question: "How accurate is the data in the report?",
    answer: `We have put a system in place to fetch data from verified government
          and credible public sources. Besides, we also cross check as well as
          manually check the data for accuracy.`,
  },
  {
    question: "What kind of issues can the report reveal?",
    answer: `You can identify issues like high tension lines near the property,
          upcoming metro stations, understand premiumess of the property, look
          at timely delivery committment of the builder and much more.`,
  },
  {
    question: "Can this report tell me if the property will appreciate?",
    answer: `It includes a “Growth Potential” analysis based on location trends,
          upcoming infrastructure, and historical price patterns.`,
  },
  {
    question: "How is this different from a broker’s advice?",
    answer: `Brokers are often incentivized to sell specific properties and heavily
          market them. We do not have tie ups to specific properties and
          prioritize 100% data-driven and unbiased insights.`,
  },
  {
    question: "How quickly can I get my property report?",
    answer: `For selected projects, you can get a Brick360 report instanly. For others, it may take longer to gather all the necessary property
          details and you will receive a confirmation once the report is ready to view.`,
  },
  {
    question: "What if I have a question with the report ?",
    answer: `The report is interactive and has an AI assistant which lets you ask
          unlimited questions for clarity and to generate more insights. You can
          also reach out to the Brickfi team at hello@brickfi.in in case you
          have any more specific questions.`,
  },
];
