import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useReader } from '../../context/ReaderContext';
import { ReaderView } from '../../components/reader/ReaderView';
import { ReaderHeader } from '../../components/reader/ReaderHeader';
import { ProgressBar } from '../../components/reader/ProgressBar';
import { SettingsSheet } from '../../components/reader/SettingsSheet';
import { mockEssay } from '../../lib/mockEssay';

export default function ReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useReader();

  // Keep screen awake while reading
  useKeepAwake();

  const [headerVisible, setHeaderVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-hide header timer
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollDirectionRef = useRef<'up' | 'down'>('up');

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // Start auto-hide timer when header becomes visible
  useEffect(() => {
    if (headerVisible && lastScrollDirectionRef.current === 'down') {
      hideTimerRef.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 2000);
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [headerVisible]);

  const handleScroll = useCallback((scrollProgress: number, direction: 'up' | 'down') => {
    setProgress(scrollProgress);
    lastScrollDirectionRef.current = direction;

    // Clear any existing timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (direction === 'down' && headerVisible) {
      // Hide header after scrolling down
      hideTimerRef.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 500);
    } else if (direction === 'up' && !headerVisible) {
      // Show header when scrolling up
      setHeaderVisible(true);
    }
  }, [headerVisible]);

  const handleTap = useCallback(() => {
    setHeaderVisible((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSettingsPress = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  // For Step 1, we use mock data
  const essay = mockEssay;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={progress} />

      <ReaderView
        title={essay.title}
        content={essay.content}
        readingTime={essay.readingTimeMinutes}
        onScroll={handleScroll}
        onTap={handleTap}
        headerVisible={headerVisible}
      />

      <ReaderHeader
        title={essay.title}
        visible={headerVisible}
        onClose={handleClose}
        onSettingsPress={handleSettingsPress}
      />

      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
