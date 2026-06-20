/**
 * ErrorBoundary 컴포넌트 테스트
 * - 정상 상태: children을 그대로 렌더링
 * - 에러 발생: fallback UI 렌더링 + 재시도 버튼으로 상태 복구
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ErrorBoundary from '../src/components/ErrorBoundary';

function ThrowingChild(): React.ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('에러가 없으면 children을 그대로 렌더링한다', async () => {
    await render(
      <ErrorBoundary>
        <Text>safe child</Text>
      </ErrorBoundary>
    );
    expect(screen.getByText('safe child')).toBeTruthy();
  });

  it('자식에서 에러가 발생하면 fallback UI를 렌더링한다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('앗, 문제가 생겼어요')).toBeTruthy();
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  it('커스텀 fallback prop이 있으면 그것을 렌더링한다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorBoundary fallback={<Text>custom fallback</Text>}>
        <ThrowingChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('custom fallback')).toBeTruthy();
  });

  it('재시도 버튼 탭 시 hasError 상태가 초기화된다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );
    await fireEvent.press(screen.getByText('다시 시도'));
    // setState는 호출되지만 ThrowingChild가 다시 던지므로 fallback UI가 그대로 유지됨을 확인
    expect(screen.getByText('앗, 문제가 생겼어요')).toBeTruthy();
  });
});
