import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { syncStats, syncProgress } from '../../services/dbService';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { NativeLanguage, LearningGoal, DailyGoalMinutes } from '../../types';
import { useT } from '../../i18n';

WebBrowser.maybeCompleteAuthSession();

type NavProp = StackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();
  const { loginWithSupabase } = useAuthStore();
  const { loadFromRemote } = useUserStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const t = useT();
  const { colors } = useTheme();

  const handleGoogleLogin = async () => {
    if (!supabase || !isSupabaseConfigured) {
      Alert.alert(
        'Setup Required',
        'Google sign-in needs Supabase env vars. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, or use Start for Free for guest mode.'
      );
      return;
    }

    try {
      setIsGoogleLoading(true);

      const redirectUrl = makeRedirectUri({ scheme: 'hanuri' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        throw error ?? new Error('OAuth URL not received');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        // Supabase returns tokens in hash fragment (#access_token=...) not query params
        const hashParams = new URLSearchParams(
          url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
        );
        const accessToken = hashParams.get('access_token') ?? url.searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') ?? url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

          if (sessionError) throw sessionError;

          const supaUser = sessionData.user;
          if (supaUser) {
            // 로그인 전 게스트 데이터 캡처 (이전용)
            const guestState = useUserStore.getState();
            const hadGuestData = guestState.xp > 0 || guestState.progress.length > 0;

            const { user: currentUser } = useAuthStore.getState();
            const appUser = {
              id: supaUser.id,
              email: supaUser.email ?? '',
              native_lang: (currentUser?.native_lang ?? 'en') as NativeLanguage,
              current_level: currentUser?.current_level ?? 1,
              xp: 0,
              streak: 0,
              daily_goal_minutes: (currentUser?.daily_goal_minutes ?? 15) as DailyGoalMinutes,
              learning_goal: (currentUser?.learning_goal ?? 'travel') as LearningGoal,
              created_at: supaUser.created_at,
            };
            // Sync profile & fetch remote data
            await loginWithSupabase(appUser);
            await loadFromRemote(supaUser.id);

            // 게스트 데이터가 있었고 서버 데이터가 비어있으면 게스트 데이터를 서버로 이전
            if (hadGuestData) {
              const serverState = useUserStore.getState();
              // 서버 XP가 0이면 게스트 데이터가 더 많으므로 이전
              if (serverState.xp === 0 && guestState.xp > 0) {
                const mergedXp = guestState.xp;
                const mergedStreak = guestState.streak;
                const mergedLastStreakDate = guestState.lastStreakDate;
                const mergedTodayMinutes = guestState.todayMinutes;
                useUserStore.setState({
                  xp: mergedXp,
                  streak: mergedStreak,
                  lastStreakDate: mergedLastStreakDate,
                  todayMinutes: mergedTodayMinutes,
                  progress: guestState.progress.map((p) => ({ ...p, user_id: supaUser.id })),
                });
                // 서버에 동기화
                await syncStats(supaUser.id, {
                  xp: mergedXp,
                  streak: mergedStreak,
                  lastStreakDate: mergedLastStreakDate,
                  todayMinutes: mergedTodayMinutes,
                });
                for (const p of guestState.progress) {
                  await syncProgress(supaUser.id, { ...p, user_id: supaUser.id });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      Alert.alert(t.splash.loginFailedTitle, t.splash.loginFailedMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!supabase || !isSupabaseConfigured) {
      Alert.alert('Setup Required', 'Apple sign-in needs Supabase env vars.');
      return;
    }

    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      Alert.alert(t.splash.loginFailedTitle, t.splash.appleNotAvailable);
      return;
    }

    try {
      setIsAppleLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identity token not received');
      }

      const { data: sessionData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      const supaUser = sessionData.user;
      if (supaUser) {
        const guestState = useUserStore.getState();
        const hadGuestData = guestState.xp > 0 || guestState.progress.length > 0;

        const { user: currentUser } = useAuthStore.getState();
        const appUser = {
          id: supaUser.id,
          email: supaUser.email ?? credential.email ?? '',
          native_lang: (currentUser?.native_lang ?? 'en') as NativeLanguage,
          current_level: currentUser?.current_level ?? 1,
          xp: 0,
          streak: 0,
          daily_goal_minutes: (currentUser?.daily_goal_minutes ?? 15) as DailyGoalMinutes,
          learning_goal: (currentUser?.learning_goal ?? 'travel') as LearningGoal,
          created_at: supaUser.created_at,
        };

        await loginWithSupabase(appUser);
        await loadFromRemote(supaUser.id);

        if (hadGuestData) {
          const serverState = useUserStore.getState();
          if (serverState.xp === 0 && guestState.xp > 0) {
            useUserStore.setState({
              xp: guestState.xp,
              streak: guestState.streak,
              lastStreakDate: guestState.lastStreakDate,
              todayMinutes: guestState.todayMinutes,
              progress: guestState.progress.map((p) => ({ ...p, user_id: supaUser.id })),
            });
            await syncStats(supaUser.id, {
              xp: guestState.xp,
              streak: guestState.streak,
              lastStreakDate: guestState.lastStreakDate,
              todayMinutes: guestState.todayMinutes,
            });
            for (const p of guestState.progress) {
              await syncProgress(supaUser.id, { ...p, user_id: supaUser.id });
            }
          }
        }
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert(t.splash.loginFailedTitle, t.splash.appleLoginFailedMsg);
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1 },
    gradient: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xxl,
    },
    logoSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      fontSize: 48,
      fontWeight: '900',
      color: colors.white,
      letterSpacing: 4,
    },
    logoKo: {
      fontSize: 20,
      color: colors.white,
      opacity: 0.9,
      marginTop: spacing.xs,
    },
    slogan: {
      fontSize: 16,
      color: colors.white,
      opacity: 0.8,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    buttonSection: { gap: spacing.sm },
    primaryButton: {
      backgroundColor: colors.white,
      height: 52,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButtonText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '700',
    },
    secondaryButton: {
      height: 52,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.6)',
    },
    secondaryButtonText: { ...typography.body, color: colors.white },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xs,
      gap: spacing.sm,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
    dividerText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    socialButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      height: 52,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    socialButtonDisabled: {
      opacity: 0.65,
    },
    socialButtonText: { ...typography.body, color: colors.white },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>HANURI</Text>
          <Text style={styles.logoKo}>하누리</Text>
          <Text style={styles.slogan}>{t.splash.slogan}</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{t.splash.startFree}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t.splash.or}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.socialButton,
              !isSupabaseConfigured && styles.socialButtonDisabled,
            ]}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.socialButtonText}>🇬 {t.splash.googleLogin}</Text>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[
                styles.socialButton,
                (!isSupabaseConfigured) && styles.socialButtonDisabled,
              ]}
              onPress={handleAppleLogin}
              activeOpacity={0.85}
              disabled={isAppleLoading || !isSupabaseConfigured}
            >
              {isAppleLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.socialButtonText}> {t.splash.appleLogin}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

