import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useReader } from '../../context/ReaderContext';

interface ReaderHeaderProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSettingsPress: () => void;
}

export function ReaderHeader({
  title,
  visible,
  onClose,
  onSettingsPress,
}: ReaderHeaderProps) {
  const { theme } = useReader();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.headerBackground,
          paddingTop: insets.top + 8,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
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

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.settingsIcon, { color: theme.colors.text }]}>
          Aa
        </Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: '300',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
});
