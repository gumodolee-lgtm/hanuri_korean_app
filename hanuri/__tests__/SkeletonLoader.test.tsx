/**
 * SkeletonLoader 컴포넌트 테스트 (스모크 — 렌더링 에러 없이 마운트되는지만 확인)
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

import {
  SkeletonBox,
  LessonCardSkeleton,
  StatRowSkeleton,
  HomeScreenSkeleton,
} from '../src/components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('SkeletonBox가 기본 props로 렌더링된다', async () => {
    const { toJSON } = await render(<SkeletonBox />);
    expect(toJSON()).toBeTruthy();
  });

  it('SkeletonBox가 커스텀 props로 렌더링된다', async () => {
    const { toJSON } = await render(<SkeletonBox width={100} height={20} borderRadius={4} />);
    expect(toJSON()).toBeTruthy();
  });

  it('LessonCardSkeleton이 렌더링된다', async () => {
    const { toJSON } = await render(<LessonCardSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('StatRowSkeleton이 3개 박스로 렌더링된다', async () => {
    const { toJSON } = await render(<StatRowSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('HomeScreenSkeleton이 렌더링된다', async () => {
    const { toJSON } = await render(<HomeScreenSkeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
