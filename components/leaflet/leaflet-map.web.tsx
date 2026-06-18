import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import { Coords, LeafletMapHandle } from './types';
export { type LeafletMapHandle };

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  style?: StyleProp<ViewStyle>;
  initialRegion: { latitude: number; longitude: number; zoom?: number };
  interactive?: boolean;
  onPress?: (coords: Coords) => void;
  onRegionChange?: (coords: Coords) => void;
  onReady?: () => void;
  marker?: { latitude: number; longitude: number; html?: string } | null;
  circle?: {
    latitude: number;
    longitude: number;
    radius: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  } | null;
}

const userIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
  className: 'user-marker',
  iconSize: [16, 16] as [number, number],
  iconAnchor: [8, 8] as [number, number],
});

function MapEventHandler({
  onPress,
  onRegionChange,
  onReady,
  setMapInstance,
}: {
  onPress?: (coords: Coords) => void;
  onRegionChange?: (coords: Coords) => void;
  onReady?: () => void;
  setMapInstance: (map: L.Map) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onPress?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
    moveend: () => {
      const center = map.getCenter();
      onRegionChange?.({ latitude: center.lat, longitude: center.lng });
    },
    zoomend: () => {
      const center = map.getCenter();
      onRegionChange?.({ latitude: center.lat, longitude: center.lng });
    },
  });

  useEffect(() => {
    setMapInstance(map);
    onReady?.();
  }, []);

  return null;
}

const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>((props, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mainMarker, setMainMarker] = useState<typeof props.marker>(null);
  const [mainCircle, setMainCircle] = useState<typeof props.circle>(null);
  const [userPos, setUserPos] = useState<Coords | null>(null);
  const [readyCalled, setReadyCalled] = useState(false);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region) => {
      mapRef.current?.flyTo([region.latitude, region.longitude], region.zoom ?? 12);
    },
    setMarker: (marker) => setMainMarker(marker),
    setCircle: (circle) => setMainCircle(circle),
    setUserLocation: (coords) => setUserPos(coords),
  }));

  useEffect(() => {
    if (props.marker !== undefined) setMainMarker(props.marker);
  }, [props.marker]);

  useEffect(() => {
    if (props.circle !== undefined) setMainCircle(props.circle);
  }, [props.circle]);

  useEffect(() => {
    if (mapRef.current && !readyCalled) {
      setReadyCalled(true);
    }
  }, [mapRef.current, readyCalled]);

  const initial = props.initialRegion;
  const center: [number, number] = [initial.latitude, initial.longitude];
  const zoom = initial.zoom ?? 12;
  const isInteractive = props.interactive !== false;

  const mainIcon = mainMarker?.html
    ? L.divIcon({
        html: mainMarker.html,
        className: 'custom-marker',
        iconSize: [40, 40] as [number, number],
        iconAnchor: [20, 20] as [number, number],
      })
    : undefined;

  return (
    <View style={props.style}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={isInteractive}
        dragging={isInteractive}
        doubleClickZoom={isInteractive}
        scrollWheelZoom={isInteractive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler
          onPress={props.onPress}
          onRegionChange={props.onRegionChange}
          onReady={props.onReady}
          setMapInstance={(map) => {
            mapRef.current = map;
          }}
        />
        {mainMarker && (
          <Marker
            position={[mainMarker.latitude, mainMarker.longitude]}
            {...(mainIcon ? { icon: mainIcon } : {})}
          />
        )}
        {userPos && (
          <Marker
            position={[userPos.latitude, userPos.longitude]}
            icon={userIcon}
          />
        )}
        {mainCircle && (
          <Circle
            center={[mainCircle.latitude, mainCircle.longitude]}
            radius={mainCircle.radius}
            pathOptions={{
              color: mainCircle.strokeColor || '#22c55e',
              fillColor: mainCircle.fillColor || 'rgba(34, 197, 94, 0.2)',
              fillOpacity: 0.3,
              weight: mainCircle.strokeWidth || 2,
            }}
          />
        )}
      </MapContainer>
    </View>
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;
