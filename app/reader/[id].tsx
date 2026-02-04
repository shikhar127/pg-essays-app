import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useReader } from '../../context/ReaderContext';
import { ReaderView } from '../../components/reader/ReaderView';
import { ReaderHeader } from '../../components/reader/ReaderHeader';
import { ProgressBar } from '../../components/reader/ProgressBar';
import { SettingsSheet } from '../../components/reader/SettingsSheet';
import { SearchBar } from '../../components/reader/SearchBar';
import { BookmarksSheet } from '../../components/reader/BookmarksSheet';
import { mockEssay } from '../../lib/mockEssay';
import { saveScrollPosition, getScrollPosition, markEssayAsRead } from '../../lib/storage';

export default function ReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isLoading: settingsLoading } = useReader();

  // Keep screen awake while reading
  useKeepAwake();

  const [headerVisible, setHeaderVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialScrollPosition, setInitialScrollPosition] = useState(0);

  // Search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const readerViewRef = useRef<{ scrollToPosition: (position: number) => void } | null>(null);

  // Bookmarks state
  const [bookmarksVisible, setBookmarksVisible] = useState(false);

  // Auto-hide header timer
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollDirectionRef = useRef<'up' | 'down'>('up');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // For Step 1, we use mock data
  const essay = mockEssay;
  const essayId = id || essay.id;

  // Load saved scroll position
  useEffect(() => {
    async function loadPosition() {
      const savedPosition = await getScrollPosition(essayId);
      setInitialScrollPosition(savedPosition);
      setProgress(savedPosition);
      setIsLoading(false);
    }
    loadPosition();
  }, [essayId]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => backHandler.remove();
  }, []);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback((scrollProgress: number, direction: 'up' | 'down') => {
    setProgress(scrollProgress);
    lastScrollDirectionRef.current = direction;

    // Clear any existing timers
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Auto-hide header
    if (direction === 'down' && headerVisible) {
      hideTimerRef.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 500);
    } else if (direction === 'up' && !headerVisible) {
      setHeaderVisible(true);
    }

    // Debounce save scroll position (save after 500ms of no scrolling)
    saveTimerRef.current = setTimeout(() => {
      saveScrollPosition(essayId, scrollProgress);

      // Mark as read if scrolled past 90%
      if (scrollProgress > 0.9) {
        markEssayAsRead(essayId);
      }
    }, 500);
  }, [headerVisible, essayId]);

  const handleTap = useCallback(() => {
    setHeaderVisible((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    // Save position before closing
    saveScrollPosition(essayId, progress);
    router.back();
  }, [router, essayId, progress]);

  const handleSettingsPress = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const handleSearchPress = useCallback(() => {
    setSearchVisible(true);
    setHeaderVisible(false);
  }, []);

  const handleBookmarksPress = useCallback(() => {
    setBookmarksVisible(true);
  }, []);

  const handleNavigateToBookmark = useCallback((position: number) => {
    readerViewRef.current?.scrollToPosition(position);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchVisible(false);
    setSearchText('');
    setCurrentMatchIndex(0);
  }, []);

  // Calculate search matches
  const searchMatches = useMemo(() => {
    if (!searchText || searchText.length < 2) return [];
    const content = essay.content.toLowerCase();
    const query = searchText.toLowerCase();
    const matches: number[] = [];
    let index = content.indexOf(query);
    while (index !== -1) {
      // Calculate approximate scroll position (0-1) based on character position
      matches.push(index / content.length);
      index = content.indexOf(query, index + 1);
    }
    return matches;
  }, [searchText, essay.content]);

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    setCurrentMatchIndex(0);
  }, []);

  const handlePrevMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const newIndex = currentMatchIndex <= 1 ? searchMatches.length : currentMatchIndex - 1;
    setCurrentMatchIndex(newIndex);
    readerViewRef.current?.scrollToPosition(searchMatches[newIndex - 1]);
  }, [searchMatches, currentMatchIndex]);

  const handleNextMatch = useCallback(() => {
    if (searchMatches.length === 0) return;
    const newIndex = currentMatchIndex >= searchMatches.length ? 1 : currentMatchIndex + 1;
    setCurrentMatchIndex(newIndex);
    readerViewRef.current?.scrollToPosition(searchMatches[newIndex - 1]);
  }, [searchMatches, currentMatchIndex]);

  // Auto-navigate to first match when search text changes
  useEffect(() => {
    if (searchMatches.length > 0 && searchText.length >= 2) {
      setCurrentMatchIndex(1);
      readerViewRef.current?.scrollToPosition(searchMatches[0]);
    }
  }, [searchMatches]);

  // Show loading while settings or scroll position is loading
  if (settingsLoading || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProgressBar progress={progress} />

      <ReaderView
        ref={readerViewRef}
        title={essay.title}
        content={essay.content}
        readingTime={essay.readingTimeMinutes}
        onScroll={handleScroll}
        onTap={handleTap}
        headerVisible={headerVisible || searchVisible}
        initialScrollPosition={initialScrollPosition}
        searchText={searchVisible ? searchText : ''}
      />

      <ReaderHeader
        title={essay.title}
        visible={headerVisible && !searchVisible}
        onClose={handleClose}
        onSettingsPress={handleSettingsPress}
        onSearchPress={handleSearchPress}
        onBookmarksPress={handleBookmarksPress}
        essayUrl={essay.url}
      />

      <SearchBar
        visible={searchVisible}
        searchText={searchText}
        onSearchTextChange={handleSearchTextChange}
        onClose={handleSearchClose}
        currentMatch={currentMatchIndex}
        totalMatches={searchMatches.length}
        onPrevMatch={handlePrevMatch}
        onNextMatch={handleNextMatch}
      />

      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      <BookmarksSheet
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        essayId={essayId}
        currentPosition={progress}
        onNavigateToBookmark={handleNavigateToBookmark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
