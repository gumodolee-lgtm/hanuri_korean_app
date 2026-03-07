import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { NativeLanguage } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingLanguage'>;

const NEXT_LABELS: Record<NativeLanguage, string> = {
  en: 'Next →', ko: '다음 →', es: 'Siguiente →', zh: '下一步 →', ja: '次へ →', vi: 'Tiếp theo →',
};

const languages: { code: NativeLanguage; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>🌏</Text>
        <Text style={styles.title}>What language do you speak?</Text>
        <Text style={styles.subtitle}>어떤 언어로 설명해 드릴까요?</Text>

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
      </ScrollView>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>{NEXT_LABELS[selected]}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  progressRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginTop: spacing.lg },
  title: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.gray, textAlign: 'center' },
  options: { gap: spacing.sm, marginTop: spacing.xs },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.md, borderWidth: 2, borderColor: 'transparent',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  flag: { fontSize: 28 },
  optionText: { ...typography.body, color: colors.dark },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  nextBtn: {
    backgroundColor: colors.primary, margin: spacing.lg,
    borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
