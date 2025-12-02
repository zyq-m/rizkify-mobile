import CustomHeader from '@/components/custom/custom-header';
import { Stack } from 'expo-router';
import React from 'react';

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ navigation, options: { title } }) => (
          <CustomHeader navigation={navigation} title={title} backBtn />
        ),
      }}>
      <Stack.Screen
        name="choose"
        options={{
          title: 'Choose your pickup location',
        }}
      />
      <Stack.Screen
        name="set"
        options={{
          title: 'Set Location',
        }}
      />
    </Stack>
  );
}
