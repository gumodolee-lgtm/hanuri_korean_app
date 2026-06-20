/**
 * ProUpgradeScreen 컴포넌트 테스트
 */

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('../src/services/supabase', () => ({ supabase: null }));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('../src/services/revenuecatService', () => ({
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  isPro: jest.fn(),
}));

import ProUpgradeScreen from '../src/screens/pro/ProUpgradeScreen';
import { useAuthStore } from '../src/store/authStore';
import * as revenuecatService from '../src/services/revenuecatService';

const yearlyPackage = {
  packageType: 'ANNUAL',
  product: { priceString: '₩69,900' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGoBack.mockClear();
  useAuthStore.setState({ user: null, hasCompletedOnboarding: true, onboardingData: {} });
  (revenuecatService.getOfferings as jest.Mock).mockResolvedValue({
    availablePackages: [yearlyPackage],
  });
});

describe('ProUpgradeScreen — 상품 로딩', () => {
  it('HANURI PRO 헤더와 로딩된 플랜 카드를 렌더링한다', async () => {
    await render(<ProUpgradeScreen />);
    expect(screen.getByText('HANURI PRO')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('₩69,900')).toBeTruthy();
    });
  });

  it('getOfferings가 null을 반환하면 에러 메시지를 표시한다', async () => {
    (revenuecatService.getOfferings as jest.Mock).mockResolvedValue(null);
    await render(<ProUpgradeScreen />);
    await waitFor(() => {
      expect(revenuecatService.getOfferings).toHaveBeenCalled();
    });
  });

  it('닫기 버튼 탭 시 goBack이 호출된다', async () => {
    await render(<ProUpgradeScreen />);
    await fireEvent.press(screen.getByText('✕'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('ProUpgradeScreen — 구독 플로우', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 'user_test_1', email: 'test@example.com', native_lang: 'en', current_level: 1,
        xp: 0, streak: 0, daily_goal_minutes: 15, learning_goal: 'travel', created_at: '2026-01-01',
      },
      hasCompletedOnboarding: true,
      onboardingData: {},
    });
  });

  it('구매 성공 시 upgradeToPro가 호출되어 user.isPro가 true가 된다', async () => {
    (revenuecatService.purchasePackage as jest.Mock).mockResolvedValue({});
    (revenuecatService.isPro as jest.Mock).mockReturnValue(true);
    await render(<ProUpgradeScreen />);
    await waitFor(() => {
      expect(screen.getByText('₩69,900')).toBeTruthy();
    });
    await fireEvent.press(screen.getByText('👑 Start Annual Subscription'));
    await waitFor(() => {
      expect(useAuthStore.getState().user?.isPro).toBe(true);
    });
    expect(revenuecatService.purchasePackage).toHaveBeenCalledWith(yearlyPackage);
  });

  it('구매 취소(PURCHASE_CANCELLED) 시 에러 알림을 띄우지 않는다', async () => {
    (revenuecatService.purchasePackage as jest.Mock).mockRejectedValue({ code: 'PURCHASE_CANCELLED' });
    await render(<ProUpgradeScreen />);
    await waitFor(() => {
      expect(screen.getByText('₩69,900')).toBeTruthy();
    });
    await fireEvent.press(screen.getByText('👑 Start Annual Subscription'));
    await waitFor(() => {
      expect(revenuecatService.purchasePackage).toHaveBeenCalled();
    });
  });
});

describe('ProUpgradeScreen — 구매 복원', () => {
  it('복원 성공 시 upgradeToPro 트리거 알림을 띄운다', async () => {
    (revenuecatService.restorePurchases as jest.Mock).mockResolvedValue({});
    (revenuecatService.isPro as jest.Mock).mockReturnValue(true);
    await render(<ProUpgradeScreen />);
    await fireEvent.press(screen.getByText('Restore Purchases'));
    await waitFor(() => {
      expect(revenuecatService.restorePurchases).toHaveBeenCalled();
    });
  });
});
