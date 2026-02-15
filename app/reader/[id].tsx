import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { loadEssayContent, loadEssayIndex, EssayMetadata } from '@/lib/essays';
import { useAppState } from '@/contexts/AppStateContext';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { readingProgress, updateProgress } = useAppState();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<EssayMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const updateProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadContent() {
      if (!id) {
        setError('No essay ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load essay content
        const essayContent = await loadEssayContent(id);
        setContent(essayContent);

        // Load metadata to display title
        const essayIndex = loadEssayIndex();
        const essayMeta = essayIndex.find((e) => e.id === id);
        if (essayMeta) {
          setMetadata(essayMeta);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load essay');
        setLoading(false);
      }
    }

    loadContent();
  }, [id]);

  // Restore scroll position when content loads
  useEffect(() => {
    if (!loading && id && content && scrollViewRef.current) {
      const progress = readingProgress[id];
      if (progress && progress.scrollPosition > 0) {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: progress.scrollPosition,
            animated: false,
          });
        }, 100);
      }
    }
  }, [loading, id, content, readingProgress]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateProgressTimerRef.current) {
        clearTimeout(updateProgressTimerRef.current);
      }
    };
  }, []);

  // Handle scroll events with debouncing
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!id) return;

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    const scrollViewHeight = layoutMeasurement.height;
    const contentHeight = contentSize.height;

    // Calculate progress as a percentage (0-1)
    const maxScroll = contentHeight - scrollViewHeight;
    const progress = maxScroll > 0 ? Math.min(scrollPosition / maxScroll, 1) : 0;

    // Clear existing timer
    if (updateProgressTimerRef.current) {
      clearTimeout(updateProgressTimerRef.current);
    }

    // Debounce: wait 500ms after last scroll before saving
    updateProgressTimerRef.current = setTimeout(() => {
      updateProgress(id, scrollPosition, progress);
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading essay...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessibilityLabel={metadata ? `Reading ${metadata.title}` : 'Essay reader'}
        accessibilityHint="Scroll to read the essay"
      >
        {metadata && (
          <View style={styles.header}>
            <Text style={styles.title}>{metadata.title}</Text>
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>{metadata.year}</Text>
              <Text style={styles.metadataText}>•</Text>
              <Text style={styles.metadataText}>
                {metadata.readingTimeMinutes} min read
              </Text>
            </View>
          </View>
        )}
        <Markdown style={markdownStyles}>{content}</Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 36,
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

const markdownStyles = {
  body: {
    fontSize: 18,
    lineHeight: 28,
    color: '#1a1a1a',
  },
  paragraph: {
    marginBottom: 16,
    fontSize: 18,
    lineHeight: 28,
  },
  heading1: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 40,
  },
  heading2: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 34,
  },
  heading3: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
    lineHeight: 30,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline' as const,
  },
  blockquote: {
    backgroundColor: '#f8f8f8',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 16,
    paddingVertical: 8,
    marginVertical: 12,
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'Courier',
    fontSize: 16,
  },
  code_block: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    fontFamily: 'Courier',
    fontSize: 14,
  },
  fence: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    fontFamily: 'Courier',
    fontSize: 14,
  },
};
