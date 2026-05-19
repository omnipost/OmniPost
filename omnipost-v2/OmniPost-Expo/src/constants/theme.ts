// src/constants/theme.ts
export const Colors = {
  // Backgrounds
  bg0:       '#06090F',
  bg1:       '#0B1220',
  bg2:       '#101B2E',
  bg3:       '#162038',

  // Borders
  border:    '#1C2C44',
  borderHi:  '#243552',

  // Brand
  brand:     '#6366F1',
  brandDim:  'rgba(99,102,241,0.13)',
  brandBdr:  'rgba(99,102,241,0.3)',

  // Accent
  cyan:      '#22D3EE',
  cyanDim:   'rgba(34,211,238,0.11)',

  // Text
  text:      '#EEF2FF',
  textSec:   '#8FA3BE',
  textMuted: '#435972',

  // Status
  success:    '#10B981',
  successDim: 'rgba(16,185,129,0.12)',
  warning:    '#F59E0B',
  warningDim: 'rgba(245,158,11,0.12)',
  danger:     '#F43F5E',
  dangerDim:  'rgba(244,63,94,0.12)',

  white: '#FFFFFF',
  black: '#000000',
};

export const PlatformColors: Record<string, string> = {
  instagram: '#E1306C',
  facebook:  '#1877F2',
  twitter:   '#1DA1F2',
  youtube:   '#FF0000',
  linkedin:  '#0A66C2',
  threads:   '#AAAAAA',
  sharechat: '#F58020',
  moj:       '#FF2D55',
  telegram:  '#2AABEE',
  whatsapp:  '#25D366',
  pinterest: '#E60023',
  snapchat:  '#FFFC00',
};

export const Typography = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 40,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};
