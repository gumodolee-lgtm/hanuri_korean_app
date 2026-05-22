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
  // Brand — unchanged
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFD93D',

  // Neutrals — inverted
  dark: '#F0F0F0',
  gray: '#A0A8B0',
  background: '#0F0F1A',

  // Semantic
  success: '#4ECDC4',
  warning: '#FFD93D',
  error: '#FF6B6B',
  white: '#1E1E30',
  black: '#000000',

  // UI States
  cardBg: '#1E1E30',
  inputBg: '#1A1A2C',
  border: '#2A2A40',
  disabled: '#4A4A60',

  // Gamification
  xpGold: '#FFD93D',
  streak: '#FF6B6B',
  levelBadge: '#4ECDC4',
} as const;

export type AppColors = { [K in keyof typeof lightColors]: string };
export type ColorKey = keyof AppColors;

// Backward-compat default (light) — used by static StyleSheet.create calls
export const colors = lightColors;
