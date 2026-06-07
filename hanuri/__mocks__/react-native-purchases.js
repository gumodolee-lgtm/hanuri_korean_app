const LOG_LEVEL = { DEBUG: 'DEBUG' };

const Purchases = {
  setLogLevel: jest.fn(),
  configure: jest.fn(),
  logIn: jest.fn().mockResolvedValue({}),
  logOut: jest.fn().mockResolvedValue({}),
  getOfferings: jest.fn().mockResolvedValue({ current: null }),
  purchasePackage: jest.fn().mockResolvedValue({ customerInfo: {} }),
  restorePurchases: jest.fn().mockResolvedValue({}),
};

module.exports = {
  default: Purchases,
  LOG_LEVEL,
  ...Purchases,
};
