import { useMemo } from 'react';
import { useAccessibility } from '@/context/accessibility-context';
import { highContrastPalette, lightPalette, type Palette } from '@/theme/tokens';

export type Tokens = {
  p: Palette;
  hc: boolean;
  /** Scales a font size / line height by the user's chosen text size. */
  fs: (size: number) => number;
  /** Border width that thickens in high-contrast mode. */
  bw: (width: number) => number;
};

export function useTokens(): Tokens {
  const { highContrast, scaleMultiplier } = useAccessibility();
  return useMemo(
    () => ({
      p: highContrast ? highContrastPalette : lightPalette,
      hc: highContrast,
      fs: (size: number) => Math.round(size * scaleMultiplier * 10) / 10,
      bw: (width: number) => (highContrast ? Math.max(2, width) : width),
    }),
    [highContrast, scaleMultiplier],
  );
}
