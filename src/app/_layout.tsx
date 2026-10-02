import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  IBMPlexSans_400Regular,
  IBMPlexSans_400Regular_Italic,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { AccessibilityProvider } from '@/context/accessibility-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { CaseProvider, useCase } from '@/context/case-context';
import { InterviewProvider } from '@/context/interview-context';
import { DatabaseProvider } from '@/components/database-provider';
import { AppSplash, hideSplash } from '@/components/app-splash';
import { Toaster } from '@/components/ui/toast';
import { lightPalette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = new Set(['welcome', 'login', 'register', 'forgot-password']);

const APP_FONTS = {
  IBMPlexSans_400Regular,
  IBMPlexSans_400Regular_Italic,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
};

/**
 * Fonts are loaded here, below <DatabaseProvider>, on purpose: expo-sqlite's
 * SQLiteProvider is memoized and ignores `children` changes, so state held
 * above it (e.g. "fonts loaded") never reaches this component. That kept the
 * native app stuck on the splash screen.
 */
function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts(APP_FONTS);
  // Web swaps @font-face fonts in when ready, so only native waits for them.
  // If fonts fail to load we still render with system fallbacks.
  const fontsReady = fontsLoaded || !!fontError || Platform.OS === 'web';
  const { user, isLoading } = useAuth();
  const { data: activeCase, loading: caseLoading } = useCase();
  const router = useRouter();
  const segments = useSegments();
  const ready = fontsReady && !isLoading && (!user || !caseLoading);

  useEffect(() => {
    if (ready) hideSplash();
  }, [ready]);

  // Signed-in users skip the welcome/auth screens and land on their plan.
  useEffect(() => {
    if (!ready) return;
    const first = (segments as readonly string[])[0];
    const onPublicScreen = !first || PUBLIC_ROUTES.has(first);
    if (user && onPublicScreen) {
      router.replace(activeCase ? '/plan' : '/problem-selection');
    }
  }, [ready, user, activeCase, segments, router]);

  if (!fontsReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: lightPalette.bg },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
        <Stack.Screen name="login" options={{ title: 'Log In' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
        <Stack.Screen name="(app)" />
      </Stack>
      <Toaster />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <CaseProvider>
                <InterviewProvider>
                  <RootNavigator />
                </InterviewProvider>
              </CaseProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </DatabaseProvider>
        <AppSplash />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
