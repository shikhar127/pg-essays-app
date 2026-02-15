import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { loadEssayIndex, EssayMetadata } from '@/lib/essays';

export default function LibraryScreen() {
  const [essays, setEssays] = useState<EssayMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const essayData = loadEssayIndex();
      setEssays(essayData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load essays');
      setLoading(false);
    }
  }, []);

  const renderEssayCard = ({ item }: { item: EssayMetadata }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{item.year}</Text>
          <Text style={styles.metadataText}>•</Text>
          <Text style={styles.metadataText}>{item.wordCount.toLocaleString()} words</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={essays}
        renderItem={renderEssayCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
