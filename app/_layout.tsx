import '@/global.css';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import * as Device from 'expo-device';
import { StatusBar } from 'expo-status-bar';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AnimatedSplashScreen from '@/components/animated-splash-screen';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { NAV_THEME } from '@/theme';
import { SplashScreen as ExpoSplashScreen, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const isIos26 = Platform.select({ default: false, ios: Device.osVersion?.startsWith('26.') });

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const [isAppReady, setAppReady] = useState(false);
  const { updateAvailable, update } = useServiceWorker();
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (updateAvailable) {
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [updateAvailable, bannerAnim]);

  // Simulate app initialization (replace with your actual data loading)
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load data, assets, make API calls, etc.
        await Promise.all([
          // Add your initialization tasks here
          new Promise((resolve) => setTimeout(resolve, 3500)), // Example delay
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        setSplashAnimationComplete(true);
      }
    }

    prepare();
  }, []);

  // Hide both splash screens when everything is ready
  useEffect(() => {
    if (isSplashAnimationComplete && isAppReady) {
      const hideSplashScreens = async () => {
        await SplashScreen.hideAsync();
        await ExpoSplashScreen.hideAsync();
      };
      hideSplashScreens();
    }
  }, [isSplashAnimationComplete, isAppReady]);

  return (
    <>
      <StatusBar key={`root-status-bar-${'light'}`} style={'light'} />
      {Platform.OS === 'web' && updateAvailable && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            transform: [
              {
                translateY: bannerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              },
            ],
          }}>
          <Pressable
            onPress={update}
            style={{ backgroundColor: '#F59E0B', paddingVertical: 14, paddingHorizontal: 16 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 15,
              }}>
              New version available — Tap to refresh
            </Text>
          </Pressable>
        </Animated.View>
      )}
      {/* Show animated splash screen until animation completes */}
      {!isSplashAnimationComplete && (
        <AnimatedSplashScreen onAnimationFinish={() => setSplashAnimationComplete(true)} />
      )}
      {/* WRAP YOUR APP WITH ANY ADDITIONAL PROVIDERS HERE */}
      {/* <ExampleProvider> */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ActionSheetProvider>
          <NavThemeProvider value={NAV_THEME['light']}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <QueryProvider>
                <ToastProvider>
                  <View
                    className={cn('flex-1', isSplashAnimationComplete ? 'opacity-1' : 'opacity-0')}>
                    <Slot />
                  </View>
                </ToastProvider>
              </QueryProvider>
            </GestureHandlerRootView>
          </NavThemeProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
      {/* </ExampleProvider> */}
    </>
  );
}
