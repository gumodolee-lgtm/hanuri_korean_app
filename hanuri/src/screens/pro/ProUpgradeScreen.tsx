import React, { useState, useEffect, useMemo } from 'react';
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
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { useAuthStore } from '../../store/authStore';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useT } from '../../i18n';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isPro,
} from '../../services/revenuecatService';

const BENEFIT_EMOJIS = ['💼', '📝', '🔁', '📊', '🏆'];

type PlanId = 'monthly' | 'yearly' | 'lifetime';

interface PlanConfig {
  id: PlanId;
  packageType: PACKAGE_TYPE;
  badge: string | null;
}

const PLAN_CONFIGS: PlanConfig[] = [
  { id: 'monthly', packageType: PACKAGE_TYPE.MONTHLY, badge: null },
  { id: 'yearly', packageType: PACKAGE_TYPE.ANNUAL, badge: null },
  { id: 'lifetime', packageType: PACKAGE_TYPE.LIFETIME, badge: null },
];

export default function ProUpgradeScreen() {
  const navigation = useNavigation();
  const { upgradeToPro } = useAuthStore();
  const t = useT();
  const { colors } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packages, setPackages] = useState<Partial<Record<PlanId, PurchasesPackage>>>({});
  const [loadingError, setLoadingError] = useState(false);

  const BENEFITS = [
    { emoji: BENEFIT_EMOJIS[0], title: t.proUpgrade.benefit1Title, desc: t.proUpgrade.benefit1Desc },
    { emoji: BENEFIT_EMOJIS[1], title: t.proUpgrade.benefit2Title, desc: t.proUpgrade.benefit2Desc },
    { emoji: BENEFIT_EMOJIS[2], title: t.proUpgrade.benefit3Title, desc: t.proUpgrade.benefit3Desc },
    { emoji: BENEFIT_EMOJIS[3], title: t.proUpgrade.benefit4Title, desc: t.proUpgrade.benefit4Desc },
    { emoji: BENEFIT_EMOJIS[4], title: t.proUpgrade.benefit5Title, desc: t.proUpgrade.benefit5Desc },
  ];

  const PLAN_LABELS: Record<PlanId, string> = {
    monthly: t.proUpgrade.monthly,
    yearly: t.proUpgrade.yearly,
    lifetime: t.proUpgrade.lifetime,
  };
  const PLAN_PERIODS: Record<PlanId, string> = {
    monthly: t.proUpgrade.periodMonthly,
    yearly: t.proUpgrade.periodYearly,
    lifetime: t.proUpgrade.periodLifetime,
  };
  const PLAN_BADGES: Record<PlanId, string | null> = {
    monthly: null,
    yearly: t.proUpgrade.yearlyBadge,
    lifetime: t.proUpgrade.lifetimeBadge,
  };
  const SUBSCRIBE_LABELS: Record<PlanId, string> = {
    monthly: t.proUpgrade.subscribeMonthly,
    yearly: t.proUpgrade.subscribeYearly,
    lifetime: t.proUpgrade.subscribeLifetime,
  };

  useEffect(() => {
    (async () => {
      try {
        const offering = await getOfferings();
        if (!offering) { setLoadingError(true); return; }

        const mapped: Partial<Record<PlanId, PurchasesPackage>> = {};
        for (const pkg of offering.availablePackages) {
          const config = PLAN_CONFIGS.find((c) => c.packageType === pkg.packageType);
          if (config) mapped[config.id] = pkg;
        }
        setPackages(mapped);
      } catch {
        setLoadingError(true);
      }
    })();
  }, []);

  const handleSubscribe = async () => {
    const pkg = packages[selectedPlan];
    if (!pkg) {
      Alert.alert('', t.proUpgrade.purchaseFailed);
      return;
    }
    try {
      setIsLoading(true);
      const customerInfo = await purchasePackage(pkg);
      if (isPro(customerInfo)) {
        upgradeToPro();
        Alert.alert(t.proUpgrade.successTitle, t.proUpgrade.successMsg, [
          { text: t.proUpgrade.successBtn, onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'PURCHASE_CANCELLED') {
        Alert.alert('', t.proUpgrade.purchaseFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const customerInfo = await restorePurchases();
      if (isPro(customerInfo)) {
        upgradeToPro();
        Alert.alert('', t.proUpgrade.restoreSuccess, [
          { text: t.proUpgrade.successBtn, onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('', t.proUpgrade.restoreFailed);
      }
    } catch {
      Alert.alert('', t.proUpgrade.restoreFailed);
    } finally {
      setIsRestoring(false);
    }
  };

  const hasPackages = Object.keys(packages).length > 0;

  const styles = useMemo(() => StyleSheet.create({
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

    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center', paddingVertical: spacing.md },
    loadingText: { ...typography.caption, color: colors.gray },
    errorText: { ...typography.caption, color: colors.primary, textAlign: 'center', paddingVertical: spacing.sm },

    planRow: { flexDirection: 'row', gap: spacing.sm },
    planCard: {
      flex: 1,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      gap: 4,
      position: 'relative',
      minHeight: 90,
      justifyContent: 'center',
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
    planBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white },
    planLabel: { ...typography.caption, color: colors.gray, fontWeight: '600', fontSize: 11 },
    planLabelSelected: { color: colors.primary },
    planPrice: { fontSize: 18, fontWeight: '900', color: colors.dark },
    planPriceSelected: { color: colors.primary },
    planPeriod: { ...typography.caption, color: colors.gray, fontSize: 10 },
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
    subscribeBtnDisabled: { opacity: 0.6 },
    subscribeBtnText: { ...typography.body, color: colors.white, fontWeight: '800', fontSize: 16 },

    restoreBtn: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.md,
    },
    restoreBtnText: { ...typography.caption, color: colors.gray, textDecorationLine: 'underline' },

    disclaimer: {
      ...typography.caption,
      color: colors.gray,
      textAlign: 'center',
      marginHorizontal: spacing.lg,
    },
  }), [colors]);

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

          {!hasPackages && !loadingError && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>{t.proUpgrade.loadingProducts}</Text>
            </View>
          )}

          {loadingError && (
            <Text style={styles.errorText}>{t.proUpgrade.purchaseFailed}</Text>
          )}

          {hasPackages && (
            <View style={styles.planRow}>
              {PLAN_CONFIGS.map((config) => {
                const pkg = packages[config.id];
                if (!pkg) return null;
                const selected = selectedPlan === config.id;
                const badge = PLAN_BADGES[config.id];
                return (
                  <TouchableOpacity
                    key={config.id}
                    style={[styles.planCard, selected && styles.planCardSelected]}
                    onPress={() => setSelectedPlan(config.id)}
                    activeOpacity={0.7}
                  >
                    {badge && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{badge}</Text>
                      </View>
                    )}
                    <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>
                      {PLAN_LABELS[config.id]}
                    </Text>
                    <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                      {pkg.product.priceString}
                    </Text>
                    <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                      {PLAN_PERIODS[config.id]}
                    </Text>
                    {selected && <View style={styles.planCheck}><Text style={styles.planCheckText}>✓</Text></View>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={[styles.subscribeBtn, (!hasPackages || isLoading) && styles.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={!hasPackages || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeBtnText}>
              👑 {SUBSCRIBE_LABELS[selectedPlan]}
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore purchases */}
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={isRestoring}
          activeOpacity={0.7}
        >
          {isRestoring ? (
            <ActivityIndicator color={colors.gray} size="small" />
          ) : (
            <Text style={styles.restoreBtnText}>{t.proUpgrade.restore}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t.proUpgrade.disclaimer}</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

