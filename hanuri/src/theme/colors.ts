export const lightColors = {
  // Brand
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFD93D',

  // Neutrals
  dark: '#2D3436',
  gray: '#636E72',
  background: '#F7F9FA',

  // Semantic
  success: '#4ECDC4',
  warning: '#FFD93D',
  error: '#FF6B6B',
  white: '#FFFFFF',
  black: '#000000',

  // UI States
  cardBg: '#FFFFFF',
  inputBg: '#F7F9FA',
  border: '#DFE6E9',
  disabled: '#B2BEC3',

  // Gamification
  xpGold: '#FFD93D',
  streak: '#FF6B6B',
  levelBadge: '#4ECDC4',
} as const;

export const darkColors = {
  // Brand — keep vivid for contrast on dark
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFD93D',

  // Neutrals — Netflix/TikTok pure dark
  dark: '#F5F5F5',
  gray: '#8E8E93',
  background: '#101010',

  // Semantic
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  white: '#1C1C1E',
  black: '#000000',

  // UI States
  cardBg: '#1C1C1E',
  inputBg: '#2C2C2E',
  border: '#38383A',
  disabled: '#48484A',

  // Gamification
  xpGold: '#FFD60A',
  streak: '#FF6B6B',
  levelBadge: '#4ECDC4',
} as const;

export type AppColors = { [K in keyof typeof lightColors]: string };
export type ColorKey = keyof AppColors;

// Backward-compat default (light) — used by static StyleSheet.create calls
export const colors = lightColors;
