import React, { useEffect } from 'react';
import { Platform } from 'react-native';
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
import { lightPalette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const PUBLIC_ROUTES = new Set(['welcome', 'login', 'register', 'forgot-password']);

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { user, isLoading } = useAuth();
  const { data: activeCase, loading: caseLoading } = useCase();
  const router = useRouter();
  const segments = useSegments();
  const ready = fontsReady && !isLoading && (!user || !caseLoading);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
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
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_400Regular_Italic,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <CaseProvider>
              <InterviewProvider>
                {/* Web swaps @font-face fonts in when ready, so only native waits for them.
                    If fonts fail to load we still render with system fallbacks. */}
                <RootNavigator fontsReady={fontsLoaded || !!fontError || Platform.OS === 'web'} />
              </InterviewProvider>
            </CaseProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
