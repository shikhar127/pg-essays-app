import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { loadEssayIndex } from '@/lib/essays';
import { useAppState } from '@/contexts/AppStateContext';
import type { EssayMetadata } from '@/types/essay';

// Memoized essay card component for better scroll performance
interface EssayCardProps {
  essay: EssayMetadata;
  progress: { progress: number; isRead?: boolean; lastReadAt?: string } | undefined;
  isFavorite: boolean;
  onPress: (essay: EssayMetadata) => void;
  onToggleFavorite: (essayId: string, event: GestureResponderEvent) => void;
}

const EssayCard = React.memo(({ essay, progress, isFavorite, onPress, onToggleFavorite }: EssayCardProps) => {
  const progressPercentage = progress ? Math.round(progress.progress * 100) : 0;
  const hasProgress = progress && progress.progress > 0;
  const isRead = progress?.isRead || false;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(essay)}
      accessibilityLabel={`Read ${essay.title}${isRead ? ', read' : hasProgress ? `, ${progressPercentage}% complete` : ''}${isFavorite ? ', favorited' : ''}`}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{essay.title}</Text>
          <View style={styles.badgeContainer}>
            {isRead ? (
              <View style={styles.readBadge}>
                <Text style={styles.readBadgeText}>✓ Read</Text>
              </View>
            ) : hasProgress ? (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{progressPercentage}%</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => onToggleFavorite(essay.id, e)}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF3B30' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>{essay.year}</Text>
          <Text style={styles.metadataText}>•</Text>
          <Text style={styles.metadataText}>{essay.wordCount.toLocaleString()} words</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function LibraryScreen() {
  const router = useRouter();
  const { readingProgress, favorites, toggleFavorite } = useAppState();
  const [essays, setEssays] = useState<EssayMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEssays = () => {
    try {
      setLoading(true);
      setError(null);
      const essayData = loadEssayIndex();
      setEssays(essayData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load essays');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEssays();
  }, []);

  // Filter essays based on search query with debouncing
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEssays = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return essays;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return essays.filter((essay) =>
      essay.title.toLowerCase().includes(query)
    );
  }, [essays, debouncedSearchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleEssayPress = (essay: EssayMetadata) => {
    router.push(`/reader/${essay.id}`);
  };

  const handleToggleFavorite = (essayId: string, event: GestureResponderEvent) => {
    event.stopPropagation(); // Prevent navigation when tapping heart
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(essayId);
  };

  const renderEssayCard = ({ item }: { item: EssayMetadata }) => {
    return (
      <EssayCard
        essay={item}
        progress={readingProgress[item.id]}
        isFavorite={favorites.has(item.id)}
        onPress={handleEssayPress}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  };

  // Performance optimization: getItemLayout for faster scrolling
  const ITEM_HEIGHT = 88 + 16; // card minHeight (88) + marginBottom (16)
  const getItemLayout = (_data: ArrayLike<EssayMetadata> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadEssays}
          accessibilityLabel="Retry loading essays"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search essays..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          accessibilityLabel="Search essays"
          accessibilityHint="Type to filter essays by title"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredEssays}
        renderItem={renderEssayCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
        accessibilityLabel="Essay library"
        accessibilityHint={`Showing ${filteredEssays.length} essay${filteredEssays.length === 1 ? '' : 's'}`}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 88, // Ensure adequate touch target (2x44 for content + padding)
  },
  cardContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -10, // Offset padding to align with card edge
  },
  progressBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  readBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  readBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
