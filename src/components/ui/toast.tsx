import React, { useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useMotion } from '@/components/ui/motion';
import { haptics } from '@/lib/haptics';
import { MaxContentWidth, Radius } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

type ToastTone = 'success' | 'info' | 'warning';
type ToastItem = { id: number; message: string; tone: ToastTone };

/** Long enough to read at a relaxed pace — most people using PATH are older adults. */
const VISIBLE_MS = 4000;

const ICON: Record<ToastTone, IconName> = { success: 'check', info: 'info', warning: 'alert-triangle' };

let current: ToastItem | null = null;
let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getCurrent = () => current;
const emit = () => listeners.forEach((listener) => listener());

export function hideToast() {
  clearTimeout(hideTimer);
  current = null;
  emit();
}

/**
 * Shows a short confirmation at the bottom of the screen ("Contact saved").
 * Callable from anywhere and it outlives navigation, so a screen can show it right
 * before `router.back()`. A newer toast replaces the one on screen.
 */
export function showToast(message: string, tone: ToastTone = 'success') {
  clearTimeout(hideTimer);
  current = { id: nextId++, message, tone };
  emit();
  if (tone === 'success') haptics.success();
  // Android and web announce through the live region below; iOS needs an explicit announcement.
  if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  hideTimer = setTimeout(hideToast, VISIBLE_MS);
}

/** Renders the current toast. Mounted once, above every screen, in the root layout. */
export function Toaster() {
  const toast = useSyncExternalStore(subscribe, getCurrent, getCurrent);
  const { p, fs } = useTokens();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  const accent = toast.tone === 'success' ? p.green : toast.tone === 'warning' ? p.coral : p.sky;
  return (
    <View style={[styles.host, { bottom: insets.bottom + 16, pointerEvents: 'box-none' }]}>
      <Animated.View key={toast.id} entering={motion.riseLarge()} exiting={motion.fadeOut} style={styles.slot}>
        <Pressable
          onPress={hideToast}
          accessibilityLabel={toast.message}
          accessibilityHint="Dismisses this message"
          accessibilityLiveRegion="polite"
          style={[styles.toast, { backgroundColor: p.ink }]}>
          <Animated.View entering={motion.pop(160)} style={[styles.badge, { backgroundColor: accent }]}>
            <Icon name={ICON[toast.tone]} size={15} color="#FFFFFF" />
          </Animated.View>
          <AppText variant="strong" color="#FFFFFF" style={{ flex: 1, fontSize: fs(15) }}>
            {toast.message}
          </AppText>
          <Icon name="x" size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, zIndex: 900 },
  // Absolute so a replaced toast fades out in place while the new one rises over it.
  slot: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: MaxContentWidth - 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    shadowColor: '#162638',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
