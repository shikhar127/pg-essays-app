import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Share,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { loadEssayContent, loadEssayIndex } from '@/lib/essays';
import { useAppState } from '@/contexts/AppStateContext';
import { colors, serifFont, sansFont, spacing, radius, MAX_READING_WIDTH } from '@/lib/theme';
import type { EssayMetadata } from '@/types/essay';
import type { ReaderParams } from '@/types/navigation';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<ReaderParams>();
  const router = useRouter();
  const navigation = useNavigation();
  const { readingProgress, updateProgress } = useAppState();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<EssayMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const updateProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const headerBottomRef = useRef(0);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const loadContent = async () => {
    if (!id) {
      setError('No essay ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const essayContent = await loadEssayContent(id);
      setContent(essayContent);
      const essayIndex = loadEssayIndex();
      const essayMeta = essayIndex.find((e) => e.id === id);
      if (essayMeta) setMetadata(essayMeta);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load essay');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [id]);

  const handleShareEssay = async () => {
    if (!metadata) return;
    await Share.share({
      message: `"${metadata.title}" by Paul Graham\n${metadata.url}`,
    });
  };

  const handleShareText = async (text: string) => {
    const attribution = metadata ? `\n\n— "${metadata.title}" by Paul Graham` : '';
    await Share.share({
      message: `"${text.trim()}"${attribution}`,
    });
  };

  const renderRules: RenderRules = {
    paragraph: (node, children, _parent, styles) => (
      <TouchableOpacity
        key={node.key}
        onLongPress={() => {
          const text = node.children
            ?.map((child: any) => child.content || '')
            .join('')
            .trim();
          if (text) handleShareText(text);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.paragraph}>{children}</Text>
      </TouchableOpacity>
    ),
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: showHeaderTitle && metadata ? metadata.title : '',
      headerTitleStyle: {
        fontFamily: serifFont,
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.text,
      },
      headerRight: () => metadata ? (
        <TouchableOpacity
          onPress={handleShareEssay}
          style={{ padding: 8 }}
          accessibilityLabel="Share essay"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
      ) : null,
    });
  }, [metadata, navigation, showHeaderTitle]);

  useEffect(() => {
    if (!loading && id && content && scrollViewRef.current) {
      const progress = readingProgress[id];
      if (progress && progress.scrollPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: progress.scrollPosition, animated: false });
        }, 100);
      }
    }
  }, [loading, id, content, readingProgress]);

  useEffect(() => {
    return () => {
      if (updateProgressTimerRef.current) clearTimeout(updateProgressTimerRef.current);
    };
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!id) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const progress = maxScroll > 0 ? Math.min(scrollPosition / maxScroll, 1) : 0;

    progressAnim.setValue(progress);

    const pastHeader = scrollPosition > headerBottomRef.current;
    if (pastHeader !== showHeaderTitle) setShowHeaderTitle(pastHeader);

    if (updateProgressTimerRef.current) clearTimeout(updateProgressTimerRef.current);
    updateProgressTimerRef.current = setTimeout(() => {
      updateProgress(id, scrollPosition, progress);
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadContent}
            accessibilityLabel="Retry loading essay"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, {
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }]} />
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        accessibilityLabel={metadata ? `Reading ${metadata.title}` : 'Essay reader'}
        accessibilityHint="Scroll to read the essay"
      >
        <View style={styles.readingColumn}>
          {metadata && (
            <View
              style={styles.header}
              onLayout={(e) => { headerBottomRef.current = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
            >
              <Text style={styles.title}>{metadata.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metadataText}>{metadata.year}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metadataText}>{metadata.readingTimeMinutes} min read</Text>
              </View>
            </View>
          )}
          <Markdown style={markdownStyles} rules={renderRules}>{content}</Markdown>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.accent,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  readingColumn: {
    maxWidth: MAX_READING_WIDTH,
    width: '100%',
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: sansFont,
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: serifFont,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minWidth: 100,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: sansFont,
    fontSize: 16,
    fontWeight: '600',
    color: '#F7F5F0',
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.md,
    minWidth: 100,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontFamily: sansFont,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

const markdownStyles = {
  body: {
    fontFamily: serifFont,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text,
  },
  paragraph: {
    fontFamily: serifFont,
    marginBottom: 20,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text,
  },
  heading1: {
    fontFamily: serifFont,
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 32,
    marginBottom: 16,
    lineHeight: 36,
    color: colors.text,
    letterSpacing: -0.3,
  },
  heading2: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '600' as const,
    marginTop: 28,
    marginBottom: 12,
    lineHeight: 32,
    color: colors.text,
    letterSpacing: -0.2,
  },
  heading3: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 24,
    marginBottom: 10,
    lineHeight: 28,
    color: colors.text,
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline' as const,
  },
  blockquote: {
    backgroundColor: colors.accentLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 16,
    paddingVertical: 10,
    marginVertical: 16,
    fontStyle: 'italic' as const,
  },
  code_inline: {
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Courier',
    fontSize: 16,
    color: colors.text,
  },
  code_block: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.md,
    marginVertical: 16,
    fontFamily: 'Courier',
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fence: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.md,
    marginVertical: 16,
    fontFamily: 'Courier',
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
};
