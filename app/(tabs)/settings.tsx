import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAppState } from '@/contexts/AppStateContext';
import { getMorningReminder, getEveningReminder, REMINDER_TIMES } from '@/lib/reminderService';
import { colors, sansFont, spacing } from '@/lib/theme';

export default function SettingsScreen() {
  const { settings, readingProgress, updateSettings, clearProgress, clearFavorites } = useAppState();

  const handleToggleReminders = async (enabled: boolean) => {
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device Settings to receive reading reminders.'
        );
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const morning = getMorningReminder(readingProgress);
      await Notifications.scheduleNotificationAsync({
        content: { title: morning.title, body: morning.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: REMINDER_TIMES.morning.hour,
          minute: REMINDER_TIMES.morning.minute,
        },
      });

      const evening = getEveningReminder(readingProgress);
      await Notifications.scheduleNotificationAsync({
        content: { title: evening.title, body: evening.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: REMINDER_TIMES.evening.hour,
          minute: REMINDER_TIMES.evening.minute,
        },
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    await updateSettings({ remindersEnabled: enabled });
  };

  const handleShowTutorialAgain = async () => {
    await updateSettings({ hasCompletedOnboarding: false });
  };

  const handleClearProgress = () => {
    Alert.alert(
      'Clear Reading Progress',
      'This will remove all reading progress and marks. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearProgress() },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      'This will remove all favorited essays. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearFavorites() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Reading Reminders</Text>
            <Switch
              value={settings.remindersEnabled}
              onValueChange={handleToggleReminders}
              trackColor={{ false: colors.border, true: colors.accent }}
              accessibilityLabel="Toggle reading reminders"
              accessibilityHint="Enables morning and evening reading reminders"
            />
          </View>
          <Text style={styles.settingDescription}>
            Receive gentle reminders at 8 AM and 8 PM.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleShowTutorialAgain}
            accessibilityLabel="Show tutorial again"
            accessibilityRole="button"
            accessibilityHint="Resets the onboarding tutorial"
          >
            <Text style={styles.settingLabel}>Show Tutorial Again</Text>
            <Text style={styles.settingAction}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.sectionContent}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearProgress}
            accessibilityLabel="Clear reading progress"
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>Clear Reading Progress</Text>
            <Text style={styles.settingDestructive}>Clear</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearFavorites}
            accessibilityLabel="Clear favorites"
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>Clear Favorites</Text>
            <Text style={styles.settingDestructive}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: sansFont,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 44,
  },
  settingLabel: {
    fontFamily: sansFont,
    fontSize: 16,
    color: colors.text,
  },
  settingAction: {
    fontFamily: sansFont,
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  settingDestructive: {
    fontFamily: sansFont,
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
  settingDescription: {
    fontFamily: sansFont,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingBottom: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
});
