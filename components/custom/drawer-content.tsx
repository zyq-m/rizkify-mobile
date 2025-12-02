import { useUser } from '@/hooks/use-user';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { ChevronRight, User } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { useProfile } = useUser();
  const { data: profile } = useProfile();

  return (
    <DrawerContentScrollView {...props} className="relative flex-1">
      <TouchableOpacity onPress={() => router.push('/(screen)/profile/profile')}>
        <View className="mb-2 flex-row items-center gap-4 p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            {profile?.imageUrl ? (
              <Image
                source={{
                  uri: profile.imageUrl,
                }}
              />
            ) : (
              <User size={20} color="#6B7280" />
            )}
          </View>
          <View className="flex-1 flex-row items-center justify-between">
            <View>
              <Text className="font-bold">{profile?.name}</Text>
              <Text>{profile?.email}</Text>
            </View>
            <ChevronRight color="#064e3b" />
          </View>
        </View>
      </TouchableOpacity>
      <View className="border-t border-t-slate-200 pt-4">
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
  );
}
