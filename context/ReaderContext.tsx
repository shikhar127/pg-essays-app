import React, { createContext, useContext, useState, ReactNode } from 'react';
import { themes, fontSizes, Theme, ThemeName, FontSize, FontSizeConfig } from '../lib/themes';

interface ReaderContextType {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  fontSize: FontSize;
  fontSizeConfig: FontSizeConfig;
  setFontSize: (size: FontSize) => void;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  const value: ReaderContextType = {
    theme: themes[themeName],
    themeName,
    setThemeName,
    fontSize,
    fontSizeConfig: fontSizes[fontSize],
    setFontSize,
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
