/**
 * revenuecatService 단위 테스트
 * - initRevenueCat: 플랫폼별 apiKey 선택 + __DEV__ 로그레벨 설정
 * - 단순 위임 함수들: getCustomerInfo / loginUser / logoutUser / getOfferings /
 *   purchasePackage / restorePurchases
 */

import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  initRevenueCat,
  getCustomerInfo,
  loginUser,
  logoutUser,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../src/services/revenuecatService';

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
});

describe('revenuecatService — initRevenueCat', () => {
  it('__DEV__이면 로그레벨을 ERROR로 설정한다', async () => {
    await initRevenueCat('android-key');
    expect(Purchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.ERROR);
  });

  it('android에서는 androidKey로 configure한다', async () => {
    Platform.OS = 'android';
    await initRevenueCat('android-key', 'ios-key');
    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'android-key' });
  });

  it('ios에서는 iosKey가 있으면 iosKey로 configure한다', async () => {
    Platform.OS = 'ios';
    await initRevenueCat('android-key', 'ios-key');
    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'ios-key' });
  });

  it('ios인데 iosKey가 없으면 androidKey로 폴백한다', async () => {
    Platform.OS = 'ios';
    await initRevenueCat('android-key');
    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'android-key' });
  });
});

describe('revenuecatService — 위임 함수들', () => {
  it('getCustomerInfo는 Purchases.getCustomerInfo를 호출한다', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({ entitlements: { active: {} } });
    const result = await getCustomerInfo();
    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
    expect(result).toEqual({ entitlements: { active: {} } });
  });

  it('loginUser는 Purchases.logIn을 userId로 호출한다', async () => {
    await loginUser('user_1');
    expect(Purchases.logIn).toHaveBeenCalledWith('user_1');
  });

  it('logoutUser는 Purchases.logOut을 호출한다', async () => {
    await logoutUser();
    expect(Purchases.logOut).toHaveBeenCalled();
  });

  it('getOfferings는 current offering을 반환한다', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: { identifier: 'default' } });
    expect(await getOfferings()).toEqual({ identifier: 'default' });
  });

  it('getOfferings는 current가 없으면 null을 반환한다', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: null });
    expect(await getOfferings()).toBeNull();
  });

  it('purchasePackage는 customerInfo를 반환한다', async () => {
    (Purchases.purchasePackage as jest.Mock).mockResolvedValue({ customerInfo: { entitlements: { active: {} } } });
    const result = await purchasePackage({} as never);
    expect(result).toEqual({ entitlements: { active: {} } });
  });

  it('restorePurchases는 Purchases.restorePurchases 결과를 반환한다', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue({ entitlements: { active: {} } });
    expect(await restorePurchases()).toEqual({ entitlements: { active: {} } });
  });
});
