import { create } from "zustand";
import { persist } from "zustand/middleware";

type SavedState = {
  ids: string[];
  toggle: (fips: string) => void;
  has: (fips: string) => boolean;
};

export const useSaved = create<SavedState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (fips) => get().ids.includes(fips),
      toggle: (fips) => {
        const ids = get().ids;
        set({ ids: ids.includes(fips) ? ids.filter((id) => id !== fips) : [fips, ...ids] });
      },
    }),
    { name: "hotl-saved-auctions" },
  ),
);
