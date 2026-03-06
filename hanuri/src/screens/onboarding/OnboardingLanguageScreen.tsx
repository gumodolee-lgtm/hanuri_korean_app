import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { NativeLanguage } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingLanguage'>;

const languages: { code: NativeLanguage; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
];

export default function OnboardingLanguageScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData } = useAuthStore();
  const [selected, setSelected] = React.useState<NativeLanguage>('en');

  const handleNext = () => {
    setOnboardingData({ nativeLanguage: selected });
    navigation.navigate('OnboardingGoal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>🌏</Text>
        <Text style={styles.title}>어떤 언어로 설명해{'\n'}드릴까요?</Text>

        <View style={styles.options}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.option, selected === lang.code && styles.optionSelected]}
              onPress={() => setSelected(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.optionText, selected === lang.code && styles.optionTextSelected]}>
                {lang.label}
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
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  progressRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: spacing.xl },
  title: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  options: { gap: spacing.sm, marginTop: spacing.md },
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
  flag: { fontSize: 28 },
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
