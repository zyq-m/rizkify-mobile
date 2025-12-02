import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const featuredItems = [
  {
    id: '1',
    name: 'Organic Avocados',
    category: 'Fruits',
    location: 'Farmers Market',
    distance: '0.8km',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Fresh Bread Basket',
    category: 'Bakery',
    location: 'Artisan Bakery',
    distance: '1.2km',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    isFeatured: true,
  },
];

export default function FeaturedItems() {
  return (
    <View className="mt-2 bg-white px-4 py-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-900">Featured Items</Text>
        <Pressable>
          <Text className="font-medium text-yellow-500">See all</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-4">
          {featuredItems.map((item) => (
            <Pressable key={item.id} className="w-64">
              <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <Image source={{ uri: item.image }} className="h-32 w-full" resizeMode="cover" />
                <View className="p-3">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500">{item.category}</Text>
                    <Text className="text-xs text-gray-500">{item.distance}</Text>
                  </View>
                  <Text className="mt-1 text-xs text-gray-600" numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
