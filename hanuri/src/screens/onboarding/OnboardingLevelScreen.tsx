import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingLevel'>;

export default function OnboardingLevelScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData, onboardingData } = useAuthStore();
  const t = useT();
  // 레벨 테스트 결과가 있으면 그 값을 초기값으로 사용
  const [selected, setSelected] = React.useState(onboardingData.currentLevel ?? 1);

  const levels = [
    { icon: '🌱', label: t.onboarding.levels.absolute, value: 1 },
    { icon: '🌿', label: t.onboarding.levels.canRead, value: 2 },
    { icon: '🌳', label: t.onboarding.levels.basicConv, value: 3 },
    { icon: '⚡', label: t.onboarding.levels.intermediate, value: 5 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i <= 3 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>📊</Text>
        <Text style={styles.title}>{t.onboarding.levelTitle}</Text>

        <View style={styles.options}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.option, selected === level.value && styles.optionSelected]}
              onPress={() => setSelected(level.value)}
            >
              <Text style={styles.icon}>{level.icon}</Text>
              <Text style={[styles.optionText, selected === level.value && styles.optionTextSelected]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.testLink} onPress={() => navigation.navigate('OnboardingLevelTest')}>
          <Text style={styles.testLinkText}>{t.onboarding.levelTest}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={() => { setOnboardingData({ currentLevel: selected }); navigation.navigate('OnboardingTime'); }}>
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
  testLink: { alignItems: 'center', marginTop: spacing.sm },
  testLinkText: { ...typography.body, color: colors.secondary, fontWeight: '600' },
  nextBtn: {
    backgroundColor: colors.primary, margin: spacing.lg,
    borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
