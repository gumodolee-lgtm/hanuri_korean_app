import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { getLessonById, getLessonsForLevel, ALL_LEVELS, getMeaning, VocabCard } from '../../data/lessons';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { NativeLanguage } from '../../types';
import { speakKorean } from '../../utils/tts';
import {
  startRecording,
  stopRecording,
  assessPronunciation,
  PronunciationResult,
} from '../../services/pronunciationService';
import { sendLessonCompleteNotification } from '../../services/notificationService';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

type NavProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Lesson'>;

type Phase = 'flashcard' | 'quiz' | 'fillblank' | 'pronunciation';

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

// ─── 발음 연습 단계 컴포넌트 ─────────────────────────────────

function PronunciationPhase({
  vocab,
  pronIndex,
  onNext,
  onFinish,
  isFinishing,
}: {
  vocab: VocabCard[];
  pronIndex: number;
  onNext: (result: PronunciationResult) => void;
  onFinish: () => void;
  isFinishing: boolean;
}) {
  const card = vocab[pronIndex];
  const t = useT();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const isLast = pronIndex === vocab.length - 1;

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      try {
        const uri = await stopRecording();
        if (uri) {
          const assessment = await assessPronunciation(uri, card.korean, t.pron);
          setResult(assessment);
        }
      } catch {
        setResult({
          transcript: '',
          score: 0,
          feedback: t.lesson.pronError,
          wordMatches: [],
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setResult(null);
      setIsRecording(true);
      try {
        await startRecording();
      } catch {
        setIsRecording(false);
      }
    }
  }, [isRecording, card.korean]);

  const scoreColor =
    !result ? colors.gray
    : result.score >= 70 ? colors.secondary
    : result.score >= 40 ? '#FFD93D'
    : colors.primary;

  return (
    <View style={pronStyles.container}>
      {/* 단어 카드 */}
      <View style={pronStyles.card}>
        <Text style={pronStyles.emoji}>{card.emoji ?? '🎤'}</Text>
        <Text style={pronStyles.korean}>{card.korean}</Text>
        <Text style={pronStyles.roman}>{card.romanization}</Text>
        <TouchableOpacity
          style={pronStyles.listenBtn}
          onPress={() => speakKorean(card.korean)}
        >
          <Text style={pronStyles.listenBtnText}>{t.lesson.listenFirst}</Text>
        </TouchableOpacity>
      </View>

      {/* 녹음 버튼 */}
      <View style={pronStyles.recordSection}>
        <Text style={pronStyles.instruction}>
          {isRecording ? t.lesson.recording : t.lesson.tapMic}
        </Text>
        <TouchableOpacity
          style={[pronStyles.micBtn, isRecording && pronStyles.micBtnActive]}
          onPress={handleRecord}
          disabled={isProcessing}
        >
          {isProcessing
            ? <ActivityIndicator color={colors.white} />
            : <Text style={pronStyles.micIcon}>{isRecording ? '⏹' : '🎤'}</Text>
          }
        </TouchableOpacity>
      </View>

      {/* 결과 */}
      {result && (
        <View style={pronStyles.resultBox}>
          <View style={pronStyles.scoreRow}>
            <Text style={[pronStyles.scoreNum, { color: scoreColor }]}>
              {result.score}{t.lesson.scoreUnit}
            </Text>
            <Text style={pronStyles.feedbackText}>{result.feedback}</Text>
          </View>

          {result.transcript.length > 0 && (
            <Text style={pronStyles.transcriptText}>
              {t.lesson.recognized} "{result.transcript}"
            </Text>
          )}

          <View style={pronStyles.wordMatchRow}>
            {result.wordMatches.map((wm, i) => (
              <View
                key={i}
                style={[
                  pronStyles.wordChip,
                  { backgroundColor: wm.matched ? colors.secondary + '30' : colors.primary + '20' },
                ]}
              >
                <Text style={[pronStyles.wordChipText, { color: wm.matched ? colors.secondary : colors.primary }]}>
                  {wm.matched ? '✓' : '✗'} {wm.word}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[pronStyles.nextBtn, isLast && isFinishing && { opacity: 0.5 }]}
            disabled={isLast && isFinishing}
            onPress={() => {
              onNext(result);
              if (isLast) onFinish();
            }}
          >
            <Text style={pronStyles.nextBtnText}>
              {isLast ? t.lesson.lessonComplete : t.lesson.nextWord}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const pronStyles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: { fontSize: 48 },
  korean: { fontSize: 36, fontWeight: '800', color: colors.dark },
  roman: { ...typography.body, color: colors.gray },
  listenBtn: {
    backgroundColor: colors.secondary + '22',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginTop: spacing.xs,
  },
  listenBtnText: { ...typography.caption, color: colors.secondary, fontWeight: '700' },

  recordSection: { alignItems: 'center', gap: spacing.sm },
  instruction: { ...typography.body, color: colors.gray, textAlign: 'center' },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  micBtnActive: { backgroundColor: '#CC0000' },
  micIcon: { fontSize: 32 },

  resultBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scoreNum: { fontSize: 36, fontWeight: '900' },
  feedbackText: { ...typography.body, color: colors.dark, flex: 1, lineHeight: 22 },
  transcriptText: { ...typography.caption, color: colors.gray, fontStyle: 'italic' },
  wordMatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  wordChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  wordChipText: { fontSize: 13, fontWeight: '600' },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nextBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },
});

// ─── 메인 레슨 플레이어 ───────────────────────────────────────

export default function LessonPlayerScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { updateProgress, addXP, addTodayMinutes, markTodayLearned, progress } = useUserStore();
  const { user, levelUp } = useAuthStore();
  const nativeLang: NativeLanguage = user?.native_lang ?? 'en';
  const t = useT();

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
  const [pronIndex, setPronIndex] = useState(0);
  const [pronTotalScore, setPronTotalScore] = useState(0);
  // useRef: 동기적 중복 호출 차단 (setState는 비동기라 더블탭 race condition 발생 가능)
  const isFinishingRef = useRef(false);
  const [isFinishingUI, setIsFinishingUI] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  // Must be called before any conditional return (Rules of Hooks)
  const quizQuestions = useRef(buildQuiz(lesson?.vocabulary ?? [], nativeLang)).current;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t.lesson.lessonNotFound}</Text>
      </SafeAreaView>
    );
  }

  const vocab = lesson.vocabulary;
  const fillBlanks = lesson.fillInBlanks ?? [];

  const totalSteps = vocab.length + quizQuestions.length + fillBlanks.length + vocab.length;
  const currentStep =
    phase === 'flashcard'  ? cardIndex :
    phase === 'quiz'       ? vocab.length + quizIndex :
    phase === 'fillblank'  ? vocab.length + quizQuestions.length + fillIndex :
                             vocab.length + quizQuestions.length + fillBlanks.length + pronIndex;
  const lessonProgress = totalSteps > 0 ? currentStep / totalSteps : 0;

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
    if (idx === quizQuestions[quizIndex].correctIndex) setScore((s) => s + 1);
  };

  const handleNextQuiz = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
    } else if (fillBlanks.length > 0) {
      setPhase('fillblank');
    } else {
      setPhase('pronunciation');
    }
  };

  const handleFillAnswer = (choice: string) => {
    if (fillSelected !== null) return;
    setFillSelected(choice);
    if (choice === fillBlanks[fillIndex].answer) setFillScore((s) => s + 1);
  };

  const handleNextFill = () => {
    if (fillIndex < fillBlanks.length - 1) {
      setFillIndex(fillIndex + 1);
      setFillSelected(null);
    } else {
      setPhase('pronunciation');
    }
  };

  const handlePronResult = (result: PronunciationResult) => {
    setPronTotalScore((s) => s + result.score);
    if (pronIndex < vocab.length - 1) {
      setPronIndex(pronIndex + 1);
    }
  };

  const finishLesson = () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true; // 동기적으로 즉시 차단
    setIsFinishingUI(true);        // UI 비활성화 트리거
    const quizTotal = quizQuestions.length + fillBlanks.length;
    const quizCorrect = score + fillScore;
    const quizScore = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 100;
    const pronAvg = vocab.length > 0 ? Math.round(pronTotalScore / vocab.length) : 0;
    const finalScore = Math.round((quizScore + pronAvg) / 2);
    const xpEarned = Math.round(lesson.xpReward * (finalScore / 100));
    // 'guest_' 접두사 규칙 준수: isGuest() 체크가 startsWith('guest_')로 동작함
    const userId = user?.id ?? 'guest_anonymous';

    updateProgress({ user_id: userId, lesson_id: lesson.id, status: 'completed', score: finalScore });
    addXP(xpEarned, userId);
    // 실제 학습 완료 기록: streak/todayLearned 갱신 후 학습 시간 누적
    markTodayLearned(userId);
    addTodayMinutes(lesson.estimatedMinutes, userId);
    // 레슨 완료 축하 알림 (fire-and-forget)
    sendLessonCompleteNotification(xpEarned, {
      title: t.notifContent.lessonTitle,
      body: `+${xpEarned}${t.notifContent.lessonBody}`,
    }).catch(() => {});

    // Level-up check: if all lessons at current level are now complete, advance
    const currentLevel = user?.current_level ?? 1;
    if (lesson.level === currentLevel && currentLevel < ALL_LEVELS.length) {
      const levelLessons = getLessonsForLevel(currentLevel);
      const updatedProgress = [
        ...progress.filter((p) => p.lesson_id !== lesson.id),
        { user_id: userId, lesson_id: lesson.id, status: 'completed' as const, score: finalScore },
      ];
      const allDone = levelLessons.every((l) =>
        updatedProgress.some((p) => p.lesson_id === l.id && p.status === 'completed')
      );
      if (allDone) levelUp();
    }

    navigation.replace('LessonComplete', {
      xp: xpEarned,
      score: finalScore,
      expressions: vocab.slice(0, 3).map((v) => v.korean),
    });
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const currentCard = vocab[cardIndex];
  const currentQ    = quizQuestions[quizIndex];
  const currentFill = fillBlanks[fillIndex];

  const phaseLabel =
    phase === 'flashcard'  ? t.lesson.flashcard :
    phase === 'quiz'       ? t.lesson.quiz :
    phase === 'fillblank'  ? t.lesson.fillBlank : t.lesson.pronunciation;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${lessonProgress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentStep + 1}/{totalSteps}</Text>
      </View>

      <View style={styles.lessonLabel}>
        <Text style={styles.lessonLabelText}>{lesson.emoji} {lesson.titleKo}</Text>
        <Text style={styles.phaseLabel}>{phaseLabel}</Text>
      </View>

      {/* ─── FLASHCARD ─── */}
      {phase === 'flashcard' && (
        <View style={styles.body}>
          <TouchableOpacity onPress={handleFlip} activeOpacity={0.9} style={styles.cardWrapper}>
            <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
              <Text style={styles.cardEmoji}>{currentCard.emoji ?? '🇰🇷'}</Text>
              <Text style={styles.cardKorean}>{currentCard.korean}</Text>
              <Text style={styles.cardRoman}>{currentCard.romanization}</Text>
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakKorean(currentCard.korean)}>
                <Text style={styles.speakBtnText}>{t.lesson.listen}</Text>
              </TouchableOpacity>
              <Text style={styles.cardHint}>{t.lesson.tapToSee}</Text>
            </Animated.View>

            <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
              <Text style={styles.cardEmoji}>{currentCard.emoji ?? '💡'}</Text>
              <Text style={styles.cardKorean}>{currentCard.korean}</Text>
              <Text style={styles.cardMeaning}>{getMeaning(currentCard, nativeLang)}</Text>
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakKorean(currentCard.korean)}>
                <Text style={styles.speakBtnText}>{t.lesson.listenAgain}</Text>
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
              {cardIndex < vocab.length - 1 ? t.lesson.nextCard : t.lesson.startQuiz}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── QUIZ ─── */}
      {phase === 'quiz' && (
        <View style={styles.body}>
          <View style={styles.quizQuestion}>
            <Text style={styles.quizEmoji}>{currentQ.card.emoji ?? '❓'}</Text>
            <Text style={styles.quizKorean}>{currentQ.card.korean}</Text>
            <Text style={styles.quizRoman}>{currentQ.card.romanization}</Text>
            <Text style={styles.quizInstruction}>{t.lesson.chooseAnswer}</Text>
          </View>

          <View style={styles.choices}>
            {currentQ.choices.map((choice, idx) => {
              let bg = colors.white;
              let border = colors.border;
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
                  {selectedAnswer !== null && idx === currentQ.correctIndex && <Text style={styles.choiceIcon}>✓</Text>}
                  {selectedAnswer === idx && idx !== currentQ.correctIndex && <Text style={styles.choiceIconWrong}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedAnswer !== null && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackText}>
                {selectedAnswer === currentQ.correctIndex ? t.lesson.correct : `${t.lesson.wrongPrefix} ${getMeaning(currentQ.card, nativeLang)}`}
              </Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuiz}>
                <Text style={styles.nextBtnText}>
                  {quizIndex < quizQuestions.length - 1 ? t.lesson.next : fillBlanks.length > 0 ? t.lesson.toFillBlank : t.lesson.toPronunciation}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ─── FILL-IN-BLANK ─── */}
      {phase === 'fillblank' && currentFill && (
        <View style={styles.body}>
          <View style={styles.quizQuestion}>
            <Text style={styles.fillTitle}>{t.lesson.fillBlankInstruction}</Text>
            <View style={styles.sentenceRow}>
              {currentFill.before ? <Text style={styles.sentenceText}>{currentFill.before}</Text> : null}
              <View style={[
                styles.blank,
                fillSelected !== null && fillSelected === currentFill.answer && styles.blankCorrect,
                fillSelected !== null && fillSelected !== currentFill.answer && styles.blankWrong,
              ]}>
                <Text style={styles.blankText}>{fillSelected ?? '___'}</Text>
              </View>
              {currentFill.after ? <Text style={styles.sentenceText}>{currentFill.after}</Text> : null}
            </View>
            <Text style={styles.quizInstruction}>💡 {currentFill.hint}</Text>
          </View>

          <View style={styles.choices}>
            {currentFill.choices.map((choice, idx) => {
              let bg = colors.white;
              let border = colors.border;
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
                  {fillSelected !== null && choice === currentFill.answer && <Text style={styles.choiceIcon}>✓</Text>}
                  {fillSelected === choice && choice !== currentFill.answer && <Text style={styles.choiceIconWrong}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {fillSelected !== null && (
            <View style={styles.feedbackRow}>
              <Text style={styles.feedbackText}>
                {fillSelected === currentFill.answer ? t.lesson.correct : `${t.lesson.wrongPrefix} ${currentFill.answer}`}
              </Text>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextFill}>
                <Text style={styles.nextBtnText}>
                  {fillIndex < fillBlanks.length - 1 ? t.lesson.next : t.lesson.toPronunciation}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ─── PRONUNCIATION ─── */}
      {phase === 'pronunciation' && (
        <PronunciationPhase
          vocab={vocab}
          pronIndex={pronIndex}
          onNext={handlePronResult}
          onFinish={finishLesson}
          isFinishing={isFinishingUI}
        />
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

  cardWrapper: { flex: 1, position: 'relative' },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
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
  blankCorrect: { borderColor: colors.secondary, backgroundColor: '#E8FFF5', borderRadius: 4, borderBottomWidth: 2 },
  blankWrong: { borderColor: colors.primary, backgroundColor: '#FFF0F0', borderRadius: 4, borderBottomWidth: 2 },
  blankText: { fontSize: 20, color: colors.primary, fontWeight: '700' },
});
