// The device class guessed from the request, so the server renders (and the
// client hydrates with) the right layout instead of desktop-then-mobile. Only
// a first guess: useMobileDetection corrects it from the real viewport width
// once mounted (e.g. a narrow desktop window).
export interface DeviceHint {
  /** phone - same class as the .mobile-only breakpoint (<= 576px) */
  isMobile: boolean;
  /** phone or tablet - same class as .tablet-mobile-only (<= 992px) */
  isTabletOrMobile: boolean;
}

export const DESKTOP_HINT: DeviceHint = {
  isMobile: false,
  isTabletOrMobile: false,
};

export function getDeviceHint(
  userAgent: string | null,
  chUaMobile?: string | null,
): DeviceHint {
  const ua = userAgent || "";
  // Sec-CH-UA-Mobile is "?1" on phones (Chromium browsers)
  const isPhone =
    chUaMobile === "?1" ||
    /iPhone|iPod|Windows Phone|Mobi/i.test(ua) ||
    // Android phones carry "Mobile"; Android tablets don't
    (/Android/i.test(ua) && /Mobile/i.test(ua));
  const isTablet =
    !isPhone && /iPad|Android|Tablet|Silk|PlayBook/i.test(ua);
  return { isMobile: isPhone, isTabletOrMobile: isPhone || isTablet };
}
