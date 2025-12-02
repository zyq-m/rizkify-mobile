// utils/distance.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type DistanceUnit = 'km' | 'mi';

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @param unit Distance unit (km or mi)
 * @returns Distance in the specified unit
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates,
  unit: DistanceUnit = 'km'
): number => {
  // Earth's radius in kilometers or miles
  const R = unit === 'km' ? 6371 : 3959;

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Format distance for display with appropriate units
 */
export const formatDistance = (distance: number, unit: DistanceUnit = 'km'): string => {
  if (unit === 'km') {
    if (distance < 0.1) {
      // Less than 100m
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 1) {
      // Less than 1km but more than 100m
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      // 1km to 10km
      return `${distance.toFixed(1)}km away`;
    } else {
      // More than 10km
      return `${Math.round(distance)}km away`;
    }
  } else {
    // Miles
    if (distance < 0.1) {
      // Less than 0.1 miles (about 528 feet)
      return `${Math.round(distance * 5280)}ft away`;
    } else if (distance < 1) {
      // Less than 1 mile but more than 0.1 miles
      return `${(distance * 5280).toFixed(0)}ft away`;
    } else if (distance < 10) {
      // 1 mile to 10 miles
      return `${distance.toFixed(1)}mi away`;
    } else {
      // More than 10 miles
      return `${Math.round(distance)}mi away`;
    }
  }
};

/**
 * Calculate and format distance in one function
 */
export const getFormattedDistance = (
  coord1: Coordinates | null,
  coord2: Coordinates | null,
  unit: DistanceUnit = 'km'
): string => {
  if (!coord1 || !coord2) {
    return 'Location unavailable';
  }

  const distance = calculateDistance(coord1, coord2, unit);
  return formatDistance(distance, unit);
};

/**
 * Check if coordinates are within a certain distance
 */
export const isWithinDistance = (
  coord1: Coordinates,
  coord2: Coordinates,
  maxDistance: number,
  unit: DistanceUnit = 'km'
): boolean => {
  const distance = calculateDistance(coord1, coord2, unit);
  return distance <= maxDistance;
};

/**
 * Get distance range label for filtering
 */
export const getDistanceRangeLabel = (range: string): number => {
  switch (range) {
    case 'Within 1km':
      return 1;
    case 'Within 5km':
      return 5;
    case 'Within 10km':
      return 10;
    case 'Within 25km':
      return 25;
    case 'Within 50km':
      return 50;
    default:
      return Infinity; // Any distance
  }
};

/**
 * Calculate approximate travel time (driving)
 * Note: This is a rough estimate - 50km/h average speed
 */
export const calculateTravelTime = (distance: number, unit: DistanceUnit = 'km'): string => {
  // Convert to km if in miles
  const distanceInKm = unit === 'mi' ? distance * 1.60934 : distance;

  // Average speed in km/h
  const averageSpeed = 50;
  const timeInHours = distanceInKm / averageSpeed;

  if (timeInHours < 1) {
    const minutes = Math.round(timeInHours * 60);
    return `${minutes} min drive`;
  } else if (timeInHours < 2) {
    return `${Math.round(timeInHours * 60)} min drive`;
  } else {
    return `${timeInHours.toFixed(1)} hour drive`;
  }
};

/**
 * Get distance with travel time
 */
export const getDistanceWithTravelTime = (
  coord1: Coordinates | null,
  coord2: Coordinates | null,
  unit: DistanceUnit = 'km'
): { distance: string; travelTime: string } => {
  if (!coord1 || !coord2) {
    return {
      distance: 'Location unavailable',
      travelTime: '',
    };
  }

  const distance = calculateDistance(coord1, coord2, unit);
  const formattedDistance = formatDistance(distance, unit);
  const travelTime = calculateTravelTime(distance, unit);

  return {
    distance: formattedDistance,
    travelTime,
  };
};

/**
 * Sort coordinates by distance from a reference point
 */
export const sortByDistance = (
  coordinates: Coordinates[],
  referencePoint: Coordinates,
  unit: DistanceUnit = 'km'
): Coordinates[] => {
  return coordinates
    .map((coord) => ({
      coord,
      distance: calculateDistance(referencePoint, coord, unit),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.coord);
};

/**
 * Find nearest coordinate to a reference point
 */
export const findNearest = (
  coordinates: Coordinates[],
  referencePoint: Coordinates,
  unit: DistanceUnit = 'km'
): { coord: Coordinates; distance: number } | null => {
  if (coordinates.length === 0) return null;

  let nearest = coordinates[0];
  let minDistance = calculateDistance(referencePoint, nearest, unit);

  for (let i = 1; i < coordinates.length; i++) {
    const distance = calculateDistance(referencePoint, coordinates[i], unit);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = coordinates[i];
    }
  }

  return {
    coord: nearest,
    distance: minDistance,
  };
};

// Default export for convenience
export default {
  calculateDistance,
  formatDistance,
  getFormattedDistance,
  isWithinDistance,
  getDistanceRangeLabel,
  calculateTravelTime,
  getDistanceWithTravelTime,
  sortByDistance,
  findNearest,
};
