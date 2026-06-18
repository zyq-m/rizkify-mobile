export interface Coords {
  latitude: number;
  longitude: number;
}

export interface LeafletMapHandle {
  animateToRegion: (region: { latitude: number; longitude: number; zoom?: number }) => void;
  setMarker: (marker: { latitude: number; longitude: number; html?: string } | null) => void;
  setCircle: (
    circle: {
      latitude: number;
      longitude: number;
      radius: number;
      fillColor?: string;
      strokeColor?: string;
      strokeWidth?: number;
    } | null
  ) => void;
  setUserLocation: (coords: Coords | null) => void;
}
