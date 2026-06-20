/**
 * LoadingScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

import LoadingScreen from '../src/components/LoadingScreen';

describe('LoadingScreen', () => {
  it('기본 메시지를 렌더링한다', async () => {
    await render(<LoadingScreen />);
    expect(screen.getByText('불러오는 중...')).toBeTruthy();
    expect(screen.getByText('HANURI')).toBeTruthy();
    expect(screen.getByText('하누리')).toBeTruthy();
  });

  it('커스텀 메시지를 렌더링한다', async () => {
    await render(<LoadingScreen message="동기화 중..." />);
    expect(screen.getByText('동기화 중...')).toBeTruthy();
  });
});
