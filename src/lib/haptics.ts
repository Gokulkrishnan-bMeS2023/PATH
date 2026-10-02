import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isAndroid = Platform.OS === 'android';

/**
 * Fire-and-forget: a native build made before expo-haptics was added rejects these calls,
 * so they're ignored instead of crashing. Skipped on web, where the Vibration API shakes
 * the whole phone and reads as an error.
 */
function run(feedback: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  feedback().catch(() => {});
}

/** Short touch feedback for key moments. Android uses its haptics engine, as the Expo docs recommend. */
export const haptics = {
  /** A choice was toggled (checkbox, radio row, selectable chip). */
  select: () =>
    run(() =>
      isAndroid ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick) : Haptics.selectionAsync(),
    ),
  /** Something was saved or completed. */
  success: () =>
    run(() =>
      isAndroid
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    ),
  /** A destructive action is about to happen (e.g. "Remove this contact?"). */
  warning: () =>
    run(() =>
      isAndroid
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    ),
};
