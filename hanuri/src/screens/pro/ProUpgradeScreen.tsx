import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

const BENEFITS = [
  { emoji: '💼', title: '비즈니스 회화', desc: '전문적인 한국어 비즈니스 표현 마스터' },
  { emoji: '📝', title: 'TOPIK 시험 준비', desc: 'AI와 함께하는 실전 TOPIK 훈련' },
  { emoji: '🔁', title: '무제한 AI 대화', desc: '대화 횟수 제한 없이 연습하세요' },
  { emoji: '📊', title: '심화 문법 분석', desc: '자세한 문법 피드백과 교정' },
  { emoji: '🏆', title: '리더보드 뱃지', desc: 'PRO 전용 배지와 순위 표시' },
];

const PLANS = [
  { id: 'monthly', label: '월간', price: '₩9,900', period: '/월', badge: null },
  { id: 'yearly', label: '연간', price: '₩69,900', period: '/년', badge: '40% 할인' },
];

export default function ProUpgradeScreen() {
  const navigation = useNavigation();
  const { upgradeToPro } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    // In production: integrate with expo-in-app-purchases or RevenueCat here
    // For now, simulate a purchase flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    Alert.alert(
      '구독 완료!',
      'HANURI PRO에 오신 것을 환영해요! 모든 PRO 기능이 잠금 해제되었습니다.',
      [
        {
          text: '시작하기',
          onPress: () => {
            upgradeToPro();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={[colors.primary, '#FF8E53']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>HANURI PRO</Text>
          <Text style={styles.heroSub}>한국어 실력을 한 단계 끌어올리세요</Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRO 혜택</Text>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <Text style={styles.benefitEmoji}>{b.emoji}</Text>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요금제 선택</Text>
          <View style={styles.planRow}>
            {PLANS.map((plan) => {
              const selected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selected && styles.planCardSelected]}
                  onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
                  activeOpacity={0.7}
                >
                  {plan.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
                    {plan.label}
                  </Text>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {plan.price}
                  </Text>
                  <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                    {plan.period}
                  </Text>
                  {selected && <View style={styles.planCheck}><Text style={styles.planCheckText}>✓</Text></View>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeBtnText}>
              👑 {selectedPlan === 'yearly' ? '연간 구독 시작하기' : '월간 구독 시작하기'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          언제든지 취소할 수 있습니다. 구독은 자동 갱신됩니다.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { gap: spacing.md, paddingBottom: spacing.xl },

  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  closeBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: colors.white, letterSpacing: 2 },
  heroSub: { ...typography.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.dark, marginBottom: spacing.xs },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  benefitEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  benefitText: { flex: 1 },
  benefitTitle: { ...typography.body, color: colors.dark, fontWeight: '600' },
  benefitDesc: { ...typography.caption, color: colors.gray, marginTop: 2 },
  checkMark: { color: colors.secondary, fontWeight: '800', fontSize: 18 },

  planRow: { flexDirection: 'row', gap: spacing.sm },
  planCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    gap: 4,
    position: 'relative',
  },
  planCardSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  planBadgeText: { fontSize: 10, fontWeight: '800', color: colors.white },
  planLabel: { ...typography.caption, color: colors.gray, fontWeight: '600' },
  planLabelSelected: { color: colors.primary },
  planPrice: { fontSize: 22, fontWeight: '900', color: colors.dark },
  planPriceSelected: { color: colors.primary },
  planPeriod: { ...typography.caption, color: colors.gray },
  planPeriodSelected: { color: colors.primary },
  planCheck: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
  },
  planCheckText: { color: colors.primary, fontWeight: '800' },

  subscribeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    height: 52,
    justifyContent: 'center',
  },
  subscribeBtnText: { ...typography.body, color: colors.white, fontWeight: '800', fontSize: 16 },

  disclaimer: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
});
