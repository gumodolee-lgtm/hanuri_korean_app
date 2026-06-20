/**
 * utils/tts.ts 단위 테스트
 */

jest.mock('expo-speech', () => ({
  stop: jest.fn().mockResolvedValue(undefined),
  speak: jest.fn(),
}));

import * as Speech from 'expo-speech';
import { speakKorean, stopSpeaking, isTTSAvailable } from '../src/utils/tts';

// 모듈 스코프의 isSpeaking 플래그가 테스트 간에 누수되지 않도록 매 테스트 전에 정규화한다
beforeEach(async () => {
  await stopSpeaking();
  jest.clearAllMocks();
});

describe('tts — speakKorean', () => {

  it('빈 문자열이면 speak을 호출하지 않는다', async () => {
    await speakKorean('   ');
    expect(Speech.speak).not.toHaveBeenCalled();
  });

  it('물결표(~)를 제거하고 trim한 텍스트로 speak을 호출한다', async () => {
    await speakKorean('  안녕~하세요~  ');
    expect(Speech.speak).toHaveBeenCalledWith(
      '안녕하세요',
      expect.objectContaining({ language: 'ko-KR', rate: 0.85 })
    );
  });

  it('이미 말하는 중이면 stop을 먼저 호출한 후 다시 speak한다', async () => {
    await speakKorean('첫번째');
    await speakKorean('두번째');
    expect(Speech.stop).toHaveBeenCalledTimes(1);
    expect(Speech.speak).toHaveBeenCalledTimes(2);
  });
});

describe('tts — stopSpeaking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('말하는 중이 아니면 stop을 호출하지 않는다', async () => {
    await stopSpeaking();
    expect(Speech.stop).not.toHaveBeenCalled();
  });

  it('말하는 중이면 stop을 호출한다', async () => {
    await speakKorean('테스트');
    await stopSpeaking();
    expect(Speech.stop).toHaveBeenCalled();
  });
});

describe('tts — isTTSAvailable', () => {
  it('항상 true를 반환한다', () => {
    expect(isTTSAvailable()).toBe(true);
  });
});
