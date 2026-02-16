import { Platform } from 'react-native';

/**
 * Design system for PG Essays
 *
 * Warm, bookish, premium aesthetic. Think Substack reader meets Matter.
 * No pure black or white anywhere. Muted sage green as sole accent.
 * Serif for reading content and headlines, sans-serif only for UI meta labels.
 */

// Serif font stack (reading content & headlines)
export const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

// Sans-serif for UI meta labels only
export const sansFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const colors = {
  // Backgrounds
  bg: '#F7F5F0',           // Warm parchment off-white
  bgDark: '#1C1B19',       // Warm charcoal
  card: '#EFEDE8',          // Slightly deeper parchment for cards
  cardDark: '#26251F',      // Warm dark card

  // Text
  text: '#2C2B28',          // Warm near-black
  textDark: '#E5E2DC',      // Warm near-white
  textSecondary: '#7A766E', // Muted warm gray
  textSecondaryDark: '#9B9790',
  textMuted: '#A09B93',     // Even more subdued
  textMutedDark: '#6B6760',

  // Accent — muted sage green (sole accent)
  accent: '#5B7F5E',
  accentLight: '#EEF2EE',   // Very faint sage tint
  accentDark: '#4A6A4D',    // Slightly deeper sage

  // Borders
  border: '#E0DDD6',        // Soft warm border
  borderDark: '#3A3835',
  borderLight: '#EAE7E0',   // Even softer

  // States
  error: '#B55A50',         // Warm muted red
  errorBg: '#F5EEEC',       // Warm error background

  // Overlay
  overlay: 'rgba(28, 27, 25, 0.75)',
} as const;

// Reading-optimized typography scale
export const typography = {
  // Headlines (serif)
  h1: {
    fontFamily: serifFont,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: serifFont,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: serifFont,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: colors.text,
  },

  // Body (serif, optimized for reading)
  body: {
    fontFamily: serifFont,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text,
  },

  // Card title (serif)
  cardTitle: {
    fontFamily: serifFont,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600' as const,
    color: colors.text,
  },

  // UI labels (sans-serif)
  label: {
    fontFamily: sansFont,
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: sansFont,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  tab: {
    fontFamily: sansFont,
    fontSize: 13,
    fontWeight: '600' as const,
  },
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Max content width for comfortable reading (65-70 chars at 18px serif)
export const MAX_READING_WIDTH = 620;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
} as const;
