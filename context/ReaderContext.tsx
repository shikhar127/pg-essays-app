import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { themes, fontSizes, Theme, ThemeName, FontSize, FontSizeConfig } from '../lib/themes';
import { loadSettings, saveSettings } from '../lib/storage';

interface ReaderContextType {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  fontSize: FontSize;
  fontSizeConfig: FontSizeConfig;
  setFontSize: (size: FontSize) => void;
  isLoading: boolean;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function load() {
      const settings = await loadSettings();
      if (settings) {
        setThemeNameState(settings.themeName);
        setFontSizeState(settings.fontSize);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // Save settings when theme changes
  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    saveSettings({ themeName: name, fontSize });
  }, [fontSize]);

  // Save settings when font size changes
  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    saveSettings({ themeName, fontSize: size });
  }, [themeName]);

  const value: ReaderContextType = {
    theme: themes[themeName],
    themeName,
    setThemeName,
    fontSize,
    fontSizeConfig: fontSizes[fontSize],
    setFontSize,
    isLoading,
  };

  return (
    <ReaderContext.Provider value={value}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
}
