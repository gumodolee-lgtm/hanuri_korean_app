import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleStreakWarning,
} from '../../services/notificationService';

const TIME_TO_HOUR: Record<string, number> = {
  '08:00': 8,
  '19:00': 19,
  '22:00': 22,
};

export default function OnboardingNotificationScreen() {
  const { completeOnboarding } = useAuthStore();
  const t = useT();
  const [selected, setSelected] = React.useState('08:00');

  const timeSlots = [
    { icon: '🌅', label: t.onboarding.notifMorning, sub: t.onboarding.recommended, value: '08:00' },
    { icon: '🌆', label: t.onboarding.notifEvening, sub: '', value: '19:00' },
    { icon: '🌙', label: t.onboarding.notifNight, sub: '', value: '22:00' },
  ];

  const handleComplete = async () => {
    const hour = TIME_TO_HOUR[selected] ?? 20;
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleDailyReminder({ hour, minute: 0, title: t.notifContent.dailyTitle, body: t.notifContent.dailyBody });
      await scheduleStreakWarning({ title: t.notifContent.streakTitle, body: t.notifContent.streakBody });
    }
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>{t.onboarding.notifTitle}</Text>

        <View style={styles.options}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.value}
              style={[styles.option, selected === slot.value && styles.optionSelected]}
              onPress={() => setSelected(slot.value)}
            >
              <Text style={styles.icon}>{slot.icon}</Text>
              <Text style={[styles.optionText, selected === slot.value && styles.optionTextSelected]}>
                {slot.label}
              </Text>
              {slot.sub ? <Text style={styles.badge}>{slot.sub}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleComplete}>
          <Text style={styles.nextBtnText}>{t.onboarding.startApp}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={styles.skipText}>{t.onboarding.skip}</Text>
        </TouchableOpacity>
      </View>
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
  optionText: { ...typography.body, color: colors.dark, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  badge: {
    backgroundColor: colors.secondary + '30', paddingHorizontal: spacing.sm,
    paddingVertical: 2, borderRadius: borderRadius.full, fontSize: 12,
    color: colors.dark, fontWeight: '600', overflow: 'hidden',
  },
  footer: { padding: spacing.lg, gap: spacing.sm },
  nextBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
  skipText: { ...typography.body, color: colors.gray, textAlign: 'center' },
});
