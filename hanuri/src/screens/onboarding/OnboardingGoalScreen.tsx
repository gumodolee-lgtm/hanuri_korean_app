import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { LearningGoal } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingGoal'>;

const goals: { code: LearningGoal; icon: string; label: string }[] = [
  { code: 'kpop', icon: '🎵', label: 'K-팝 & K-드라마' },
  { code: 'travel', icon: '✈️', label: '한국 여행' },
  { code: 'business', icon: '💼', label: '비즈니스 & 취업' },
  { code: 'topik', icon: '📝', label: 'TOPIK 시험 준비' },
  { code: 'relationship', icon: '❤️', label: '한국인 친구/연인' },
];

export default function OnboardingGoalScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData } = useAuthStore();
  const [selected, setSelected] = React.useState<LearningGoal>('kpop');

  const handleNext = () => {
    setOnboardingData({ learningGoal: selected });
    navigation.navigate('OnboardingLevel');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>왜 한국어를 배우나요?</Text>

        <View style={styles.options}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.code}
              style={[styles.option, selected === goal.code && styles.optionSelected]}
              onPress={() => setSelected(goal.code)}
            >
              <Text style={styles.icon}>{goal.icon}</Text>
              <Text style={[styles.optionText, selected === goal.code && styles.optionTextSelected]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>다음 →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  progressRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: spacing.lg },
  title: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  icon: { fontSize: 24 },
  optionText: { ...typography.body, color: colors.dark },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  nextBtn: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
