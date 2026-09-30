import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useTokens } from '@/theme/use-tokens';

export type IconName = React.ComponentProps<typeof Feather>['name'];

type Props = { name: IconName; size?: number; color?: string };

/** Stroke icons matching the wireframe's line-icon style. */
export function Icon({ name, size = 18, color }: Props) {
  const { p, fs } = useTokens();
  return (
    <Feather
      name={name}
      size={fs(size)}
      color={color ?? p.ink}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
