// hooks/use-distance.ts
import { Coordinates, DistanceUnit, calculateDistance, formatDistance } from '@/utils/distance';
import { useMemo } from 'react';

/**
 * Hook to calculate raw distance between two coordinates
 */
export const useDistance = (
  targetCoords: Coordinates | null,
  userCoords: Coordinates | null,
  unit: DistanceUnit = 'km'
): number => {
  return useMemo(() => {
    if (!targetCoords || !userCoords) {
      return Infinity;
    }
    return calculateDistance(userCoords, targetCoords, unit);
  }, [targetCoords, userCoords, unit]);
};

/**
 * Hook to get formatted distance string
 */
export const useFormattedDistance = (
  targetCoords: Coordinates | null,
  userCoords: Coordinates | null,
  unit: DistanceUnit = 'km'
): string => {
  const distance = useDistance(targetCoords, userCoords, unit);

  return useMemo(() => {
    if (distance === Infinity) return '';
    return formatDistance(distance, unit);
  }, [distance, unit]);
};

/**
 * Hook to check if coordinates are within a certain distance
 */
export const useIsWithinDistance = (
  targetCoords: Coordinates | null,
  userCoords: Coordinates | null,
  maxDistance: number,
  unit: DistanceUnit = 'km'
): boolean => {
  const distance = useDistance(targetCoords, userCoords, unit);

  return useMemo(() => {
    if (distance === Infinity) return false;
    return distance <= maxDistance;
  }, [distance, maxDistance]);
};

export default {
  useDistance,
  useFormattedDistance,
  useIsWithinDistance,
};
