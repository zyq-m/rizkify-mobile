import * as Location from 'expo-location';
import { useState } from 'react';

export interface LocationWithAddress {
  coords: Location.LocationObjectCoords;
  timestamp?: number;
  address?: {
    formatted: string;
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
    name: string | null;
  } | null;
}

export default function useLocation() {
  const [location, setLocation] = useState<LocationWithAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');

        return {
          formatted: formattedAddress,
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          name: address.name,
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }

    return null;
  };

  // Function to get address for any coordinates
  const getAddressFromCoords = async (coords: { latitude: number; longitude: number }) => {
    return await reverseGeocode(coords.latitude, coords.longitude);
  };

  // Function to refresh location and address
  const refreshLocation = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const address = await reverseGeocode(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      setLocation({
        coords: currentLocation.coords,
        timestamp: currentLocation.timestamp,
        address,
      });
    } catch (error) {
      setErrorMsg('Unable to get location');
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    errorMsg,
    loading,
    refreshLocation,
    getAddressFromCoords,
  };
}
