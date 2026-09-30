import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { Fonts } from '@/theme/tokens';
import { useTokens } from '@/theme/use-tokens';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'body'
  | 'small'
  | 'label'
  | 'step'
  | 'tag'
  | 'mono'
  | 'strong';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  italic?: boolean;
};

/** Typography primitive — every string in the app renders through this. */
export function AppText({ variant = 'body', color, align, italic, style, ...rest }: Props) {
  const { p, fs, hc } = useTokens();

  const base: Record<TextVariant, TextStyle> = {
    h1: { fontFamily: Fonts.sansSemiBold, fontSize: fs(24), lineHeight: fs(29), color: p.ink },
    h2: { fontFamily: Fonts.sansSemiBold, fontSize: fs(16), lineHeight: fs(21), color: p.ink },
    body: { fontFamily: Fonts.sans, fontSize: fs(14), lineHeight: fs(20), color: p.body },
    strong: { fontFamily: Fonts.sansSemiBold, fontSize: fs(14), lineHeight: fs(20), color: p.ink },
    small: { fontFamily: Fonts.sans, fontSize: fs(12), lineHeight: fs(17), color: p.muted },
    label: { fontFamily: Fonts.sansSemiBold, fontSize: fs(12), lineHeight: fs(16), color: p.body },
    step: {
      fontFamily: Fonts.monoMedium,
      fontSize: fs(11),
      letterSpacing: 0.9,
      textTransform: 'uppercase',
      color: p.muted,
    },
    tag: {
      fontFamily: Fonts.monoSemiBold,
      fontSize: fs(11),
      letterSpacing: 0.7,
      textTransform: 'uppercase',
      color: p.primary,
    },
    mono: { fontFamily: Fonts.mono, fontSize: fs(12), lineHeight: fs(17), color: p.muted },
  };

  const style2: TextStyle = {
    ...base[variant],
    ...(hc && variant !== 'h1' && variant !== 'h2' ? { fontFamily: Fonts.sansSemiBold } : null),
    ...(italic ? { fontFamily: Fonts.sansItalic, fontStyle: 'italic' } : null),
    ...(color ? { color } : null),
    ...(align ? { textAlign: align } : null),
  };

  return (
    <Text
      accessibilityRole={variant === 'h1' || variant === 'h2' ? 'header' : undefined}
      style={[style2, style]}
      {...rest}
    />
  );
}
