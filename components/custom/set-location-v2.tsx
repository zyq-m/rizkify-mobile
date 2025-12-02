// components/SetSearchLocationModal.tsx
import useLocation from '@/hooks/use-location';
import { Crosshair, MapPin, Target, X } from 'lucide-react-native';
import React, { JSX, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import MapView, { Circle, MapPressEvent, Marker, Region } from 'react-native-maps';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchLocation {
  latitude: number;
  longitude: number;
  address?: string;
  range: number;
}

export interface RangeOption {
  label: string;
  value: number;
}

const rangeOptions: RangeOption[] = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '20 km', value: 20 },
];

interface SetSearchLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSet: (location: SearchLocation) => void;
  initialLocation?: SearchLocation | null;
  userId?: string;
  hideRange?: boolean;
  btnLabel?: string;
}

export default function SetSearchLocationModal({
  visible,
  onClose,
  onLocationSet,
  initialLocation = null,
  userId,
  btnLabel = 'Save Location',
  hideRange = undefined,
}: SetSearchLocationModalProps): JSX.Element {
  const mapRef = useRef<MapView>(null);
  const {
    location,
    loading: locationLoading,
    errorMsg,
    refreshLocation,
    getAddressFromCoords,
  } = useLocation();

  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(initialLocation);
  const [selectedRange, setSelectedRange] = useState<number>(initialLocation?.range || 5);
  const [gettingAddress, setGettingAddress] = useState<boolean>(false);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Animation functions
  const animateToRegion = (coords: Coordinates, zoomLevel: number = 0.05): void => {
    const region: Region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: zoomLevel,
      longitudeDelta: zoomLevel,
    };

    mapRef.current?.animateToRegion(region, 1000);
  };
  // Initialize with current location or initial location when modal opens
  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setSearchLocation(initialLocation);
        setSelectedRange(initialLocation.range);
        // Animate to initial location when modal opens
        setTimeout(() => {
          animateToRegion(initialLocation, 0.2);
        }, 500);
      } else if (location) {
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: location.address?.formatted || 'Current Location',
          range: 5,
        };
        setSearchLocation(newLocation);
        // Animate to current location when modal opens
        setTimeout(() => {
          animateToRegion(newLocation, 0.2);
        }, 500);
      }
    }
  }, [visible, location, initialLocation]);

  const handleMapPress = async (event: MapPressEvent): Promise<void> => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setGettingAddress(true);

    try {
      const address = await getAddressFromCoords({ latitude, longitude });
      const newLocation = {
        latitude,
        longitude,
        address: address?.formatted || 'Selected Location',
        range: selectedRange,
      };
      setSearchLocation(newLocation);
      // Smooth animation to the tapped location
      animateToRegion(newLocation, 0.07);
    } catch (error) {
      console.error('Error getting address:', error);
      const newLocation = {
        latitude,
        longitude,
        address: 'Selected Location',
        range: selectedRange,
      };
      setSearchLocation(newLocation);
      animateToRegion(newLocation, 0.2);
    } finally {
      setGettingAddress(false);
    }
  };

  const handleUseCurrentLocation = async (): Promise<void> => {
    if (location) {
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: location.address?.formatted || 'Current Location',
        range: selectedRange,
      };
      setSearchLocation(newLocation);
      // Smooth animation to current location
      animateToRegion(newLocation, 0.07);
    } else {
      await refreshLocation();
    }
  };

  const handleRangeChange = (range: number): void => {
    setSelectedRange(range);
    if (searchLocation) {
      setSearchLocation({
        ...searchLocation,
        range,
      });
      // Optional: Slight zoom adjustment when range changes
      if (range <= 3) {
        animateToRegion(searchLocation, 0.05);
      } else if (range === 5) {
        animateToRegion(searchLocation, 0.1);
      } else if (range <= 15) {
        animateToRegion(searchLocation, 0.3);
      } else {
        animateToRegion(searchLocation, 0.6);
      }
    }
  };

  const handleSaveLocation = async (): Promise<void> => {
    if (!searchLocation) {
      Alert.alert('Select Location', 'Please select a location on the map first.');
      return;
    }

    setSaving(true);
    try {
      if (userId) {
        console.log('Saving to database for user:', userId);
      }
      onLocationSet(searchLocation);

      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (): void => {
    setSearchLocation(initialLocation);
    setSelectedRange(initialLocation?.range || 5);
    onClose();
  };

  const getInitialRegion = (): Region => {
    if (searchLocation) {
      return {
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="border-b border-gray-200 px-6 py-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">Set Search Area</Text>
            <Pressable onPress={handleClose} className="p-1">
              <X size={24} color="#374151" />
            </Pressable>
          </View>
          <Text className="text-sm text-gray-600">Set where you want to look for items</Text>
        </View>

        {/* Map Section */}
        <View className="relative flex-1">
          {mapLoading && (
            <View className="absolute bottom-0 left-0 right-0 top-0 z-10 items-center justify-center bg-gray-100">
              <ActivityIndicator size="large" color="#EAB308" />
              <Text className="mt-2 text-gray-600">Loading map...</Text>
            </View>
          )}

          <MapView
            ref={mapRef} // Add the ref here
            style={{ flex: 1 }}
            initialRegion={getInitialRegion()}
            onPress={handleMapPress}
            onMapLoaded={() => setMapLoading(false)}
            showsUserLocation={true}
            showsMyLocationButton={false}>
            {searchLocation && (
              <>
                {/* Search Range Circle */}
                <Circle
                  center={{
                    latitude: searchLocation.latitude,
                    longitude: searchLocation.longitude,
                  }}
                  radius={searchLocation.range * 1000}
                  fillColor="rgba(34, 197, 94, 0.2)"
                  strokeColor="rgba(34, 197, 94, 0.7)"
                  strokeWidth={2}
                />

                {/* Search Location Marker */}
                <Marker
                  coordinate={{
                    latitude: searchLocation.latitude,
                    longitude: searchLocation.longitude,
                  }}>
                  <View className="items-center">
                    <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-lg">
                      <Target size={18} color="white" />
                    </View>
                  </View>
                </Marker>
              </>
            )}
          </MapView>

          {/* Current Location Button */}
          <Pressable
            onPress={handleUseCurrentLocation}
            className="absolute right-4 top-4 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg active:bg-gray-50">
            <Crosshair size={20} color="#374151" />
          </Pressable>

          {/* Map Instructions */}
          <View className="absolute left-4 top-4 rounded-lg bg-black/70 px-3 py-2">
            <Text className="text-sm font-medium text-white">Tap to set location</Text>
          </View>
        </View>

        {/* Controls Panel */}
        <View className="border-t border-gray-200 bg-white p-4">
          <View className="mb-4">
            <View className="mb-2 flex-row items-center">
              <MapPin size={18} color="#6B7280" />
              <Text className="ml-2 text-sm font-medium text-gray-900">Search Center</Text>
            </View>
            {gettingAddress ? (
              <View className="flex-row items-center rounded-lg bg-gray-50 p-3">
                <ActivityIndicator size="small" color="#EAB308" />
                <Text className="ml-2 text-sm text-gray-500">Getting address...</Text>
              </View>
            ) : searchLocation ? (
              <View className="rounded-lg border border-green-200 bg-green-50 p-3">
                <Text className="text-sm font-medium text-green-800">{searchLocation.address}</Text>
              </View>
            ) : (
              <View className="rounded-lg bg-gray-50 p-3">
                <Text className="text-sm text-gray-500">Tap on the map to set location</Text>
              </View>
            )}
          </View>

          {/* Range Selection */}
          {!hideRange && (
            <View className="mb-6">
              <Text className="mb-3 text-sm font-medium text-gray-900">Search Range</Text>
              <Text className="mb-3 text-sm text-gray-500">Show items within this distance</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}>
                <View className="flex-row gap-2">
                  {rangeOptions.map((range: RangeOption) => (
                    <Pressable
                      key={range.value}
                      onPress={() => handleRangeChange(range.value)}
                      className={`rounded-full border px-4 py-2 ${
                        selectedRange === range.value
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-sm font-medium ${
                          selectedRange === range.value ? 'text-white' : 'text-gray-700'
                        }`}>
                        {range.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleSaveLocation}
              disabled={!searchLocation || saving}
              className={`flex-1 items-center justify-center rounded-lg py-3 ${
                searchLocation && !saving ? 'bg-green-500 active:bg-green-600' : 'bg-gray-300'
              }`}>
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  {searchLocation ? btnLabel : 'Select Location'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Info Text */}
          {!hideRange && (
            <Text className="mt-3 text-center text-xs text-gray-400">
              This will filter items shown in your feed
            </Text>
          )}
        </View>

        {/* Error Message */}
        {errorMsg && (
          <View className="absolute left-4 right-4 top-20 rounded-lg border border-red-200 bg-red-50 p-3">
            <Text className="text-center text-sm text-red-700">{errorMsg}</Text>
            <Pressable onPress={refreshLocation} className="mt-2">
              <Text className="text-center text-sm font-medium text-red-600">Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Loading Overlay */}
        {locationLoading && (
          <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-white/90">
            <ActivityIndicator size="large" color="#EAB308" />
            <Text className="mt-4 text-gray-600">Getting your location...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
