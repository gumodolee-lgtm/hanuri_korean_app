import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

type NavProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;
type RouteType = RouteProp<RootStackParamList, 'LessonComplete'>;

export default function LessonCompleteScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { xp, score, expressions } = route.params;
  const t = useT();

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const getRating = () => {
    if (score >= 90) return { emoji: '🏆', label: t.lessonComplete.perfect, color: '#FFD93D' };
    if (score >= 70) return { emoji: '⭐', label: t.lessonComplete.great, color: colors.secondary };
    return { emoji: '💪', label: t.lessonComplete.tryAgain, color: colors.primary };
  };

  const rating = getRating();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

        {/* Trophy */}
        <Animated.View style={[styles.trophyWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.trophyEmoji}>{rating.emoji}</Text>
        </Animated.View>

        <Text style={styles.title}>{t.lessonComplete.title}</Text>
        <Text style={[styles.ratingLabel, { color: rating.color }]}>{rating.label}</Text>

        {/* Score Cards */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{score}%</Text>
            <Text style={styles.scoreLabel}>{t.lessonComplete.accuracy}</Text>
          </View>
          <View style={[styles.scoreCard, styles.scoreCardXP]}>
            <Text style={[styles.scoreValue, { color: colors.white }]}>+{xp}</Text>
            <Text style={[styles.scoreLabel, { color: 'rgba(255,255,255,0.85)' }]}>{t.lessonComplete.xpEarned}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{expressions.length}</Text>
            <Text style={styles.scoreLabel}>{t.lessonComplete.wordsLearned}</Text>
          </View>
        </View>

        {/* Learned Expressions */}
        <View style={styles.expressionBox}>
          <Text style={styles.expressionTitle}>{t.lessonComplete.expressionsTitle}</Text>
          {expressions.map((expr, i) => (
            <View key={i} style={styles.expressionRow}>
              <Text style={styles.expressionBullet}>•</Text>
              <Text style={styles.expressionText}>{expr}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.primaryBtnText}>{t.lessonComplete.goHome}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Lessons' })}
          >
            <Text style={styles.secondaryBtnText}>{t.lessonComplete.nextLesson}</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },

  trophyWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  trophyEmoji: { fontSize: 64 },

  title: { ...typography.h1, color: colors.dark, textAlign: 'center' },
  ratingLabel: { ...typography.h3, textAlign: 'center' },

  scoreRow: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  scoreCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreCardXP: { backgroundColor: colors.primary },
  scoreValue: { fontSize: 28, fontWeight: '800', color: colors.dark },
  scoreLabel: { ...typography.caption, color: colors.gray },

  expressionBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
    gap: spacing.xs,
  },
  expressionTitle: { ...typography.body, color: colors.dark, fontWeight: '700', marginBottom: spacing.xs },
  expressionRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  expressionBullet: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  expressionText: { ...typography.body, color: colors.dark },

  actions: { width: '100%', gap: spacing.sm },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryBtnText: { ...typography.body, color: colors.dark },
});
