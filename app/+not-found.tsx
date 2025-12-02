import { Text } from '@/components/nativewindui/Text';
import { router, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text variant="largeTitle">{"This screen doesn't exist."}</Text>

        <Pressable onPress={() => router.back()} className="m-4 py-4">
          <Text>Go to home screen!</Text>
        </Pressable>
      </View>
    </>
  );
}
