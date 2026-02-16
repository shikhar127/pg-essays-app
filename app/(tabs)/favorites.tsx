import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

export default function FavoritesScreen() {
  const router = useRouter();
  const { readingProgress, favorites, toggleFavorite } = useAppState();
  const { handleScroll: handleTabBarScroll } = useTabBar();
  const [essays, setEssays] = useState<EssayMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const favoritedEssays = useMemo(() => {
    return essays.filter((essay) => favorites.has(essay.id));
  }, [essays, favorites]);

  const handleEssayPress = (essay: EssayMetadata) => {
    router.push(`/reader/${essay.id}`);
  };

  const handleToggleFavorite = (essayId: string, event: GestureResponderEvent) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(essayId);
  };

  const handleListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    handleTabBarScroll(event.nativeEvent.contentOffset.y);
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

  if (favoritedEssays.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyStateText}>No favorites yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Tap the heart on any essay to save it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritedEssays}
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
        accessibilityLabel="Favorited essays"
        accessibilityHint={`Showing ${favoritedEssays.length} favorited essay${favoritedEssays.length === 1 ? '' : 's'}`}
      />
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
    paddingHorizontal: spacing.xl,
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
  emptyStateText: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontFamily: sansFont,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
