/**
 * Reading Reminder Service
 *
 * Provides morning and evening reading summaries/reminders
 * for the PG Essays app.
 */

import { loadEssayIndex } from './essays';
import type { ReadingProgress } from '@/types/essay';

export interface ReminderMessage {
  title: string;
  body: string;
  time: 'morning' | 'evening';
}

/**
 * Generate morning reminder message
 * Focuses on continuing reading and showing progress
 */
export function getMorningReminder(
  readingProgress: Record<string, ReadingProgress>
): ReminderMessage {
  const essays = loadEssayIndex();

  // Get essays in progress
  const inProgress = essays.filter(essay => {
    const progress = readingProgress[essay.id];
    return progress && progress.progress > 0 && !progress.isRead;
  });

  // Get most recently read essay
  const recentEssay = inProgress.sort((a, b) => {
    const aTime = readingProgress[a.id]?.lastReadAt || 0;
    const bTime = readingProgress[b.id]?.lastReadAt || 0;
    return bTime - aTime;
  })[0];

  if (recentEssay) {
    const progress = Math.round(readingProgress[recentEssay.id].progress * 100);
    return {
      title: '☀️ Good Morning! Continue Reading',
      body: `Resume "${recentEssay.title}" (${progress}% complete). ${inProgress.length - 1} more essay${inProgress.length - 1 === 1 ? '' : 's'} in progress.`,
      time: 'morning',
    };
  }

  return {
    title: '☀️ Good Morning! Start Your Day with PG',
    body: `228 essays waiting for you. Pick one to read with your morning coffee.`,
    time: 'morning',
  };
}

/**
 * Generate evening reminder message
 * Focuses on winding down with reading
 */
export function getEveningReminder(
  readingProgress: Record<string, ReadingProgress>
): ReminderMessage {
  const essays = loadEssayIndex();

  // Get essays in progress
  const inProgress = essays.filter(essay => {
    const progress = readingProgress[essay.id];
    return progress && progress.progress > 0 && !progress.isRead;
  });

  // Count read today (last 24 hours)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const readToday = Object.values(readingProgress).filter(
    p => p.lastReadAt && p.lastReadAt > oneDayAgo
  ).length;

  if (readToday > 0) {
    return {
      title: '🌙 Evening Reflection',
      body: `You read ${readToday} essay${readToday === 1 ? '' : 's'} today. ${inProgress.length} still in progress. Wind down with more wisdom?`,
      time: 'evening',
    };
  }

  if (inProgress.length > 0) {
    return {
      title: '🌙 Evening Reading Time',
      body: `${inProgress.length} essay${inProgress.length === 1 ? '' : 's'} waiting for you. Perfect for winding down before bed.`,
      time: 'evening',
    };
  }

  return {
    title: '🌙 Unwind with Paul Graham',
    body: 'End your day with thought-provoking ideas. Pick an essay to read.',
    time: 'evening',
  };
}

/**
 * Schedule notifications (requires expo-notifications)
 *
 * To use this, install expo-notifications:
 * npx expo install expo-notifications
 *
 * Then request permissions and schedule:
 *
 * ```typescript
 * import * as Notifications from 'expo-notifications';
 *
 * // Request permission
 * const { status } = await Notifications.requestPermissionsAsync();
 *
 * // Schedule morning reminder (8 AM)
 * await Notifications.scheduleNotificationAsync({
 *   content: getMorningReminder(readingProgress),
 *   trigger: {
 *     hour: 8,
 *     minute: 0,
 *     repeats: true,
 *   },
 * });
 *
 * // Schedule evening reminder (8 PM)
 * await Notifications.scheduleNotificationAsync({
 *   content: getEveningReminder(readingProgress),
 *   trigger: {
 *     hour: 20,
 *     minute: 0,
 *     repeats: true,
 *   },
 * });
 * ```
 */
export const REMINDER_TIMES = {
  morning: { hour: 8, minute: 0 },  // 8:00 AM
  evening: { hour: 20, minute: 0 },  // 8:00 PM
} as const;
