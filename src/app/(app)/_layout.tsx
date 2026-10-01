import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerMenuContent } from '@/components/ui/drawer-menu-content';
import { useAuth } from '@/context/auth-context';

const PANEL_WIDTH_RATIO = 0.84;
const MAX_PANEL_WIDTH = 340;

/** Everything in this group requires a signed-in user. The hamburger "Menu" opens this as a real drawer. */
export default function AppLayout() {
  const { width } = useWindowDimensions();
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/welcome" />;

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
        overlayColor: 'rgba(10,16,24,0.5)',
        drawerStyle: { width: Math.min(width * PANEL_WIDTH_RATIO, MAX_PANEL_WIDTH) },
      }}
      drawerContent={(props) => <DrawerMenuContent {...props} />}>
      <Drawer.Screen name="(stack)" options={{ title: 'PATH' }} />
    </Drawer>
  );
}
