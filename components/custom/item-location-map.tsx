import LeafletMap from '@/components/leaflet/leaflet-map';
import React from 'react';
import { View } from 'react-native';

interface ItemLocationMapProps {
  latitude: number;
  longitude: number;
}

export default function ItemLocationMap({ latitude, longitude }: ItemLocationMapProps) {
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <LeafletMap
        style={{ width: '100%', height: '100%' }}
        initialRegion={{ latitude, longitude, zoom: 14 }}
        interactive={false}
        marker={{ latitude, longitude }}
      />
    </View>
  );
}
