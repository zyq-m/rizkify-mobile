import LeafletMap, { LeafletMapHandle } from '@/components/leaflet/leaflet-map';
import { Coords } from '@/components/leaflet/types';
import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import useLocation from '@/hooks/use-location';
import { useCoords } from '@/store/store';
import { router } from 'expo-router';
import { LocateFixed } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';

export default function ChooseLocation() {
  const { location } = useLocation();
  const mapRef = useRef<LeafletMapHandle>(null);
  const [markerCoords, setMarkerCoords] = useState<Coords>();
  const { setCoords } = useCoords();

  const onMapPress = (coords: Coords) => {
    setMarkerCoords(coords);
  };

  const handleLocateMe = () => {
    if (location) {
      const newCoords = location.coords;
      setMarkerCoords(newCoords);
      mapRef.current?.animateToRegion({
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        zoom: 14,
      });
    }
  };

  const handleSetPickupLocation = () => {
    if (markerCoords) {
      setCoords(markerCoords);
      router.back();
    }
  };

  const getInitialRegion = () => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 14,
      };
    }
    return {
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 10,
    };
  };

  return (
    <View className="flex-1">
      <LeafletMap
        ref={mapRef}
        style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        initialRegion={getInitialRegion()}
        onPress={onMapPress}
        marker={
          markerCoords
            ? { latitude: markerCoords.latitude, longitude: markerCoords.longitude }
            : null
        }
      />
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
