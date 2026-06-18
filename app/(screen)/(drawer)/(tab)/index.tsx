import Category from '@/components/custom/category';
import SetSearchLocationModal, { SearchLocation } from '@/components/custom/set-location-v2';
import TrendingItemCard from '@/components/custom/trending-item';
import { useItems } from '@/hooks/use-items';
import { useUser } from '@/hooks/use-user';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, MapPin, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { useProfile } = useUser();
  const { data: profile } = useProfile();
  const { data: trending } = useItems().useTrending();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lookup', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['items', 'trending'] }),
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const handleSetLocation = (_location: SearchLocation) => {
    setShowLocationModal(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {profile?.location ? (
        <>
          {/* Header */}
          <View className="bg-white px-4 py-4">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-gray-900">Hello {profile?.name}👋</Text>
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
                {profile?.location?.address?.split(',')[1] || 'Set your location'}
              </Text>
              <Text className="font-medium text-yellow-500">Change</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="gap-2"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
        </>
      ) : (
        <View className="flex-1 items-center justify-center bg-gray-50 px-8">
          <MapPin size={80} color="#D1D5DB" />
          <Text className="mt-6 text-2xl font-bold text-gray-900">Welcome!</Text>
          <Text className="mt-2 text-center text-gray-600">
            Set your location to find fresh food near you.
          </Text>
          <Pressable
            onPress={() => setShowLocationModal(true)}
            className="mt-8 w-full rounded-2xl bg-black py-4">
            <Text className="text-center font-semibold text-white">Set Location</Text>
          </Pressable>
        </View>
      )}

      <SetSearchLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleSetLocation}
        initialLocation={profile?.location}
        // hideRange={true}
      />
    </View>
  );
}
