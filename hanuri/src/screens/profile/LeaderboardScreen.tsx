import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { fetchLeaderboard, LeaderEntry } from '../../services/dbService';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

const LANG_TO_FLAG: Record<string, string> = {
  en: '🇺🇸', ko: '🇰🇷', es: '🇪🇸', zh: '🇨🇳', ja: '🇯🇵', vi: '🇻🇳',
};

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
  const t = useT();
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.rankCell}>
        {rank <= 3
          ? <Text style={styles.medal}>{MEDAL[rank]}</Text>
          : <Text style={styles.rankNum}>{rank}</Text>}
      </View>
      <Text style={styles.flag}>{flag}</Text>
      <View style={styles.nameCell}>
        <Text style={[styles.name, isMe && styles.nameMe]}>{name}{isMe ? ` ${t.leaderboard.meSuffix}` : ''}</Text>
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
  const { user } = useAuthStore();
  const t = useT();

  // Derive isGuest before useState so we can use it as the initial loading value
  const isGuest = !user || user.id.startsWith('guest_');
  const currentLevel = user?.current_level ?? 1;

  const [entries, setEntries] = useState(MOCK_LEADERS);
  // H-1 fix: start loading=true for authenticated users to avoid flash of mock content
  const [loading, setLoading] = useState(!isGuest);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    if (isGuest) return; // guests see mock data
    const data = await fetchLeaderboard(10);
    if (data.length === 0) return; // RLS blocked or empty — keep mock
    const mapped = data.map((entry: LeaderEntry, i: number) => {
      const isCurrentUser = entry.userId === user?.id;
      return {
        rank: i + 1,
        // M-2 fix: use boolean isCurrentUser field, not string comparison
        name: isCurrentUser ? t.leaderboard.meSuffix : `학습자 ${i + 1}`,
        flag: LANG_TO_FLAG[entry.nativeLang] ?? '🌍',
        // H-2 fix: override current user's xp/streak with fresh userStore values
        xp: isCurrentUser ? xp : entry.xp,
        streak: isCurrentUser ? streak : entry.streak,
        level: entry.level,
        isCurrentUser,
      };
    });
    setEntries(mapped);
  }, [isGuest, user?.id, xp, streak, t.leaderboard.meSuffix]);

  useEffect(() => {
    // M-1 fix: only set loading for authenticated users
    if (!isGuest) {
      setLoading(true);
      loadLeaderboard().finally(() => setLoading(false));
    }
  }, [isGuest, loadLeaderboard]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  // meInTop via isCurrentUser field (M-2 fix: no locale-sensitive string comparison)
  const meInTop = (entries as any[]).some((l) => l.isCurrentUser === true);
  const myRank = meInTop ? 0 : entries.filter((l) => l.xp > xp).length + 1;
  const showMyRow = !meInTop;

  const top3 = entries.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.leaderboard.title}</Text>
        <Text style={styles.headerSub}>{t.leaderboard.subtitle}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length >= 3 && (
            <View style={styles.podium}>
              <View style={[styles.podiumCol, { marginTop: spacing.lg }]}>
                <Text style={styles.podiumFlag}>{top3[1].flag}</Text>
                <Text style={styles.podiumMedal}>🥈</Text>
                <Text style={styles.podiumName}>{top3[1].name}</Text>
                <Text style={styles.podiumXp}>{top3[1].xp.toLocaleString()} XP</Text>
              </View>
              <View style={styles.podiumCol}>
                <Text style={styles.podiumFlag}>{top3[0].flag}</Text>
                <Text style={styles.podiumMedal}>🥇</Text>
                <Text style={styles.podiumName}>{top3[0].name}</Text>
                <Text style={styles.podiumXp}>{top3[0].xp.toLocaleString()} XP</Text>
              </View>
              <View style={[styles.podiumCol, { marginTop: spacing.xl }]}>
                <Text style={styles.podiumFlag}>{top3[2].flag}</Text>
                <Text style={styles.podiumMedal}>🥉</Text>
                <Text style={styles.podiumName}>{top3[2].name}</Text>
                <Text style={styles.podiumXp}>{top3[2].xp.toLocaleString()} XP</Text>
              </View>
            </View>
          )}

          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
            }
          >
            {entries.map((leader) => (
              <LeaderRow key={leader.rank} {...leader} isMe={leader.name === t.leaderboard.meSuffix} />
            ))}

            {showMyRow && (
              <>
                <View style={styles.separator}>
                  <Text style={styles.separatorText}>• • •</Text>
                </View>
                <LeaderRow
                  rank={myRank}
                  name={t.leaderboard.meSuffix}
                  flag={LANG_TO_FLAG[user?.native_lang ?? 'en'] ?? '🌟'}
                  xp={xp}
                  streak={streak}
                  level={currentLevel}
                  isMe
                />
              </>
            )}

            <View style={styles.notice}>
              <Text style={styles.noticeText}>{t.leaderboard.notice}</Text>
            </View>
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </>
      )}
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
