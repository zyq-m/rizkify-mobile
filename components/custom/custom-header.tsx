import { ChevronLeft, Menu } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CustomHeaderProps = {
  title?: string;
  backBtn?: boolean;
  navigation: {
    goBack: () => void;
    openDrawer?: () => void;
  };
};

export default function CustomHeader({ title, navigation, backBtn = false }: CustomHeaderProps) {
  return (
    <SafeAreaView className="bg-emerald-900">
      <View className="flex-row items-center gap-6 px-6 py-4">
        <Pressable onPress={backBtn ? navigation.goBack : navigation.openDrawer}>
          {backBtn ? <ChevronLeft color="#fff" /> : <Menu color="#fff" />}
        </Pressable>
        <Text className="text-lg text-white">{title}</Text>
      </View>
    </SafeAreaView>
  );
}
