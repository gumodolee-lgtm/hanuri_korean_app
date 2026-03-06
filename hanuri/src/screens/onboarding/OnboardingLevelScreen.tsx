import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingLevel'>;

const levels = [
  { icon: '🌱', label: '완전 처음이에요', value: 1 },
  { icon: '🌿', label: '한글은 읽을 수 있어요', value: 2 },
  { icon: '🌳', label: '기초 회화 가능해요', value: 3 },
  { icon: '⚡', label: '중급 이상이에요', value: 5 },
];

export default function OnboardingLevelScreen() {
  const navigation = useNavigation<NavProp>();
  const [selected, setSelected] = React.useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i <= 3 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>📊</Text>
        <Text style={styles.title}>현재 한국어 실력은?</Text>

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

        <TouchableOpacity style={styles.testLink}>
          <Text style={styles.testLinkText}>→ 레벨 테스트로 확인하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate('OnboardingTime')}
      >
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
  testLink: { alignItems: 'center', marginTop: spacing.sm },
  testLinkText: { ...typography.body, color: colors.secondary, fontWeight: '600' },
  nextBtn: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
