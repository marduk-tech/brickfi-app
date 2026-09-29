"use client";

import posthog from "posthog-js";
import { env, PLACE_TIMELINE } from "./constants";
import { useSearchParams } from "next/navigation";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { LvnzyProject } from "../types/LvnzyProject";
import { ProjectResult } from "../app/app/brickchat/brickchat-client";

export const nestedPropertyAccessor = (
  record: any,
  keys: string | string[],
) => {
  if (Array.isArray(keys)) {
    return keys.reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
      record,
    );
  } else {
    return record[keys];
  }
};

export function useUrlParams() {
  return useSearchParams();
}

export const getMinMaxPrices = (prices: number[]) => {
  if (!Array.isArray(prices) || prices.length === 0) {
    return null; // or throw an error
  }
  let min = prices[0];
  let max = prices[0];

  for (const num of prices) {
    if (num < min) min = num;
    if (num > max) max = num;
  }

  return max == min
    ? rupeeAmountFormat(min)
    : `${rupeeAmountFormat(min)} - ${rupeeAmountFormat(max)}`;
};
const toRoman = (num: number) => {
  const romanMap: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of romanMap) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

// covers phase/block numbering (e.g. "Phase II"); real project names don't
// go past this range, kept small to avoid false positives on ordinary words
// that happen to be spelled with roman numeral letters (e.g. "mix", "civil")
const ROMAN_NUMERALS = new Set(
  Array.from({ length: 49 }, (_, i) => toRoman(i + 1)),
);

export const capitalize = (input: string) => {
  if (!input) {
    return "";
  }
  return input.toLowerCase().replace(/\b\w+\b/g, (word) => {
    const upper = word.toUpperCase();
    return ROMAN_NUMERALS.has(upper)
      ? upper
      : word.charAt(0).toUpperCase() + word.slice(1);
  });
};

export const driverStatusLabel = (status: string) => {
  if (status == PLACE_TIMELINE.ANNOUNCED) {
    return "Proposed";
  } else if (status == PLACE_TIMELINE.PRE_CONSTRUCTION) {
    return "Land Acquisition/Planning";
  } else if (status == PLACE_TIMELINE.CONSTRUCTION) {
    return "Under Construction";
  } else if (status == PLACE_TIMELINE.LAUNCHED) {
    return "Recently Launched";
  } else {
    return "Operational";
  }
};

export const rupeeAmountFormat = (amt: string | number) => {
  const amtNum = typeof amt == "string" ? parseInt(amt) : Math.round(amt);
  if (!amtNum || isNaN(amtNum)) {
    return amt;
  }
  const val = Math.abs(amtNum);
  if (val >= 10000000) return `${(amtNum / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(amtNum / 100000).toFixed(2)} Lacs`;
  return amtNum;
};

export const thsndFormat = (amt: string | number) => {
  const amtNum = typeof amt == "string" ? parseInt(amt) : Math.round(amt);
  if (!amtNum || isNaN(amtNum)) {
    return amt;
  }
  const val = Math.abs(amtNum);
  if (val >= 1000) return `${Math.floor(amtNum / 1000)},${String(amtNum % 1000).padStart(3, "0")}`;
  return amtNum;
};

export const captureAnalyticsEvent = (event: string, props: any) => {
  if (env == "production") {
    try {
      console.log("captured posthog event: ", event);
      posthog.capture(`bkfi-${event}`, props || {});
    } catch (err: any) {
      console.warn("error while capturing posthog event: ", err);
    }
  }
};

export const getCategoryScore = (dataPt: any) => {
  if (!dataPt) {
    return 0;
  }
  let totRating = 0,
    ct = 0;
  Object.keys(dataPt).forEach((subPt) => {
    if (dataPt[subPt]?.rating) {
      totRating += dataPt[subPt].rating;
      ct++;
    }
  });
  if (!totRating) {
    return 0;
  }
  return totRating / ct;
};

