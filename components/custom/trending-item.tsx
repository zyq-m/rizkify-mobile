import { TrendingItemRes } from '@/api/service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

dayjs.extend(relativeTime);

export default function TrendingItemCard(item: TrendingItemRes) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-amber-800';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/(screen)/(item)/[id]', params: { id: item.id } })}>
      <View className="mr-4 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Image with Rank Badge */}
        <View className="relative">
          {item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0].imageUrl }}
              className="h-32 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-32 w-full items-center justify-center bg-gray-100">
              <Text className="text-gray-400">No image</Text>
            </View>
          )}

          {/* Rank Badge */}
          <View
            className={`absolute left-3 top-3 h-7 w-7 items-center justify-center rounded-full ${getRankColor(item.trendingRank)}`}>
            <Text className="text-xs font-bold text-white">
              {item.trendingRank === 1
                ? '🔥'
                : item.trendingRank === 2
                  ? '🥈'
                  : item.trendingRank === 3
                    ? '🥉'
                    : `#${item.trendingRank}`}
            </Text>
          </View>

          {/* Like Count */}
          <View className="absolute right-3 top-3 flex-row items-center rounded-full bg-black/70 px-2 py-1">
            <Heart size={10} color="#FFF" fill={item.isLiked ? '#EF4444' : 'transparent'} />
            <Text className="ml-1 text-xs font-medium text-white">{item.likeCount}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="mb-1 text-sm font-semibold text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {item.category.name}
            </Text>
            <Text className="text-xs font-medium text-gray-700">{item.quantity} left</Text>
          </View>

          {/* User */}
          <View className="mt-2 flex-row items-center">
            {item.user.imageUrl ? (
              <Image source={{ uri: item.user.imageUrl }} className="h-5 w-5 rounded-full" />
            ) : (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-gray-300">
                <Text className="text-xs text-gray-600">{item.user.name.charAt(0)}</Text>
              </View>
            )}
            <Text className="ml-2 flex-1 text-xs text-gray-600" numberOfLines={1}>
              {item.user.name}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
