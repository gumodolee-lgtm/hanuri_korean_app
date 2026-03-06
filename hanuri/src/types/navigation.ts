export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
  Lesson: { lessonId: string };
  AIChat: { scenarioId?: string };
  LessonComplete: { xp: number; score: number; expressions: string[] };
  ProUpgrade: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lessons: undefined;
  AIHub: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type OnboardingStackParamList = {
  OnboardingLanguage: undefined;
  OnboardingGoal: undefined;
  OnboardingLevel: undefined;
  OnboardingTime: undefined;
  OnboardingNotification: undefined;
};
