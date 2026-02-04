import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useReader } from '../../context/ReaderContext';

interface ReaderViewProps {
  title: string;
  content: string;
  readingTime: number;
  onScroll: (progress: number, direction: 'up' | 'down') => void;
  onTap: () => void;
  headerVisible: boolean;
  initialScrollPosition?: number;
}

export function ReaderView({
  title,
  content,
  readingTime,
  onScroll,
  onTap,
  headerVisible,
  initialScrollPosition = 0,
}: ReaderViewProps) {
  const { theme, fontSizeConfig } = useReader();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);

  // Restore scroll position when content is laid out
  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    contentHeight.current = height;

    // Restore position once we have both content height and layout height
    if (!hasRestoredPosition.current && initialScrollPosition > 0 && layoutHeight.current > 0) {
      const maxScrollY = height - layoutHeight.current;
      if (maxScrollY > 0) {
        const scrollY = maxScrollY * initialScrollPosition;
        scrollViewRef.current?.scrollTo({ y: scrollY, animated: false });
        hasRestoredPosition.current = true;
      }
    }
  }, [initialScrollPosition]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    layoutHeight.current = height;
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const currentY = contentOffset.y;
      const maxScrollY = contentSize.height - layoutMeasurement.height;
      const progress = maxScrollY > 0 ? currentY / maxScrollY : 0;
      const direction = currentY > lastScrollY.current ? 'down' : 'up';

      lastScrollY.current = currentY;
      isScrolling.current = true;

      // Clear previous timer
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }

      // Reset scrolling flag after scroll ends
      scrollTimer.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);

      onScroll(progress, direction);
    },
    [onScroll]
  );

  const handleTap = useCallback(() => {
    // Only trigger tap if not scrolling
    if (!isScrolling.current) {
      onTap();
    }
  }, [onTap]);

  // Handle link presses
  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => {
      console.warn('Failed to open URL:', err);
    });
    return false; // Prevent default behavior
  }, []);

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: theme.colors.text,
          fontSize: fontSizeConfig.body,
          lineHeight: fontSizeConfig.body * fontSizeConfig.lineHeight,
          fontFamily: 'System',
        },
        heading1: {
          color: theme.colors.text,
          fontSize: fontSizeConfig.title,
          fontWeight: '700',
          marginTop: 24,
          marginBottom: 16,
          lineHeight: fontSizeConfig.title * 1.2,
        },
        heading2: {
          color: theme.colors.text,
          fontSize: fontSizeConfig.title * 0.85,
          fontWeight: '600',
          marginTop: 20,
          marginBottom: 12,
        },
        heading3: {
          color: theme.colors.text,
          fontSize: fontSizeConfig.body * 1.1,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
        },
        paragraph: {
          marginBottom: fontSizeConfig.body * 1.5,
        },
        strong: {
          fontWeight: '600',
        },
        em: {
          fontStyle: 'italic',
        },
        blockquote: {
          backgroundColor: 'transparent',
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.accent,
          paddingLeft: 16,
          marginLeft: 0,
          marginVertical: 16,
          opacity: 0.9,
        },
        code_inline: {
          backgroundColor: theme.colors.border,
          color: theme.colors.text,
          fontFamily: 'Courier',
          fontSize: fontSizeConfig.body * 0.9,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        },
        code_block: {
          backgroundColor: theme.colors.border,
          color: theme.colors.text,
          fontFamily: 'Courier',
          fontSize: fontSizeConfig.body * 0.85,
          padding: 16,
          borderRadius: 8,
          marginVertical: 16,
        },
        link: {
          color: theme.colors.accent,
          textDecorationLine: 'underline',
        },
        list_item: {
          marginBottom: 8,
        },
        bullet_list: {
          marginBottom: 16,
        },
        ordered_list: {
          marginBottom: 16,
        },
        hr: {
          backgroundColor: theme.colors.border,
          height: 1,
          marginVertical: 24,
        },
      }),
    [theme, fontSizeConfig]
  );

  // Calculate max content width for tablets
  const maxContentWidth = Math.min(width - 48, 680);
  const horizontalPadding = (width - maxContentWidth) / 2;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerVisible ? insets.top + 80 : insets.top + 48,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: Math.max(horizontalPadding, 24),
        },
      ]}
      onScroll={handleScroll}
      onLayout={handleLayout}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      onTouchEnd={handleTap}
    >
      <View onLayout={handleContentLayout}>
        <Text
          style={[styles.title, { color: theme.colors.text, fontSize: fontSizeConfig.title }]}
          selectable={true}
        >
          {title}
        </Text>
        <Text style={[styles.readingTime, { color: theme.colors.textSecondary }]}>
          {readingTime} min read
        </Text>
        <View style={styles.divider} />
        <Markdown
          style={markdownStyles}
          onLinkPress={handleLinkPress}
        >
          {content}
        </Markdown>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 36,
  },
  readingTime: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 24,
    opacity: 0.5,
  },
});
