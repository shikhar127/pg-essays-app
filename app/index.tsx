import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReader } from '../context/ReaderContext';
import { loadEssayIndex, EssayMeta } from '../lib/essays';
import { loadFavorites } from '../lib/storage';

export default function LibraryScreen() {
  const router = useRouter();
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const [essays, setEssays] = useState<EssayMeta[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const sorted = loadEssayIndex().sort((a, b) => a.title.localeCompare(b.title));
    setEssays(sorted);
    loadFavorites().then(setFavorites);
  }, []);

  const handlePress = useCallback((id: string) => {
    router.push(`/reader/${id}`);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: EssayMeta }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.colors.border }]}
      onPress={() => handlePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemDetail, { color: theme.colors.textSecondary }]}>
            {item.readingTimeMinutes} min
          </Text>
          <Text style={[styles.itemSeparator, { color: theme.colors.textSecondary }]}>·</Text>
          <Text style={[styles.itemDetail, { color: theme.colors.textSecondary }]}>
            {item.year}
          </Text>
        </View>
      </View>
      {favorites.includes(item.id) && (
        <Text style={[styles.heartIcon, { color: theme.colors.accent }]}>♥</Text>
      )}
    </TouchableOpacity>
  ), [theme, favorites, handlePress]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>PG Essays</Text>
      </View>

      <FlatList
        data={essays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemDetail: {
    fontSize: 14,
  },
  itemSeparator: {
    fontSize: 14,
  },
  heartIcon: {
    fontSize: 20,
    marginLeft: 12,
  },
});
