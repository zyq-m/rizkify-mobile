import { LATITUDE_DELTA, LONGITUDE_DELTA } from '@/components/custom/custom-map';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import useLocation from '@/hooks/use-location';
import { useCoords } from '@/store/store';
import { router } from 'expo-router';
import { LocateFixed } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

export type Coords = { latitude: number; longitude: number };

export default function ChooseLocation() {
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [markerCoords, setMarkerCoords] = useState<Coords>();
  const [currentRegion, setCurrentRegion] = useState<Region>();
  const { setCoords } = useCoords();

  const onMapPress = (event: MapPressEvent) => {
    setMarkerCoords(event.nativeEvent.coordinate);
  };

  const handleLocateMe = () => {
    if (location) {
      const newCoords = location.coords;
      const region = {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setMarkerCoords(newCoords);
      setCurrentRegion(region);

      // Animate map to user location
      mapRef.current?.animateToRegion(region, 500);
    }
  };

  const handleSetPickupLocation = () => {
    if (markerCoords) {
      setCoords(markerCoords);
      router.back();
    }
  };

  useEffect(() => {
    if (location) {
      const newCoords = location.coords;
      setCurrentRegion({
        ...newCoords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  return (
    <View className="flex-1">
      {currentRegion && (
        <MapView
          ref={mapRef}
          style={{ ...StyleSheet.absoluteFillObject }}
          initialRegion={currentRegion}
          onPress={onMapPress}>
          {markerCoords && <Marker coordinate={markerCoords} />}
        </MapView>
      )}
      <View className="absolute bottom-20 w-full space-y-4 px-6">
        <Button variant="plain" onPress={handleLocateMe}>
          <LocateFixed color="#eab308" />
          <Text className="text-yellow-500">Locate me</Text>
        </Button>
        <Button className="bg-yellow-500" onPress={handleSetPickupLocation}>
          <Text>Set pickup location</Text>
        </Button>
      </View>
    </View>
  );
}
