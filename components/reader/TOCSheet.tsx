import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';

interface TOCEntry {
  text: string;
  level: number; // 1, 2, or 3
  position: number; // 0-1
}

interface TOCSheetProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  onNavigate: (position: number) => void;
}

function parseTOC(content: string): TOCEntry[] {
  const lines = content.split('\n');
  const entries: TOCEntry[] = [];
  let charIndex = 0;

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const position = content.length > 0 ? charIndex / content.length : 0;
      entries.push({ text, level, position });
    }
    charIndex += line.length + 1; // +1 for \n
  }

  return entries;
}

export function TOCSheet({ visible, onClose, content, onNavigate }: TOCSheetProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();

  const tocEntries = useMemo(() => parseTOC(content), [content]);

  const handleNavigate = (position: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(position);
    onClose();
  };

  const indentForLevel = (level: number) => {
    if (level === 1) return 0;
    if (level === 2) return 16;
    return 32;
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
              Contents
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.doneButton, { color: theme.colors.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {tocEntries.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No headings found in this essay.
            </Text>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {tocEntries.map((entry, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tocItem,
                    { paddingLeft: 20 + indentForLevel(entry.level), borderBottomColor: theme.colors.border },
                  ]}
                  onPress={() => handleNavigate(entry.position)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.tocText,
                      {
                        color: theme.colors.text,
                        fontSize: entry.level === 1 ? 17 : entry.level === 2 ? 15 : 14,
                        fontWeight: entry.level === 1 ? '600' : '500',
                      },
                    ]}
                  >
                    {entry.text}
                  </Text>
                </TouchableOpacity>
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
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    fontSize: 15,
  },
  list: {
    paddingRight: 20,
  },
  tocItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tocText: {
    lineHeight: 22,
  },
});
