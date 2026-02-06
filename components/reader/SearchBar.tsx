import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';

interface SearchBarProps {
  visible: boolean;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onClose: () => void;
  currentMatch: number;
  totalMatches: number;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  content?: string;
}

export function SearchBar({
  visible,
  searchText,
  onSearchTextChange,
  onClose,
  currentMatch,
  totalMatches,
  onPrevMatch,
  onNextMatch,
  content = '',
}: SearchBarProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const inputRef = useRef<TextInput>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -100,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: true,
    }).start();

    if (visible) {
      setTimeout(() => inputRef.current?.focus(), reduceMotion ? 0 : 250);
    } else {
      Keyboard.dismiss();
    }
  }, [visible, translateY, reduceMotion]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrevMatch();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNextMatch();
  };

  // Extract snippet around current match
  const snippet = useMemo(() => {
    if (!content || !searchText || searchText.length < 2 || totalMatches === 0 || currentMatch === 0) return null;
    const lower = content.toLowerCase();
    const query = searchText.toLowerCase();
    // Find the nth match (currentMatch is 1-based)
    let idx = -1;
    let pos = 0;
    for (let i = 0; i < currentMatch; i++) {
      idx = lower.indexOf(query, pos);
      if (idx === -1) return null;
      pos = idx + 1;
    }
    const snippetRadius = 40;
    const start = Math.max(0, idx - snippetRadius);
    const end = Math.min(content.length, idx + searchText.length + snippetRadius);
    const prefix = content.slice(start, idx);
    const match = content.slice(idx, idx + searchText.length);
    const suffix = content.slice(idx + searchText.length, end);
    return { prefix: (start > 0 ? '...' : '') + prefix, match, suffix: suffix + (end < content.length ? '...' : '') };
  }, [content, searchText, currentMatch, totalMatches]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.headerBackground,
          paddingTop: insets.top + 8,
          borderBottomColor: theme.colors.border,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.inputRow}>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: theme.colors.textSecondary }]}>
            ⌕
          </Text>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Find in essay..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={onSearchTextChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchTextChange('')}
              style={styles.clearButton}
            >
              <Text style={[styles.clearIcon, { color: theme.colors.textSecondary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={[styles.closeText, { color: theme.colors.accent }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {searchText.length === 1 && (
        <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
          Type at least 2 characters
        </Text>
      )}

      {searchText.length >= 2 && totalMatches === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.colors.textSecondary }]}>⌀</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No matches found
          </Text>
        </View>
      )}

      {searchText.length >= 2 && totalMatches > 0 && (
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: theme.colors.textSecondary }]}>
            {`${currentMatch} of ${totalMatches}`}
          </Text>

          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={handlePrev}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  { color: theme.colors.text },
                ]}
              >
                ↑
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  { color: theme.colors.text },
                ]}
              >
                ↓
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {snippet && (
        <View style={[styles.snippetBox, { backgroundColor: theme.colors.border, borderRadius: 8 }]}>
          <Text style={[styles.snippetText, { color: theme.colors.text }]}>
            {snippet.prefix}
            <Text style={styles.snippetMatch}>{snippet.match}</Text>
            {snippet.suffix}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 17,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 14,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  snippetBox: {
    marginTop: 8,
    padding: 10,
  },
  snippetText: {
    fontSize: 14,
    lineHeight: 20,
  },
  snippetMatch: {
    fontWeight: '700',
  },
});
