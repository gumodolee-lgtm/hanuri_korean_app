import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = '불러오는 중...' }: Props) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: pulse }]}>HANURI</Animated.Text>
      <Text style={styles.logoKo}>하누리</Text>
      <Text style={styles.message}>{message}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  logoKo: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  message: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 32,
  },
});
