import React from 'react';
import { Stack } from 'expo-router';
import { lightPalette } from '@/theme/tokens';

/** The pushable screens inside the drawer's single "Home" destination. */
export default function AppStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: lightPalette.bg },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="logout" options={{ title: 'Log Out', animation: 'fade' }} />
    </Stack>
  );
}
