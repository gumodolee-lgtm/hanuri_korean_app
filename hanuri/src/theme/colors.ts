export const colors = {
  // Primary
  primary: '#FF6B6B',       // Hanuri Coral
  secondary: '#4ECDC4',     // Fresh Mint
  accent: '#FFD93D',        // Focus Yellow

  // Neutrals
  dark: '#2D3436',          // Charcoal Black
  gray: '#636E72',          // Slate Gray
  background: '#F7F9FA',    // Off White

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

export type ColorKey = keyof typeof colors;
