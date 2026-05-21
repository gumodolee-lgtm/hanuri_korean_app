import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases';

export const RC_ENTITLEMENT_ID = 'hanuri Pro';

export async function initRevenueCat(apiKey: string): Promise<void> {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
}

export async function loginUser(userId: string): Promise<void> {
  await Purchases.logIn(userId);
}

export async function logoutUser(): Promise<void> {
  await Purchases.logOut();
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return await Purchases.restorePurchases();
}

export function isPro(customerInfo: CustomerInfo): boolean {
  return RC_ENTITLEMENT_ID in customerInfo.entitlements.active;
}
