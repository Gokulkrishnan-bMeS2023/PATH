import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Reveal, Row } from '@/components/ui/blocks';
import { AnimatedPressable, usePressScale } from '@/components/ui/motion';
import { haptics } from '@/lib/haptics';
import { Fonts, Radius, toneColors, type Tone } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  /** Icon after the label (e.g. "Next →"). */
  trailingIcon?: IconName;
  /** `danger` is a solid red fill; `danger-outline` is a red outline (e.g. Log Out). */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
  /** Border, text and icon colour for `secondary` / `ghost` buttons. Defaults to teal; `neutral` is grey (e.g. Cancel). */
  tone?: Tone | 'neutral';
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  icon,
  trailingIcon,
  variant = 'secondary',
  tone,
  size = 'md',
  disabled,
  loading,
  accessibilityLabel,
  accessibilityHint,
  style,
}: Props) {
  const { p, fs, bw } = useTokens();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isDangerOutline = variant === 'danger-outline';
  const accent =
    isDanger || isDangerOutline ? p.coral : tone === 'neutral' ? p.muted : tone ? toneColors(p, tone).fg : p.primary;
  const fg = isPrimary || isDanger ? '#FFFFFF' : accent;
  const iconSize = size === 'sm' ? 16 : 18;
  const minHeight = size === 'sm' ? 44 : 48;
  const press = usePressScale();

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={iconSize} color={fg} /> : null}
          <AppText
            style={{
              flexShrink: 1,
              fontFamily: Fonts.sansSemiBold,
              fontSize: fs(size === 'sm' ? 13 : 15),
              color: fg,
              textAlign: 'center',
              textDecorationLine: isGhost ? 'underline' : 'none',
            }}>
            {label}
          </AppText>
          {trailingIcon ? <Icon name={trailingIcon} size={iconSize} color={fg} /> : null}
        </>
      )}
    </View>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      aria-disabled={!!(disabled || loading)}
      aria-busy={!!loading}
      style={[
        styles.base,
        {
          minHeight,
          borderWidth: isGhost ? 0 : bw(isDangerOutline ? 1.5 : 2),
          borderColor: accent,
          backgroundColor: isGhost ? 'transparent' : isDanger ? p.coral : p.surface,
          opacity: disabled ? 0.5 : 1,
        },
        isPrimary && styles.primaryShadow,
        isDanger && styles.dangerShadow,
        style,
        press.style,
      ]}>
      {isPrimary ? (
        <LinearGradient
          colors={p.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.md - 2 }]}
        />
      ) : null}
      {content}
    </AnimatedPressable>
  );
}

/**
 * A red outline button for something that can't be undone. The first tap asks
 * `question` in place, with Keep / confirm buttons, so a slip never deletes anything.
 */
export function ConfirmButton({
  label,
  question,
  confirmLabel = label,
  icon = 'trash-2',
  size = 'sm',
  onConfirm,
}: {
  label: string;
  question: string;
  confirmLabel?: string;
  icon?: IconName;
  size?: 'md' | 'sm';
  onConfirm: () => Promise<void> | void;
}) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!asking) {
    return (
      <Button
        size={size}
        variant="danger-outline"
        icon={icon}
        label={label}
        onPress={() => {
          haptics.warning();
          setAsking(true);
        }}
      />
    );
  }
  return (
    <Reveal style={{ gap: 8 }}>
      <AppText variant="strong" accessibilityRole="alert">
        {question}
      </AppText>
      <Row gap={8}>
        <Button size={size} tone="neutral" icon="x" label="Keep" onPress={() => setAsking(false)} />
        <Button
          size={size}
          variant="danger"
          icon={icon}
          label={confirmLabel}
          loading={busy}
          onPress={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
            }
          }}
        />
      </Row>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  primaryShadow: {
    shadowColor: '#0B7F76',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dangerShadow: {
    shadowColor: '#CF3F33',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
