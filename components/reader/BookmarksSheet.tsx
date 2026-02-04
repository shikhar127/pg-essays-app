import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';
import { Bookmark, getEssayBookmarks, addBookmark, removeBookmark } from '../../lib/storage';

interface BookmarksSheetProps {
  visible: boolean;
  onClose: () => void;
  essayId: string;
  currentPosition: number;
  onNavigateToBookmark: (position: number) => void;
}

export function BookmarksSheet({
  visible,
  onClose,
  essayId,
  currentPosition,
  onNavigateToBookmark,
}: BookmarksSheetProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadBookmarks();
    }
  }, [visible, essayId]);

  const loadBookmarks = async () => {
    setIsLoading(true);
    const loaded = await getEssayBookmarks(essayId);
    setBookmarks(loaded.sort((a, b) => a.position - b.position));
    setIsLoading(false);
  };

  const handleAddBookmark = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await addBookmark(essayId, currentPosition);
      await loadBookmarks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add bookmark');
    }
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeBookmark(essayId, bookmarkId);
            await loadBookmarks();
          },
        },
      ]
    );
  };

  const handleNavigate = (position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateToBookmark(position);
    onClose();
  };

  const formatPosition = (position: number) => {
    return `${Math.round(position * 100)}%`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Bookmarks
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.colors.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.accent },
            ]}
            onPress={handleAddBookmark}
          >
            <Text style={styles.addButtonText}>
              + Bookmark Current Position ({formatPosition(currentPosition)})
            </Text>
          </TouchableOpacity>

          {isLoading ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Loading...
            </Text>
          ) : bookmarks.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No bookmarks yet. Add one to save your place!
            </Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {bookmarks.map((bookmark) => (
                <View
                  key={bookmark.id}
                  style={[
                    styles.bookmarkItem,
                    { borderBottomColor: theme.colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.bookmarkContent}
                    onPress={() => handleNavigate(bookmark.position)}
                  >
                    <View style={styles.bookmarkInfo}>
                      <Text style={[styles.bookmarkPosition, { color: theme.colors.text }]}>
                        {formatPosition(bookmark.position)} through essay
                      </Text>
                      <Text style={[styles.bookmarkDate, { color: theme.colors.textSecondary }]}>
                        Added {formatDate(bookmark.createdAt)}
                      </Text>
                    </View>
                    <Text style={[styles.goIcon, { color: theme.colors.accent }]}>
                      Go →
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveBookmark(bookmark.id)}
                  >
                    <Text style={[styles.deleteIcon, { color: theme.colors.textSecondary }]}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: 20,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookmarkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkPosition: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  bookmarkDate: {
    fontSize: 13,
  },
  goIcon: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 16,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
});
