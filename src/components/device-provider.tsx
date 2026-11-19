"use client";

import { createContext, useContext } from "react";
import { DESKTOP_HINT, type DeviceHint } from "../libs/device-hint";

const DeviceHintContext = createContext<DeviceHint>(DESKTOP_HINT);

// Hands the server's user-agent guess (see getDeviceHint, read in the root
// layout) to useMobileDetection, which starts from it
export function DeviceProvider({
  hint,
  children,
}: {
  hint: DeviceHint;
  children: React.ReactNode;
}) {
  return (
    <DeviceHintContext.Provider value={hint}>
      {children}
    </DeviceHintContext.Provider>
  );
}

export const useDeviceHint = () => useContext(DeviceHintContext);
