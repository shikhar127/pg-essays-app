import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingProgress, Settings, AppState } from '@/types/essay';

// Re-export types for convenience
export type { ReadingProgress, Settings } from '@/types/essay';

interface AppStateContextValue extends AppState {
  updateProgress: (essayId: string, scrollPosition: number, progress: number) => Promise<void>;
  toggleFavorite: (essayId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  clearProgress: () => Promise<void>;
  clearFavorites: () => Promise<void>;
  isLoading: boolean;
}

// AsyncStorage keys
const STORAGE_KEYS = {
  READING_PROGRESS: '@pg_essays:reading_progress',
  FAVORITES: '@pg_essays:favorites',
  SETTINGS: '@pg_essays:settings',
} as const;

// Default values
const DEFAULT_SETTINGS: Settings = {
  hasCompletedOnboarding: false,
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = async () => {
    try {
      const [progressData, favoritesData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.READING_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      if (progressData) {
        setReadingProgress(JSON.parse(progressData));
      }

      if (favoritesData) {
        const favArray = JSON.parse(favoritesData) as string[];
        setFavorites(new Set(favArray));
      }

      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Failed to load app state from AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (
    essayId: string,
    scrollPosition: number,
    progress: number
  ) => {
    try {
      const newProgress: ReadingProgress = {
        essayId,
        scrollPosition,
        progress,
        isRead: progress >= 0.9, // Auto mark as read at 90%
        lastReadAt: new Date().toISOString(),
      };

      const updatedProgress = {
        ...readingProgress,
        [essayId]: newProgress,
      };

      setReadingProgress(updatedProgress);
      await AsyncStorage.setItem(
        STORAGE_KEYS.READING_PROGRESS,
        JSON.stringify(updatedProgress)
      );
    } catch (error) {
      console.error('Failed to update reading progress:', error);
    }
  };

  const toggleFavorite = async (essayId: string) => {
    try {
      const newFavorites = new Set(favorites);

      if (newFavorites.has(essayId)) {
        newFavorites.delete(essayId);
      } else {
        newFavorites.add(essayId);
      }

      setFavorites(newFavorites);
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(Array.from(newFavorites))
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const clearProgress = async () => {
    try {
      setReadingProgress({});
      await AsyncStorage.removeItem(STORAGE_KEYS.READING_PROGRESS);
    } catch (error) {
      console.error('Failed to clear reading progress:', error);
    }
  };

  const clearFavorites = async () => {
    try {
      setFavorites(new Set());
      await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  };

  const value: AppStateContextValue = {
    readingProgress,
    favorites,
    settings,
    updateProgress,
    toggleFavorite,
    updateSettings,
    clearProgress,
    clearFavorites,
    isLoading,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
