/**
 * Design tokens taken from the "PATH × AccessBridge" wireframes.
 * Every screen and UI primitive reads colors from a `Palette` so that the
 * high-contrast accessibility mode can swap the whole palette at once.
 */

export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  body: string;
  muted: string;
  border: string;
  borderStrong: string;
  divider: string;
  primary: string;
  primaryDark: string;
  primaryGradient: [string, string];
  primaryTint: string;
  barGradient: [string, string];
  onBar: string;
  sky: string;
  skyTint: string;
  purple: string;
  purpleTint: string;
  coral: string;
  coralTint: string;
  sun: string;
  sunTint: string;
  sunBorder: string;
  sunInk: string;
  green: string;
  greenTint: string;
  warm: string;
  placeholder: string;
  danger: string;
  dangerTint: string;
};

export const lightPalette: Palette = {
  bg: '#F3F8FB',
  surface: '#FFFFFF',
  ink: '#162638',
  body: '#2B3A48',
  muted: '#56677A',
  border: '#DDE6EC',
  borderStrong: '#B4C3CF',
  divider: '#E6EDF2',
  primary: '#0B7F76',
  primaryDark: '#075E57',
  primaryGradient: ['#0E9489', '#0B7F76'],
  primaryTint: '#E0F9F5',
  barGradient: ['#162638', '#24506B'],
  onBar: '#FFFFFF',
  sky: '#1A76B8',
  skyTint: '#E7F4FD',
  purple: '#5F3FB3',
  purpleTint: '#EFEAFA',
  coral: '#CF3F33',
  coralTint: '#FEECEA',
  sun: '#8A5A00',
  sunTint: '#FEF6E1',
  sunBorder: '#E0A526',
  sunInk: '#4A3000',
  green: '#1B7F53',
  greenTint: '#E3F6EC',
  warm: '#FAC44C',
  placeholder: '#7D8C99',
  danger: '#B42318',
  dangerTint: '#FEECEA',
};

/** Maximum-contrast palette: black ink, black borders, white surfaces. */
export const highContrastPalette: Palette = {
  ...lightPalette,
  bg: '#FFFFFF',
  ink: '#000000',
  body: '#000000',
  muted: '#1F1F1F',
  border: '#000000',
  borderStrong: '#000000',
  divider: '#000000',
  primary: '#00463F',
  primaryDark: '#002E29',
  primaryGradient: ['#00463F', '#00463F'],
  primaryTint: '#FFFFFF',
  barGradient: ['#000000', '#000000'],
  sky: '#003E6B',
  skyTint: '#FFFFFF',
  purple: '#2E1A6B',
  purpleTint: '#FFFFFF',
  coral: '#7A120A',
  coralTint: '#FFFFFF',
  sun: '#3D2800',
  sunTint: '#FFFFFF',
  sunBorder: '#000000',
  sunInk: '#000000',
  green: '#0B4A2E',
  greenTint: '#FFFFFF',
  placeholder: '#333333',
  danger: '#7A120A',
  dangerTint: '#FFFFFF',
};

export type Tone = 'teal' | 'sky' | 'purple' | 'coral' | 'sun' | 'green';

export function toneColors(p: Palette, tone: Tone): { bg: string; fg: string } {
  switch (tone) {
    case 'teal':
      return { bg: p.primaryTint, fg: p.primary };
    case 'sky':
      return { bg: p.skyTint, fg: p.sky };
    case 'purple':
      return { bg: p.purpleTint, fg: p.purple };
    case 'coral':
      return { bg: p.coralTint, fg: p.coral };
    case 'sun':
      return { bg: p.sunTint, fg: p.sun };
    case 'green':
      return { bg: p.greenTint, fg: p.green };
  }
}

export const Fonts = {
  sans: 'IBMPlexSans_400Regular',
  sansItalic: 'IBMPlexSans_400Regular_Italic',
  sansMedium: 'IBMPlexSans_500Medium',
  sansSemiBold: 'IBMPlexSans_600SemiBold',
  sansBold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
} as const;

export const Radius = { sm: 10, md: 12, lg: 14, xl: 16, pill: 999 } as const;

export const MaxContentWidth = 560;

/** Brand dots used in the welcome illustration. */
export const ArtDots = ['#14B2A5', '#4AA9E6', '#F57063', '#FAC44C', '#7D5BCC'] as const;
