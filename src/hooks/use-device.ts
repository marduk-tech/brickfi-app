import { useMobileDetection } from './use-browser-safe';

export function useDevice() {
  const { isMobile, isTabletOrMobile } = useMobileDetection();
  
  return {
    isMobile,
    isTabletOrMobile,
  };
}
