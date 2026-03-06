import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import MainTabNavigator from './MainTabNavigator';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingNavigator from './OnboardingNavigator';
import LessonPlayerScreen from '../screens/lesson/LessonPlayerScreen';
import LessonCompleteScreen from '../screens/lesson/LessonCompleteScreen';
import AIChatScreen from '../screens/ai-chat/AIChatScreen';
import ProUpgradeScreen from '../screens/pro/ProUpgradeScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Lesson" component={LessonPlayerScreen} />
            <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
            <Stack.Screen name="AIChat" component={AIChatScreen} />
            <Stack.Screen name="ProUpgrade" component={ProUpgradeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
