import React, { useState } from 'react';
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
import { ALL_LEVELS, LessonData } from '../../data/lessons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

type NavProp = StackNavigationProp<RootStackParamList>;

export default function LessonsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { progress } = useUserStore();
  const currentLevel = user?.current_level ?? 1;
  const t = useT();

  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  const selectedLevelData = ALL_LEVELS.find((l) => l.level === selectedLevel);

  const isLessonCompleted = (lessonId: string) =>
    progress.some((p) => p.lesson_id === lessonId && p.status === 'completed');

  const isLessonUnlocked = (lesson: LessonData, allLessons: LessonData[]) => {
    if (lesson.order === 1) return true;
    const prev = allLessons.find((l) => l.order === lesson.order - 1);
    return prev ? isLessonCompleted(prev.id) : false;
  };

  const handleStartLesson = (lessonId: string) => {
    navigation.navigate('Lesson', { lessonId });
  };

  const allLessonsFlat = selectedLevelData?.units.flatMap((u) => u.lessons) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.lessons.title}</Text>
      </View>

      {/* Level Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.levelSelector}
      >
        {ALL_LEVELS.map((lvl) => {
          const isActive = lvl.level === selectedLevel;
          const isAvail = lvl.level <= currentLevel;
          return (
            <TouchableOpacity
              key={lvl.level}
              style={[styles.levelTab, isActive && styles.levelTabActive, !isAvail && styles.levelTabLocked]}
              onPress={() => isAvail && setSelectedLevel(lvl.level)}
              disabled={!isAvail}
            >
              <Text style={styles.levelTabEmoji}>{isAvail ? lvl.emoji : '🔒'}</Text>
              <Text style={[styles.levelTabText, isActive && styles.levelTabTextActive]}>
                Lv.{lvl.level}
              </Text>
              <Text style={[styles.levelTabSub, isActive && styles.levelTabSubActive]}>
                {lvl.titleKo}
              </Text>
            </TouchableOpacity>
          );
        })}
        {Array.from({ length: 12 - ALL_LEVELS.length }, (_, i) => ALL_LEVELS.length + i + 1).map((lvl) => (
          <TouchableOpacity key={`future-${lvl}`} style={[styles.levelTab, styles.levelTabLocked]} disabled>
            <Text style={styles.levelTabEmoji}>🔒</Text>
            <Text style={styles.levelTabText}>Lv.{lvl}</Text>
            <Text style={styles.levelTabSub}>{t.lessons.comingSoon}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Units & Lessons */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedLevelData?.units.map((unit) => (
          <View key={unit.unit} style={styles.unitSection}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitLabel}>UNIT {unit.unit}</Text>
              <Text style={styles.unitTitleKo}>{unit.titleKo}</Text>
            </View>

            {unit.lessons.map((lesson) => {
              const completed = isLessonCompleted(lesson.id);
              const unlocked = isLessonUnlocked(lesson, allLessonsFlat);

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonCard,
                    completed && styles.lessonCardCompleted,
                    !unlocked && styles.lessonCardLocked,
                  ]}
                  onPress={() => unlocked && handleStartLesson(lesson.id)}
                  disabled={!unlocked}
                  activeOpacity={unlocked ? 0.7 : 1}
                >
                  <View style={styles.lessonLeft}>
                    <Text style={styles.lessonEmoji}>{unlocked ? lesson.emoji : '🔒'}</Text>
                    <View style={styles.lessonMeta}>
                      <Text style={[styles.lessonTitle, !unlocked && styles.lockedText]}>
                        {lesson.titleKo}
                      </Text>
                      <Text style={styles.lessonSub}>
                        {lesson.estimatedMinutes}{t.lessons.minUnit} · +{lesson.xpReward} XP
                      </Text>
                    </View>
                  </View>
                  <View style={styles.lessonRight}>
                    {completed ? (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>✓</Text>
                      </View>
                    ) : unlocked ? (
                      <Text style={styles.startArrow}>▶</Text>
                    ) : (
                      <Text style={styles.lockIcon}>🔒</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.h2, color: colors.dark },

  levelSelector: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  levelTab: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelTabActive: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  levelTabLocked: { opacity: 0.45 },
  levelTabEmoji: { fontSize: 20 },
  levelTabText: { ...typography.caption, color: colors.dark, fontWeight: '700', marginTop: 2 },
  levelTabTextActive: { color: colors.primary },
  levelTabSub: { fontSize: 10, color: colors.gray },
  levelTabSubActive: { color: colors.primary },

  content: { paddingHorizontal: spacing.md, gap: spacing.md },

  unitSection: { gap: spacing.sm },
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  unitLabel: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  unitTitleKo: { ...typography.caption, color: colors.gray },

  lessonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  lessonCardCompleted: { borderColor: colors.secondary, backgroundColor: '#F0FFFE' },
  lessonCardLocked: { opacity: 0.5 },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  lessonEmoji: { fontSize: 32 },
  lessonMeta: { flex: 1 },
  lessonTitle: { ...typography.body, color: colors.dark, fontWeight: '600' },
  lockedText: { color: colors.gray },
  lessonSub: { ...typography.caption, color: colors.gray, marginTop: 2 },
  lessonRight: { alignItems: 'center', justifyContent: 'center', width: 32 },

  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  startArrow: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  lockIcon: { fontSize: 16 },
});
