import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import LoadingScreen from './src/components/LoadingScreen';
import {
  getNotificationPermissionStatus,
  scheduleDailyReminder,
  scheduleStreakWarning,
} from './src/services/notificationService';
import { initRevenueCat } from './src/services/revenuecatService';
import { useAuthStore } from './src/store/authStore';
import { getT } from './src/i18n';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Brief initialization: let Zustand hydrate from AsyncStorage before rendering nav
    const timer = setTimeout(() => setIsReady(true), 300);

    (async () => {
      try {
        // persist 하이드레이션 완료 대기 — 이전 세션의 user/reminderHour를 읽기 위해 필수
        if (!useAuthStore.persist.hasHydrated()) {
          await new Promise<void>((resolve) => {
            const unsub = useAuthStore.persist.onFinishHydration(() => {
              unsub();
              resolve();
            });
          });
        }

        const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
        const rcIosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
        if (rcKey) {
          await initRevenueCat(rcKey, rcIosKey || undefined).catch((err) => {
            console.warn('[App] RevenueCat initialization failed:', err);
          });
          // Sync Pro status for users who were already logged in (app restart)
          useAuthStore.getState().syncProStatus().catch(() => {});
        }

        // 권한 요청은 온보딩 알림 화면/프로필 토글에서만 수행 — 여기서는 이미 허용된 경우에만
        // 사용자가 고른 시각과 현재 언어 문구로 스케줄을 갱신한다 (언어 변경/앱 업데이트 반영)
        const status = await getNotificationPermissionStatus();
        if (status === 'granted') {
          const t = getT();
          const { reminderHour } = useAuthStore.getState();
          await scheduleDailyReminder({ hour: reminderHour, minute: 0, title: t.notifContent.dailyTitle, body: t.notifContent.dailyBody });
          await scheduleStreakWarning({ title: t.notifContent.streakTitle, body: t.notifContent.streakBody });
        }
      } catch (err) {
        console.warn('[App] Notification initialization failed:', err);
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      clearTimeout(timer);
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
