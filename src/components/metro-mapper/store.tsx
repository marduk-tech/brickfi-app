// useStore.ts
import { create } from "zustand";

interface StoreState {
  values: Record<string, any>;
  setValue: (key: string, val: any) => void;
}

const useStore = create<StoreState>((set) => ({
  values: { highlightDrivers: [] },
  setValue: (key, val) =>
    set((state) => ({
      values: { ...state.values, [key]: val },
    })),
}));

export default useStore;
