import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '@/components/ui/text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Bubble } from '@/components/ui/blocks';
import { AnimatedPressable, useColorTransition, useMotion, usePressScale } from '@/components/ui/motion';
import { Fonts, Radius, type Tone } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// ---------- text fields ----------

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  /** Rendered to the right of the input (e.g. a Show/Hide chip). */
  trailing?: React.ReactNode;
  flex?: boolean;
};

export function Field({ label, error, required, multiline, trailing, flex, style, ...input }: FieldProps) {
  const { p, fs, bw } = useTokens();
  const [focused, setFocused] = useState(false);
  const motion = useMotion();
  // Focus ring cross-fades; an error keeps the border red in both states.
  const focusStyle = useColorTransition(
    focused,
    { bg: p.surface, border: error ? p.danger : p.borderStrong },
    { bg: p.primaryTint, border: error ? p.danger : p.primary },
  );

  return (
    <View style={[styles.fld, flex && { flex: 1 }]}>
      <AppText variant="label">
        {label}
        {required ? <AppText variant="label" color={p.danger}> *</AppText> : null}
      </AppText>
      <View style={styles.inrow}>
        <AnimatedTextInput
          placeholderTextColor={p.placeholder}
          multiline={multiline}
          aria-label={label}
          aria-invalid={!!error}
          aria-required={required}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              fontSize: fs(14),
              borderWidth: bw(1.5),
              color: p.ink,
            },
            focusStyle,
            multiline && { minHeight: 72, paddingTop: 10, textAlignVertical: 'top' },
            style,
          ]}
          {...input}
        />
        {trailing}
      </View>
      {error ? (
        <Animated.View entering={motion.rise()} exiting={motion.fadeOut} style={styles.errRow} accessibilityRole="alert">
          <Icon name="alert-circle" size={14} color={p.danger} />
          <AppText variant="small" color={p.danger} style={{ flex: 1 }}>
            {error}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

export function PasswordField(props: Omit<FieldProps, 'secureTextEntry' | 'trailing'>) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      secureTextEntry={!show}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <Chip
          label={show ? 'Hide' : 'Show'}
          onPress={() => setShow((s) => !s)}
          accessibilityLabel={`${show ? 'Hide' : 'Show'} ${props.label.toLowerCase()}`}
        />
      }
    />
  );
}

// ---------- chips ----------

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'due' | 'bar';
  icon?: IconName;
  accessibilityLabel?: string;
  role?: 'radio' | 'checkbox' | 'button';
};

export function Chip({ label, selected, onPress, tone = 'default', icon, accessibilityLabel, role = 'button' }: ChipProps) {
  const { p, fs, bw } = useTokens();
  let bg = p.surface;
  let border = p.borderStrong;
  let fg = p.ink;
  if (selected) {
    bg = p.sky;
    border = p.sky;
    fg = '#FFFFFF';
  }
  if (tone === 'due') {
    bg = p.coral;
    border = p.coral;
    fg = '#FFFFFF';
  }
  if (tone === 'bar') {
    bg = 'rgba(255,255,255,0.16)';
    border = 'rgba(255,255,255,0.6)';
    fg = '#FFFFFF';
  }
  const bold = selected || tone !== 'default';
  // Selectable chips cross-fade between the plain and the selected (sky) colors.
  const colors = useColorTransition(
    !!selected,
    tone === 'default' ? { bg: p.surface, border: p.borderStrong } : { bg, border },
    tone === 'default' ? { bg: p.sky, border: p.sky } : { bg, border },
  );
  const press = usePressScale(0.95);
  const body = (
    <>
      {icon ? <Icon name={icon} size={15} color={fg} /> : null}
      <AppText
        style={{ fontFamily: bold ? Fonts.sansSemiBold : Fonts.sans, fontSize: fs(tone === 'due' ? 12 : 14), color: fg }}>
        {label}
      </AppText>
    </>
  );
  const chipStyle = [
    styles.chip,
    { borderWidth: bw(1.5) },
    tone === 'due' && { minHeight: 26, paddingHorizontal: 10 },
  ];
  if (!onPress) return <Animated.View style={[chipStyle, colors]}>{body}</Animated.View>;
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      aria-checked={role === 'button' ? undefined : !!selected}
      style={[chipStyle, colors, press.style]}>
      {body}
    </AnimatedPressable>
  );
}

export type ChoiceOption<T extends string> = { value: T; label: string };

/** Single-select chip group. Tapping the selected chip again clears it. */
export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly ChoiceOption<T>[];
  value: T | null | undefined;
  onChange: (v: T | null) => void;
  label?: string;
}) {
  return (
    <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          role="radio"
          selected={value === o.value}
          onPress={() => onChange(value === o.value ? null : o.value)}
        />
      ))}
    </View>
  );
}

export function ChipMulti<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly ChoiceOption<T>[];
  value: T[];
  onChange: (v: T[]) => void;
  label?: string;
}) {
  return (
    <View style={styles.chips} accessibilityLabel={label}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <Chip
            key={o.value}
            label={o.label}
            role="checkbox"
            selected={on}
            onPress={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}
          />
        );
      })}
    </View>
  );
}

// ---------- radio option rows ----------

type OptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  tone?: Tone;
  /** Shows an "i" badge; pressing it calls onInfo. */
  onInfo?: () => void;
  flex?: boolean;
};

