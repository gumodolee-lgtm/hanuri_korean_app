import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabParamList } from '../types/navigation';
import { colors, typography } from '../theme';
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

const tabLabels: Record<string, string> = {
  Home: '홈',
  Lessons: '레슨',
  AIHub: 'AI대화',
  Leaderboard: '랭킹',
  Profile: '나',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
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
