export const fontFamily = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
};

export const fontSize = {
  h1: 32,
  h2: 24,
  h3: 20,
  bodyLarge: 18,
  body: 16,
  caption: 12,
} as const;

export const lineHeight = {
  h1: 40,
  h2: 32,
  h3: 28,
  bodyLarge: 26,
  body: 24,
  caption: 18,
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
  },
  h3: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
  },
} as const;
