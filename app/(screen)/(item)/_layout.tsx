import CustomHeader from '@/components/custom/custom-header';
import { Stack } from 'expo-router';
import React from 'react';

export default function ItemLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ navigation, options: { title } }) => (
          <CustomHeader navigation={navigation} title={title} backBtn />
        ),
      }}>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Item',
        }}
      />
      <Stack.Screen
        name="requester/[id]"
        options={{
          title: 'Item',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Item',
        }}
      />
    </Stack>
  );
}
