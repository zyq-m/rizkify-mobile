import { Text } from '@/components/nativewindui/Text';
import { router } from 'expo-router';
import { Heart, MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';

export default function ItemCard() {
  return (
    <Pressable onPress={() => router.navigate('/(screen)/(item)/2')}>
      <View className="relative flex-row gap-2 overflow-hidden rounded-md bg-white">
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?auto=compress&cs=tinysrgb&w=600',
          }}
          resizeMode="cover"
          className="h-36 w-2/5"
        />
        <Pressable className="absolute bottom-0 m-2 rounded-full bg-red-100 p-2">
          <Heart color="#ef4444" size={20} />
        </Pressable>
        <View className="w-screen justify-between p-4">
          <View className="flex-row gap-4">
            <Text className="rounded-full bg-yellow-300 px-2">Jenis</Text>
            <Text className="bg-red-50 px-2 text-red-500">2 left</Text>
          </View>
          <Text variant="heading" numberOfLines={1} ellipsizeMode="clip">
            Title
          </Text>
          <View className="flex-row items-center gap-2">
            <Text variant="body">Location</Text>
            <MapPin color="#60a5fa" size={23} />
          </View>
          <Text variant="body">Last month</Text>
        </View>
      </View>
    </Pressable>
  );
}
