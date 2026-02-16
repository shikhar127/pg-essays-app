/**
 * Essay-related TypeScript type definitions
 */

/**
 * Metadata for a single Paul Graham essay
 */
export interface EssayMetadata {
  id: string;
  title: string;
  wordCount: number;
  readingTimeMinutes: number;
  year: number;
  month: number;
  url: string;
  filename: string;
}

/**
 * Full essay with content
 */
export interface Essay extends EssayMetadata {
  content: string;
}

/**
 * User's reading progress for a specific essay
 */
export interface ReadingProgress {
  essayId: string;
  scrollPosition: number;
  progress: number; // 0-1 representing percentage of essay read
  isRead: boolean; // Auto-marked true when progress >= 0.9
  lastReadAt: string; // ISO date string
}

/**
 * User settings and preferences
 */
export interface Settings {
  hasCompletedOnboarding: boolean;
  remindersEnabled: boolean;
}

/**
 * Complete app state stored in AsyncStorage
 */
export interface AppState {
  readingProgress: Record<string, ReadingProgress>;
  favorites: Set<string>; // Set of essay IDs
  settings: Settings;
}
