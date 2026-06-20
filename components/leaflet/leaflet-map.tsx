import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native';
import {
  AnimationType,
  LeafletView,
  MapLayer,
  MapMarker,
  MapShape,
  MapShapeType,
  OwnPositionMarker,
  WebViewLeafletEvents,
  WebviewLeafletMessage,
} from 'react-native-leaflet-view';
import { useToast } from '@/providers/ToastProvider';
import { Coords, LeafletMapHandle } from './types';
export { type LeafletMapHandle };

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

const DEFAULT_LAYERS: MapLayer[] = [
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    baseLayerIsChecked: true,
    baseLayerName: 'OpenStreetMap.Mapnik',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
];

const DEFAULT_MARKER_HTML =
  '<div style="background:#ef4444;width:16px;height:16px;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>';

const OWN_MARKER_HTML =
  '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>';

function toLatLng(coords: { latitude: number; longitude: number }) {
  return { lat: coords.latitude, lng: coords.longitude };
}

function markerToMapMarker(marker: {
  latitude: number;
  longitude: number;
  html?: string;
}): MapMarker {
  const hasHtml = !!marker.html;
  return {
    position: toLatLng(marker),
    icon: marker.html || DEFAULT_MARKER_HTML,
    size: hasHtml ? { x: 40, y: 40 } : { x: 16, y: 16 },
    iconAnchor: hasHtml ? { x: 20, y: 20 } : { x: 8, y: 8 },
    id: 'main-marker',
  };
}

function circleToMapShape(circle: {
  latitude: number;
  longitude: number;
  radius: number;
  strokeColor?: string;
}): MapShape {
  return {
    shapeType: MapShapeType.CIRCLE,
    center: toLatLng(circle),
    radius: circle.radius,
    color: circle.strokeColor || '#22c55e',
    id: 'main-circle',
  };
}

const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>((props, ref) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [internalMarkers, setInternalMarkers] = useState<MapMarker[]>([]);
  const [internalShapes, setInternalShapes] = useState<MapShape[]>([]);
  const [internalCenter, setInternalCenter] = useState(() => toLatLng(props.initialRegion));
  const [internalZoom, setInternalZoom] = useState(props.initialRegion.zoom ?? 12);
  const [userMarker, setUserMarker] = useState<OwnPositionMarker | undefined>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const loadHtml = async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/leaflet.html'));
        const content = await FileSystem.readAsStringAsync(asset.uri);
        if (mounted) setHtmlContent(content);
      } catch (error) {
        console.error('Failed to load leaflet HTML:', error);
        showToast('error', 'Map Error', 'Failed to load map. Please try again.');
      }
    };
    loadHtml();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || props.marker === undefined) return;
    setInternalMarkers(props.marker ? [markerToMapMarker(props.marker)] : []);
  }, [mapReady, props.marker]);

  useEffect(() => {
    if (!mapReady || props.circle === undefined) return;
    setInternalShapes(props.circle ? [circleToMapShape(props.circle)] : []);
  }, [mapReady, props.circle]);

  const onMessageReceived = useCallback(
    (message: WebviewLeafletMessage) => {
      if (
        message.msg === WebViewLeafletEvents.MAP_READY ||
        message.event === WebViewLeafletEvents.MAP_COMPONENT_MOUNTED
      ) {
        setMapReady(true);
        props.onReady?.();
      }
      if (message.event === WebViewLeafletEvents.ON_MAP_TOUCHED) {
        const touch = message.payload?.touchLatLng;
        if (touch) {
          props.onPress?.({ latitude: touch.lat, longitude: touch.lng });
        }
      }
      if (
        message.event === WebViewLeafletEvents.ON_MOVE_END ||
        message.event === WebViewLeafletEvents.ON_ZOOM_END
      ) {
        const center = message.payload?.mapCenterPosition;
        if (center) {
          props.onRegionChange?.({ latitude: center.lat, longitude: center.lng });
        }
      }
    },
    [props.onPress, props.onRegionChange, props.onReady]
  );

  useImperativeHandle(ref, () => ({
    animateToRegion: (region) => {
      setInternalCenter(toLatLng(region));
      if (region.zoom) setInternalZoom(region.zoom);
    },
    setMarker: (marker) => {
      setInternalMarkers(marker ? [markerToMapMarker(marker)] : []);
    },
    setCircle: (circle) => {
      setInternalShapes(circle ? [circleToMapShape(circle)] : []);
    },
    setUserLocation: (coords) => {
      if (!coords) {
        setUserMarker(undefined);
        return;
      }
      setUserMarker({
        position: toLatLng(coords),
        icon: OWN_MARKER_HTML,
        size: { x: 16, y: 16 },
        title: 'You',
        animation: { type: AnimationType.FADE, duration: 0 },
      });
    },
  }));

  const interactiveJS = useMemo(() => {
    if (props.interactive === false) {
      return `(function(){var s=document.createElement('style');s.textContent='.leaflet-container{pointer-events:none!important}';document.head.appendChild(s);})();`;
    }
    return undefined;
  }, [props.interactive]);

  if (!htmlContent) {
    return (
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, props.style]}>
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  return (
    <View style={props.style}>
      <LeafletView
        doDebug={false}
        source={{ html: htmlContent }}
        mapLayers={DEFAULT_LAYERS}
        mapCenterPosition={internalCenter}
        zoom={internalZoom}
        mapMarkers={internalMarkers}
        mapShapes={internalShapes}
        ownPositionMarker={userMarker}
        onMessageReceived={onMessageReceived}
        zoomControl={props.interactive !== false}
        attributionControl={false}
        injectedJavaScript={interactiveJS}
        webviewStyle={{ flex: 1 } as any}
      />
    </View>
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;
