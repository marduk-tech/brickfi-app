/**
 * SSR-safe browser hooks
 * Custom hooks that provide safe access to browser APIs with proper hydration
 */

import { useState, useEffect, useCallback } from 'react';
import { safeWindow, safeStorage, isBrowser } from '../libs/browser-utils';
import { useDeviceHint } from '../components/device-provider';

/**
 * Hook to detect if we're on the client side (hydrated)
 * Prevents hydration mismatches by starting with false on server
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for safe window dimensions with SSR support
 * Returns default values during SSR, then updates on client
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: 1024,  // Default for SSR
    height: 768,  // Default for SSR
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const updateDimensions = () => {
      setDimensions({
        width: safeWindow.innerWidth(),
        height: safeWindow.innerHeight(),
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Listen for resize events
    safeWindow.addEventListener('resize', updateDimensions);

    return () => {
      safeWindow.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return dimensions;
}

/**
 * Hook for safe localStorage usage with SSR support
 * Prevents hydration mismatches and handles localStorage errors
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get value from localStorage on client mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const item = safeStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, isClient]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (isClient) {
          safeStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, isClient]
  );

  return [storedValue, setValue];
}

/**
 * Hook for safe media query matching with SSR support
 * Returns false during SSR, then updates on client
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isBrowser()) return;

    const mediaQuery = safeWindow.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query, mounted]);

  return matches;
}

/**
 * Hook for safe scroll event handling with SSR support
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isBrowser()) return;

    const updatePosition = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };

    safeWindow.addEventListener('scroll', updatePosition);
    
    // Set initial position
    updatePosition();

    return () => {
      safeWindow.removeEventListener('scroll', updatePosition);
    };
  }, []);

  return scrollPosition;
}

/**
 * Hook to safely access window.location with SSR support
 */
export function useLocation() {
  const [location, setLocation] = useState({
    pathname: '/',
    search: '',
    hash: '',
    origin: '',
    href: '',
  });

  useEffect(() => {
    if (!isBrowser()) return;

    const updateLocation = () => {
      setLocation({
        pathname: safeWindow.location.pathname,
        search: window.location.search || '',
        hash: safeWindow.location.hash,
        origin: safeWindow.location.origin,
        href: safeWindow.location.href,
      });
    };

    // Set initial location
    updateLocation();

    // Listen for navigation changes
    const handlePopState = () => updateLocation();
    safeWindow.addEventListener('popstate', handlePopState);

    return () => {
      safeWindow.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return location;
}

// same breakpoints as the .mobile-only / .tablet-mobile-only classes in
// globals.scss
const MOBILE_QUERY = '(max-width: 576px)';
const TABLET_OR_MOBILE_QUERY = '(max-width: 992px)';

/**
 * Hook for detecting mobile devices with SSR support.
 * Starts from the server's user-agent guess (DeviceProvider, set in the root
 * layout) so the server render and the first client render already have the
 * right layout - no desktop-then-mobile jump - then follows the real
 * viewport width once mounted.
 */
export function useMobileDetection() {
  const hint = useDeviceHint();
  const [isMobile, setIsMobile] = useState(hint.isMobile);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(
    hint.isTabletOrMobile
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;
    const mobile = window.matchMedia(MOBILE_QUERY);
    const tabletOrMobile = window.matchMedia(TABLET_OR_MOBILE_QUERY);
    const update = () => {
      setIsMobile(mobile.matches);
      setIsTabletOrMobile(tabletOrMobile.matches);
    };
    update();
    setMounted(true);
    mobile.addEventListener('change', update);
    tabletOrMobile.addEventListener('change', update);
    return () => {
      mobile.removeEventListener('change', update);
      tabletOrMobile.removeEventListener('change', update);
    };
  }, []);

  return { isMobile, isTabletOrMobile, mounted };
}