import LeafletMap, { LeafletMapHandle } from '@/components/leaflet/leaflet-map';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface Coords {
  latitude: number;
  longitude: number;
}

export default function CustomMap(props: Coords) {
  const mapRef = useRef<LeafletMapHandle>(null);

  useEffect(() => {
    if (props.latitude && props.longitude) {
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion(
          { latitude: props.latitude, longitude: props.longitude, zoom: 14 }
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [props.latitude, props.longitude]);

  return (
    <View style={styles.container}>
      <LeafletMap
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: props.latitude,
          longitude: props.longitude,
          zoom: 14,
        }}
        interactive={false}
        marker={props.latitude && props.longitude ? { latitude: props.latitude, longitude: props.longitude } : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
