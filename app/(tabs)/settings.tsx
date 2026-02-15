import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppState } from '@/contexts/AppStateContext';

export default function SettingsScreen() {
  const { updateSettings, clearProgress, clearFavorites } = useAppState();

  const handleShowTutorialAgain = async () => {
    await updateSettings({ hasCompletedOnboarding: false });
  };

  const handleClearProgress = () => {
    Alert.alert(
      'Clear Reading Progress',
      'This will remove all reading progress and marks for all essays. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearProgress();
          },
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'This will remove all favorited essays. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearFavorites();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tutorial</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleShowTutorialAgain}
          accessibilityLabel="Show tutorial again"
          accessibilityRole="button"
          accessibilityHint="Resets the onboarding tutorial to show it again on next launch"
        >
          <Text style={styles.settingLabel}>Show Tutorial Again</Text>
          <Text style={styles.settingValue}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleClearProgress}
          accessibilityLabel="Clear reading progress"
          accessibilityRole="button"
          accessibilityHint="Removes all reading progress and marks for all essays"
        >
          <Text style={styles.settingLabel}>Clear Reading Progress</Text>
          <Text style={styles.settingValueDestructive}>Clear</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleClearFavorites}
          accessibilityLabel="Clear favorites"
          accessibilityRole="button"
          accessibilityHint="Removes all favorited essays"
        >
          <Text style={styles.settingLabel}>Clear Favorites</Text>
          <Text style={styles.settingValueDestructive}>Clear</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C6C6C8',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F2F2F7',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    backgroundColor: '#fff',
  },
  settingLabel: {
    fontSize: 17,
    color: '#000',
  },
  settingValue: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingValueDestructive: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#C6C6C8',
    marginLeft: 16,
  },
});
