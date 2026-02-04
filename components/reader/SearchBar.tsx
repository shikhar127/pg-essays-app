import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Keyboard,
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
}: SearchBarProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -100,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      Keyboard.dismiss();
    }
  }, [visible, translateY]);

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
            🔍
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

      {searchText.length > 0 && (
        <View style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: theme.colors.textSecondary }]}>
            {totalMatches === 0
              ? 'No matches'
              : `${currentMatch} of ${totalMatches}`}
          </Text>

          <View style={styles.navButtons}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={totalMatches === 0}
              style={[
                styles.navButton,
                totalMatches === 0 && styles.navButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  { color: totalMatches === 0 ? theme.colors.textSecondary : theme.colors.text },
                ]}
              >
                ↑
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              disabled={totalMatches === 0}
              style={[
                styles.navButton,
                totalMatches === 0 && styles.navButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  { color: totalMatches === 0 ? theme.colors.textSecondary : theme.colors.text },
                ]}
              >
                ↓
              </Text>
            </TouchableOpacity>
          </View>
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
});
