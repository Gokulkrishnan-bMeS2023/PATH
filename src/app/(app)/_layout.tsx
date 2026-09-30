import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { lightPalette } from '@/theme/tokens';

/** Everything in this group requires a signed-in user. */
export default function AppLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/welcome" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: lightPalette.bg },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="menu" options={{ title: 'Menu', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="logout" options={{ title: 'Log Out', animation: 'fade' }} />
    </Stack>
  );
}
