// src/screens/auth/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, ActivityIndicator } from 'react-native';
import { DarkColors, Radius, Shadow } from '../../constants/theme';

// SplashScreen always renders in dark theme (it's before theme selection)
const C = DarkColors;

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation (scale and fade in)
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Circular rotation animation for logo loader glow
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Loading progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // width/layout animations cannot use native driver
    }).start(() => {
      // 4. Exit animation (fade out)
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(onFinish);
    });
  }, [onFinish]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        
        {/* Animated Rotating Outer Ring / Logo Loader */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Text Logo */}
        <Text style={styles.appName}>OmniPost</Text>
        <Text style={styles.tagline}>Sync. Schedule. Sparkle. ✨</Text>

        {/* Custom Loading Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        
        {/* Custom Loading indicator */}
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={C.cyan} />
          <Text style={styles.loadingText}>Initializing services...</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: Radius.xl * 1.5,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: C.brand,
    borderRightColor: C.cyan,
    borderBottomColor: C.brand,
    opacity: 0.8,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: Radius.xl,
    backgroundColor: C.bg1,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: C.text,
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: C.textSec,
    fontWeight: '500',
    marginBottom: 48,
  },
  progressContainer: {
    width: 160,
    height: 4,
    backgroundColor: C.bg3,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: C.brand,
    borderRadius: Radius.full,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
  },
});
