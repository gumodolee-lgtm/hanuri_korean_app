import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<OnboardingStackParamList, 'OnboardingLevelTest'>;

const QUESTIONS = [
  {
    question: '안녕하세요 means:',
    choices: ['Hello / Hi', 'Thank you', 'Goodbye', 'Sorry'],
    answer: 'Hello / Hi',
    levelTag: 1,
  },
  {
    question: '이거 주세요 means:',
    choices: ['Give me this please', 'How much is this?', 'Where is this?', 'I want this later'],
    answer: 'Give me this please',
    levelTag: 1,
  },
  {
    question: '괜찮아요 means:',
    choices: ["It's okay / I'm fine", "I'm hungry", "Let's go", 'Not yet'],
    answer: "It's okay / I'm fine",
    levelTag: 2,
  },
  {
    question: '조금만 기다려 주세요 means:',
    choices: ['Please wait a moment', 'Follow me please', 'Turn left here', 'Pay at the counter'],
    answer: 'Please wait a moment',
    levelTag: 3,
  },
  {
    question: '회의를 연기해야 할 것 같습니다 means:',
    choices: [
      'We may need to postpone the meeting',
      'The meeting started late',
      'Please attend the meeting',
      'The meeting was cancelled',
    ],
    answer: 'We may need to postpone the meeting',
    levelTag: 5,
  },
];

function getSuggestedLevel(correctCount: number): number {
  if (correctCount <= 1) return 1;
  if (correctCount === 2) return 2;
  if (correctCount === 3) return 3;
  if (correctCount === 4) return 5;
  return 6;
}

export default function OnboardingLevelTestScreen() {
  const navigation = useNavigation<NavProp>();
  const { setOnboardingData } = useAuthStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);

  const q = QUESTIONS[currentQ];

  const handleAnswer = (choice: string) => {
    if (answered) return;
    setAnswered(choice);
    const isCorrect = choice === q.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;

    setTimeout(() => {
      if (currentQ + 1 < QUESTIONS.length) {
        setCurrentQ(currentQ + 1);
        setAnswered(null);
        setCorrectCount(newCorrect);
      } else {
        setFinalCorrect(newCorrect);
        setDone(true);
      }
    }, 800);
  };

  const handleFinish = () => {
    const suggestedLevel = getSuggestedLevel(finalCorrect);
    setOnboardingData({ currentLevel: suggestedLevel });
    navigation.goBack();
  };

  if (done) {
    const level = getSuggestedLevel(finalCorrect);
    const levelLabels: Record<number, string> = {
      1: '🌱 입문 (Beginner)',
      2: '🌿 초급 (Elementary)',
      3: '🌳 초중급 (Pre-Intermediate)',
      5: '⚡ 중급 (Intermediate)',
      6: '🔥 중고급 (Upper-Intermediate)',
    };
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🎯</Text>
          <Text style={styles.resultTitle}>테스트 완료!</Text>
          <Text style={styles.resultScore}>{finalCorrect} / {QUESTIONS.length} 정답</Text>
          <View style={styles.resultLevelBox}>
            <Text style={styles.resultLevelLabel}>추천 레벨</Text>
            <Text style={styles.resultLevel}>{levelLabels[level]}</Text>
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={handleFinish}>
            <Text style={styles.nextBtnText}>이 레벨로 시작하기 →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryLink}>
            <Text style={styles.retryText}>직접 레벨 선택하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>{currentQ + 1} / {QUESTIONS.length}</Text>
      </View>

      <View style={styles.progressBarWrap}>
        <View style={[styles.progressFill, { width: `${(currentQ / QUESTIONS.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>이 문장의 뜻은 무엇인가요?</Text>
        <View style={styles.questionBox}>
          <Text style={styles.question}>{q.question}</Text>
        </View>

        <View style={styles.choices}>
          {q.choices.map((choice) => {
            let style = styles.choice;
            let textStyle = styles.choiceText;
            if (answered) {
              if (choice === q.answer) {
                style = { ...styles.choice, ...styles.choiceCorrect };
                textStyle = { ...styles.choiceText, ...styles.choiceTextCorrect };
              } else if (choice === answered) {
                style = { ...styles.choice, ...styles.choiceWrong };
              }
            }
            return (
              <TouchableOpacity
                key={choice}
                style={style}
                onPress={() => handleAnswer(choice)}
                disabled={!!answered}
                activeOpacity={0.7}
              >
                <Text style={textStyle}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  backBtn: { ...typography.body, color: colors.primary },
  progressText: { ...typography.caption, color: colors.gray },
  progressBarWrap: {
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  subtitle: { ...typography.caption, color: colors.gray, textAlign: 'center', marginTop: spacing.md },
  questionBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  question: { ...typography.h2, color: colors.dark, textAlign: 'center' },
  choices: { gap: spacing.sm },
  choice: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceCorrect: { borderColor: '#4ECDC4', backgroundColor: '#F0FFFE' },
  choiceWrong: { borderColor: colors.primary, backgroundColor: '#FFF5F5', opacity: 0.7 },
  choiceText: { ...typography.body, color: colors.dark, textAlign: 'center' },
  choiceTextCorrect: { color: '#4ECDC4', fontWeight: '700' },

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: { ...typography.h2, color: colors.dark },
  resultScore: { ...typography.body, color: colors.gray },
  resultLevelBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  resultLevelLabel: { ...typography.caption, color: colors.gray },
  resultLevel: { ...typography.h2, color: colors.primary, fontWeight: '800', marginTop: 4 },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.sm,
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
  retryLink: { marginTop: spacing.xs },
  retryText: { ...typography.caption, color: colors.gray, textDecorationLine: 'underline' },
});
