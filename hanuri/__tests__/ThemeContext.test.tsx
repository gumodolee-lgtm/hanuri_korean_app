/**
 * ThemeContext 테스트
 * - themeMode: 'light' / 'dark' / 'system' 조합에 따른 isDark, colors 분기
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

import { useColorScheme } from 'react-native';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { useAuthStore } from '../src/store/authStore';
import { lightColors, darkColors } from '../src/theme/colors';

function Probe() {
  const { colors, isDark } = useTheme();
  return <Text testID="probe">{`${isDark}|${colors.primary}`}</Text>;
}

beforeEach(() => {
  (useColorScheme as jest.Mock).mockReturnValue('light');
  useAuthStore.setState({ themeMode: 'system' });
});

describe('ThemeContext — themeMode 분기', () => {
  it("themeMode='dark'면 시스템 설정과 무관하게 다크 컬러를 적용한다", async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    useAuthStore.setState({ themeMode: 'dark' });
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('probe').props.children).toBe(`true|${darkColors.primary}`);
  });

  it("themeMode='light'면 시스템 설정과 무관하게 라이트 컬러를 적용한다", async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    useAuthStore.setState({ themeMode: 'light' });
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('probe').props.children).toBe(`false|${lightColors.primary}`);
  });

  it("themeMode='system'이고 시스템이 dark면 다크 컬러를 적용한다", async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    useAuthStore.setState({ themeMode: 'system' });
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('probe').props.children).toBe(`true|${darkColors.primary}`);
  });

  it("themeMode='system'이고 시스템이 light면 라이트 컬러를 적용한다", async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    useAuthStore.setState({ themeMode: 'system' });
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('probe').props.children).toBe(`false|${lightColors.primary}`);
  });
});

describe('ThemeContext — Provider 없이 useTheme 호출', () => {
  it('기본값(lightColors, isDark=false)을 반환한다', async () => {
    await render(<Probe />);
    expect(screen.getByTestId('probe').props.children).toBe(`false|${lightColors.primary}`);
  });
});
