export interface Coords {
  latitude: number;
  longitude: number;
}

export interface LeafletMarker {
  latitude: number;
  longitude: number;
  html?: string;
}

export interface LeafletCircle {
  latitude: number;
  longitude: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface LeafletRegion {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export type OutgoingMessage =
  | { type: 'SET_MARKER'; data: LeafletMarker }
  | { type: 'CLEAR_MARKERS'; data?: undefined }
  | { type: 'SET_CIRCLE'; data: LeafletCircle }
  | { type: 'CLEAR_CIRCLE'; data?: undefined }
  | { type: 'SET_CENTER'; data: LeafletRegion }
  | { type: 'SET_USER_LOCATION'; data: Coords }
  | { type: 'SET_INTERACTIVE'; data: { enabled: boolean } };

export type IncomingMessage =
  | { type: 'MAP_CLICK'; data: Coords }
  | { type: 'MAP_READY'; data?: undefined }
  | { type: 'ERROR'; data: { message: string } };
