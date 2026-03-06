import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { getFirstLesson, ALL_LEVELS } from '../../data/lessons';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<RootStackParamList>;

const GOAL_LABELS: Record<string, string> = {
  kpop: 'K-POP / 드라마',
  travel: '여행',
  business: '비즈니스',
  topik: 'TOPIK 시험',
  relationship: '인간관계',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { xp, streak, todayMinutes, checkAndUpdateStreak } = useUserStore();

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
    // Navigate to AI tab - handled by tab navigator
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요! 👋</Text>
            <Text style={styles.goalLabel}>목표: {GOAL_LABELS[learningGoal]}</Text>
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
            <Text style={styles.statLabel}>연속 학습</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>총 XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFD93D' }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{Math.floor(xp / 100)}</Text>
            <Text style={styles.statLabel}>완료 레슨</Text>
          </View>
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>오늘의 목표</Text>
            <Text style={styles.cardSub}>{todayMinutes}분 / {dailyGoal}분</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((todayMinutes / dailyGoal) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.progressHint}>
            {todayMinutes >= dailyGoal ? '🎉 오늘 목표 달성!' : '오늘 첫 레슨을 시작해보세요!'}
          </Text>
        </View>

        {/* XP Level Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>레벨 진행도</Text>
            <Text style={styles.cardSub}>{xp % xpForNextLevel} / {xpForNextLevel} XP</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress * 100}%`, backgroundColor: colors.secondary }]} />
          </View>
        </View>

        {/* Continue Learning */}
        {firstLesson && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 지금 시작하기</Text>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonEmoji}>{firstLesson.emoji}</Text>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonTitle}>{firstLesson.titleKo}</Text>
                <Text style={styles.lessonSub}>
                  Level {firstLesson.level} · Unit {firstLesson.unit} · {firstLesson.estimatedMinutes}분 · +{firstLesson.xpReward} XP
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.continueBtn} onPress={handleStartLesson}>
              <Text style={styles.continueBtnText}>▶ 레슨 시작하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Start */}
        <Text style={styles.sectionTitle}>⚡ 빠른 시작</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickCard} onPress={handleAIChat}>
            <Text style={styles.quickIcon}>🗣️</Text>
            <Text style={styles.quickLabel}>AI 대화</Text>
            <Text style={styles.quickSub}>자유 회화</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={handleStartLesson}>
            <Text style={styles.quickIcon}>📝</Text>
            <Text style={styles.quickLabel}>오늘의 단어</Text>
            <Text style={styles.quickSub}>5분 완성</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard}>
            <Text style={styles.quickIcon}>🎵</Text>
            <Text style={styles.quickLabel}>K-POP</Text>
            <Text style={styles.quickSub}>Coming soon</Text>
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
