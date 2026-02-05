import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';

interface ReaderHeaderProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSettingsPress: () => void;
  onSearchPress: () => void;
  onBookmarksPress: () => void;
  onTOCPress: () => void;
  essayUrl?: string;
  content?: string;
  progress?: number;
}

export function ReaderHeader({
  title,
  visible,
  onClose,
  onSettingsPress,
  onSearchPress,
  onBookmarksPress,
  onTOCPress,
  essayUrl,
  content = '',
  progress = 0,
}: ReaderHeaderProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsPress();
  };

  const handleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearchPress();
  };

  const handleBookmarks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmarksPress();
  };

  const handleTOC = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTOCPress();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      let excerpt = '';
      if (content && progress > 0) {
        const charIndex = Math.round(progress * content.length);
        const start = Math.max(0, charIndex - 50);
        const end = Math.min(content.length, charIndex + 50);
        excerpt = content.slice(start, end).replace(/\n/g, ' ').trim();
        if (excerpt.length > 100) excerpt = excerpt.slice(0, 100);
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';
      }
      const url = essayUrl || 'https://paulgraham.com/articles.html';
      const message = excerpt
        ? `"${title}" by Paul Graham\n\n${excerpt}\n\nRead more: ${url}`
        : `"${title}" by Paul Graham\n\nRead more: ${url}`;
      await Share.share({ message, title });
    } catch (error) {
      console.warn('Share failed:', error);
    }
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
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.closeIcon, { color: theme.colors.text }]}>
          {Platform.OS === 'ios' ? '✕' : '←'}
        </Text>
      </TouchableOpacity>

      <Text
        style={[styles.title, { color: theme.colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleTOC}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.icon, { color: theme.colors.text }]}>≡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBookmarks}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.icon, { color: theme.colors.text }]}>⛖</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.icon, { color: theme.colors.text }]}>⌕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.icon, { color: theme.colors.text }]}>↗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleSettings}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.icon, { color: theme.colors.text }]}>
            Aa
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: '300',
  },
  icon: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
