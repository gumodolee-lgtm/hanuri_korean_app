import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { SCENARIOS, ScenarioData } from '../../data/scenarios';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<RootStackParamList>;

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '초급',
  2: '중하급',
  3: '중급',
  4: '중상급',
  5: '고급',
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#4ECDC4',
  2: '#6BCB77',
  3: '#FFD93D',
  4: '#FF9F1C',
  5: '#FF6B6B',
};

function DifficultyDots({ level }: { level: number }) {
  return (
    <View style={styles.dots}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i <= level ? DIFFICULTY_COLORS[level] : colors.border },
          ]}
        />
      ))}
    </View>
  );
}

function ScenarioCard({
  scenario,
  onPress,
  locked,
}: {
  scenario: ScenarioData;
  onPress: () => void;
  locked: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, scenario.isPro && styles.cardPro, locked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.cardLeft}>
        <Text style={[styles.cardEmoji, locked && { opacity: 0.4 }]}>{scenario.emoji}</Text>
        {locked && <Text style={styles.lockIcon}>🔒</Text>}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, locked && styles.cardTitleLocked]}>{scenario.titleKo}</Text>
          {scenario.isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardDesc}>{scenario.description}</Text>
        {locked ? (
          <Text style={styles.lockHint}>PRO로 업그레이드하면 이용할 수 있어요</Text>
        ) : (
          <View style={styles.cardFooter}>
            <DifficultyDots level={scenario.difficulty} />
            <Text style={[styles.diffLabel, { color: DIFFICULTY_COLORS[scenario.difficulty] }]}>
              {DIFFICULTY_LABELS[scenario.difficulty]}
            </Text>
            <View style={styles.tagsRow}>
              {scenario.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      <Text style={styles.arrow}>{locked ? '›' : '›'}</Text>
    </TouchableOpacity>
  );
}

export default function AIHubScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const isPro = user?.isPro ?? false;

  const handleStart = (scenario: ScenarioData) => {
    if (scenario.isPro && !isPro) {
      navigation.navigate('ProUpgrade');
      return;
    }
    navigation.navigate('AIChat', { scenarioId: scenario.id });
  };

  const freeScenarios = SCENARIOS.filter((s) => !s.isPro);
  const proScenarios = SCENARIOS.filter((s) => s.isPro);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗣️ AI 대화</Text>
        <Text style={styles.headerSub}>원하는 상황을 선택하고 AI와 한국어로 대화해봐요</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Free scenarios */}
        <Text style={styles.sectionTitle}>무료 시나리오</Text>
        {freeScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            locked={false}
            onPress={() => handleStart(scenario)}
          />
        ))}

        {/* Pro scenarios */}
        <View style={styles.proSectionHeader}>
          <Text style={styles.sectionTitle}>PRO 시나리오</Text>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeChip}
              onPress={() => navigation.navigate('ProUpgrade')}
            >
              <Text style={styles.upgradeChipText}>👑 업그레이드</Text>
            </TouchableOpacity>
          )}
        </View>
        {proScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            locked={!isPro}
            onPress={() => handleStart(scenario)}
          />
        ))}

        {/* Tips */}
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 AI 대화 팁</Text>
          <Text style={styles.tipText}>• 틀려도 괜찮아요! AI가 자동으로 교정해줘요</Text>
          <Text style={styles.tipText}>• 한국어로만 대화하면 실력이 훨씬 빨리 늘어요</Text>
          <Text style={styles.tipText}>• [교정:] 부분을 꼭 읽어보세요</Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.h2, color: colors.dark },
  headerSub: { ...typography.caption, color: colors.gray, marginTop: 4 },

  content: { paddingHorizontal: spacing.md, gap: spacing.sm },

  sectionTitle: {
    ...typography.h3,
    color: colors.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  proSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  upgradeChip: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  upgradeChipText: { fontSize: 12, fontWeight: '800', color: colors.dark },

  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPro: { borderColor: '#FFD93D', backgroundColor: '#FFFEF0' },
  cardLocked: { opacity: 0.7 },
  cardLeft: { alignItems: 'center', justifyContent: 'center', width: 44 },
  lockIcon: { fontSize: 14, position: 'absolute', bottom: -4, right: -4 },
  cardEmoji: { fontSize: 32 },
  cardBody: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardTitle: { ...typography.body, color: colors.dark, fontWeight: '700' },
  proBadge: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: colors.dark },
  cardDesc: { ...typography.caption, color: colors.gray },
  cardTitleLocked: { color: colors.gray },
  lockHint: { ...typography.caption, color: colors.primary, marginTop: 4, fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  diffLabel: { fontSize: 11, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'flex-end' },
  tag: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: colors.gray },
  arrow: { fontSize: 24, color: colors.gray },

  tipBox: {
    backgroundColor: colors.secondary + '18',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tipTitle: { ...typography.body, color: colors.dark, fontWeight: '700', marginBottom: spacing.xs },
  tipText: { ...typography.caption, color: colors.dark, lineHeight: 20 },
});
