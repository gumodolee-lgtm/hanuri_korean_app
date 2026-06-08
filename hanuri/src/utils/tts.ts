import * as Speech from 'expo-speech';

let isSpeaking = false;

function cleanForTTS(text: string): string {
  return text.replace(/~/g, '').trim();
}

export async function speakKorean(text: string): Promise<void> {
  const cleaned = cleanForTTS(text);
  if (!cleaned) return;

  if (isSpeaking) {
    await Speech.stop();
  }

  isSpeaking = true;
  Speech.speak(cleaned, {
    language: 'ko-KR',
    pitch: 1.0,
    rate: 0.85, // Slightly slower for learners
    onDone: () => { isSpeaking = false; },
    onError: () => { isSpeaking = false; },
    onStopped: () => { isSpeaking = false; },
  });
}

export async function stopSpeaking(): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
  }
}

export function isTTSAvailable(): boolean {
  return true; // expo-speech always available on iOS/Android
}
