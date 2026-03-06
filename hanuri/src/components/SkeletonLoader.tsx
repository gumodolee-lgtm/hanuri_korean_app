import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius: br = 8, style }: SkeletonBoxProps) {
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius: br, backgroundColor: colors.border, opacity: shimmer },
        style,
      ]}
    />
  );
}

// ─── Lesson Card Skeleton ─────────────────────────────────────
export function LessonCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width={48} height={48} borderRadius={borderRadius.md} />
      <View style={styles.cardBody}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="50%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// ─── Stat Row Skeleton ────────────────────────────────────────
export function StatRowSkeleton() {
  return (
    <View style={styles.statRow}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.statBox}>
          <SkeletonBox width={40} height={24} />
          <SkeletonBox width={48} height={12} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

// ─── Full Home Skeleton ───────────────────────────────────────
export function HomeScreenSkeleton() {
  return (
    <View style={styles.page}>
      <StatRowSkeleton />
      <View style={styles.card}>
        <SkeletonBox width="40%" height={16} />
        <SkeletonBox width="100%" height={8} style={{ marginTop: 12 }} borderRadius={borderRadius.full} />
      </View>
      <LessonCardSkeleton />
      <LessonCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardBody: { flex: 1 },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
});
