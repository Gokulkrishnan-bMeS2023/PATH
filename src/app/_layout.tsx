import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccessibilityProvider, useAccessibility } from '@/context/accessibility-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { highContrast } = useAccessibility();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <StatusBar style={highContrast ? 'dark' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" options={{ title: 'Welcome' }} />
        <Stack.Screen name="login" options={{ title: 'Log In' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
        <Stack.Screen name="problem-selection" options={{ title: 'Problem Selection' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <RootLayoutContent />
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
