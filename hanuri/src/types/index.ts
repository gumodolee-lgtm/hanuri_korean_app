export type NativeLanguage = 'en' | 'es' | 'zh' | 'ja' | 'vi';
export type LearningGoal = 'kpop' | 'travel' | 'business' | 'topik' | 'relationship';
export type DailyGoalMinutes = 5 | 15 | 30;
export type LessonStatus = 'locked' | 'in_progress' | 'completed';
export type ActivityType = 'vocabulary' | 'listening' | 'speaking' | 'grammar' | 'ai_chat';

export interface User {
  id: string;
  email: string;
  native_lang: NativeLanguage;
  current_level: number;
  xp: number;
  streak: number;
  daily_goal_minutes: DailyGoalMinutes;
  learning_goal: LearningGoal;
  created_at: string;
  isPro?: boolean;
}

export interface Lesson {
  id: string;
  level: number;
  unit: number;
  order: number;
  title: string;
  title_ko: string;
  description: string;
  content: LessonContent;
  xp_reward: number;
  estimated_minutes: number;
}

export interface LessonContent {
  vocabulary: VocabItem[];
  activities: Activity[];
}

export interface VocabItem {
  korean: string;
  romanization: string;
  translations: Record<NativeLanguage, string>;
  image_url?: string;
  audio_url?: string;
}

export interface Activity {
  type: ActivityType;
  data: Record<string, unknown>;
}

export interface UserProgress {
  user_id: string;
  lesson_id: string;
  status: LessonStatus;
  score: number;
  completed_at?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: string;
}

export interface AIScenario {
  id: string;
  title: string;
  title_ko: string;
  icon: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  is_pro: boolean;
}
