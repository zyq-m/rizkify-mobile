import { Platform } from 'react-native';

export interface GeoSearchResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function searchLocations(
  query: string,
  limit: number = 5
): Promise<GeoSearchResult[]> {
  if (!query.trim()) return [];

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}`;
  let url;

  if (Platform.OS === 'web') {
    url = `https://corsproxy.io/?${encodeURIComponent(nominatimUrl)}`;
  } else {
    url = nominatimUrl;
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Rizkify/1.0',
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Nominatim returned non-JSON:', text.slice(0, 200));
    return [];
  }

  if (!Array.isArray(data)) return [];

  return data.map((item: any) => ({
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    displayName: item.display_name,
  }));
}
