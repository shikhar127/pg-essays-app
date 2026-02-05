import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useReader } from '../../context/ReaderContext';
import { ThemeName, FontSize } from '../../lib/themes';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const { theme, themeName, setThemeName, fontSize, setFontSize } = useReader();
  const insets = useSafeAreaInsets();

  const themeOptions: { name: ThemeName; label: string; color: string }[] = [
    { name: 'light', label: 'Light', color: '#FFFFFF' },
    { name: 'dark', label: 'Dark', color: '#121212' },
    { name: 'sepia', label: 'Sepia', color: '#FBF5E6' },
  ];

  const fontSizeOptions: { size: FontSize; label: string }[] = [
    { size: 'small', label: 'S' },
    { size: 'medium', label: 'M' },
    { size: 'large', label: 'L' },
  ];

  const handleThemeChange = (name: ThemeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeName(name);
  };

  const handleFontSizeChange = (size: FontSize) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFontSize(size);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              paddingBottom: insets.bottom + 20,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>Settings</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.settingsDone, { color: theme.colors.accent }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.handle} />

          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Theme
          </Text>
          <View style={styles.optionsRow}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: option.color,
                    borderColor:
                      themeName === option.name
                        ? theme.colors.accent
                        : theme.colors.border,
                    borderWidth: themeName === option.name ? 2 : 1,
                  },
                ]}
                onPress={() => handleThemeChange(option.name)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.themeLabel,
                    {
                      color: option.name === 'dark' ? '#E0E0E0' : '#2D2D2D',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Font Size
          </Text>
          <View style={styles.optionsRow}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.size}
                style={[
                  styles.fontSizeOption,
                  {
                    backgroundColor:
                      fontSize === option.size
                        ? theme.colors.accent
                        : 'transparent',
                    borderColor:
                      fontSize === option.size
                        ? theme.colors.accent
                        : theme.colors.border,
                  },
                ]}
                onPress={() => handleFontSizeChange(option.size)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.fontSizeLabel,
                    {
                      color:
                        fontSize === option.size
                          ? '#FFFFFF'
                          : theme.colors.text,
                      fontSize:
                        option.size === 'small'
                          ? 14
                          : option.size === 'medium'
                          ? 18
                          : 22,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  themeOption: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fontSizeOption: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeLabel: {
    fontWeight: '600',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 4,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingsDone: {
    fontSize: 16,
    fontWeight: '600',
  },
});
