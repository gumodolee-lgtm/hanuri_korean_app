import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Notification IDs for cancellation
const DAILY_REMINDER_ID = 'hanuri-daily-reminder';
const STREAK_REMINDER_ID = 'hanuri-streak-reminder';

// How notifications look when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── PERMISSIONS ─────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '하누리 학습 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// ─── SCHEDULE DAILY REMINDER ──────────────────────────────────

export interface DailyReminderOptions {
  hour: number;   // 0–23
  minute: number; // 0–59
  title?: string;
  body?: string;
}

export async function scheduleDailyReminder(options: DailyReminderOptions): Promise<void> {
  // Cancel existing before rescheduling
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: options.title ?? '오늘 한국어 공부 했나요? 🇰🇷',
      body: options.body ?? '매일 조금씩 — 오늘의 레슨을 시작해보세요!',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: options.hour,
      minute: options.minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
}

// ─── STREAK WARNING (if no activity by 9 PM) ─────────────────

export interface StreakWarningOptions {
  title?: string;
  body?: string;
}

export async function scheduleStreakWarning(options: StreakWarningOptions = {}): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_REMINDER_ID,
    content: {
      title: options.title ?? '🔥 스트릭이 끊길 것 같아요!',
      body: options.body ?? '오늘 자정 전에 레슨 하나만 완료하면 스트릭을 지킬 수 있어요!',
      sound: true,
      data: { type: 'streak_warning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

export async function cancelStreakWarning(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);
}

// ─── IMMEDIATE (celebration) ──────────────────────────────────

export interface LessonCompleteOptions {
  title?: string;
  body?: string;
}

export async function sendLessonCompleteNotification(xp: number, options: LessonCompleteOptions = {}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title ?? '레슨 완료! 🎉',
      body: options.body ?? `+${xp} XP 획득! 오늘도 대단해요!`,
      sound: true,
      data: { type: 'lesson_complete' },
    },
    trigger: null, // immediate
  });
}

// ─── CANCEL ALL ───────────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── GET SCHEDULED LIST ───────────────────────────────────────

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}
