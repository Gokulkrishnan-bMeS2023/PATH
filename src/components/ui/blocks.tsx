import React, { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components/ui/text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useMotion, usePressScale, useToggleProgress } from '@/components/ui/motion';
import { useAccessibility } from '@/context/accessibility-context';
import { ArtDots, Fonts, Radius, toneColors, type Tone } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

/** Round tinted icon bubble (".bub.t-*"). */
export function Bubble({ icon, tone = 'teal', size = 28 }: { icon: IconName; tone?: Tone | 'solid'; size?: number }) {
  const { p } = useTokens();
  const c = tone === 'solid' ? { bg: p.primary, fg: '#FFFFFF' } : toneColors(p, tone);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} size={size * 0.57} color={c.fg} />
    </View>
  );
}

export function Row({ children, gap = 10, style }: { children: React.ReactNode; gap?: number; style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', gap }, style]}>
      {React.Children.map(children, (child) => (child ? <View style={{ flex: 1, minWidth: 0 }}>{child}</View> : null))}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { p, bw } = useTokens();
  return (
    <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border, borderWidth: bw(1.5) }, style]}>
      {children}
    </View>
  );
}

/** Highlighted "Your next step" card. */
export function Hero({ children }: { children: React.ReactNode }) {
  const { p } = useTokens();
  return <View style={[styles.hero, { borderColor: p.primary, backgroundColor: p.surface }]}>{children}</View>;
}

export function Note({ children, icon = 'info' }: { children: React.ReactNode; icon?: IconName }) {
  const { p, hc } = useTokens();
  return (
    <View style={[styles.note, { backgroundColor: p.skyTint }, hc && { borderWidth: 2, borderColor: '#000' }]}>
      <Icon name={icon} size={18} color={p.sky} />
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <AppText color={p.ink}>{children}</AppText> : children}</View>
    </View>
  );
}

export function Warn({ children }: { children: React.ReactNode }) {
  const { p, bw } = useTokens();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.note, { backgroundColor: p.sunTint, borderColor: p.sunBorder, borderWidth: bw(1.5) }]}>
      <Icon name="alert-triangle" size={18} color={p.sun} />
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <AppText color={p.sunInk}>{children}</AppText> : children}</View>
    </View>
  );
}

/** Key/value row (".kv"). */
export function KV({ k, v, mono, onPress }: { k: string; v: React.ReactNode; mono?: boolean; onPress?: () => void }) {
  const { p, fs } = useTokens();
  const value =
    typeof v === 'string' || v == null ? (
      <AppText
        style={{
          fontFamily: mono ? Fonts.mono : Fonts.sansSemiBold,
          fontSize: fs(13),
          color: onPress ? p.primary : p.ink,
          textAlign: 'right',
          flexShrink: 1,
        }}>
        {v || '—'}
      </AppText>
    ) : (
      v
    );
  const body = (
    <View style={[styles.kv, { borderBottomColor: p.divider }]}>
      <AppText style={{ fontSize: fs(13), color: p.muted, flexShrink: 1 }}>{k}</AppText>
      {value}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${k}: ${typeof v === 'string' ? v : ''}`}>
      {body}
    </Pressable>
  );
}

type SectionProps = {
  title: string;
  icon?: IconName;
  tone?: Tone;
  /** When set the header acts as a link (chevron-right) instead of a disclosure. */
  onPress?: () => void;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

/** Collapsible section card (".sec" / ".sech" / ".secb"). */
export function Section({ title, icon, tone = 'teal', onPress, defaultOpen = false, right, children }: SectionProps) {
  const { p, fs, bw } = useTokens();
  const [open, setOpen] = useState(defaultOpen);
  const isLink = !!onPress;
  const motion = useMotion();
  const press = usePressScale(0.985);
  const turn = useToggleProgress(open);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 180}deg` }] }));
  return (
    <Reanimated.View
      style={[styles.sec, { borderColor: p.border, backgroundColor: p.surface, borderWidth: bw(1.5) }, press.style]}>
      <Pressable
        onPress={isLink ? onPress : () => setOpen((o) => !o)}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        aria-expanded={isLink ? undefined : open}
        accessibilityLabel={title}
        style={styles.sech}>
        <View style={styles.st}>
          {icon ? <Bubble icon={icon} tone={tone} /> : null}
          <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize: fs(15), color: p.ink, flexShrink: 1 }}>{title}</AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {right}
          {isLink ? (
            <Icon name="chevron-right" size={18} color={p.muted} />
          ) : (
            <Reanimated.View style={chevron}>
              <Icon name="chevron-down" size={18} color={p.muted} />
            </Reanimated.View>
          )}
        </View>
      </Pressable>
      {!isLink && open && children ? (
        <Reanimated.View entering={motion.rise()} exiting={motion.fadeOut} style={styles.secb}>
          {children}
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
}

/** Segmented progress bar for multi-step flows (".bar5"). */
export function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <View
      style={{ flexDirection: 'row', gap: 6 }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <StepSegment key={i} filled={i < current} fillOnMount={i === current - 1} />
      ))}
    </View>
  );
}

