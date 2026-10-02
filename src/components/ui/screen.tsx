import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { AppText } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Chip } from '@/components/ui/form';
import { useMotion } from '@/components/ui/motion';
import { useAccessibility } from '@/context/accessibility-context';
import { useAuth } from '@/context/auth-context';
import { Fonts, MaxContentWidth } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

export const DISCLAIMER = 'Educational and organizational support — not medical advice.';

type BarLeft = { kind: 'brand' } | { kind: 'back'; onPress?: () => void; label?: string };

type ScreenProps = {
  left?: BarLeft;
  /** Right side of the app bar: a step label, a chip, etc. */
  right?: React.ReactNode;
  children: React.ReactNode;
  /** Content pinned under the scroll area (e.g. Back / Next buttons). */
  bottom?: React.ReactNode;
  footer?: boolean;
  gap?: number;
  /** Text read by the "Read aloud" chip, if `readAloud` is set. */
  readAloud?: string;
  /** Show the Menu chip in the app bar. Defaults to on for signed-in users. */
  menu?: boolean;
};

export function Screen({ left = { kind: 'brand' }, right, children, bottom, footer = true, gap = 16, readAloud, menu }: ScreenProps) {
  const { p } = useTokens();
  const { user } = useAuth();
  const showMenu = menu ?? !!user;

  const rightSlot =
    right || readAloud || showMenu ? (
      <View style={styles.barRight}>
        {typeof right === 'string' ? (
          <AppText variant="step" color="#FFFFFF">
            {right}
          </AppText>
        ) : (
          right
        )}
        {readAloud ? <ReadAloudChip text={readAloud} /> : null}
        {showMenu ? <MenuChip /> : null}
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <AppBar left={left} right={rightSlot} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={[styles.body, { gap }]}>
              <Staggered>{children}</Staggered>
            </View>
            {footer ? (
              <View style={[styles.foot, { borderTopColor: p.border }]}>
                <AppText variant="small" align="center">
                  {DISCLAIMER}
                </AppText>
              </View>
            ) : null}
          </ScrollView>
          {bottom ? <BottomBar>{bottom}</BottomBar> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const STAGGER_MS = 45;
const MAX_STAGGER_STEPS = 8;

type Keyed = { key: string; el: React.ReactElement };

/** Flattens fragments so their children stay direct flex children (and keep the body's `gap`). */
function flattenChildren(children: React.ReactNode, prefix = ''): Keyed[] {
  const out: Keyed[] = [];
  React.Children.forEach(children, (child, i) => {
    if (!React.isValidElement(child)) return;
    const key = `${prefix}${child.key ?? i}`;
    if (child.type === React.Fragment) {
      out.push(...flattenChildren((child.props as { children?: React.ReactNode }).children, `${key}.`));
    } else {
      out.push({ key, el: child });
    }
  });
  return out;
}

/**
 * Screen content rises into place one block after another ("rise" in the wireframe).
 * Blocks that appear later (errors, expanded panels) rise without delay, and
 * siblings glide to their new positions instead of jumping.
 */
function Staggered({ children }: { children: React.ReactNode }) {
  const motion = useMotion();
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 700);
    return () => clearTimeout(t);
  }, []);

  return flattenChildren(children).map(({ key, el }, index) => {
    const grow = StyleSheet.flatten((el.props as { style?: StyleProp<ViewStyle> }).style)?.flexGrow;
    return (
      <Animated.View
        key={key}
        entering={motion.rise(settled ? 0 : Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS)}
        layout={motion.glide}
        style={grow ? { flexGrow: grow } : undefined}>
        {el}
      </Animated.View>
    );
  });
}

function BottomBar({ children }: { children: React.ReactNode }) {
  const { p } = useTokens();
  const motion = useMotion();
  return (
    <Animated.View
      entering={motion.riseLarge(120)}
      style={[styles.bottom, { backgroundColor: p.bg, borderTopColor: p.border }]}>
      <View style={styles.bottomInner}>{children}</View>
    </Animated.View>
  );
}

export function MenuChip() {
  const navigation = useNavigation();
  return (
    <Chip
      tone="bar"
      icon="menu"
      label="Menu"
      accessibilityLabel="Open menu"
      onPress={() => navigation.dispatch({ type: 'OPEN_DRAWER' })}
    />
  );
}

export function AppBar({ left, right }: { left: BarLeft; right?: React.ReactNode }) {
  const { p, fs } = useTokens();
  return (
    <LinearGradient colors={p.barGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top', 'left', 'right']}>
        <View style={styles.bar}>
          {left.kind === 'brand' ? (
            <View style={styles.logo} accessibilityRole="header">
              <View style={styles.mark}>
                <Image source={require('@/assets/images/logo.png')} style={styles.markImage} contentFit="contain" />
              </View>
              <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize: fs(14), color: '#FFFFFF' }}>PATH</AppText>
            </View>
          ) : (
            <Pressable
              onPress={left.onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')))}
              accessibilityRole="button"
              accessibilityLabel={left.label ?? 'Back'}
              hitSlop={8}
              style={styles.back}>
              <Icon name="chevron-left" size={20} color="#FFFFFF" />
              <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize: fs(14), color: '#FFFFFF' }}>
                {left.label ?? 'Back'}
              </AppText>
            </Pressable>
          )}
          {typeof right === 'string' ? (
            <AppText variant="step" color="#FFFFFF">
              {right}
            </AppText>
          ) : (
            right
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export function ReadAloudChip({ text }: { text: string }) {
  const { isReading, toggleReadAloud } = useAccessibility();
  return (
    <Chip
      tone="bar"
      icon={isReading ? 'volume-x' : 'volume-2'}
      label={isReading ? 'Stop' : 'Read aloud'}
      onPress={() => toggleReadAloud(text)}
      accessibilityLabel={isReading ? 'Stop reading aloud' : 'Read this page aloud'}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
    minHeight: 56,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, justifyContent: 'flex-end' },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markImage: { width: 24, height: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingRight: 8 },
  scroll: { flexGrow: 1 },
  body: {
    padding: 20,
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  foot: {
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  bottom: { borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 12 },
  bottomInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: 10 },
});
