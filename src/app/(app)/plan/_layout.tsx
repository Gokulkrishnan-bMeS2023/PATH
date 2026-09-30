import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useCase } from '@/context/case-context';
import { lightPalette } from '@/theme/tokens';

/** Action-plan screens need an open case; otherwise start the interview. */
export default function PlanLayout() {
  const { data, loading } = useCase();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: lightPalette.bg }}>
        <ActivityIndicator color={lightPalette.primary} />
      </View>
    );
  }
  if (!data) return <Redirect href="/problem-selection" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: lightPalette.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
