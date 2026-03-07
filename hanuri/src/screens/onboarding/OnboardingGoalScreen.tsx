import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { LearningGoal } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingGoal'>;

const GOAL_ICONS: Record<LearningGoal, string> = {
  kpop: '🎵', travel: '✈️', business: '💼', topik: '📝', relationship: '❤️',
};

export default function OnboardingGoalScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData } = useAuthStore();
  const t = useT();
  const [selected, setSelected] = React.useState<LearningGoal>('kpop');

  const goals: { code: LearningGoal; label: string }[] = [
    { code: 'kpop', label: t.onboarding.goals.kpop },
    { code: 'travel', label: t.onboarding.goals.travel },
    { code: 'business', label: t.onboarding.goals.business },
    { code: 'topik', label: t.onboarding.goals.topik },
    { code: 'relationship', label: t.onboarding.goals.relationship },
  ];

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
        <Text style={styles.title}>{t.onboarding.goalTitle}</Text>

        <View style={styles.options}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.code}
              style={[styles.option, selected === goal.code && styles.optionSelected]}
              onPress={() => setSelected(goal.code)}
            >
              <Text style={styles.icon}>{GOAL_ICONS[goal.code]}</Text>
              <Text style={[styles.optionText, selected === goal.code && styles.optionTextSelected]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>{t.onboarding.next}</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 2, borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  icon: { fontSize: 24 },
  optionText: { ...typography.body, color: colors.dark },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  nextBtn: {
    backgroundColor: colors.primary, margin: spacing.lg,
    borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
