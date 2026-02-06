import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
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
  content?: string;
}

export function BookmarksSheet({
  visible,
  onClose,
  essayId,
  currentPosition,
  onNavigateToBookmark,
  content = '',
}: BookmarksSheetProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Undo toast state
  const [toastVisible, setToastVisible] = useState(false);
  const deletedBookmarkRef = useRef<Bookmark | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add bookmark toast state
  const [addToastVisible, setAddToastVisible] = useState(false);
  const addToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Storage error toast state
  const [errorToastVisible, setErrorToastVisible] = useState(false);
  const errorToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Note input state
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    if (visible) {
      fetchBookmarks();
    }
  }, [visible, essayId]);

  // Cleanup toast timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (addToastTimerRef.current) clearTimeout(addToastTimerRef.current);
      if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
    };
  }, []);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    const loaded = await getEssayBookmarks(essayId);
    setBookmarks(loaded.sort((a, b) => a.position - b.position));
    setIsLoading(false);
  };

  const handleAddBookmark = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const note = noteInput.trim() || undefined;
      await addBookmark(essayId, currentPosition, note);
      setNoteInput(''); // Clear note input after adding
      await fetchBookmarks();

      // Show add toast
      setAddToastVisible(true);
      if (addToastTimerRef.current) clearTimeout(addToastTimerRef.current);
      addToastTimerRef.current = setTimeout(() => {
        setAddToastVisible(false);
      }, 2000);
    } catch (error) {
      // Show error toast
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorToastVisible(true);
      if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current);
      errorToastTimerRef.current = setTimeout(() => {
        setErrorToastVisible(false);
      }, 3000);
    }
  };

  const handleRemoveBookmark = useCallback((bookmark: Bookmark) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistic remove
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));
    deletedBookmarkRef.current = bookmark;

    // Show toast
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(async () => {
      // Persist the deletion after 3s if no undo
      setToastVisible(false);
      await removeBookmark(essayId, bookmark.id);
      deletedBookmarkRef.current = null;
    }, 3000);
  }, [essayId]);

  const handleUndo = useCallback(async () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(false);
    const restored = deletedBookmarkRef.current;
    if (restored) {
      // Re-add to local state (sorted)
      setBookmarks((prev) => [...prev, restored].sort((a, b) => a.position - b.position));
      deletedBookmarkRef.current = null;
      // No need to call removeBookmark — it was never persisted
    }
  }, []);

  const handleNavigate = (position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateToBookmark(position);
    onClose();
  };

  const extractSnippet = (position: number): string => {
    if (!content) return `${Math.round(position * 100)}% through essay`;
    const charIndex = Math.round(position * content.length);
    const start = Math.max(0, charIndex - 30);
    const end = Math.min(content.length, charIndex + 30);
    let snippet = content.slice(start, end).replace(/\n/g, ' ').trim();
    if (snippet.length > 60) snippet = snippet.slice(0, 60);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < content.length ? '...' : '';
    return prefix + snippet + suffix;
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

          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: theme.colors.border,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Add a note (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={noteInput}
            onChangeText={setNoteInput}
            multiline
            numberOfLines={2}
            maxLength={200}
          />

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
          ) : bookmarks.length === 0 && !toastVisible ? (
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
                      <Text style={[styles.bookmarkSnippet, { color: theme.colors.text }]}>
                        {extractSnippet(bookmark.position)}
                      </Text>
                      {bookmark.note && (
                        <Text style={[styles.bookmarkNote, { color: theme.colors.textSecondary }]}>
                          "{bookmark.note}"
                        </Text>
                      )}
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
                    onPress={() => handleRemoveBookmark(bookmark)}
                  >
                    <Text style={[styles.deleteIcon, { color: theme.colors.textSecondary }]}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Undo Toast */}
          {toastVisible && (
            <View
              style={[
                styles.toast,
                { backgroundColor: theme.colors.headerBackground, borderTopColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.toastText, { color: theme.colors.text }]}>
                Bookmark removed
              </Text>
              <TouchableOpacity onPress={handleUndo}>
                <Text style={[styles.toastUndo, { color: theme.colors.accent }]}>
                  Undo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Bookmark Toast */}
          {addToastVisible && (
            <View
              style={[
                styles.toast,
                { backgroundColor: theme.colors.headerBackground, borderTopColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.toastText, { color: theme.colors.accent }]}>
                Bookmark added ✓
              </Text>
            </View>
          )}

          {/* Error Toast */}
          {errorToastVisible && (
            <View
              style={[
                styles.toast,
                { backgroundColor: theme.colors.headerBackground, borderTopColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.toastText, { color: '#ff4444' }]}>
                Could not save bookmark. Storage may be full.
              </Text>
            </View>
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
  noteInput: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
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
  bookmarkSnippet: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 22,
  },
  bookmarkNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 20,
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
  toast: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '500',
  },
  toastUndo: {
    fontSize: 15,
    fontWeight: '700',
  },
});
