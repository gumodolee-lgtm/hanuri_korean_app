import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { DailyGoalMinutes } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingTime'>;

const timeOptions: { minutes: DailyGoalMinutes; label: string; sub: string; recommended?: boolean }[] = [
  { minutes: 5, label: '5분', sub: '가볍게' },
  { minutes: 15, label: '15분', sub: '추천', recommended: true },
  { minutes: 30, label: '30분', sub: '집중 학습' },
];

export default function OnboardingTimeScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData } = useAuthStore();
  const [selected, setSelected] = React.useState<DailyGoalMinutes>(15);

  const handleNext = () => {
    setOnboardingData({ dailyGoalMinutes: selected });
    navigation.navigate('OnboardingNotification');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i <= 4 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>⏰</Text>
        <Text style={styles.title}>하루 몇 분 학습할까요?</Text>

        <View style={styles.optionRow}>
          {timeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.minutes}
              style={[styles.option, selected === opt.minutes && styles.optionSelected]}
              onPress={() => setSelected(opt.minutes)}
            >
              {opt.recommended && <Text style={styles.badge}>⭐</Text>}
              <Text style={[styles.optionLabel, selected === opt.minutes && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
              <Text style={styles.optionSub}>{opt.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>
            💡 15분/일 → 3개월 후 기초 회화 가능!
          </Text>
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
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  progressRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: spacing.lg },
  title: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  optionRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  option: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 90,
    justifyContent: 'center',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  badge: { fontSize: 16 },
  optionLabel: { ...typography.h3, color: colors.dark },
  optionLabelSelected: { color: colors.primary },
  optionSub: { ...typography.caption, color: colors.gray },
  tip: {
    backgroundColor: colors.secondary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  tipText: { ...typography.body, color: colors.dark, textAlign: 'center' },
  nextBtn: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
