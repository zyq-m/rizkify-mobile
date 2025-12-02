import { Coords } from '@/app/(screen)/(location)/choose';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const screen = Dimensions.get('window');

const ASPECT_RATIO = screen.width / screen.height;
export const LATITUDE_DELTA = 0.0922;
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function CustomMap(props: Coords) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (props.latitude && props.longitude) {
      // Small delay to ensure map is ready
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            ...props,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          1000
        ); // 1000ms animation duration
      }, 100);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.latitude, props.longitude]); // Re-run when coordinates change

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...props,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        scrollEnabled={false} // Disables map dragging
        zoomEnabled={false} // Disables zooming
        pitchEnabled={false} // Disables 3D tilt
        rotateEnabled={false} // Disables rotation
        zoomTapEnabled={false} // Disables double-tap zoom
      >
        <Marker coordinate={props} />
      </MapView>
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
