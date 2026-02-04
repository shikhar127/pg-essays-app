import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useReader } from '../../context/ReaderContext';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { theme } = useReader();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: theme.colors.progressBar,
            width: `${Math.min(progress * 100, 100)}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 100,
  },
  fill: {
    height: '100%',
  },
});
