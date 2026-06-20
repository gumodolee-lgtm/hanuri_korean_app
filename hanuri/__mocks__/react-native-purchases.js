const LOG_LEVEL = { DEBUG: 'DEBUG' };

const PACKAGE_TYPE = {
  UNKNOWN: 'UNKNOWN',
  CUSTOM: 'CUSTOM',
  LIFETIME: 'LIFETIME',
  ANNUAL: 'ANNUAL',
  SIX_MONTH: 'SIX_MONTH',
  THREE_MONTH: 'THREE_MONTH',
  TWO_MONTH: 'TWO_MONTH',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
};

const Purchases = {
  setLogLevel: jest.fn(),
  configure: jest.fn(),
  logIn: jest.fn().mockResolvedValue({}),
  logOut: jest.fn().mockResolvedValue({}),
  getOfferings: jest.fn().mockResolvedValue({ current: null }),
  purchasePackage: jest.fn().mockResolvedValue({ customerInfo: {} }),
  restorePurchases: jest.fn().mockResolvedValue({}),
  getCustomerInfo: jest.fn().mockResolvedValue({}),
};

module.exports = {
  default: Purchases,
  LOG_LEVEL,
  PACKAGE_TYPE,
  ...Purchases,
};
