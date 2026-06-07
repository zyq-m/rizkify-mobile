import { Item, ItemResponse } from '@/api/service';
import { useItems } from '@/hooks/use-items';
import dayjs from 'dayjs';
import relativetime from 'dayjs/plugin/relativeTime';
import { router } from 'expo-router';
import { Calendar, Heart, MapPin, Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type ItemCardProps = {
  item: ItemResponse;
  onPress?: (item: Item) => void;
  onLike?: (itemId: string, liked: boolean) => void;
};

export default function ItemCard({ item, onPress, onLike }: ItemCardProps) {
  const [isLiked, setIsLiked] = useState(item.likedBy.length || false);
  const [imageError, setImageError] = useState(false);

  const { useLikeItem } = useItems();
  const likeItem = useLikeItem();

  const handleLikePress = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    likeItem.mutate(item.id);
    onLike?.(item.id, newLikedState);
  };

  const handleCardPress = () => {
    router.push({ pathname: '/(screen)/(item)/[id]', params: { id: item.id } });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    dayjs.extend(relativetime);
  }, []);

  return (
    <Pressable
      onPress={handleCardPress}
      className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all active:scale-95">
      {/* Image Section */}
      <View className="relative">
        {item.images.length && !imageError ? (
          item.images.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.imageUrl }}
              className="h-48 w-full"
              resizeMode="cover"
              onError={handleImageError}
            />
          ))
        ) : (
          <View className="h-48 w-full items-center justify-center bg-gray-200">
            <Package size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Like Button */}
        <Pressable
          onPress={handleLikePress}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2"
          hitSlop={8}>
          <Heart
            size={20}
            color={isLiked ? '#EF4444' : '#6B7280'}
            fill={isLiked ? '#EF4444' : 'transparent'}
          />
        </Pressable>

        {/* Expiry Badge */}
        <View className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1">
          <Text className="text-xs font-medium text-white">
            {dayjs().to(item.createdAt).toString()}
          </Text>
        </View>

        {/* Quantity Badge */}
        {item.quantity > 0 && (
          <View className="absolute bottom-3 right-3 rounded-full bg-yellow-500 px-2 py-1">
            <Text className="text-xs font-medium text-white">{item.quantity} available</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4">
        {/* Title and Category */}
        <View className="mb-2 flex-row items-start justify-between">
          <Text className="mr-2 flex-1 text-lg font-semibold text-gray-900" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="rounded-full bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-600">
            {item.category.name}
          </Text>
        </View>

        {/* Location */}
        <View className="mb-3 flex-row items-center">
          <MapPin size={16} color="#6B7280" />
          <Text className="ml-1 flex-1 text-sm text-gray-600" numberOfLines={1}>
            {item.location.address?.split(',')[1]}
          </Text>
          {item.distanceText && <Text className="text-xs text-gray-500">{item.distanceText} away</Text>}
        </View>

        {/* Meta Info */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">
              Expires in {dayjs(item.expiry).format('DD MMM YY')}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Package size={14} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">{item.quantity} units</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
