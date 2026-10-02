import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SuccessBadge } from '@/components/ui/blocks';
import { useAuth } from '@/context/auth-context';
import { useInterview } from '@/context/interview-context';

/** 16 · Log out */
export default function LogoutScreen() {
  const { logout } = useAuth();
  const { reset } = useInterview();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    // Don't leave a half-finished interview behind for the next person on this device.
    reset();
    await logout();
    router.replace('/welcome');
  };

  return (
    <Screen left={{ kind: 'back' }} menu={false}>
      <View style={{ height: 12 }} />
      <View style={{ alignItems: 'center' }}>
        <SuccessBadge icon="log-out" tone="coral" />
      </View>
      <AppText variant="h1" align="center">
        Log out?
      </AppText>
      <AppText align="center">
        Your action plan, call history and reminders stay saved. Log in again to pick up where you left off.
      </AppText>
      <View style={{ height: 8 }} />
      <Button variant="danger" icon="log-out" label="Log Out" loading={busy} onPress={confirm} />
      <Button label="Stay Logged In" onPress={() => (router.canGoBack() ? router.back() : router.replace('/plan'))} />
    </Screen>
  );
}
