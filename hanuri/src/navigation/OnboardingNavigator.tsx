import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types/navigation';
import OnboardingLanguageScreen from '../screens/onboarding/OnboardingLanguageScreen';
import OnboardingGoalScreen from '../screens/onboarding/OnboardingGoalScreen';
import OnboardingLevelScreen from '../screens/onboarding/OnboardingLevelScreen';
import OnboardingTimeScreen from '../screens/onboarding/OnboardingTimeScreen';
import OnboardingNotificationScreen from '../screens/onboarding/OnboardingNotificationScreen';
import OnboardingLevelTestScreen from '../screens/onboarding/OnboardingLevelTestScreen';
const Stack = createStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="OnboardingLanguage" component={OnboardingLanguageScreen} />
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="OnboardingLevel" component={OnboardingLevelScreen} />
      <Stack.Screen name="OnboardingLevelTest" component={OnboardingLevelTestScreen} />
      <Stack.Screen name="OnboardingTime" component={OnboardingTimeScreen} />
      <Stack.Screen name="OnboardingNotification" component={OnboardingNotificationScreen} />
    </Stack.Navigator>
  );
}
