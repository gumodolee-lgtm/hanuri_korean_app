import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { getFirstLesson, ALL_LEVELS } from '../../data/lessons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { LearningGoal } from '../../types';

const GOAL_CONTEXT: Record<LearningGoal, string> = {
  kpop: 'K-pop · 드라마 기초 필수 표현 🎵',
  travel: '여행 필수 표현 ✈️',
  business: '비즈니스 한국어 기초 💼',
  topik: 'TOPIK 기초 대비 📝',
  relationship: '일상 대화 기초 ❤️',
};

type NavProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { xp, streak, todayMinutes, checkAndUpdateStreak } = useUserStore();
  const t = useT();

  // 앱 진입 시 스트릭 체크 (userId 전달 → Supabase 동기화)
  useEffect(() => {
    checkAndUpdateStreak(user?.id);
  }, []);

  const currentLevel = user?.current_level ?? 1;
  const dailyGoal = user?.daily_goal_minutes ?? 15;
  const learningGoal = user?.learning_goal ?? 'travel';
  const firstLesson = getFirstLesson(currentLevel);
  const levelInfo = ALL_LEVELS.find((l) => l.level === currentLevel);

  // XP needed per level (simple formula: level * 100)
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = Math.min((xp % xpForNextLevel) / xpForNextLevel, 1);

  const handleStartLesson = () => {
    if (firstLesson) {
      navigation.navigate('Lesson', { lessonId: firstLesson.id });
    }
  };

  const handleAIChat = () => {
    (navigation as any).navigate('AIHub');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t.home.greeting}</Text>
            <Text style={styles.goalLabel}>{t.home.goalPrefix} {t.goalLabels[learningGoal]}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{levelInfo?.emoji ?? '🌱'}</Text>
            <Text style={styles.levelText}>Lv.{currentLevel}</Text>
          </View>
        </View>

        {/* Streak + XP Banner */}
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{t.home.streakLabel}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>{t.home.xpLabel}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFD93D' }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{Math.floor(xp / 100)}</Text>
            <Text style={styles.statLabel}>{t.home.completedLabel}</Text>
          </View>
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.home.dailyGoalTitle}</Text>
            <Text style={styles.cardSub}>{todayMinutes}{t.home.minUnit} / {dailyGoal}{t.home.minUnit}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((todayMinutes / dailyGoal) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {todayMinutes >= dailyGoal ? t.home.goalAchieved : t.home.startFirstLesson}
          </Text>
        </View>

        {/* XP Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.home.levelProgress}</Text>
            <Text style={styles.cardSub}>{xp % xpForNextLevel} / {xpForNextLevel} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress * 100}%`, backgroundColor: colors.secondary }]} />
          </View>
        </View>

        {/* Continue Learning */}
        {firstLesson && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{GOAL_CONTEXT[learningGoal as LearningGoal] ?? t.home.startNow}</Text>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonEmoji}>{firstLesson.emoji}</Text>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonTitle}>{firstLesson.titleKo}</Text>
                <Text style={styles.lessonSub}>
                  Level {firstLesson.level} · Unit {firstLesson.unit} · {firstLesson.estimatedMinutes}{t.home.minUnit} · +{firstLesson.xpReward} XP
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={handleStartLesson}>
              <Text style={styles.continueBtnText}>{t.home.startLessonBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Start */}
        <Text style={styles.sectionTitle}>{t.home.quickStart}</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={handleAIChat}>
            <Text style={styles.quickIcon}>🗣️</Text>
            <Text style={styles.quickLabel}>{t.home.aiChatLabel}</Text>
            <Text style={styles.quickSub}>{t.home.aiChatSub}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleStartLesson}>
            <Text style={styles.quickIcon}>📝</Text>
            <Text style={styles.quickLabel}>{t.home.todaysWord}</Text>
            <Text style={styles.quickSub}>{t.home.todaysWordSub}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <Text style={styles.quickIcon}>🎵</Text>
            <Text style={styles.quickLabel}>{t.home.kpop}</Text>
            <Text style={styles.quickSub}>{t.home.comingSoon}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  greeting: { ...typography.h2, color: colors.dark },
  goalLabel: { ...typography.caption, color: colors.gray, marginTop: 2 },
  levelBadge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelEmoji: { fontSize: 20 },
  levelText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  statRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.white },
  statLabel: { ...typography.caption, color: colors.white, opacity: 0.9, textAlign: 'center' },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...typography.body, color: colors.dark, fontWeight: '600' },
  cardSub: { ...typography.caption, color: colors.gray },
  cardLabel: { ...typography.caption, color: colors.gray },

  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressHint: { ...typography.caption, color: colors.gray, textAlign: 'center' },

  lessonInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lessonEmoji: { fontSize: 36 },
  lessonMeta: { flex: 1 },
  lessonTitle: { ...typography.h3, color: colors.dark },
  lessonSub: { ...typography.caption, color: colors.gray, marginTop: 2 },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  continueBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },

  sectionTitle: { ...typography.h3, color: colors.dark },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { ...typography.caption, color: colors.dark, fontWeight: '600', textAlign: 'center' },
  quickSub: { fontSize: 10, color: colors.gray, textAlign: 'center' },
});
