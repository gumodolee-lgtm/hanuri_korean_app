import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to Sentry / Crashlytics here
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😵</Text>
          <Text style={styles.title}>앗, 문제가 생겼어요</Text>
          <Text style={styles.message}>
            예상치 못한 오류가 발생했습니다.{'\n'}앱을 다시 시작해주세요.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry}>
            <Text style={styles.retryBtnText}>다시 시도</Text>
          </TouchableOpacity>
          {__DEV__ && this.state.error && (
            <Text style={styles.devError}>{this.state.error.message}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: { fontSize: 56 },
  title: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  message: { ...typography.body, color: colors.gray, textAlign: 'center', lineHeight: 24 },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  retryBtnText: { ...typography.body, color: '#fff', fontWeight: '700' },
  devError: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: 'monospace',
  },
});
