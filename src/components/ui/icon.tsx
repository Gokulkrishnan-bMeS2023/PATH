import React from 'react';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTokens } from '@/theme/use-tokens';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

/** Feather names, plus the accessibility symbol Feather lacks (drawn from MaterialIcons). */
export type IconName = FeatherName | 'accessibility';

type Props = { name: IconName; size?: number; color?: string };

/** Stroke icons matching the wireframe's line-icon style. */
export function Icon({ name, size = 18, color }: Props) {
  const { p, fs } = useTokens();
  const shared = {
    size: fs(size),
    color: color ?? p.ink,
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no' as const,
  };
  if (name === 'accessibility') return <MaterialIcons name="accessible-forward" {...shared} />;
  return <Feather name={name} {...shared} />;
}
