import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  GestureResponderEvent,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { loadEssayIndex } from '@/lib/essays';
import { useAppState } from '@/contexts/AppStateContext';
import { colors, serifFont, sansFont, spacing, radius } from '@/lib/theme';
import { useTabBar } from '@/contexts/TabBarContext';
import type { EssayMetadata } from '@/types/essay';

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
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => onToggleFavorite(essay.id, e)}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Text style={styles.metadataText}>{essay.year}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metadataText}>{essay.wordCount.toLocaleString()} words</Text>
          </View>
          {isRead ? (
            <Text style={styles.readLabel}>Read</Text>
          ) : hasProgress ? (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

type FilterTab = 'all' | 'in-progress' | 'read';

export default function LibraryScreen() {
  const router = useRouter();
  const { readingProgress, favorites, toggleFavorite } = useAppState();
  const { handleScroll: handleTabBarScroll, showTabBar } = useTabBar();
  const [essays, setEssays] = useState<EssayMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filters: FilterTab[] = ['all', 'in-progress', 'read'];
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

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

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const initialIndex = filters.indexOf(activeFilter);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: initialIndex * screenWidth, animated: false });
    }, 100);
  }, []);

  const filteredEssays = useMemo(() => {
    let result = essays;

    if (activeFilter === 'read') {
      result = result.filter((essay) => readingProgress[essay.id]?.isRead);
    } else if (activeFilter === 'in-progress') {
      result = result.filter((essay) => {
        const progress = readingProgress[essay.id];
        return progress && progress.progress > 0 && !progress.isRead;
      });
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((essay) =>
        essay.title.toLowerCase().includes(query)
      );
    }

    return result;
  }, [essays, debouncedSearchQuery, activeFilter, readingProgress]);

  const counts = useMemo(() => {
    const all = essays.length;
    const read = essays.filter((e) => readingProgress[e.id]?.isRead).length;
    const inProgress = essays.filter((e) => {
      const progress = readingProgress[e.id];
      return progress && progress.progress > 0 && !progress.isRead;
    }).length;
    return { all, read, inProgress };
  }, [essays, readingProgress]);

  const handleClearSearch = () => setSearchQuery('');

  const handleEssayPress = (essay: EssayMetadata) => {
    router.push(`/reader/${essay.id}`);
  };

  const handleToggleFavorite = (essayId: string, event: GestureResponderEvent) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(essayId);
  };

  const renderEssayCard = ({ item }: { item: EssayMetadata }) => (
    <EssayCard
      essay={item}
      progress={readingProgress[item.id]}
      isFavorite={favorites.has(item.id)}
      onPress={handleEssayPress}
      onToggleFavorite={handleToggleFavorite}
    />
  );

  const ITEM_HEIGHT = 96 + 12;
  const getItemLayout = (_data: ArrayLike<EssayMetadata> | null | undefined, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const handleFilterScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    const newFilter = filters[index];
    if (newFilter && newFilter !== activeFilter) {
      setActiveFilter(newFilter);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleTabBarScroll(event.nativeEvent.contentOffset.y);
  };

  const switchToFilter = (filter: FilterTab) => {
    const index = filters.indexOf(filter);
    setActiveFilter(filter);
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
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
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const count = filter === 'all' ? counts.all : filter === 'in-progress' ? counts.inProgress : counts.read;
          const label = filter === 'all' ? 'All' : filter === 'in-progress' ? 'In Progress' : 'Read';
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => switchToFilter(filter)}
              accessibilityLabel={`${label} essays, ${count} total`}
              accessibilityRole="button"
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {label}{count > 0 ? ` ${count}` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Swipeable Filter Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleFilterScroll}
        scrollEventThrottle={8}
        style={styles.swipeContainer}
      >
        {filters.map((filter) => (
          <View key={filter} style={[styles.filterPage, { width: screenWidth }]}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search essays..."
                placeholderTextColor={colors.textMuted}
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
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={activeFilter === filter ? filteredEssays : []}
              renderItem={renderEssayCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              getItemLayout={getItemLayout}
              initialNumToRender={20}
              maxToRenderPerBatch={10}
              windowSize={21}
              removeClippedSubviews={true}
              onScroll={handleListScroll}
              scrollEventThrottle={8}
              accessibilityLabel="Essay library"
              accessibilityHint={`Showing ${filteredEssays.length} essay${filteredEssays.length === 1 ? '' : 's'}`}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  swipeContainer: {
    flex: 1,
  },
  filterPage: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  filterTabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterTabText: {
    fontFamily: sansFont,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#F7F5F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.text,
    height: 44,
  },
  clearButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -12,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 76,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 96,
  },
  cardContent: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 23,
    marginRight: spacing.sm,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    marginRight: -8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontFamily: sansFont,
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    fontFamily: sansFont,
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  readLabel: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    width: 48,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  errorText: {
    fontFamily: serifFont,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minWidth: 120,
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
});
