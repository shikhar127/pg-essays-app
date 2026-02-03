export type ThemeName = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large';

export interface Theme {
  name: ThemeName;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    accent: string;
    headerBackground: string;
    progressBar: string;
    border: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    colors: {
      background: '#FFFFFF',
      text: '#2D2D2D',
      textSecondary: '#666666',
      accent: '#FF6B35',
      headerBackground: 'rgba(255, 255, 255, 0.95)',
      progressBar: '#FF6B35',
      border: '#E5E5E5',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      background: '#121212',
      text: '#E0E0E0',
      textSecondary: '#9E9E9E',
      accent: '#FF8A65',
      headerBackground: 'rgba(18, 18, 18, 0.95)',
      progressBar: '#FF8A65',
      border: '#333333',
    },
  },
  sepia: {
    name: 'sepia',
    colors: {
      background: '#FBF5E6',
      text: '#4A4135',
      textSecondary: '#7A6F5F',
      accent: '#B85C38',
      headerBackground: 'rgba(251, 245, 230, 0.95)',
      progressBar: '#B85C38',
      border: '#E5DCC8',
    },
  },
};

export interface FontSizeConfig {
  body: number;
  title: number;
  lineHeight: number;
}

export const fontSizes: Record<FontSize, FontSizeConfig> = {
  small: {
    body: 16,
    title: 24,
    lineHeight: 1.65,
  },
  medium: {
    body: 18,
    title: 28,
    lineHeight: 1.7,
  },
  large: {
    body: 21,
    title: 32,
    lineHeight: 1.75,
  },
};
