import LeafletMap, { LeafletMapHandle } from '@/components/leaflet/leaflet-map';
import { Coords } from '@/components/leaflet/types';
import useLocation from '@/hooks/use-location';
import { Crosshair, MapPin, X } from 'lucide-react-native';
import React, { JSX, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const TARGET_MARKER_HTML = `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:2px solid white;background:#22c55e;box-shadow:0 4px 6px -1px rgba(0,0,0,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg></div>`;

function rangeToZoom(range: number): number {
  if (range <= 3) return 13;
  if (range === 5) return 12;
  if (range <= 15) return 10;
  return 9;
}

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
  const mapRef = useRef<LeafletMapHandle>(null);
  const [mapReady, setMapReady] = useState(false);
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
  const [saving, setSaving] = useState<boolean>(false);

  const animateToRegion = (coords: Coordinates, zoom: number = 13): void => {
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      zoom,
    });
  };

  const getInitialZoom = (): number => {
    if (searchLocation) return rangeToZoom(searchLocation.range);
    return 12;
  };

  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setSearchLocation(initialLocation);
        setSelectedRange(initialLocation.range);
        if (mapReady) {
          setTimeout(() => {
            animateToRegion(initialLocation, rangeToZoom(initialLocation.range));
          }, 500);
        }
      } else if (location) {
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: location.address?.formatted || 'Current Location',
          range: 5,
        };
        setSearchLocation(newLocation);
        if (mapReady) {
          setTimeout(() => {
            animateToRegion(newLocation, 12);
          }, 500);
        }
      }
    }
  }, [visible, location, initialLocation, mapReady]);

  useEffect(() => {
    if (mapReady && location) {
      mapRef.current?.setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [mapReady, location]);

  useEffect(() => {
    if (mapReady && searchLocation) {
      mapRef.current?.setMarker({
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        html: TARGET_MARKER_HTML,
      });
      mapRef.current?.setCircle({
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radius: searchLocation.range * 1000,
        fillColor: 'rgba(34, 197, 94, 0.2)',
        strokeColor: 'rgba(34, 197, 94, 0.7)',
        strokeWidth: 2,
      });
    }
  }, [mapReady, searchLocation]);

  const handleMapPress = async (coords: Coords): Promise<void> => {
    const { latitude, longitude } = coords;
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
      animateToRegion(newLocation, 13);
    } catch (error) {
      console.error('Error getting address:', error);
      const newLocation = {
        latitude,
        longitude,
        address: 'Selected Location',
        range: selectedRange,
      };
      setSearchLocation(newLocation);
      animateToRegion(newLocation, 12);
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
      animateToRegion(newLocation, 13);
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
      animateToRegion(searchLocation, rangeToZoom(range));
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

  const getInitialRegion = () => {
    if (searchLocation) {
      return {
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        zoom: rangeToZoom(searchLocation.range),
      };
    } else if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 12,
      };
    } else {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        zoom: 10,
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
        <SafeAreaView edges={['top']}>
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Set Search Area</Text>
              <Pressable onPress={handleClose} className="p-1">
                <X size={24} color="#374151" />
              </Pressable>
            </View>
            <Text className="text-sm text-gray-600">Set where you want to look for items</Text>
          </View>
        </SafeAreaView>

        {/* Map Section */}
        <View className="relative flex-1">
          {!mapReady && (
            <View className="absolute bottom-0 left-0 right-0 top-0 z-10 items-center justify-center bg-gray-100">
              <ActivityIndicator size="large" color="#EAB308" />
              <Text className="mt-2 text-gray-600">Loading map...</Text>
            </View>
          )}

          <LeafletMap
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={getInitialRegion()}
            onPress={handleMapPress}
            onReady={() => setMapReady(true)}
          />

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
