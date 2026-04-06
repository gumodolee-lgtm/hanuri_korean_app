import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

const BENEFIT_EMOJIS = ['💼', '📝', '🔁', '📊', '🏆'];

export default function ProUpgradeScreen() {
  const navigation = useNavigation();
  const { upgradeToPro } = useAuthStore();
  const t = useT();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const BENEFITS = [
    { emoji: BENEFIT_EMOJIS[0], title: t.proUpgrade.benefit1Title, desc: t.proUpgrade.benefit1Desc },
    { emoji: BENEFIT_EMOJIS[1], title: t.proUpgrade.benefit2Title, desc: t.proUpgrade.benefit2Desc },
    { emoji: BENEFIT_EMOJIS[2], title: t.proUpgrade.benefit3Title, desc: t.proUpgrade.benefit3Desc },
    { emoji: BENEFIT_EMOJIS[3], title: t.proUpgrade.benefit4Title, desc: t.proUpgrade.benefit4Desc },
    { emoji: BENEFIT_EMOJIS[4], title: t.proUpgrade.benefit5Title, desc: t.proUpgrade.benefit5Desc },
  ];

  const PLANS = [
    { id: 'monthly', label: t.proUpgrade.monthly, price: '₩9,900', period: '/월', badge: null },
    { id: 'yearly', label: t.proUpgrade.yearly, price: '₩69,900', period: '/년', badge: t.proUpgrade.yearlyBadge },
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    // In production: integrate with expo-in-app-purchases or RevenueCat here
    // For now, simulate a purchase flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    Alert.alert(
      t.proUpgrade.successTitle,
      t.proUpgrade.successMsg,
      [
        {
          text: t.proUpgrade.successBtn,
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
          <Text style={styles.heroSub}>{t.proUpgrade.heroSub}</Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.proUpgrade.benefitsTitle}</Text>
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
          <Text style={styles.sectionTitle}>{t.proUpgrade.planTitle}</Text>
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
              👑 {selectedPlan === 'yearly' ? t.proUpgrade.subscribeYearly : t.proUpgrade.subscribeMonthly}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t.proUpgrade.disclaimer}</Text>

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
