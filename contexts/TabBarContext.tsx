import React, { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
  tabBarTranslateY: Animated.Value;
  handleScroll: (currentY: number) => void;
  showTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextType | null>(null);

export function useTabBar() {
  const ctx = useContext(TabBarContext);
  if (!ctx) throw new Error('useTabBar must be used within TabBarProvider');
  return ctx;
}

const TAB_BAR_HEIGHT = 60;

export function TabBarProvider({ children }: { children: ReactNode }) {
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  const showTabBar = useCallback(() => {
    if (isHidden.current) {
      isHidden.current = false;
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [tabBarTranslateY]);

  const hideTabBar = useCallback(() => {
    if (!isHidden.current) {
      isHidden.current = true;
      Animated.timing(tabBarTranslateY, {
        toValue: TAB_BAR_HEIGHT + 20,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [tabBarTranslateY]);

  const handleScroll = useCallback((currentY: number) => {
    const delta = currentY - lastScrollY.current;
    lastScrollY.current = currentY;

    if (currentY <= 10) {
      showTabBar();
      return;
    }

    if (delta > 5) {
      hideTabBar();
    } else if (delta < -5) {
      showTabBar();
    }
  }, [showTabBar, hideTabBar]);

  return (
    <TabBarContext.Provider value={{ tabBarTranslateY, handleScroll, showTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
}
