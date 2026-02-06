import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  onTOCPress: () => void;
  onSettingsPress: () => void;
  essayTitle: string;
  essayUrl: string;
  content: string;
  progress: number;
}

export function MenuSheet({
  visible,
  onClose,
  onTOCPress,
  onSettingsPress,
  essayTitle,
  essayUrl,
  content,
  progress,
}: MenuSheetProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();

  const handleItemPress = (action: () => void) => {
    onClose();
    // Small delay to let sheet close before opening next sheet
    setTimeout(action, 200);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
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
      const message = excerpt
        ? `"${essayTitle}" by Paul Graham\n\n${excerpt}\n\nRead more: ${essayUrl}`
        : `"${essayTitle}" by Paul Graham\n\nRead more: ${essayUrl}`;
      await Share.share({ message, title: essayTitle });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={[styles.sheet, { backgroundColor: theme.colors.background, paddingBottom: insets.bottom + 16 }]}>
        {/* Handle bar */}
        <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.doneButton, { color: theme.colors.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={styles.menuItems}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => handleItemPress(onTOCPress)}
          >
            <Text style={styles.menuIcon}>≡</Text>
            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Table of Contents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
            onPress={handleShare}
          >
            <Text style={styles.menuIcon}>↗</Text>
            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress(onSettingsPress)}
          >
            <Text style={styles.menuIcon}>Aa</Text>
            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItems: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
});
