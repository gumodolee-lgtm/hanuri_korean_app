import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import LoadingScreen from './src/components/LoadingScreen';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleStreakWarning,
} from './src/services/notificationService';
import { initRevenueCat } from './src/services/revenuecatService';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Brief initialization: let Zustand hydrate from AsyncStorage before rendering nav
    const timer = setTimeout(() => setIsReady(true), 300);

    (async () => {
      try {
        const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
        const rcIosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
        if (rcKey) {
          await initRevenueCat(rcKey, rcIosKey || undefined).catch((err) => {
            console.warn('[App] RevenueCat initialization failed:', err);
          });
          // Sync Pro status for users who were already logged in (app restart)
          useAuthStore.getState().syncProStatus().catch(() => {});
        }

        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleDailyReminder({ hour: 20, minute: 0 });
          await scheduleStreakWarning();
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
