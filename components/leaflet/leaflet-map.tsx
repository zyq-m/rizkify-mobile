import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { buildLeafletHtml } from './leaflet-html';
import { Coords, IncomingMessage, LeafletCircle, LeafletMarker, LeafletRegion, OutgoingMessage } from './types';

export interface LeafletMapHandle {
  animateToRegion: (region: LeafletRegion) => void;
  setMarker: (marker: LeafletMarker | null) => void;
  setCircle: (circle: LeafletCircle | null) => void;
  setUserLocation: (coords: Coords | null) => void;
}

interface LeafletMapProps {
  style?: StyleProp<ViewStyle>;
  initialRegion: LeafletRegion;
  interactive?: boolean;
  onPress?: (coords: Coords) => void;
  onReady?: () => void;
  marker?: LeafletMarker | null;
  circle?: LeafletCircle | null;
}

const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>((props, ref) => {
  const webViewRef = useRef<WebView>(null);

  const html = useMemo(
    () => buildLeafletHtml(props.initialRegion.latitude, props.initialRegion.longitude, props.initialRegion.zoom ?? 12),
    []
  );

  const post = useCallback((msg: OutgoingMessage) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `window.bridge.${msg.type} ? window.bridge[${JSON.stringify(msg.type)}](${JSON.stringify(msg.data ?? null)}) : null; true;`
      );
    }
  }, []);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: LeafletRegion) => {
      post({ type: 'SET_CENTER', data: region });
    },
    setMarker: (marker: LeafletMarker | null) => {
      if (marker) {
        post({ type: 'SET_MARKER', data: marker });
      } else {
        post({ type: 'CLEAR_MARKERS', data: undefined });
      }
    },
    setCircle: (circle: LeafletCircle | null) => {
      if (circle) {
        post({ type: 'SET_CIRCLE', data: circle });
      } else {
        post({ type: 'CLEAR_CIRCLE', data: undefined });
      }
    },
    setUserLocation: (coords: Coords | null) => {
      if (coords) {
        post({ type: 'SET_USER_LOCATION', data: coords });
      }
    },
  }));

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg: IncomingMessage = JSON.parse(event.nativeEvent.data);
      switch (msg.type) {
        case 'MAP_READY':
          post({ type: 'SET_INTERACTIVE', data: { enabled: props.interactive ?? true } });
          if (props.marker) {
            post({ type: 'SET_MARKER', data: props.marker });
          }
          if (props.circle) {
            post({ type: 'SET_CIRCLE', data: props.circle });
          }
          props.onReady?.();
          break;
        case 'MAP_CLICK':
          props.onPress?.(msg.data);
          break;
        case 'ERROR':
          console.error('LeafletMap error:', msg.data.message);
          break;
      }
    } catch (e) {
      console.error('LeafletMap message parse error:', e);
    }
  }, [props, post]);

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={props.style}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      originWhitelist={['*']}
    />
  );
});

LeafletMap.displayName = 'LeafletMap';

export default LeafletMap;
