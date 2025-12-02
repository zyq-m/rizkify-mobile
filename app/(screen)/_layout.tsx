import { Stack } from 'expo-router';
import React from 'react';

export default function Root() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(drawer)" />
      <Stack.Screen name="(item)" />
      <Stack.Screen name="(location)" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
