/**
 * SSR-safe browser API utilities
 * Provides safe wrappers for browser-only APIs with fallbacks for server-side rendering
 */

// Safe window object with fallbacks
export const safeWindow = {
  /**
   * Get window inner width with fallback
   * @param fallback Default width for SSR (default: 1024)
   */
  innerWidth: (fallback = 1024): number => 
    typeof window !== 'undefined' ? window.innerWidth : fallback,
  
  /**
   * Get window inner height with fallback  
   * @param fallback Default height for SSR (default: 768)
   */
  innerHeight: (fallback = 768): number =>
    typeof window !== 'undefined' ? window.innerHeight : fallback,
  
  /**
   * Safe window location operations
   */
  location: {
    assign: (url: string): void => {
      if (typeof window !== 'undefined') {
        window.location.assign(url);
      }
    },
    replace: (url: string): void => {
      if (typeof window !== 'undefined') {
        window.location.replace(url);
      }
    },
    reload: (): void => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
    get origin(): string {
      return typeof window !== 'undefined' ? window.location.origin : '';
    },
    get pathname(): string {
      return typeof window !== 'undefined' ? window.location.pathname : '/';
    },
    get hash(): string {
      return typeof window !== 'undefined' ? window.location.hash : '';
    },
    get href(): string {
      return typeof window !== 'undefined' ? window.location.href : '';
    },
    set href(url: string) {
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    }
  },

  /**
   * Safe event listener management
   */
  addEventListener: (event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void => {
    if (typeof window !== 'undefined') {
      window.addEventListener(event, handler, options);
    }
  },
  
  removeEventListener: (event: string, handler: EventListener, options?: boolean | EventListenerOptions): void => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(event, handler, options);
    }
  },

  /**
   * Safe media query matching
   */
  matchMedia: (query: string) => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query);
    }
    // Return mock MediaQueryList for SSR
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    } as MediaQueryList;
  },

  /**
   * Safe computed style access
   */
  getComputedStyle: (element: Element): CSSStyleDeclaration | null => {
    if (typeof window !== 'undefined') {
      return window.getComputedStyle(element);
    }
    return null;
  }
};

// Safe document object with fallbacks
export const safeDocument = {
  /**
   * Safe element creation
   */
  createElement: <K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] | null => {
    if (typeof document !== 'undefined') {
      return document.createElement(tagName);
    }
    return null;
  },

  /**
   * Safe body access
   */
  get body(): HTMLElement | null {
    return typeof document !== 'undefined' ? document.body : null;
  },

  /**
   * Safe element operations
   */
  appendChild: (parent: HTMLElement | null, child: HTMLElement | null): void => {
    if (parent && child && typeof document !== 'undefined') {
      parent.appendChild(child);
    }
  },

  removeChild: (parent: HTMLElement | null, child: HTMLElement | null): void => {
    if (parent && child && typeof document !== 'undefined') {
      parent.removeChild(child);
    }
  }
};

// Safe localStorage with fallbacks
export const safeStorage = {
  /**
   * Get item from localStorage with fallback
   */
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage.getItem failed:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Set item in localStorage safely
   */
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage.setItem failed:', error);
      }
    }
  },

  /**
   * Remove item from localStorage safely
   */
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage.removeItem failed:', error);
      }
    }
  },

  /**
   * Clear localStorage safely
   */
  clear: (): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('localStorage.clear failed:', error);
      }
    }
  }
};

// Safe sessionStorage with fallbacks
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.warn('sessionStorage.getItem failed:', error);
        return null;
      }
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.warn('sessionStorage.setItem failed:', error);
      }
    }
  },

  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('sessionStorage.removeItem failed:', error);
      }
    }
  }
};

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if we're running on server-side
 */
export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * Safe navigator access
 */
export const safeNavigator = {
  get userAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : '';
  },
  
  get language(): string {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  }
};