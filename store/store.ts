import { Coords } from '@/components/leaflet/types';
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
