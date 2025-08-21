import posthog from "posthog-js";
import { env, PLACE_TIMELINE } from "./constants";
import { useLocation } from "react-router-dom";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export const nestedPropertyAccessor = (
  record: any,
  keys: string | string[]
) => {
  if (Array.isArray(keys)) {
    return keys.reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
      record
    );
  } else {
    return record[keys];
  }
};

export function useUrlParams() {
  return new URLSearchParams(useLocation().search);
}

export const capitalize = (input: string) => {
  if (!input) {
    return "";
  }
  return input.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const driverStatusLabel = (status: string) => {
  if (status == PLACE_TIMELINE.ANNOUNCED) {
    return "Proposed";
  } else if (status == PLACE_TIMELINE.PRE_CONSTRUCTION) {
    return "Land Acquisition/Planning";
  } else if (status == PLACE_TIMELINE.CONSTRUCTION) {
    return "Under Construction";
  } else if (status == PLACE_TIMELINE.LAUNCHED) {
    return "Ready for Operation";
  } else {
    return "Operational";
  }
};

export const rupeeAmountFormat = (amt: string) => {
  const amtNum = parseInt(amt);
  if (!amtNum || isNaN(amtNum)) {
    return amt;
  }
  const val = Math.abs(amtNum);
  if (val >= 10000000) return `${(amtNum / 10000000).toFixed(1)} Crs`;
  if (val >= 100000) return `${(amtNum / 100000).toFixed(2)} Lacs`;
  return amtNum;
};

export const captureAnalyticsEvent = (event: string, props: any) => {
  if (env == "production") {
    try {
      posthog.capture(event, props || {});
    } catch (err: any) {
      console.warn("error while logging posthog event: ", err);
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

export const renderCitations = (citations: any) => {
  if (!citations || !Array.isArray(citations)) {
    return [];
  }
  
  return citations
    .filter((c: any) => c.url.indexOf("wikipedia") == -1)
    .map((citation: any) => {
      const domain = citation.url.match(
        /^(?:https?:\/\/)?(?:www\.)?([^/]+)/
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
