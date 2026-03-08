import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { ALL_LEVELS } from '../../data/lessons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  scheduleDailyReminder,
  scheduleStreakWarning,
  cancelDailyReminder,
  cancelStreakWarning,
} from '../../services/notificationService';

const LANG_FLAGS: Record<string, string> = {
  en: '🇺🇸 English',
  es: '🇪🇸 Español',
  zh: '🇨🇳 中文',
  ja: '🇯🇵 日本語',
  vi: '🇻🇳 Tiếng Việt',
  ko: '🇰🇷 한국어',
};

const BADGE_IDS = [
  { id: 'first_lesson', emoji: '🎯', nameKey: 'firstLesson', descKey: 'firstLesson' },
  { id: 'week_streak', emoji: '🔥', nameKey: 'weekStreak', descKey: 'weekStreak' },
  { id: 'vocab_100', emoji: '📖', nameKey: 'vocab100', descKey: 'vocab100' },
  { id: 'ai_chat_5', emoji: '🗣️', nameKey: 'aiChat5', descKey: 'aiChat5' },
  { id: 'perfect_quiz', emoji: '💯', nameKey: 'perfectQuiz', descKey: 'perfectQuiz' },
  { id: 'level_up', emoji: '⬆️', nameKey: 'levelUp', descKey: 'levelUp' },
] as const;

type NavProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, signOut } = useAuthStore();
  const { xp, streak, progress, aiChatCount } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const isPro = user?.isPro ?? false;
  const t = useT();

  useEffect(() => {
    getNotificationPermissionStatus().then((status) => {
      setNotificationsEnabled(status === 'granted');
    });
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDailyReminder({ hour: 20, minute: 0 });
        await scheduleStreakWarning();
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          t.profile.notifPermTitle,
          t.profile.notifPermMsg,
          [{ text: t.profile.confirm }]
        );
      }
    } else {
      await cancelDailyReminder();
      await cancelStreakWarning();
      setNotificationsEnabled(false);
    }
  };

  const currentLevel = user?.current_level ?? 1;
  const levelInfo = ALL_LEVELS.find((l) => l.level === currentLevel);
  const xpForNext = currentLevel * 100;
  const xpProgress = Math.min((xp % xpForNext) / xpForNext, 1);
  const completedLessons = progress.filter((p) => p.status === 'completed').length;

  const unlockedBadges = new Set<string>();
  if (completedLessons >= 1) unlockedBadges.add('first_lesson');
  if (streak >= 7) unlockedBadges.add('week_streak');
  if (xp >= 500) unlockedBadges.add('vocab_100');
  if (progress.some((p) => p.score === 100)) unlockedBadges.add('perfect_quiz');
  if (aiChatCount >= 5) unlockedBadges.add('ai_chat_5');
  if (currentLevel >= 2) unlockedBadges.add('level_up');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{levelInfo?.emoji ?? '🌱'}</Text>
          </View>
          <View style={styles.levelTitleRow}>
            <Text style={styles.levelTitle}>{levelInfo?.titleKo ?? '초급'} {t.profile.learnerSuffix}</Text>
            {isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>👑 PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.goalLabel}>{t.goalLabels[user?.learning_goal ?? 'travel']} {t.profile.goalSuffix}</Text>
          <Text style={styles.langLabel}>{LANG_FLAGS[user?.native_lang ?? 'en']}</Text>
        </View>

        {/* PRO Upgrade Banner (only for non-PRO) */}
        {!isPro && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => navigation.navigate('ProUpgrade')}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeBannerEmoji}>👑</Text>
            <View style={styles.upgradeBannerText}>
              <Text style={styles.upgradeBannerTitle}>{t.profile.upgradeTitle}</Text>
              <Text style={styles.upgradeBannerSub}>{t.profile.upgradeSub}</Text>
            </View>
            <Text style={styles.upgradeBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>{t.profile.xpLabel}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{t.profile.streakLabel}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedLessons}</Text>
            <Text style={styles.statLabel}>{t.profile.completedLabel}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Lv.{currentLevel} → Lv.{currentLevel + 1}</Text>
            <Text style={styles.cardSub}>{xp % xpForNext} / {xpForNext} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressHint}>{xpForNext - (xp % xpForNext)} XP {t.profile.xpUntilNext}</Text>
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>{t.profile.badges}</Text>
        <View style={styles.badgeGrid}>
          {BADGE_IDS.map((badge) => {
            const unlocked = unlockedBadges.has(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
                <Text style={styles.badgeEmoji}>{unlocked ? badge.emoji : '🔒'}</Text>
                <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>{t.profile.badgeNames[badge.nameKey]}</Text>
                <Text style={styles.badgeDesc}>{t.profile.badgeDescs[badge.descKey]}</Text>
              </View>
            );
          })}
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>{t.profile.settings}</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>{t.profile.notifLabel}</Text>
              <Text style={styles.settingHint}>{t.profile.notifHint}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary + '88' }}
              thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.profile.dailyGoal}</Text>
            <Text style={styles.settingValue}>{user?.daily_goal_minutes ?? 15}min</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t.profile.nativeLang}</Text>
            <Text style={styles.settingValue}>{LANG_FLAGS[user?.native_lang ?? 'en']}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>{t.profile.signOut}</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },

  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 40 },
  levelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  levelTitle: { ...typography.h2, color: colors.white, fontWeight: '800' },
  proBadge: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  proBadgeText: { fontSize: 12, fontWeight: '900', color: colors.dark },
  goalLabel: { ...typography.body, color: 'rgba(255,255,255,0.85)' },
  langLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },

  upgradeBanner: {
    backgroundColor: '#FFF9E6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: '#FFD93D',
  },
  upgradeBannerEmoji: { fontSize: 28 },
  upgradeBannerText: { flex: 1 },
  upgradeBannerTitle: { ...typography.body, color: colors.dark, fontWeight: '700' },
  upgradeBannerSub: { ...typography.caption, color: colors.gray, marginTop: 2 },
  upgradeBannerArrow: { fontSize: 24, color: colors.gray },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  statBox: { flex: 1, padding: spacing.md, alignItems: 'center', gap: 4 },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.dark },
  statLabel: { ...typography.caption, color: colors.gray },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.body, color: colors.dark, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.gray },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  progressHint: { ...typography.caption, color: colors.gray, textAlign: 'center' },

  sectionTitle: { ...typography.h3, color: colors.dark },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
    minWidth: '30%',
    flexGrow: 1,
  },
  badgeLocked: { opacity: 0.4 },
  badgeEmoji: { fontSize: 28 },
  badgeName: { ...typography.caption, color: colors.dark, fontWeight: '700', textAlign: 'center' },
  badgeNameLocked: { color: colors.gray },
  badgeDesc: { fontSize: 10, color: colors.gray, textAlign: 'center' },

  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLabel: { ...typography.body, color: colors.dark },
  settingHint: { ...typography.caption, color: colors.gray, marginTop: 2 },
  settingValue: { ...typography.body, color: colors.gray },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  signOutBtn: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: { ...typography.body, color: colors.gray },
});
