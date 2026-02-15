import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppState } from '@/contexts/AppStateContext';

export default function SettingsScreen() {
  const { updateSettings } = useAppState();

  const handleShowTutorialAgain = async () => {
    await updateSettings({ hasCompletedOnboarding: false });
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
});
