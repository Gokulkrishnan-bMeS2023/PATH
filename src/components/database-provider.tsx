import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { initializeDatabase } from '@/lib/database';

// expo-sqlite on web needs SharedArrayBuffer, which requires a cross-origin-isolated
// page (COOP/COEP headers — see metro.config.js). Without it, opening the database hangs.
const notIsolated = Platform.OS === 'web' && typeof globalThis.SharedArrayBuffer === 'undefined';

// The Expo dev server serves the "/" document before Metro's middleware, so it lacks
// the isolation headers every other path gets. Reload once on a path that has them.
const reloadingForIsolation =
  notIsolated && typeof window !== 'undefined' && window.location.pathname === '/' && !window.location.search.includes('coi=');
if (reloadingForIsolation) window.location.replace('/welcome?coi=1');

const webUnsupported = notIsolated ? new Error('SharedArrayBuffer unavailable: page is not cross-origin isolated') : null;

// Browser storage is "best effort" by default and may be evicted; ask the browser to
// keep this app's database (OPFS) persistently. Browsers may still decline.
if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(webUnsupported);

  if (reloadingForIsolation) return null;
  if (error) return <DatabaseError error={error} />;

  return (
    <SQLiteProvider
      databaseName="path.db"
      onInit={initializeDatabase}
      onError={(e) => {
        // Called during SQLiteProvider's render, so defer our state update.
        setTimeout(() => setError(e), 0);
      }}>
      {children}
    </SQLiteProvider>
  );
}

/** Shown when the local database can't be opened (e.g. the app is open in another browser tab). */
function DatabaseError({ error }: { error: Error }) {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  if (error === webUnsupported) {
    return (
      <Message
        title="This browser can’t store your information"
        body="PATH keeps your data privately on this device, which this browser window doesn’t support. Please open PATH in an up-to-date Chrome, Edge, Firefox or Safari window."
      />
    );
  }
  // On web the database file is exclusively locked by the first open tab.
  const locked = Platform.OS === 'web' && /Access Handle|NoModificationAllowed|locked/i.test(String(error));
  return (
    <Message
      title={locked ? 'PATH is already open in another tab' : 'We couldn’t open your saved data'}
      body={
        locked
          ? 'Your information can only be used in one tab at a time. Close the other tab, then reload this page.'
          : 'Please close and reopen the app. If this keeps happening, restart your device.'
      }
    />
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <View
      accessibilityRole="alert"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#F3F8FB' }}>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#162638', textAlign: 'center' }}>
        {title}
      </Text>
      <Text style={{ fontSize: 15, lineHeight: 22, color: '#2B3A48', textAlign: 'center', maxWidth: 420 }}>
        {body}
      </Text>
    </View>
  );
}
