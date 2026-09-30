/**
 * Motion presets matching the wireframe's CSS animations (`rise`, `pop`, `fill`).
 * Native uses eased keyframes (spring-based entering animations aren't available
 * on web). Web uses Reanimated's built-in presets instead: custom keyframe
 * entering animations on web leave elements pinned with `position: absolute`
 * after they finish (Reanimated web cleanup), which collapses flowing layouts.
 * Every preset is disabled when the OS "reduce motion" setting is on (see `useMotion`).
 */
import { useEffect, useMemo } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolateColor,
  Keyframe,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useAccessibility } from '@/context/accessibility-context';

const isWeb = Platform.OS === 'web';
const easeOut = Easing.out(Easing.cubic);

/** Content rising into place while fading in (".body { animation: rise }"). */
export const rise = (delay = 0) =>
  isWeb
    ? FadeInDown.duration(420).delay(delay)
    : new Keyframe({
        0: { opacity: 0, transform: [{ translateY: 12 }] },
        100: { opacity: 1, transform: [{ translateY: 0 }], easing: easeOut },
      })
        .duration(420)
        .delay(delay);

/** Overshooting scale for selection ticks and badges ("@keyframes pop"). */
export const pop = (delay = 0) =>
  isWeb
    ? ZoomIn.duration(300).delay(delay)
    : new Keyframe({
        0: { opacity: 0, transform: [{ scale: 0.6 }] },
        55: { opacity: 1, transform: [{ scale: 1.12 }], easing: easeOut },
        100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.inOut(Easing.quad) },
      })
        .duration(360)
        .delay(delay);

/** Slides up from further below — for bottom action bars. */
export const riseLarge = (delay = 0) =>
  isWeb
    ? FadeInDown.duration(480).delay(delay)
    : new Keyframe({
        0: { opacity: 0, transform: [{ translateY: 28 }] },
        100: { opacity: 1, transform: [{ translateY: 0 }], easing: easeOut },
      })
        .duration(480)
        .delay(delay);

export const fadeIn = FadeIn.duration(220);
export const fadeOut = FadeOut.duration(160);

/** Siblings glide to their new position when content above them grows or shrinks. */
export const glide = LinearTransition.duration(240).easing(Easing.out(Easing.quad));

/**
 * Returns animation presets, or no-ops when the user prefers reduced motion.
 * Pass the results straight to `entering` / `exiting` / `layout` props.
 */
export function useMotion() {
  const { reduceMotion } = useAccessibility();
  return useMemo(() => {
    const off = () => undefined;
    return {
      enabled: !reduceMotion,
      rise: reduceMotion ? off : rise,
      riseLarge: reduceMotion ? off : riseLarge,
      pop: reduceMotion ? off : pop,
      fadeIn: reduceMotion ? undefined : fadeIn,
      fadeOut: reduceMotion ? undefined : fadeOut,
      // Web layout transitions pin elements absolutely while they run, which breaks
      // flowing layouts when combined with entering animations — native only.
      glide: reduceMotion || isWeb ? undefined : glide,
    };
  }, [reduceMotion]);
}

/** Standard durations for value animations (withTiming). */
export const Durations = { fast: 160, base: 220, slow: 420 } as const;

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESS_SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

/** Springy press feedback (".btn:active { transform: scale(.97) }"). */
export function usePressScale(pressedScale = 0.97) {
  const { reduceMotion } = useAccessibility();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return {
    style,
    onPressIn: () => {
      if (!reduceMotion) scale.set(withSpring(pressedScale, PRESS_SPRING));
    },
    onPressOut: () => scale.set(withSpring(1, PRESS_SPRING)),
  };
}

/**
 * Animated 0→1 progress that follows a boolean (e.g. selected / expanded),
 * snapping instantly when reduced motion is on.
 */
export function useToggleProgress(on: boolean, duration: number = Durations.base) {
  const { reduceMotion } = useAccessibility();
  const progress = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    progress.set(reduceMotion ? (on ? 1 : 0) : withTiming(on ? 1 : 0, { duration, easing: easeOut }));
  }, [on, reduceMotion, duration, progress]);
  return progress;
}

/** Background / border colors that cross-fade between two states. */
export function useColorTransition(
  on: boolean,
  off: { bg: string; border: string },
  onColors: { bg: string; border: string },
) {
  const progress = useToggleProgress(on);
  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.get(), [0, 1], [off.bg, onColors.bg]),
    borderColor: interpolateColor(progress.get(), [0, 1], [off.border, onColors.border]),
  }));
}
