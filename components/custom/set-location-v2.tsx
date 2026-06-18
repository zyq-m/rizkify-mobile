import LeafletMap, { LeafletMapHandle } from '@/components/leaflet/leaflet-map';
import { Coords } from '@/components/leaflet/types';
import { useDebounce } from '@/hooks/use-debounce';
import useLocation from '@/hooks/use-location';
import { useUser } from '@/hooks/use-user';
import { GeoSearchResult, searchLocations } from '@/utils/geocoding';
import Slider from '@react-native-community/slider';
import { Circle, MapPin, Search, X } from 'lucide-react-native';
import React, { JSX, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
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

function rangeToZoom(range: number): number {
  if (range <= 1) return 14;
  if (range <= 3) return 13;
  if (range <= 6) return 12;
  if (range <= 12) return 11;
  return 10;
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

  const { useUpdateProfile } = useUser();
  const { mutate: saveProfile, isPending } = useUpdateProfile();

  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(initialLocation);
  const [selectedRange, setSelectedRange] = useState<number>(initialLocation?.range || 5);
  const lastAnimateTime = useRef(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 400);

  const animateToRegion = (coords: Coordinates, zoom: number = 12): void => {
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      zoom,
    });
  };

  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setSearchLocation(initialLocation);
        setSelectedRange(initialLocation.range);
        if (mapReady) {
          lastAnimateTime.current = Date.now();
          setTimeout(() => {
            animateToRegion(initialLocation);
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
          lastAnimateTime.current = Date.now();
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

  const handleRegionChange = async (coords: Coords): Promise<void> => {
    if (Date.now() - lastAnimateTime.current < 1000) {
      lastAnimateTime.current = 0;
      return;
    }

    setSearchLocation((prev) =>
      prev
        ? { ...prev, latitude: coords.latitude, longitude: coords.longitude }
        : { latitude: coords.latitude, longitude: coords.longitude, range: selectedRange }
    );

    try {
      const address = await getAddressFromCoords(coords);
      setSearchLocation((prev) =>
        prev ? { ...prev, address: address?.formatted || 'Selected Location' } : prev
      );
    } catch {
      setSearchLocation((prev) => (prev ? { ...prev, address: 'Selected Location' } : prev));
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
      lastAnimateTime.current = Date.now();
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

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    searchLocations(debouncedQuery)
      .then((results) => {
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setSearchResults([]);
      })
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  const handleSelectSearchResult = async (result: GeoSearchResult): Promise<void> => {
    setShowSearchResults(false);
    setSearchQuery(result.displayName);

    lastAnimateTime.current = Date.now();
    animateToRegion(result, 13);

    try {
      const address = await getAddressFromCoords({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setSearchLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        address: address?.formatted || result.displayName,
        range: selectedRange,
      });
    } catch {
      setSearchLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.displayName,
        range: selectedRange,
      });
    }
  };

  const handleSaveLocation = (): void => {
    if (!searchLocation) {
      Alert.alert('Select Location', 'Please select a location on the map first.');
      return;
    }

    saveProfile(
      { location: JSON.stringify(searchLocation) },
      {
        onSuccess: () => {
          onLocationSet(searchLocation);
          onClose();
        },
        onError: (error) => {
          console.error('Error saving location:', error);
          Alert.alert('Error', 'Failed to save location. Please try again.');
        },
      }
    );
  };

  const handleClose = (): void => {
    setSearchLocation(initialLocation);
    setSelectedRange(initialLocation?.range || 5);
    setMapReady(false);
    onClose();
  };

  const getInitialRegion = () => {
    if (searchLocation) {
      return {
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        zoom: rangeToZoom(Number(searchLocation.range)),
      };
    } else if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 12,
      };
    } else {
      return {
        latitude: 4.2105,
        longitude: 101.9758,
        zoom: 7,
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
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">Set Search Area</Text>
              <Pressable onPress={handleClose} className="p-1">
                <X size={24} color="#374151" />
              </Pressable>
            </View>
            <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                className="ml-2 flex-1 text-sm text-gray-900"
                placeholder="Search location..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.trim()) setShowSearchResults(true);
                }}
              />
              {isSearching && <ActivityIndicator size="small" color="#EAB308" />}
              {searchQuery.length > 0 && !isSearching && (
                <Pressable
                  onPress={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}>
                  <X size={16} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
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
            onRegionChange={handleRegionChange}
            onReady={() => setMapReady(true)}
          />

          {/* Centered Pin */}
          <View className="pointer-events-none absolute inset-0 z-10 items-center justify-center">
            <Circle color="#ffff" fill="#22c55e" />
          </View>

          {/* Search Results */}
          {showSearchResults && (
            <View className="absolute left-4 right-4 top-4 z-20 max-h-48 overflow-hidden rounded-lg bg-white shadow-lg">
              <FlatList
                data={searchResults}
                keyExtractor={(_item, index) => String(index)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    className="border-b border-gray-100 px-3 py-2.5 active:bg-gray-50"
                    onPress={() => handleSelectSearchResult(item)}>
                    <Text className="text-sm text-gray-700" numberOfLines={2}>
                      {item.displayName}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Current Location Button */}
          <Pressable
            onPress={handleUseCurrentLocation}
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg active:bg-gray-50">
            <MapPin size={20} color="#374151" />
          </Pressable>
        </View>

        {/* Controls Panel */}
        <View className="border-t border-gray-200 bg-white p-4">
          {/* Range Selection */}
          {!hideRange && (
            <View className="mb-6">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-900">Search Range</Text>
                <Text className="text-sm font-semibold text-green-600">{selectedRange} km</Text>
              </View>
              <Text className="mb-1 text-sm text-gray-500">Show items within this distance</Text>

              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={selectedRange}
                onValueChange={(value) => {
                  setSelectedRange(value);
                  if (searchLocation) {
                    setSearchLocation({ ...searchLocation, range: value });
                    animateToRegion(searchLocation, rangeToZoom(value));
                  }
                }}
                minimumTrackTintColor="#22c55e"
                maximumTrackTintColor="#d1d5db"
                thumbTintColor="#22c55e"
              />
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleSaveLocation}
              disabled={!searchLocation || isPending}
              className={`flex-1 items-center justify-center rounded-lg py-3 ${
                searchLocation && !isPending ? 'bg-green-500 active:bg-green-600' : 'bg-gray-300'
              }`}>
              {isPending ? (
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
