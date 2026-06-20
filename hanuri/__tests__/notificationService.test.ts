/**
 * notificationService.ts 단위 테스트
 */

import { Platform } from 'react-native';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'undetermined' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));

import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleStreakWarning,
  cancelStreakWarning,
  sendLessonCompleteNotification,
  cancelAllNotifications,
  getScheduledNotifications,
} from '../src/services/notificationService';

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
});

describe('notificationService — requestNotificationPermission', () => {
  it('web에서는 항상 false를 반환한다', async () => {
    Platform.OS = 'web';
    expect(await requestNotificationPermission()).toBe(false);
  });

  it('android에서는 알림 채널을 생성한다', async () => {
    await requestNotificationPermission();
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
  });

  it('이미 권한이 있으면 true를 반환하고 재요청하지 않는다', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    expect(await requestNotificationPermission()).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('권한이 없으면 요청 후 결과를 반환한다', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    expect(await requestNotificationPermission()).toBe(false);
  });
});

describe('notificationService — getNotificationPermissionStatus', () => {
  it('현재 권한 상태 문자열을 반환한다', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    expect(await getNotificationPermissionStatus()).toBe('granted');
  });
});

describe('notificationService — 일일 리마인더', () => {
  it('scheduleDailyReminder는 기존 알림을 취소한 후 새로 등록한다', async () => {
    await scheduleDailyReminder({ hour: 20, minute: 0 });
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('hanuri-daily-reminder');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'hanuri-daily-reminder' })
    );
  });

  it('web에서는 아무것도 호출하지 않는다', async () => {
    Platform.OS = 'web';
    await scheduleDailyReminder({ hour: 20, minute: 0 });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancelDailyReminder는 해당 ID로 취소를 호출한다', async () => {
    await cancelDailyReminder();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('hanuri-daily-reminder');
  });
});

describe('notificationService — 스트릭 경고', () => {
  it('scheduleStreakWarning은 기존 알림을 취소한 후 새로 등록한다', async () => {
    await scheduleStreakWarning();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'hanuri-streak-reminder' })
    );
  });

  it('cancelStreakWarning은 해당 ID로 취소를 호출한다', async () => {
    await cancelStreakWarning();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('hanuri-streak-reminder');
  });
});

describe('notificationService — 즉시 알림 및 전체 관리', () => {
  it('sendLessonCompleteNotification은 trigger:null로 즉시 발송한다', async () => {
    await sendLessonCompleteNotification(20);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: null })
    );
  });

  it('cancelAllNotifications은 전체 취소를 호출한다', async () => {
    await cancelAllNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });

  it('getScheduledNotifications은 예약된 알림 목록을 반환한다', async () => {
    expect(await getScheduledNotifications()).toEqual([]);
  });

  it('web에서는 빈 배열을 반환한다', async () => {
    Platform.OS = 'web';
    expect(await getScheduledNotifications()).toEqual([]);
  });
});
