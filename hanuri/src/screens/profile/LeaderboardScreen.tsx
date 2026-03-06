import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useUserStore } from '../../store/userStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

const MOCK_LEADERS = [
  { rank: 1, name: '민준', flag: '🇰🇷', xp: 3240, streak: 42, level: 4 },
  { rank: 2, name: 'Sarah', flag: '🇺🇸', xp: 2890, streak: 31, level: 3 },
  { rank: 3, name: 'Yuki', flag: '🇯🇵', xp: 2450, streak: 28, level: 3 },
  { rank: 4, name: 'Carlos', flag: '🇪🇸', xp: 1980, streak: 19, level: 2 },
  { rank: 5, name: 'Linh', flag: '🇻🇳', xp: 1720, streak: 15, level: 2 },
  { rank: 6, name: 'Emma', flag: '🇬🇧', xp: 1450, streak: 12, level: 2 },
  { rank: 7, name: 'Zhang Wei', flag: '🇨🇳', xp: 1200, streak: 9, level: 1 },
  { rank: 8, name: 'Anna', flag: '🇩🇪', xp: 980, streak: 7, level: 1 },
  { rank: 9, name: 'Raj', flag: '🇮🇳', xp: 760, streak: 5, level: 1 },
  { rank: 10, name: 'Sofia', flag: '🇮🇹', xp: 540, streak: 3, level: 1 },
];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function LeaderRow({
  rank, name, flag, xp, streak, level, isMe,
}: {
  rank: number; name: string; flag: string; xp: number; streak: number; level: number; isMe?: boolean;
}) {
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.rankCell}>
        {rank <= 3
          ? <Text style={styles.medal}>{MEDAL[rank]}</Text>
          : <Text style={styles.rankNum}>{rank}</Text>}
      </View>
      <Text style={styles.flag}>{flag}</Text>
      <View style={styles.nameCell}>
        <Text style={[styles.name, isMe && styles.nameMe]}>{name}{isMe ? ' (나)' : ''}</Text>
        <Text style={styles.levelLabel}>Lv.{level} · 🔥{streak}</Text>
      </View>
      <View style={styles.xpCell}>
        <Text style={[styles.xp, isMe && styles.xpMe]}>{xp.toLocaleString()}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { xp, streak } = useUserStore();

  const myRank = MOCK_LEADERS.filter((l) => l.xp > xp).length + 1;
  const showMyRow = myRank > 10;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 랭킹</Text>
        <Text style={styles.headerSub}>이번 주 XP 기준</Text>
      </View>

      {/* Top 3 podium */}
      <View style={styles.podium}>
        <View style={[styles.podiumCol, { marginTop: spacing.lg }]}>
          <Text style={styles.podiumFlag}>{MOCK_LEADERS[1].flag}</Text>
          <Text style={styles.podiumMedal}>🥈</Text>
          <Text style={styles.podiumName}>{MOCK_LEADERS[1].name}</Text>
          <Text style={styles.podiumXp}>{MOCK_LEADERS[1].xp.toLocaleString()} XP</Text>
        </View>
        <View style={styles.podiumCol}>
          <Text style={styles.podiumFlag}>{MOCK_LEADERS[0].flag}</Text>
          <Text style={styles.podiumMedal}>🥇</Text>
          <Text style={styles.podiumName}>{MOCK_LEADERS[0].name}</Text>
          <Text style={styles.podiumXp}>{MOCK_LEADERS[0].xp.toLocaleString()} XP</Text>
        </View>
        <View style={[styles.podiumCol, { marginTop: spacing.xl }]}>
          <Text style={styles.podiumFlag}>{MOCK_LEADERS[2].flag}</Text>
          <Text style={styles.podiumMedal}>🥉</Text>
          <Text style={styles.podiumName}>{MOCK_LEADERS[2].name}</Text>
          <Text style={styles.podiumXp}>{MOCK_LEADERS[2].xp.toLocaleString()} XP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MOCK_LEADERS.map((leader) => (
          <LeaderRow key={leader.rank} {...leader} />
        ))}

        {showMyRow && (
          <>
            <View style={styles.separator}>
              <Text style={styles.separatorText}>• • •</Text>
            </View>
            <LeaderRow rank={myRank} name="나" flag="🌟" xp={xp} streak={streak} level={1} isMe />
          </>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            💡 레슨 완료 및 AI 대화로 XP를 얻어 랭킹을 올려보세요!
          </Text>
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.h2, color: colors.dark },
  headerSub: { ...typography.caption, color: colors.gray },

  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  podiumCol: { alignItems: 'center', gap: 4 },
  podiumFlag: { fontSize: 28 },
  podiumMedal: { fontSize: 24 },
  podiumName: { ...typography.caption, color: colors.dark, fontWeight: '700' },
  podiumXp: { fontSize: 10, color: colors.gray },

  list: { paddingHorizontal: spacing.md, gap: spacing.xs },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rowMe: { borderWidth: 2, borderColor: colors.primary, backgroundColor: '#FFF5F5' },
  rankCell: { width: 32, alignItems: 'center' },
  rankNum: { ...typography.body, color: colors.gray, fontWeight: '700' },
  medal: { fontSize: 20 },
  flag: { fontSize: 22 },
  nameCell: { flex: 1 },
  name: { ...typography.body, color: colors.dark, fontWeight: '600' },
  nameMe: { color: colors.primary },
  levelLabel: { ...typography.caption, color: colors.gray },
  xpCell: { alignItems: 'flex-end' },
  xp: { ...typography.body, color: colors.dark, fontWeight: '800' },
  xpMe: { color: colors.primary },
  xpLabel: { fontSize: 10, color: colors.gray },

  separator: { alignItems: 'center', paddingVertical: spacing.xs },
  separatorText: { color: colors.gray },

  notice: {
    backgroundColor: colors.secondary + '18',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeText: { ...typography.caption, color: colors.dark, textAlign: 'center', lineHeight: 20 },
});
