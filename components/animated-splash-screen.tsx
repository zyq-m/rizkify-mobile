import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

type AnimatedSplashScreenProps = {
  onAnimationFinish: () => void;
};

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  const [fontsLoaded] = useFonts({ Poppins_800ExtraBold, Lobster_400Regular });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current; // For final fade-out
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!fontsLoaded) return;

    // Create a sequence of animations
    Animated.sequence([
      // 1. Logo scale-in with bounce
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)), // Creates bounce effect
        useNativeDriver: true,
      }),
      // 2. Title fade-in
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 3. Description fade-in with slight delay
      Animated.delay(200),
      Animated.timing(descOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      // 4. Hold for 1.5 seconds
      Animated.delay(1500),
      // 5. Final fade-out of entire screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Callback when the entire sequence is finished
      if (onAnimationFinish) {
        onAnimationFinish();
      }
    });
  }, [fontsLoaded]); // Re-run effect when fonts are loaded

  if (!fontsLoaded) {
    return null;
  }

  // Animated styles
  const logoAnimatedStyle = {
    transform: [{ scale: logoScale }],
  };
  const titleAnimatedStyle = {
    opacity: titleOpacity,
  };
  const descAnimatedStyle = {
    opacity: descOpacity,
  };
  const containerAnimatedStyle = {
    opacity: fadeAnim,
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.center, containerAnimatedStyle, { zIndex: 999 }]}>
      <Animated.View style={logoAnimatedStyle}>
        <Image
          source={require('../assets/icon.png')}
          style={{
            width: width * 0.35,
            height: width * 0.35,
            marginBottom: 32,
            resizeMode: 'contain',
          }}
        />
      </Animated.View>

      <Animated.Text style={[styles.title, titleAnimatedStyle]}>Rizkify</Animated.Text>

      <Animated.Text style={[styles.desc, descAnimatedStyle]}>
        Connecting Surplus, Empowering Communities
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
  },
  title: {
    fontSize: 34,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#176A3E',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  desc: {
    fontSize: 16,
    fontFamily: 'Lobster_400Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
  },
});