export const fetchPmtPlan = (txt: any) => {
  let pmtPlan;
  try {
    pmtPlan = txt.split("\n")[0].replaceAll("#", "");
  } catch (err) {
    console.log("could not find pmt plan");
  }
  return pmtPlan;
};

export const txtToId = (txt: string) => {
  return txt
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\s]/g, "") // remove special characters
    .trim() // remove leading/trailing spaces
    .replace(/\s+/g, "_"); // replace spaces with underscore
};

export const renderCitations = (citations: any) => {
  if (!citations || !Array.isArray(citations)) {
    return [];
  }

  return citations
    .filter((c: any) => c.url.indexOf("wikipedia") == -1)
    .map((citation: any) => {
      const domain = citation.url.match(
        /^(?:https?:\/\/)?(?:www\.)?([^/]+)/,
      )[1];
      return (
        <a
          href={citation.url}
          target="_blank"
          style={{
            textDecoration: "none",
            fontSize: FONT_SIZE.SUB_TEXT,
            padding: "2px 4px",
            backgroundColor: COLORS.bgColor,
            borderRadius: 8,
            color: COLORS.textColorMedium,
            border: `1px solid ${COLORS.borderColor}`,
            marginRight: 4,
          }}
        >
          {domain}
        </a>
      );
    });
};

// Maps a saved LvnzyProject (as returned in a user's savedLvnzyProjects
// collection) into the ProjectResult shape BrickChatResults/BrickMapChat
// render. Returns null for entries that haven't been populated into a full
// project doc yet (report still pending) - mirrors the guard previously
// inlined in UserProjects' renderLvnzyProject.
export const mapLvnzyProjectToResult = (
  lp: LvnzyProject,
  rankScore = 0,
): ProjectResult | null => {
  if (!lp || (!lp.meta && !(lp as any).reraNumber && !(lp as any).reraId)) {
    return null;
  }
  if (!lp.meta?.projectName) {
    return null;
  }

  const minCost = lp.meta?.costingDetails?.minimumUnitCost;
  const minSize = lp.meta?.costingDetails?.minimumUnitSize;
  const corridors: any[] = lp.meta?.projectCorridors || [];
  const nearestCorridor = corridors.length
    ? corridors.reduce((a: any, b: any) =>
        (a.approxDistanceInKms ?? Infinity) <= (b.approxDistanceInKms ?? Infinity)
          ? a
          : b,
      )
    : undefined;

  return {
    projectId: lp.originalProjectId?._id || "",
    projectName: lp.meta.projectName,
    oneLiner: "",
    lvnzyProjectId: lp._id,
    projectSlug: lp.slug,
    projectStatus: lp.originalProjectId?.info.status,
    projectLocation: lp.originalProjectId?.info?.location || { lat: 0, lng: 0 },
    projectImage: (
      lp.originalProjectId?.media?.find(
        (m: any) => m.type === "image" && m.isPreview,
      ) ||
      lp.originalProjectId?.media?.find(
        (m: any) => m.type === "image" && m.image?.tags?.includes("exterior"),
      ) ||
      lp.originalProjectId?.media?.find(
        (m: any) => m.type === "image" && m.image?.tags?.includes("amenity"),
      )
    )?.image?.url,
    isDeveloperPartner:  !!lp.originalProjectId?.info?.developerId?.brkfiStatus?.isPartner,
    projectHomeTypes: lp.originalProjectId?.info?.homeType,
    sizeBuiltupMin: minSize || undefined,
    projectAvgSquareFootPrice:
      minCost && minSize ? Math.round(minCost / minSize) : undefined,
    projectCorridor: nearestCorridor?.corridorName,
    rankScore,
  };
};

// Dedupe a list of ids and put newId at the front
export const removeDuplicatesAndPrepend = (
  arr: string[],
  newId: string,
): string[] => {
  const uniqueSet = new Set(
    arr.filter((id) => id?.toString() !== newId.toString()),
  );
  return [newId, ...Array.from(uniqueSet)];
};
