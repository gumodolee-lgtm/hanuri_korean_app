import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoadingScreen from './src/components/LoadingScreen';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleStreakWarning,
} from './src/services/notificationService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Brief initialization: let Zustand hydrate from AsyncStorage before rendering nav
    const timer = setTimeout(() => setIsReady(true), 300);

    (async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDailyReminder({ hour: 20, minute: 0 });
        await scheduleStreakWarning();
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
