import Category from '@/components/custom/category';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import TrendingItemCard from '@/components/custom/trending-item';
import { useItems } from '@/hooks/use-items';
import { useUser } from '@/hooks/use-user';
import { Bell, MapPin, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const { useUpdateProfile, useProfile } = useUser();
  const { mutate: setProfile, isPending } = useUpdateProfile();
  const { data: profile } = useProfile();

  const { data: trending } = useItems().useTrending();

  const handleSetLocation = (location: SearchLocation) => {
    setProfile({ location: JSON.stringify(location) });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Hello 👋</Text>
            <Text className="text-gray-600">Find fresh food near you</Text>
          </View>
          <Pressable className="relative">
            <Bell size={24} color="#374151" />
            <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
          </Pressable>
        </View>

        {/* Location Bar */}
        <Pressable
          className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2"
          onPress={() => setShowLocationModal(true)}>
          <MapPin size={18} color="#6B7280" />
          <Text className="ml-2 flex-1 text-gray-600">
            {isPending
              ? 'Setting new location...'
              : profile?.location?.address?.split(',')[1] || 'Set your location'}
          </Text>
          <Text className="font-medium text-yellow-500">Change</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="gap-2">
        {/* Categories */}
        <View className="mt2">
          <Category />
        </View>

        {/* Trending Items */}
        <View className="mb-4 mt-2 bg-white px-4 py-4">
          <View className="mb-4 flex-row items-center">
            <TrendingUp size={20} color="#374151" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">Trending Now</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trending?.map((item) => (
              <TrendingItemCard key={item.id} {...item} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <SetSearchLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleSetLocation}
        initialLocation={profile?.location}
      />
    </View>
  );
}
