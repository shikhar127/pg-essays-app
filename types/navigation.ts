/**
 * Navigation-related TypeScript type definitions for Expo Router
 */

/**
 * Root stack navigator parameter list
 */
export type RootStackParamList = {
  '(tabs)': undefined;
  'reader/[id]': { id: string };
};

/**
 * Tab navigator parameter list
 */
export type TabParamList = {
  library: undefined;
  favorites: undefined;
  settings: undefined;
};

/**
 * Reader screen route params
 */
export type ReaderParams = {
  id: string;
};

/**
 * Type-safe navigation params for use with useLocalSearchParams
 */
export type NavigationParams = {
  ReaderScreen: ReaderParams;
};
