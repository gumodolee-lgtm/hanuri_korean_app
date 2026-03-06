import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { getLessonById, getMeaning, VocabCard } from '../../data/lessons';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { NativeLanguage } from '../../types';
import { speakKorean } from '../../utils/tts';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Lesson'>;

type Phase = 'flashcard' | 'quiz' | 'fillblank';

interface QuizQuestion {
  card: VocabCard;
  choices: string[];
  correctIndex: number;
}

function buildQuiz(vocab: VocabCard[], lang: NativeLanguage): QuizQuestion[] {
  return vocab.map((card) => {
    const correct = getMeaning(card, lang);
    const wrong = vocab
      .filter((v) => v.id !== card.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => getMeaning(v, lang));
    const choices = [...wrong, correct].sort(() => Math.random() - 0.5);
    return { card, choices, correctIndex: choices.indexOf(correct) };
  });
}

export default function LessonPlayerScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { updateProgress, addXP, addTodayMinutes } = useUserStore();
  const { user } = useAuthStore();
  const nativeLang: NativeLanguage = user?.native_lang ?? 'en';

  const lesson = getLessonById(route.params.lessonId);

  const [phase, setPhase] = useState<Phase>('flashcard');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fillIndex, setFillIndex] = useState(0);
  const [fillSelected, setFillSelected] = useState<string | null>(null);
  const [fillScore, setFillScore] = useState(0);

  // Flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>레슨을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const vocab = lesson.vocabulary;
  const fillBlanks = lesson.fillInBlanks ?? [];
  const quizQuestions = useRef(buildQuiz(vocab, nativeLang)).current;
  const totalSteps = vocab.length + quizQuestions.length + fillBlanks.length;
  const currentStep =
    phase === 'flashcard' ? cardIndex :
    phase === 'quiz' ? vocab.length + quizIndex :
    vocab.length + quizQuestions.length + fillIndex;
  const progress = currentStep / totalSteps;

  const handleFlip = () => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, friction: 8 }).start();
    setFlipped(!flipped);
  };

  const handleNextCard = () => {
    if (cardIndex < vocab.length - 1) {
      setCardIndex(cardIndex + 1);
      setFlipped(false);
      flipAnim.setValue(0);
    } else {
      setPhase('quiz');
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === quizQuestions[quizIndex].correctIndex;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNextQuiz = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
    } else if (fillBlanks.length > 0) {
      setPhase('fillblank');
    } else {
      finishLesson();
    }
  };

  const handleFillAnswer = (choice: string) => {
    if (fillSelected !== null) return;
    setFillSelected(choice);
    if (choice === fillBlanks[fillIndex].answer) {
      setFillScore((s) => s + 1);
    }
  };

  const handleNextFill = () => {
    if (fillIndex < fillBlanks.length - 1) {
      setFillIndex(fillIndex + 1);
      setFillSelected(null);
    } else {
      finishLesson();
    }
  };

  const finishLesson = () => {
    const totalQ = quizQuestions.length + fillBlanks.length;
    const totalCorrect = score + fillScore;
    const finalScore = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 100;
    const xpEarned = Math.round(lesson.xpReward * (finalScore / 100));
    const userId = user?.id ?? 'guest';

    updateProgress({ user_id: userId, lesson_id: lesson.id, status: 'completed', score: finalScore });
    addXP(xpEarned, userId);
    addTodayMinutes(lesson.estimatedMinutes, userId);

    navigation.replace('LessonComplete', {
      xp: xpEarned,
      score: finalScore,
      expressions: vocab.slice(0, 3).map((v) => v.korean),
    });
  };

  // Flip interpolations
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const currentCard = vocab[cardIndex];
  const currentQ = quizQuestions[quizIndex];
  const currentFill = fillBlanks[fillIndex];

  const phaseLabel =
    phase === 'flashcard' ? '단어 카드' :
    phase === 'quiz' ? '퀴즈' : '빈칸 채우기';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentStep + 1}/{totalSteps}</Text>
      </View>

      <View style={styles.lessonLabel}>
        <Text style={styles.lessonLabelText}>{lesson.emoji} {lesson.titleKo}</Text>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      </View>

      {/* ─── FLASHCARD PHASE ─── */}
      {phase === 'flashcard' && (
        <View style={styles.body}>
          <TouchableOpacity onPress={handleFlip} activeOpacity={0.9} style={styles.cardWrapper}>
            {/* Front */}
            <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
              <Text style={styles.cardEmoji}>{currentCard.emoji ?? '🇰🇷'}</Text>
              <Text style={styles.cardKorean}>{currentCard.korean}</Text>
              <Text style={styles.cardRoman}>{currentCard.romanization}</Text>
              <TouchableOpacity
                style={styles.speakBtn}
                onPress={() => speakKorean(currentCard.korean)}
              >
                <Text style={styles.speakBtnText}>🔊 듣기</Text>
              </TouchableOpacity>
              <Text style={styles.cardHint}>탭하여 뜻 확인</Text>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
              <Text style={styles.cardEmoji}>{currentCard.emoji ?? '💡'}</Text>
              <Text style={styles.cardKorean}>{currentCard.korean}</Text>
              <Text style={styles.cardMeaning}>{getMeaning(currentCard, nativeLang)}</Text>
              <TouchableOpacity
                style={styles.speakBtn}
                onPress={() => speakKorean(currentCard.korean)}
              >
                <Text style={styles.speakBtnText}>🔊 다시 듣기</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.dotRow}>
            {vocab.map((_, i) => (
              <View key={i} style={[styles.dot, i === cardIndex && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNextCard}>
            <Text style={styles.nextBtnText}>
              {cardIndex < vocab.length - 1 ? '다음 카드 →' : '퀴즈 시작 →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── QUIZ PHASE ─── */}
      {phase === 'quiz' && (
        <View style={styles.body}>
          <View style={styles.quizQuestion}>
            <Text style={styles.quizEmoji}>{currentQ.card.emoji ?? '❓'}</Text>
            <Text style={styles.quizKorean}>{currentQ.card.korean}</Text>
            <Text style={styles.quizRoman}>{currentQ.card.romanization}</Text>
            <Text style={styles.quizInstruction}>뜻을 선택하세요</Text>
          </View>

          <View style={styles.choices}>
            {currentQ.choices.map((choice, idx) => {
              let bg: string = colors.white;
              let border: string = colors.border;
              if (selectedAnswer !== null) {
                if (idx === currentQ.correctIndex) { bg = '#E8FFF5'; border = colors.secondary; }
                else if (idx === selectedAnswer) { bg = '#FFF0F0'; border = colors.primary; }
              }
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.choiceBtn, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.7}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                  {selectedAnswer !== null && idx === currentQ.correctIndex && (
                    <Text style={styles.choiceIcon}>✓</Text>
                  )}
                  {selectedAnswer === idx && idx !== currentQ.correctIndex && (
                    <Text style={styles.choiceIconWrong}>✗</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedAnswer !== null && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackText}>
                {selectedAnswer === currentQ.correctIndex ? '🎉 정답!' : `😅 정답: ${getMeaning(currentQ.card, nativeLang)}`}
              </Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuiz}>
                <Text style={styles.nextBtnText}>
                  {quizIndex < quizQuestions.length - 1 ? '다음 →' : fillBlanks.length > 0 ? '빈칸 채우기 →' : '완료 🎊'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ─── FILL-IN-BLANK PHASE ─── */}
      {phase === 'fillblank' && currentFill && (
        <View style={styles.body}>
          <View style={styles.quizQuestion}>
            <Text style={styles.fillTitle}>빈칸에 알맞은 말을 고르세요</Text>
            <View style={styles.sentenceRow}>
              {currentFill.before ? (
                <Text style={styles.sentenceText}>{currentFill.before}</Text>
              ) : null}
              <View style={[
                styles.blank,
                fillSelected !== null && fillSelected === currentFill.answer && styles.blankCorrect,
                fillSelected !== null && fillSelected !== currentFill.answer && styles.blankWrong,
              ]}>
                <Text style={styles.blankText}>{fillSelected ?? '___'}</Text>
              </View>
              {currentFill.after ? (
                <Text style={styles.sentenceText}>{currentFill.after}</Text>
              ) : null}
            </View>
            <Text style={styles.quizInstruction}>💡 {currentFill.hint}</Text>
          </View>

          <View style={styles.choices}>
            {currentFill.choices.map((choice, idx) => {
              let bg: string = colors.white;
              let border: string = colors.border;
              if (fillSelected !== null) {
                if (choice === currentFill.answer) { bg = '#E8FFF5'; border = colors.secondary; }
                else if (choice === fillSelected) { bg = '#FFF0F0'; border = colors.primary; }
              }
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.choiceBtn, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleFillAnswer(choice)}
                  disabled={fillSelected !== null}
                  activeOpacity={0.7}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                  {fillSelected !== null && choice === currentFill.answer && (
                    <Text style={styles.choiceIcon}>✓</Text>
                  )}
                  {fillSelected === choice && choice !== currentFill.answer && (
                    <Text style={styles.choiceIconWrong}>✗</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {fillSelected !== null && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackText}>
                {fillSelected === currentFill.answer ? '🎉 정답!' : `😅 정답: ${currentFill.answer}`}
              </Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextFill}>
                <Text style={styles.nextBtnText}>
                  {fillIndex < fillBlanks.length - 1 ? '다음 →' : '완료 🎊'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorText: { ...typography.body, color: colors.gray, textAlign: 'center', marginTop: 100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  closeBtn: { padding: spacing.xs },
  closeBtnText: { fontSize: 18, color: colors.gray },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: { ...typography.caption, color: colors.gray, minWidth: 36, textAlign: 'right' },

  lessonLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  lessonLabelText: { ...typography.caption, color: colors.dark, fontWeight: '600' },
  phaseLabel: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  body: { flex: 1, padding: spacing.lg, gap: spacing.lg },

  // Flashcard
  cardWrapper: { flex: 1, position: 'relative' },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg ?? 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    backfaceVisibility: 'hidden',
  },
  cardFront: { backgroundColor: colors.white },
  cardBack: { backgroundColor: '#FFF5F5' },
  cardEmoji: { fontSize: 56 },
  cardKorean: { fontSize: 36, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  cardRoman: { ...typography.body, color: colors.gray, textAlign: 'center' },
  cardHint: { ...typography.caption, color: colors.gray, position: 'absolute', bottom: spacing.md },
  cardMeaning: { ...typography.h3, color: colors.primary, textAlign: 'center' },
  speakBtn: {
    backgroundColor: colors.secondary + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  speakBtnText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },

  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },

  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },

  // Quiz
  quizQuestion: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quizEmoji: { fontSize: 40 },
  quizKorean: { fontSize: 32, fontWeight: '800', color: colors.dark },
  quizRoman: { ...typography.body, color: colors.gray },
  quizInstruction: { ...typography.caption, color: colors.gray, marginTop: spacing.xs },

  choices: { gap: spacing.sm },
  choiceBtn: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceText: { ...typography.body, color: colors.dark, flex: 1 },
  choiceIcon: { color: colors.secondary, fontWeight: '700', fontSize: 18 },
  choiceIconWrong: { color: colors.primary, fontWeight: '700', fontSize: 18 },

  feedbackRow: { gap: spacing.sm },
  feedbackText: { ...typography.h3, color: colors.dark, textAlign: 'center' },

  // Fill-in-blank
  fillTitle: { ...typography.caption, color: colors.gray, fontWeight: '600', marginBottom: spacing.xs },
  sentenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  sentenceText: { fontSize: 20, color: colors.dark, fontWeight: '600' },
  blank: {
    borderBottomWidth: 2,
    borderColor: colors.primary,
    minWidth: 80,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignItems: 'center',
  },
  blankCorrect: {
    borderColor: colors.secondary,
    backgroundColor: '#E8FFF5',
    borderRadius: 4,
    borderBottomWidth: 2,
  },
  blankWrong: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0F0',
    borderRadius: 4,
    borderBottomWidth: 2,
  },
  blankText: { fontSize: 20, color: colors.primary, fontWeight: '700' },
});
