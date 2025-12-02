import { Coords } from '@/app/(screen)/(location)/choose';
import { create } from 'zustand';

export type CoordStore = {
  coords?: Coords & { range?: number }; // Add range to coords
  setCoords: (coords: Coords & { range?: number }) => void;
  clear: () => void;
};

export const useCoords = create<CoordStore>((set) => ({
  coords: undefined,
  clear: () => set({ coords: undefined }),
  setCoords: (coord) => set({ coords: coord }),
}));
