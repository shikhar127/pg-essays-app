import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { loadEssayContent, loadEssayIndex, EssayMetadata } from '@/lib/essays';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<EssayMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