export function OptionRow({ label, selected, onPress, icon, tone = 'teal', onInfo, flex }: OptionProps) {
  const { p, bw } = useTokens();
  const card = useColorTransition(selected, { bg: p.surface, border: p.border }, { bg: p.primaryTint, border: p.primary });
  const dot = useColorTransition(selected, { bg: p.surface, border: p.placeholder }, { bg: p.primary, border: p.primary });
  const press = usePressScale(0.98);
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="radio"
      aria-checked={selected}
      accessibilityLabel={label}
      style={[
        styles.opt,
        { borderWidth: selected ? 2 : bw(1.5) },
        card,
        flex && { flex: 1 },
        press.style,
      ]}>
      <Animated.View style={[styles.dot, dot]}>{selected ? <Tick size={13} /> : null}</Animated.View>
      {icon ? <Bubble icon={icon} tone={tone} /> : null}
      <AppText variant={selected ? 'strong' : 'body'} color={p.ink} style={{ flex: 1 }}>
        {label}
      </AppText>
      {onInfo ? <InfoBadge onPress={onInfo} label={`What does ${label} mean?`} /> : null}
    </AnimatedPressable>
  );
}

export function RadioList<T extends string>({
  options,
  value,
  onChange,
  icons,
}: {
  options: readonly (ChoiceOption<T> & { icon?: IconName; tone?: Tone; info?: string })[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  icons?: boolean;
}) {
  const [openInfo, setOpenInfo] = useState<T | null>(null);
  const motion = useMotion();
  return (
    <View style={{ gap: 10 }} accessibilityRole="radiogroup">
      {options.map((o) => (
        <Animated.View key={o.value} style={{ gap: 10 }} layout={motion.glide}>
          <OptionRow
            label={o.label}
            selected={value === o.value}
            onPress={() => onChange(o.value)}
            icon={icons ? o.icon : undefined}
            tone={o.tone}
            onInfo={o.info ? () => setOpenInfo(openInfo === o.value ? null : o.value) : undefined}
          />
          {o.info && (openInfo === o.value || value === o.value) ? <InfoNote text={o.info} title={o.label} /> : null}
        </Animated.View>
      ))}
    </View>
  );
}

function InfoNote({ title, text }: { title: string; text: string }) {
  const { p } = useTokens();
  const motion = useMotion();
  return (
    <Animated.View entering={motion.rise()} exiting={motion.fadeOut} style={[styles.note, { backgroundColor: p.skyTint }]}>
      <Icon name="info" size={18} color={p.sky} />
      <AppText variant="body" color={p.ink} style={{ flex: 1 }}>
        <AppText variant="strong">{title}: </AppText>
        {text}
      </AppText>
    </Animated.View>
  );
}

// ---------- checkbox ----------

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { p } = useTokens();
  const box = useColorTransition(checked, { bg: p.surface, border: p.primary }, { bg: p.primary, border: p.primary });
  const press = usePressScale(0.97);
  return (
    <AnimatedPressable
      onPress={() => onChange(!checked)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="checkbox"
      aria-checked={checked}
      accessibilityLabel={label}
      style={[styles.chk, press.style]}>
      <Animated.View style={[styles.box, box]}>{checked ? <Tick size={14} /> : null}</Animated.View>
      <AppText variant="body" color={p.ink} style={{ flexShrink: 1 }}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

/** White check mark that pops in when a control becomes selected. */
function Tick({ size }: { size: number }) {
  const motion = useMotion();
  return (
    <Animated.View entering={motion.pop()}>
      <Icon name="check" size={size} color="#FFFFFF" />
    </Animated.View>
  );
}

// ---------- segmented control ----------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { p, fs } = useTokens();
  return (
    <View style={[styles.seg, { borderColor: p.primary }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return <SegmentTab key={o.value} label={o.label} on={on} fontSize={fs(14)} onPress={() => onChange(o.value)} />;
      })}
    </View>
  );
}

function SegmentTab({ label, on, onPress, fontSize }: { label: string; on: boolean; onPress: () => void; fontSize: number }) {
  const { p } = useTokens();
  const colors = useColorTransition(on, { bg: p.surface, border: p.surface }, { bg: p.primary, border: p.primary });
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="tab" aria-selected={on} accessibilityLabel={label} style={[styles.segBtn, colors]}>
      <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize, color: on ? '#FFFFFF' : p.primary }}>{label}</AppText>
    </AnimatedPressable>
  );
}

// ---------- info ("i") affordances ----------

export function InfoBadge({ onPress, label }: { onPress?: () => void; label?: string }) {
  const { p } = useTokens();
  const badge = (
    <View style={[styles.info, { borderColor: p.sky, backgroundColor: p.surface }]}>
      <AppText style={{ fontFamily: Fonts.sansBold, fontStyle: 'italic', fontSize: 12, color: p.sky }}>i</AppText>
    </View>
  );
  if (!onPress) return badge;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? 'More information'} hitSlop={12}>
      {badge}
    </Pressable>
  );
}

export function InfoLink({ label, onPress, expanded }: { label: string; onPress: () => void; expanded?: boolean }) {
  const { p, fs } = useTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      aria-expanded={!!expanded}
      accessibilityLabel={label}
      style={styles.infol}>
      <InfoBadge />
      <AppText style={{ fontFamily: Fonts.sansSemiBold, fontSize: fs(13), color: p.sky }}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fld: { gap: 6 },
  inrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    fontFamily: Fonts.sans,
  },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    shadowColor: '#162638',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chk: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seg: { flexDirection: 'row', borderWidth: 2, borderRadius: Radius.md, overflow: 'hidden' },
  segBtn: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  info: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infol: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  note: { flexDirection: 'row', gap: 10, borderRadius: Radius.md, padding: 12, alignItems: 'flex-start' },
});
