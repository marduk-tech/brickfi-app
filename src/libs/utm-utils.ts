import { LocalStorageKeys } from "./constants";
import { safeStorage } from "./browser-utils";

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landingPage?: string;
  capturedAt: string;
}

export const extractUtmParams = (): UtmParameters | null => {
  if (typeof window === "undefined") return null;

  const searchParams = new URLSearchParams(window.location.search);

  const utm_source = searchParams.get("utm_source");
  const utm_medium = searchParams.get("utm_medium");
  const utm_campaign = searchParams.get("utm_campaign");
  const utm_term = searchParams.get("utm_term");
  const utm_content = searchParams.get("utm_content");

  if (!utm_source && !utm_medium && !utm_campaign && !utm_term && !utm_content) {
    return null;
  }

  return {
    ...(utm_source && { utm_source }),
    ...(utm_medium && { utm_medium }),
    ...(utm_campaign && { utm_campaign }),
    ...(utm_term && { utm_term }),
    ...(utm_content && { utm_content }),
    landingPage: window.location.pathname + window.location.search,
    capturedAt: new Date().toISOString(),
  };
};

export const saveUtmToHistory = (utmParams: UtmParameters): void => {
  try {
    const existingHistory = getUtmHistory();
    const updatedHistory = [...existingHistory, utmParams];
    safeStorage.setItem(LocalStorageKeys.utmHistory, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save UTM parameters:", error);
  }
};

export const getUtmHistory = (): UtmParameters[] => {
  try {
    const stored = safeStorage.getItem(LocalStorageKeys.utmHistory);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to retrieve UTM history:", error);
    return [];
  }
};

export const clearUtmHistory = (): void => {
  try {
    safeStorage.removeItem(LocalStorageKeys.utmHistory);
  } catch (error) {
    console.error("Failed to clear UTM history:", error);
  }
};
