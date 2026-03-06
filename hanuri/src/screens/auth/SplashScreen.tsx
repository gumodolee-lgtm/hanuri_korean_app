import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { RootStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../services/supabase';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { NativeLanguage, LearningGoal, DailyGoalMinutes } from '../../types';

WebBrowser.maybeCompleteAuthSession();

type NavProp = StackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();
  const { loginWithSupabase } = useAuthStore();
  const { loadFromRemote } = useUserStore();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
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
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

          if (sessionError) throw sessionError;

          const supaUser = sessionData.user;
          if (supaUser) {
            const appUser = {
              id: supaUser.id,
              email: supaUser.email ?? '',
              native_lang: 'en' as NativeLanguage,
              current_level: 1,
              xp: 0,
              streak: 0,
              daily_goal_minutes: 15 as DailyGoalMinutes,
              learning_goal: 'travel' as LearningGoal,
              created_at: supaUser.created_at,
            };
            // Sync profile & fetch remote data
            await loginWithSupabase(appUser);
            await loadFromRemote(supaUser.id);
          }
        }
      }
    } catch (err) {
      Alert.alert('로그인 실패', 'Google 로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
          <Text style={styles.slogan}>한국어로 세상을 연결하다</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>🚀 무료로 시작하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>이미 계정이 있어요</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.socialButtonText}>🇬 Google로 계속하기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.85}>
            <Text style={styles.socialButtonText}> Apple로 계속하기</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  socialButtonText: { ...typography.body, color: colors.white },
});
