import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Fonts, lightPalette } from '@/theme/tokens';

/**
 * Logo splash shown while the app starts. It looks exactly like the native splash
 * (app.json → expo-splash-screen: white background, logo 160 wide), so the native
 * splash can hide underneath it without a visible jump. Then the wordmark fades in
 * and the whole splash fades away to reveal the first screen.
 *
 * Web has no native splash: public/index.html paints the same logo before the
 * JavaScript loads, and this component removes it once its own logo is drawn.
 */

const BACKGROUND = '#FFFFFF';
const LOGO_WIDTH = 160;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 488) / 574);
// On web, reuse the image public/index.html already loaded so there's no blank frame.
const LOGO = Platform.OS === 'web' ? { uri: '/splash-logo.png' } : require('@/assets/images/splash-icon.png');

/** How long the splash stays fully visible (wordmark included) before it fades out. */
const MIN_VISIBLE_MS = 900;
const FADE_MS = 420;

let appReady = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getReady = () => appReady;

/** Call once the first screen can render: hides the native splash and plays the logo splash out. */
export function hideSplash() {
  if (appReady) return;
  appReady = true;
  listeners.forEach((listener) => listener());
}

/** Web: removes the splash public/index.html painted (it sits on top of this one). */
function removeHtmlSplash() {
  if (Platform.OS === 'web') document.getElementById('splash')?.remove();
}

export function AppSplash() {
  const ready = useSyncExternalStore(subscribe, getReady, getReady);
  const reduceMotion = useReducedMotion();
  // Same font load as the root layout (expo-font dedupes it); the wordmark waits for it
  // so it never flashes in a fallback font.
  const [fontLoaded, fontError] = useFonts({ IBMPlexSans_600SemiBold });
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const shownAt = useRef(0);

  const opacity = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const wordmark = useSharedValue(0);

  // On native this view sits under the native splash until the app is ready.
  const visible = Platform.OS === 'web' || ready;
  const showWordmark = visible && (fontLoaded || !!fontError);

  useEffect(() => {
    if (visible) shownAt.current = Date.now();
  }, [visible]);

  useEffect(() => {
    if (!showWordmark) return;
    wordmark.set(reduceMotion ? 1 : withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }));
  }, [showWordmark, reduceMotion, wordmark]);

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});

    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const holdTimer = setTimeout(
      () => {
        const duration = reduceMotion ? 200 : FADE_MS;
        removeHtmlSplash();
        setLeaving(true);
        opacity.set(withTiming(0, { duration, easing: Easing.in(Easing.quad) }));
        if (!reduceMotion) logoScale.set(withTiming(1.08, { duration, easing: Easing.out(Easing.quad) }));
        fadeTimer = setTimeout(() => setGone(true), duration);
      },
      Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current)),
    );
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  }, [ready, reduceMotion, opacity, logoScale]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.get() }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.get(),
    transform: [{ translateY: (1 - wordmark.get()) * 8 }],
  }));

  if (gone) return null;

  return (
    <Animated.View
      style={[styles.overlay, { pointerEvents: leaving ? 'none' : 'auto' }, overlayStyle]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="PATH is loading">
      <Animated.View style={[styles.logo, logoStyle]}>
        <Image
          source={LOGO}
          style={styles.logo}
          contentFit="contain"
          onDisplay={removeHtmlSplash}
          onError={removeHtmlSplash}
        />
        {showWordmark && (
          <Animated.View style={[styles.wordmark, wordmarkStyle]}>
            <Text style={styles.wordmarkText}>PATH</Text>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
  logo: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  wordmark: { position: 'absolute', top: LOGO_HEIGHT + 20, left: -60, right: -60, alignItems: 'center' },
  wordmarkText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 28,
    letterSpacing: 6,
    paddingLeft: 6, // balances the letter spacing added after the last letter
    color: lightPalette.ink,
  },
});