function StepSegment({ filled, fillOnMount }: { filled: boolean; fillOnMount: boolean }) {
  const { p } = useTokens();
  const { enabled } = useMotion();
  const animateIn = enabled && filled && fillOnMount;
  const progress = useSharedValue(filled && !animateIn ? 1 : 0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    progress.set(enabled ? withDelay(animateIn ? 250 : 0, withTiming(target, { duration: 700 })) : target);
  }, [filled, animateIn, enabled, progress]);

  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.get() }] }));
  return (
    <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: p.border, overflow: 'hidden' }}>
      <Reanimated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.sky, transformOrigin: 'left' }, fill]} />
    </View>
  );
}

export type ProgressState = 'done' | 'current' | 'todo';

export function ProgressStep({ label, state }: { label: string; state: ProgressState }) {
  const { p } = useTokens();
  const [pulse] = useState(() => new Animated.Value(0));
  const { reduceMotion } = useReduceMotionSafe();

  useEffect(() => {
    if (state !== 'current' || reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse, reduceMotion]);

  const fill = state === 'done' ? p.green : state === 'current' ? p.primary : p.surface;
  const border = state === 'done' ? p.green : state === 'current' ? p.primary : p.borderStrong;
  return (
    <View
      style={styles.pstep}
      accessible
      accessibilityLabel={`${label}, ${state === 'done' ? 'completed' : state === 'current' ? 'current step' : 'not started'}`}>
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        {state === 'current' ? (
          <Animated.View
            style={{
              position: 'absolute',
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: p.primary,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
            }}
          />
        ) : null}
        <View style={[styles.pdot, { backgroundColor: fill, borderColor: border }]}>
          {state === 'done' ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
        </View>
      </View>
      <AppText variant={state === 'current' ? 'strong' : 'body'} color={state === 'todo' ? p.muted : p.ink}>
        {label}
        {state === 'current' ? ' · current' : ''}
      </AppText>
    </View>
  );
}

/** Suggested-script quote block (".quote"). */
export function Quote({ children }: { children: string }) {
  const { p, fs } = useTokens();
  return (
    <View style={[styles.quote, { borderColor: p.purple, backgroundColor: p.purpleTint }]}>
      <AppText italic style={{ fontSize: fs(14), lineHeight: fs(21), color: p.ink }}>
        “{children}”
      </AppText>
    </View>
  );
}

/** Numbered question row (".q" + ".num"). */
export function Numbered({ n, children }: { n: number; children: string }) {
  const { p, fs } = useTokens();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={[styles.num, { backgroundColor: p.purple }]}>
        <AppText style={{ fontFamily: Fonts.monoSemiBold, fontSize: fs(12), color: '#FFFFFF' }}>{n}</AppText>
      </View>
      <AppText color={p.ink} style={{ flex: 1 }}>
        {children}
      </AppText>
    </View>
  );
}

/** Brand art: navy gradient panel with bobbing colored dots (".art"). */
export function BrandArt({ height = 150 }: { height?: number }) {
  const { p } = useTokens();
  const { reduceMotion } = useReduceMotionSafe();
  const [anims] = useState(() => ArtDots.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return;
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(a, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(a, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims, reduceMotion]);

  return (
    <LinearGradient
      colors={p.barGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.art, { height }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {ArtDots.map((c, i) => (
        <Animated.View
          key={c}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: c,
            transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }],
          }}
        />
      ))}
    </LinearGradient>
  );
}

/** Success check badge with a soft green ring (".badge"). */
export function SuccessBadge({ icon = 'check' }: { icon?: IconName }) {
  const { p } = useTokens();
  const motion = useMotion();
  return (
    <Reanimated.View entering={motion.pop(150)} style={[styles.badgeRing, { backgroundColor: p.greenTint }]}>
      <View style={[styles.badge, { backgroundColor: p.green }]}>
        <Reanimated.View entering={motion.pop(380)}>
          <Icon name={icon} size={44} color="#FFFFFF" />
        </Reanimated.View>
      </View>
    </Reanimated.View>
  );
}

/**
 * Content that appears inside a card (a note, an editor, a new next step)
 * rises into place and fades out when removed.
 */
export function Reveal({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const motion = useMotion();
  return (
    <Reanimated.View entering={motion.rise()} exiting={motion.fadeOut} layout={motion.glide} style={style}>
      {children}
    </Reanimated.View>
  );
}

/** Shared title + icon row used at the top of cards (".st"). */
export function CardTitle({ icon, tone, title, tag }: { icon?: IconName; tone?: Tone; title?: string; tag?: string }) {
  return (
    <View style={styles.st}>
      {icon ? <Bubble icon={icon} tone={tone} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {tag ? <AppText variant="tag">{tag}</AppText> : null}
        {title ? <AppText variant="h2">{title}</AppText> : null}
      </View>
    </View>
  );
}

function useReduceMotionSafe() {
  const { reduceMotion } = useAccessibility();
  return { reduceMotion };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: 14,
    gap: 8,
    shadowColor: '#162638',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  hero: {
    borderWidth: 2,
    borderRadius: Radius.xl,
    padding: 18,
    gap: 10,
    shadowColor: '#162638',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  note: { flexDirection: 'row', gap: 10, borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'flex-start' },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sec: {
    borderRadius: Radius.lg,
    shadowColor: '#162638',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sech: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  st: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  secb: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  pstep: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 34 },
  pdot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radius.md, paddingVertical: 12, paddingHorizontal: 14 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  art: {
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  badgeRing: { width: 108, height: 108, borderRadius: 54, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
});
