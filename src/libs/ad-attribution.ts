import posthog from "posthog-js";
import { env } from "./constants";

// Ad attribution for the server-side conversions (see the services repo's
// ad-conversion.service.js): the ad click ids a visit arrived with, Meta's
// cookies and the visitor's ad consent - sent as `attribution` with each
// request that can be a conversion. The backend answers with the
// conversion's event id, and the Meta Pixel fires with it, so Meta counts
// its browser and server copies once.

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: Gtag;
  }
}

const isProduction = env === "production";

const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid"] as const;
const CLICK_ID_DAYS = 90;
const CONSENT_COOKIE = "bf_consent_ads";

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

// shared across brickfi.in subdomains in production; host-only elsewhere
// (localhost, netlify previews), where a .brickfi.in domain would be rejected
const setCookie = (name: string, value: string, days: number) => {
  const host = window.location.hostname;
  const domain = /(^|\.)brickfi\.in$/.test(host) ? "; Domain=.brickfi.in" : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/${domain}; SameSite=Lax${secure}`;
};

// On every page load: keeps the ad click ids the URL carries (an ad click
// lands with ?gclid=... or ?fbclid=...) for 90 days, and builds Meta's _fbc
// click cookie from an fbclid when the Pixel hasn't yet
export const captureClickIds = () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  CLICK_ID_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) setCookie(`bf_${key}`, value, CLICK_ID_DAYS);
  });
  const fbclid = params.get("fbclid");
  if (fbclid && !getCookie("_fbc")) {
    setCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`, CLICK_ID_DAYS);
  }
};

// The visitor's ad consent - null until they've answered the banner
export const getAdConsent = (): boolean | null => {
  const value = getCookie(CONSENT_COOKIE);
  return value === "1" ? true : value === "0" ? false : null;
};

export interface AdAttribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
  distinctId?: string;
  landingUrl?: string;
  consentAds: boolean;
}

// What goes with a conversion request as `attribution`
export const getAttribution = (): AdAttribution => {
  let distinctId: string | undefined;
  try {
    distinctId = posthog.get_distinct_id?.() || undefined;
  } catch {
    distinctId = undefined;
  }
  return {
    gclid: getCookie("bf_gclid"),
    gbraid: getCookie("bf_gbraid"),
    wbraid: getCookie("bf_wbraid"),
    fbclid: getCookie("bf_fbclid"),
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
    distinctId,
    landingUrl:
      typeof window !== "undefined" ? window.location.href : undefined,
    consentAds: getAdConsent() === true,
  };
};

// From the consent banner - updates Google's consent mode and the Meta
// Pixel, remembers the answer for a year, and puts it on the PostHog person
// (PostHog's ad destinations only forward conversions with consent)
export const setAdConsent = (granted: boolean) => {
  const state = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
  window.fbq?.("consent", granted ? "grant" : "revoke");
  setCookie(CONSENT_COOKIE, granted ? "1" : "0", 365);
  try {
    posthog.setPersonProperties?.({ consent_ads: granted });
  } catch {
    // PostHog isn't initialised outside production
  }
};

// What the backend returns for a request that was a conversion
export interface AdConversion {
  event: string;
  pixelEvent: string;
  eventId: string;
}

// Fires the Meta Pixel for a conversion the backend recorded, with its
// event id - production only, and the Pixel itself sends nothing without
// consent
export const trackPixelConversion = (conversion?: AdConversion | null) => {
  if (!isProduction || !conversion?.pixelEvent || !conversion.eventId) return;
  window.fbq?.(
    "track",
    conversion.pixelEvent,
    { content_name: conversion.event },
    { eventID: conversion.eventId },
  );
};
