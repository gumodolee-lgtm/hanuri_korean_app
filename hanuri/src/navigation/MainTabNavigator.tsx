import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';
import { useT } from '../i18n';
import HomeScreen from '../screens/home/HomeScreen';
import LessonsScreen from '../screens/lesson/LessonsScreen';
import AIHubScreen from '../screens/ai-chat/AIHubScreen';
import LeaderboardScreen from '../screens/profile/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<string, string> = {
  Home: '🏠',
  Lessons: '📚',
  AIHub: '🗣️',
  Leaderboard: '🏆',
  Profile: '👤',
};

export default function MainTabNavigator() {
  const t = useT();
  const insets = useSafeAreaInsets();

  const tabLabels: Record<string, string> = {
    Home: t.tabs.home,
    Lessons: t.tabs.lessons,
    AIHub: t.tabs.aiChat,
    Leaderboard: t.tabs.ranking,
    Profile: t.tabs.profile,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { height: 64 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarIcon: ({ focused }) => (
          <View style={styles.tabItem}>
            <Text style={styles.tabIcon}>{tabIcons[route.name]}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {tabLabels[route.name]}
            </Text>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={LessonsScreen} />
      <Tab.Screen name="AIHub" component={AIHubScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.gray,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
