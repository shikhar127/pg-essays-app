import React, { useRef, useCallback, useMemo, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
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
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useReader } from '../../context/ReaderContext';

// Override inline text rendering to enable native text selection + share + search highlighting
const createSelectableRules = (searchText: string, accentColor: string) => ({
  inline: (node: any, children: any, parent: any, styles: any) => {
    // If no search or search too short, just render normally
    if (!searchText || searchText.length < 2) {
      return (
        <Text key={node.key} style={styles.inline} selectable={true}>
          {children}
        </Text>
      );
    }

    // Process children to highlight search matches
    const highlightedChildren = React.Children.map(children, (child) => {
      if (typeof child !== 'string') return child;

      const lowerChild = child.toLowerCase();
      const lowerSearch = searchText.toLowerCase();

      if (!lowerChild.includes(lowerSearch)) return child;

      // Split text by search term and rebuild with highlights
      const parts: React.ReactNode[] = [];
      let remaining = child;
      let lowerRemaining = lowerChild;
      let keyIndex = 0;

      while (lowerRemaining.includes(lowerSearch)) {
        const index = lowerRemaining.indexOf(lowerSearch);
        const before = remaining.substring(0, index);
        const match = remaining.substring(index, index + searchText.length);

        if (before) parts.push(before);
        parts.push(
          <Text
            key={`highlight-${keyIndex++}`}
            style={{ backgroundColor: `${accentColor}30` }}
          >
            {match}
          </Text>
        );

        remaining = remaining.substring(index + searchText.length);
        lowerRemaining = lowerRemaining.substring(index + searchText.length);
      }

      if (remaining) parts.push(remaining);
      return parts;
    });

    return (
      <Text key={node.key} style={styles.inline} selectable={true}>
        {highlightedChildren}
      </Text>
    );
  },
});

interface ReaderViewProps {
  title: string;
  content: string;
  readingTime: number;
  onScroll: (progress: number, direction: 'up' | 'down') => void;
  onTap: () => void;
  headerVisible: boolean;
  initialScrollPosition?: number;
  searchText?: string;
  progress?: number;
}

export interface ReaderViewHandle {
  scrollToPosition: (position: number) => void;
}

export const ReaderView = forwardRef<ReaderViewHandle, ReaderViewProps>(function ReaderView({
  title,
  content,
  readingTime,
  onScroll,
  onTap,
  headerVisible,
  initialScrollPosition = 0,
  searchText = '',
  progress = 0,
}, ref) {
  const { theme, fontSizeConfig } = useReader();

  // Create selectable rules with search highlighting
  const selectableRules = useMemo(
    () => createSelectableRules(searchText, theme.colors.accent),
    [searchText, theme.colors.accent]
  );
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);
  const contentHeight = useRef(0);
  const layoutHeight = useRef(0);
  const touchStartX = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check reduce motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  // Expose scrollToPosition for search navigation
  useImperativeHandle(ref, () => ({
    scrollToPosition: (position: number) => {
      if (contentHeight.current > 0 && layoutHeight.current > 0) {
        const maxScrollY = contentHeight.current - layoutHeight.current;
        if (maxScrollY > 0) {
          const scrollY = maxScrollY * Math.min(Math.max(position, 0), 1);
          scrollViewRef.current?.scrollTo({ y: scrollY, animated: !reduceMotion });
        }
      }
    },
  }), [reduceMotion]);

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

  const handleTouchStart = useCallback((event: NativeSyntheticEvent<any>) => {
    touchStartX.current = event.nativeEvent.pageX;
  }, []);

  const handleTap = useCallback((event: NativeSyntheticEvent<any>) => {
    if (isScrolling.current) return;
    const x = touchStartX.current;
    const leftBound = width * 0.33;
    const rightBound = width * 0.66;
    if (x >= leftBound && x <= rightBound) {
      onTap();
    }
  }, [onTap, width]);

  // Handle link presses
  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => {
      console.warn('Failed to open URL:', err);
    });
    return false; // Prevent default behavior
  }, []);

  // Calculate max content width for tablets
  const maxContentWidth = Math.min(width - 48, 680);
  const horizontalPadding = (width - maxContentWidth) / 2;

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
        image: {
          width: '100%',
          maxWidth: maxContentWidth,
          borderRadius: 8,
          marginVertical: 16,
        },
      }),
    [theme, fontSizeConfig, maxContentWidth]
  );

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
      onTouchStart={handleTouchStart}
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
          {progress === 0
            ? `${readingTime} min read`
            : progress >= 0.95
            ? 'Almost done'
            : Math.ceil(readingTime * (1 - progress)) <= 1
            ? 'Less than a minute remaining'
            : `${Math.ceil(readingTime * (1 - progress))} min remaining`}
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Markdown
          style={markdownStyles}
          onLinkPress={handleLinkPress}
          rules={selectableRules}
        >
          {content}
        </Markdown>
      </View>
    </ScrollView>
  );
});

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
    marginBottom: 24,
    opacity: 0.5,
  },
});
