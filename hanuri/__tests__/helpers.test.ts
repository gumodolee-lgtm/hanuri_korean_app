/**
 * 헬퍼 함수 단위 테스트
 * - data/lessons.ts: getMeaning, getLessonsForLevel, getLessonById, getFirstLesson
 * - i18n/index.ts: fillTemplate
 * - dbService: isGuest 로직 (게스트 시 early return 검증)
 */

// ── Mocks (Native 모듈 없음) ───────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/services/supabase', () => ({ supabase: null }));

// ── lessons.ts helpers ────────────────────────────────────────────────────

import {
  getMeaning,
  getLessonsForLevel,
  getLessonById,
  getFirstLesson,
  ALL_LEVELS,
  VocabCard,
} from '../src/data/lessons';

const sampleCard: VocabCard = {
  id: 'v_test',
  korean: '안녕하세요',
  romanization: 'annyeonghaseyo',
  translations: {
    en: 'Hello',
    es: 'Hola',
    zh: '你好',
  },
};

describe('lessons — getMeaning', () => {
  it('영어(en) 번역을 반환한다', () => {
    expect(getMeaning(sampleCard, 'en')).toBe('Hello');
  });

  it('스페인어(es) 번역을 반환한다', () => {
    expect(getMeaning(sampleCard, 'es')).toBe('Hola');
  });

  it('없는 언어(ja)는 영어 fallback을 반환한다', () => {
    expect(getMeaning(sampleCard, 'ja')).toBe('Hello');
  });

  it('lang 인수 없으면 영어 기본값 사용', () => {
    expect(getMeaning(sampleCard)).toBe('Hello');
  });

  it('모든 번역이 없으면 빈 문자열 반환', () => {
    const emptyCard: VocabCard = {
      id: 'empty',
      korean: '테스트',
      romanization: 'test',
      translations: {},
    };
    expect(getMeaning(emptyCard, 'ko')).toBe('');
  });
});

describe('lessons — getLessonsForLevel', () => {
  it('레벨 1의 레슨이 1개 이상 존재한다', () => {
    const lessons = getLessonsForLevel(1);
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('존재하지 않는 레벨은 빈 배열을 반환한다', () => {
    expect(getLessonsForLevel(999)).toEqual([]);
  });

  it('반환된 레슨의 level 필드가 요청 레벨과 일치한다', () => {
    const lessons = getLessonsForLevel(2);
    lessons.forEach((l) => expect(l.level).toBe(2));
  });

  it('레벨 1~8이 모두 존재한다', () => {
    for (let lvl = 1; lvl <= 8; lvl++) {
      expect(getLessonsForLevel(lvl).length).toBeGreaterThan(0);
    }
  });
});

describe('lessons — getLessonById', () => {
  it('존재하는 id로 레슨을 찾는다', () => {
    const lesson = getLessonById('l1u1l1');
    expect(lesson).toBeDefined();
    expect(lesson!.id).toBe('l1u1l1');
  });

  it('존재하지 않는 id는 undefined를 반환한다', () => {
    expect(getLessonById('nonexistent_id')).toBeUndefined();
  });

  it('모든 레벨의 첫 번째 레슨을 id로 찾을 수 있다', () => {
    ALL_LEVELS.forEach((lvl) => {
      const firstLesson = lvl.units[0].lessons[0];
      const found = getLessonById(firstLesson.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(firstLesson.id);
    });
  });
});

describe('lessons — getFirstLesson', () => {
  it('레벨 1의 첫 번째 레슨을 반환한다', () => {
    const first = getFirstLesson(1);
    expect(first).toBeDefined();
    expect(first!.level).toBe(1);
    expect(first!.order).toBe(1);
  });

  it('존재하지 않는 레벨은 undefined를 반환한다', () => {
    expect(getFirstLesson(999)).toBeUndefined();
  });
});

describe('lessons — 데이터 무결성', () => {
  it('모든 레슨 id가 고유하다', () => {
    const allLessons = ALL_LEVELS.flatMap((l) => l.units.flatMap((u) => u.lessons));
    const ids = allLessons.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('모든 레슨에 vocabulary가 1개 이상 있다', () => {
    const allLessons = ALL_LEVELS.flatMap((l) => l.units.flatMap((u) => u.lessons));
    allLessons.forEach((lesson) => {
      expect(lesson.vocabulary.length).toBeGreaterThan(0);
    });
  });

  it('모든 레슨의 xpReward가 양수다', () => {
    const allLessons = ALL_LEVELS.flatMap((l) => l.units.flatMap((u) => u.lessons));
    allLessons.forEach((lesson) => {
      expect(lesson.xpReward).toBeGreaterThan(0);
    });
  });
});

// ── i18n — fillTemplate ───────────────────────────────────────────────────

import { fillTemplate } from '../src/i18n/index';

describe('i18n — fillTemplate', () => {
  it('{words} 플레이스홀더를 치환한다', () => {
    const result = fillTemplate('발음할 단어: {words}', '안녕하세요');
    expect(result).toBe('발음할 단어: 안녕하세요');
  });

  it('플레이스홀더가 없으면 원본 템플릿을 그대로 반환한다', () => {
    const result = fillTemplate('발음 연습', '안녕');
    expect(result).toBe('발음 연습');
  });

  it('빈 words로도 치환된다', () => {
    const result = fillTemplate('대상: {words}', '');
    expect(result).toBe('대상: ');
  });

  it('{words}가 여러 개면 첫 번째만 치환된다 (String.replace 기본 동작)', () => {
    const result = fillTemplate('{words} 그리고 {words}', '테스트');
    // replace()는 첫 번째 매치만 치환
    expect(result).toBe('테스트 그리고 {words}');
  });
});

// ── dbService — 게스트 early-return ──────────────────────────────────────

import { syncProfile, syncStats, syncProgress, fetchStats, fetchAllProgress, loadUserDataFromSupabase } from '../src/services/dbService';
import { User } from '../src/types';

const mockGuestUser: User = {
  id: 'guest_1234',
  email: '',
  native_lang: 'en',
  current_level: 1,
  xp: 0,
  streak: 0,
  daily_goal_minutes: 15,
  learning_goal: 'travel',
  created_at: '2026-01-01',
};

describe('dbService — 게스트 유저 early return (supabase=null)', () => {
  it('syncProfile: 게스트는 에러 없이 즉시 반환한다', async () => {
    await expect(syncProfile(mockGuestUser)).resolves.toBeUndefined();
  });

  it('syncStats: 게스트는 에러 없이 즉시 반환한다', async () => {
    await expect(
      syncStats('guest_123', { xp: 10, streak: 1, lastStreakDate: null, todayMinutes: 5, todayAiChatCount: 0 })
    ).resolves.toBeUndefined();
  });

  it('fetchStats: 게스트는 null을 반환한다', async () => {
    const result = await fetchStats('guest_123');
    expect(result).toBeNull();
  });

  it('fetchAllProgress: 게스트는 빈 배열을 반환한다', async () => {
    const result = await fetchAllProgress('guest_123');
    expect(result).toEqual([]);
  });

  it('loadUserDataFromSupabase: 게스트는 null/빈 데이터를 반환한다', async () => {
    const result = await loadUserDataFromSupabase('guest_123');
    expect(result.profile).toBeNull();
    expect(result.stats).toBeNull();
    expect(result.progress).toEqual([]);
  });
});
