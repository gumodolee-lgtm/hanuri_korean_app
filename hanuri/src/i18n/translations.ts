import { NativeLanguage } from '../types';

export interface Translations {
  tabs: { home: string; lessons: string; aiChat: string; ranking: string; profile: string };
  splash: {
    slogan: string; startFree: string; haveAccount: string; or: string;
    googleLogin: string; appleLogin: string;
    loginFailedTitle: string; loginFailedMsg: string;
  };
  onboarding: {
    langTitle: string; langSubtitle: string; next: string;
    goalTitle: string;
    goals: { kpop: string; travel: string; business: string; topik: string; relationship: string };
    levelTitle: string;
    levels: { absolute: string; canRead: string; basicConv: string; intermediate: string };
    levelTest: string;
    timeTitle: string;
    timeCasual: string; timeRecommended: string; timeIntensive: string; recommended: string;
    timeTip: string;
    notifTitle: string; notifMorning: string; notifEvening: string; notifNight: string; notifCustom: string;
    startApp: string; skip: string;
  };
  home: {
    greeting: string; goalPrefix: string;
    streakLabel: string; xpLabel: string; completedLabel: string;
    dailyGoalTitle: string; minUnit: string;
    goalAchieved: string; startFirstLesson: string;
    levelProgress: string; xpUntilNext: string;
    startNow: string; startLessonBtn: string;
    quickStart: string; aiChatLabel: string; aiChatSub: string;
    todaysWord: string; todaysWordSub: string;
    kpop: string; comingSoon: string;
  };
  goalLabels: { kpop: string; travel: string; business: string; topik: string; relationship: string };
  lessons: { title: string; comingSoon: string; minUnit: string };
  lesson: {
    flashcard: string; quiz: string; fillBlank: string; pronunciation: string;
    tapToSee: string; listen: string; listenAgain: string;
    nextCard: string; startQuiz: string;
    chooseAnswer: string; correct: string; wrongPrefix: string;
    next: string; toFillBlank: string; toPronunciation: string;
    fillBlankInstruction: string;
    tapMic: string; recording: string; listenFirst: string;
    scoreUnit: string; recognized: string; nextWord: string; lessonComplete: string;
    lessonNotFound: string; pronError: string;
  };
  aiChat: {
    convUnit: string; end: string; inputPlaceholder: string;
    typing: string; notFound: string; connectionError: string;
  };
  aiHub: {
    title: string; subtitle: string;
    freeScenarios: string; proScenarios: string; upgrade: string; proLocked: string;
    difficulty: Record<number, string>;
    tipTitle: string; tip1: string; tip2: string; tip3: string;
  };
  profile: {
    learnerSuffix: string; goalSuffix: string;
    xpLabel: string; streakLabel: string; completedLabel: string;
    levelProgress: string; xpUntilNext: string;
    badges: string; settings: string;
    notifLabel: string; notifHint: string;
    dailyGoal: string; nativeLang: string; signOut: string;
    upgradeTitle: string; upgradeSub: string;
    notifPermTitle: string; notifPermMsg: string; confirm: string;
    signOutConfirmTitle: string; signOutConfirmMsg: string; cancel: string;
    badgeNames: { firstLesson: string; weekStreak: string; vocab100: string; aiChat5: string; perfectQuiz: string; levelUp: string };
    badgeDescs: { firstLesson: string; weekStreak: string; vocab100: string; aiChat5: string; perfectQuiz: string; levelUp: string };
  };
  leaderboard: { title: string; subtitle: string; meSuffix: string; notice: string };
  lessonComplete: {
    title: string; perfect: string; great: string; tryAgain: string;
    accuracy: string; xpEarned: string; wordsLearned: string;
    expressionsTitle: string; goHome: string; nextLesson: string;
  };
  pron: { perfect: string; good: string; practice: string; tryAgain: string; error: string };
  notifContent: {
    dailyTitle: string; dailyBody: string;
    streakTitle: string; streakBody: string;
    lessonTitle: string; lessonBody: string;
  };
  proUpgrade: {
    heroSub: string;
    benefitsTitle: string;
    benefit1Title: string; benefit1Desc: string;
    benefit2Title: string; benefit2Desc: string;
    benefit3Title: string; benefit3Desc: string;
    benefit4Title: string; benefit4Desc: string;
    benefit5Title: string; benefit5Desc: string;
    planTitle: string;
    monthly: string; yearly: string; yearlyBadge: string;
    subscribeMonthly: string; subscribeYearly: string;
    disclaimer: string;
    successTitle: string; successMsg: string; successBtn: string;
  };
}

const en: Translations = {
  tabs: { home: 'Home', lessons: 'Lessons', aiChat: 'AI Chat', ranking: 'Ranking', profile: 'Me' },
  splash: {
    slogan: 'Connect the world through Korean',
    startFree: '🚀 Start for Free',
    haveAccount: 'I already have an account',
    or: 'or',
    googleLogin: 'Continue with Google',
    appleLogin: 'Continue with Apple',
    loginFailedTitle: 'Login Failed',
    loginFailedMsg: 'A problem occurred with Google login. Please try again.',
  },
  onboarding: {
    langTitle: 'What language do you speak?', langSubtitle: '어떤 언어로 설명해 드릴까요?', next: 'Next →',
    goalTitle: 'Why are you learning Korean?',
    goals: { kpop: 'K-Pop & K-Drama', travel: 'Travel to Korea', business: 'Business & Career', topik: 'TOPIK Exam', relationship: 'Korean Friends/Partner' },
    levelTitle: "What's your current Korean level?",
    levels: { absolute: 'Complete beginner', canRead: 'Can read Hangeul', basicConv: 'Basic conversation', intermediate: 'Intermediate or above' },
    levelTest: '→ Check with level test',
    timeTitle: 'How many minutes per day?',
    timeCasual: 'Casual', timeRecommended: 'Recommended', timeIntensive: 'Intensive', recommended: '⭐',
    timeTip: '💡 15 min/day → basic conversation in 3 months!',
    notifTitle: 'Set your study reminder',
    notifMorning: 'Morning 8:00', notifEvening: 'Evening 7:00', notifNight: 'Night 10:00', notifCustom: 'Custom',
    startApp: 'Get Started 🚀', skip: 'Skip',
  },
  home: {
    greeting: 'Hello! 👋', goalPrefix: 'Goal:',
    streakLabel: 'Streak', xpLabel: 'Total XP', completedLabel: 'Lessons',
    dailyGoalTitle: "Today's Goal", minUnit: 'min',
    goalAchieved: '🎉 Daily goal achieved!', startFirstLesson: 'Start your first lesson today!',
    levelProgress: 'Level Progress', xpUntilNext: 'XP to next level',
    startNow: '📍 Start Now', startLessonBtn: '▶ Start Lesson',
    quickStart: '⚡ Quick Start', aiChatLabel: 'AI Chat', aiChatSub: 'Free talk',
    todaysWord: "Today's Word", todaysWordSub: '5 min', kpop: 'K-POP', comingSoon: 'Coming soon',
  },
  goalLabels: { kpop: 'K-POP / Drama', travel: 'Travel', business: 'Business', topik: 'TOPIK Exam', relationship: 'Relationships' },
  lessons: { title: '📚 Lessons', comingSoon: 'Coming soon', minUnit: 'min' },
  lesson: {
    flashcard: 'Flashcard', quiz: 'Quiz', fillBlank: 'Fill in Blank', pronunciation: 'Pronunciation',
    tapToSee: 'Tap to see meaning', listen: '🔊 Listen', listenAgain: '🔊 Listen again',
    nextCard: 'Next Card →', startQuiz: 'Start Quiz →',
    chooseAnswer: 'Choose the meaning', correct: '🎉 Correct!', wrongPrefix: '😅 Answer:',
    next: 'Next →', toFillBlank: 'Fill in Blank →', toPronunciation: 'Pronunciation →',
    fillBlankInstruction: 'Choose the correct word',
    tapMic: 'Tap mic to repeat after', recording: '🔴 Recording... (tap to finish)',
    listenFirst: '🔊 Listen first', scoreUnit: 'pts', recognized: 'Recognized:',
    nextWord: 'Next Word →', lessonComplete: 'Complete 🎊',
    lessonNotFound: 'Lesson not found.', pronError: 'Error. Please try again.',
  },
  aiChat: {
    convUnit: 'conversations', end: 'End', inputPlaceholder: 'Type in Korean...',
    typing: 'Typing...', notFound: 'Scenario not found.', connectionError: 'Connection error. Please try again. 😅',
  },
  aiHub: {
    title: '🗣️ AI Chat', subtitle: 'Pick a scenario and practice Korean with AI',
    freeScenarios: 'Free Scenarios', proScenarios: 'PRO Scenarios', upgrade: '👑 Upgrade', proLocked: 'Upgrade to PRO to unlock',
    difficulty: { 1: 'Beginner', 2: 'Low-Inter', 3: 'Intermediate', 4: 'Upper-Inter', 5: 'Advanced' },
    tipTitle: '💡 AI Chat Tips',
    tip1: "• It's okay to make mistakes! AI will auto-correct",
    tip2: '• Speaking only in Korean makes you improve faster',
    tip3: '• Make sure to read the [교정:] parts',
  },
  profile: {
    learnerSuffix: 'Learner', goalSuffix: 'Goal',
    xpLabel: 'Total XP', streakLabel: '🔥 Streak', completedLabel: 'Lessons',
    levelProgress: 'Level Progress', xpUntilNext: 'XP to next level',
    badges: '🏅 Badges', settings: '⚙️ Settings',
    notifLabel: '📅 Study Reminder', notifHint: 'Daily 8pm reminder',
    dailyGoal: '🎯 Daily Goal', nativeLang: '🌍 Native Language', signOut: 'Sign Out',
    upgradeTitle: 'Upgrade to HANURI PRO', upgradeSub: 'Business · TOPIK · Unlimited AI Chat',
    notifPermTitle: 'Permission Required', notifPermMsg: 'Please allow notifications in Settings.',
    confirm: 'OK',
    signOutConfirmTitle: 'Sign Out', signOutConfirmMsg: 'Are you sure you want to sign out?', cancel: 'Cancel',
    badgeNames: { firstLesson: 'First Lesson', weekStreak: '7-Day Streak', vocab100: 'Vocab Master', aiChat5: 'AI Champ', perfectQuiz: 'Quiz Master', levelUp: 'Level Up' },
    badgeDescs: { firstLesson: 'Complete first lesson', weekStreak: '7 days in a row', vocab100: 'Reach 500 XP', aiChat5: 'Start AI chat', perfectQuiz: 'Get 100% on quiz', levelUp: 'Reach next level' },
  },
  leaderboard: { title: '🏆 Ranking', subtitle: 'This week by XP', meSuffix: '(Me)', notice: '💡 Complete lessons and AI chats to earn XP and climb the ranking!' },
  lessonComplete: {
    title: 'Lesson Complete!', perfect: 'Perfect!', great: 'Great job!', tryAgain: 'Try again!',
    accuracy: 'Accuracy', xpEarned: 'XP Earned', wordsLearned: 'Words',
    expressionsTitle: "Today's Expressions", goHome: 'Back to Home', nextLesson: 'Next Lesson',
  },
  pron: {
    perfect: 'Perfect! Your pronunciation is accurate. 🎉',
    good: 'Great! Practice "{words}" more. ⭐',
    practice: 'Keep practicing. Focus on "{words}". 💪',
    tryAgain: 'Try again slowly. You got this! 🔄',
    error: 'Error occurred. Please try again.',
  },
  notifContent: {
    dailyTitle: 'Time to study Korean! 🇰🇷',
    dailyBody: 'A little each day — start today\'s lesson!',
    streakTitle: '🔥 Your streak is at risk!',
    streakBody: 'Complete one lesson before midnight to keep your streak!',
    lessonTitle: 'Lesson complete! 🎉',
    lessonBody: ' XP earned! Great job today!',
  },
  proUpgrade: {
    heroSub: 'Take your Korean to the next level',
    benefitsTitle: 'PRO Benefits',
    benefit1Title: 'Business Korean', benefit1Desc: 'Master professional Korean business expressions',
    benefit2Title: 'TOPIK Prep', benefit2Desc: 'Real TOPIK training with AI',
    benefit3Title: 'Unlimited AI Chat', benefit3Desc: 'Practice without conversation limits',
    benefit4Title: 'Advanced Grammar', benefit4Desc: 'Detailed grammar feedback and correction',
    benefit5Title: 'Leaderboard Badge', benefit5Desc: 'PRO-exclusive badges and ranking display',
    planTitle: 'Choose a Plan',
    monthly: 'Monthly', yearly: 'Annual', yearlyBadge: '40% off',
    subscribeMonthly: 'Start Monthly Subscription',
    subscribeYearly: 'Start Annual Subscription',
    disclaimer: 'Cancel anytime. Subscription renews automatically.',
    successTitle: 'Subscribed!', successMsg: 'Welcome to HANURI PRO! All PRO features are now unlocked.', successBtn: 'Get Started',
  },
};

const ko: Translations = {
  tabs: { home: '홈', lessons: '레슨', aiChat: 'AI대화', ranking: '랭킹', profile: '나' },
  splash: {
    slogan: '한국어로 세상을 연결하다',
    startFree: '🚀 무료로 시작하기',
    haveAccount: '이미 계정이 있어요',
    or: '또는',
    googleLogin: 'Google로 계속하기',
    appleLogin: 'Apple로 계속하기',
    loginFailedTitle: '로그인 실패',
    loginFailedMsg: 'Google 로그인 중 문제가 발생했습니다. 다시 시도해주세요.',
  },
  onboarding: {
    langTitle: '어떤 언어로 설명해 드릴까요?', langSubtitle: 'What language do you speak?', next: '다음 →',
    goalTitle: '왜 한국어를 배우나요?',
    goals: { kpop: 'K-팝 & K-드라마', travel: '한국 여행', business: '비즈니스 & 취업', topik: 'TOPIK 시험 준비', relationship: '한국인 친구/연인' },
    levelTitle: '현재 한국어 실력은?',
    levels: { absolute: '완전 처음이에요', canRead: '한글은 읽을 수 있어요', basicConv: '기초 회화 가능해요', intermediate: '중급 이상이에요' },
    levelTest: '→ 레벨 테스트로 확인하기',
    timeTitle: '하루 몇 분 학습할까요?',
    timeCasual: '가볍게', timeRecommended: '추천', timeIntensive: '집중 학습', recommended: '⭐',
    timeTip: '💡 15분/일 → 3개월 후 기초 회화 가능!',
    notifTitle: '학습 알림을 설정하세요',
    notifMorning: '오전 8:00', notifEvening: '오후 7:00', notifNight: '오후 10:00', notifCustom: '직접 설정',
    startApp: '시작하기 🚀', skip: '건너뛰기',
  },
  home: {
    greeting: '안녕하세요! 👋', goalPrefix: '목표:',
    streakLabel: '연속 학습', xpLabel: '총 XP', completedLabel: '완료 레슨',
    dailyGoalTitle: '오늘의 목표', minUnit: '분',
    goalAchieved: '🎉 오늘 목표 달성!', startFirstLesson: '오늘 첫 레슨을 시작해보세요!',
    levelProgress: '레벨 진행도', xpUntilNext: 'XP 남았어요',
    startNow: '📍 지금 시작하기', startLessonBtn: '▶ 레슨 시작하기',
    quickStart: '⚡ 빠른 시작', aiChatLabel: 'AI 대화', aiChatSub: '자유 회화',
    todaysWord: '오늘의 단어', todaysWordSub: '5분 완성', kpop: 'K-POP', comingSoon: 'Coming soon',
  },
  goalLabels: { kpop: 'K-POP / 드라마', travel: '여행', business: '비즈니스', topik: 'TOPIK 시험', relationship: '인간관계' },
  lessons: { title: '📚 레슨', comingSoon: '준비 중', minUnit: '분' },
  lesson: {
    flashcard: '단어 카드', quiz: '퀴즈', fillBlank: '빈칸 채우기', pronunciation: '발음 연습',
    tapToSee: '탭하여 뜻 확인', listen: '🔊 듣기', listenAgain: '🔊 다시 듣기',
    nextCard: '다음 카드 →', startQuiz: '퀴즈 시작 →',
    chooseAnswer: '뜻을 선택하세요', correct: '🎉 정답!', wrongPrefix: '😅 정답:',
    next: '다음 →', toFillBlank: '빈칸 채우기 →', toPronunciation: '발음 연습 →',
    fillBlankInstruction: '빈칸에 알맞은 말을 고르세요',
    tapMic: '마이크를 탭하여 따라 읽기', recording: '🔴 녹음 중... (탭하여 완료)',
    listenFirst: '🔊 먼저 듣기', scoreUnit: '점', recognized: '인식된 발음:',
    nextWord: '다음 단어 →', lessonComplete: '레슨 완료 🎊',
    lessonNotFound: '레슨을 찾을 수 없습니다.', pronError: '오류가 발생했어요. 다시 시도해주세요.',
  },
  aiChat: {
    convUnit: '개 대화', end: '종료', inputPlaceholder: '한국어로 입력하세요...',
    typing: '입력 중...', notFound: '시나리오를 찾을 수 없습니다.', connectionError: '죄송해요, 연결에 문제가 있어요. 잠시 후 다시 시도해주세요. 😅',
  },
  aiHub: {
    title: '🗣️ AI 대화', subtitle: '원하는 상황을 선택하고 AI와 한국어로 대화해봐요',
    freeScenarios: '무료 시나리오', proScenarios: 'PRO 시나리오', upgrade: '👑 업그레이드', proLocked: 'PRO로 업그레이드하면 이용할 수 있어요',
    difficulty: { 1: '초급', 2: '중하급', 3: '중급', 4: '중상급', 5: '고급' },
    tipTitle: '💡 AI 대화 팁',
    tip1: '• 틀려도 괜찮아요! AI가 자동으로 교정해줘요',
    tip2: '• 한국어로만 대화하면 실력이 훨씬 빨리 늘어요',
    tip3: '• [교정:] 부분을 꼭 읽어보세요',
  },
  profile: {
    learnerSuffix: '학습자', goalSuffix: '목표',
    xpLabel: '총 XP', streakLabel: '🔥 연속', completedLabel: '완료 레슨',
    levelProgress: '레벨 진행도', xpUntilNext: 'XP 남았어요',
    badges: '🏅 배지', settings: '⚙️ 설정',
    notifLabel: '📅 학습 알림', notifHint: '매일 오후 8시 리마인더',
    dailyGoal: '🎯 일일 목표', nativeLang: '🌍 모국어', signOut: '로그아웃',
    upgradeTitle: 'HANURI PRO로 업그레이드', upgradeSub: '비즈니스 · TOPIK · 무제한 AI 대화',
    notifPermTitle: '알림 권한 필요', notifPermMsg: '설정 앱에서 하누리 알림을 허용해주세요.',
    confirm: '확인',
    signOutConfirmTitle: '로그아웃', signOutConfirmMsg: '정말 로그아웃하시겠어요?', cancel: '취소',
    badgeNames: { firstLesson: '첫 레슨', weekStreak: '7일 연속', vocab100: '단어 달인', aiChat5: 'AI 대화왕', perfectQuiz: '퀴즈 마스터', levelUp: '레벨업' },
    badgeDescs: { firstLesson: '첫 레슨 완료', weekStreak: '7일 연속 학습', vocab100: 'XP 500 달성', aiChat5: 'AI 대화 시작', perfectQuiz: '퀴즈 100% 달성', levelUp: '다음 레벨 도달' },
  },
  leaderboard: { title: '🏆 랭킹', subtitle: '이번 주 XP 기준', meSuffix: '(나)', notice: '💡 레슨 완료 및 AI 대화로 XP를 얻어 랭킹을 올려보세요!' },
  lessonComplete: {
    title: '레슨 완료!', perfect: '완벽해요!', great: '잘했어요!', tryAgain: '다시 도전해봐요!',
    accuracy: '정답률', xpEarned: 'XP 획득', wordsLearned: '학습 단어',
    expressionsTitle: '오늘 배운 표현', goHome: '홈으로 돌아가기', nextLesson: '다음 레슨 보기',
  },
  pron: {
    perfect: '완벽해요! 발음이 정확합니다. 🎉',
    good: '잘했어요! "{words}" 부분을 더 연습해보세요. ⭐',
    practice: '조금 더 연습해봐요. "{words}"에 집중하세요. 💪',
    tryAgain: '다시 한번 천천히 따라 읽어보세요. 화이팅! 🔄',
    error: '오류가 발생했어요. 다시 시도해주세요.',
  },
  notifContent: {
    dailyTitle: '오늘 한국어 공부 했나요? 🇰🇷',
    dailyBody: '매일 조금씩 — 오늘의 레슨을 시작해보세요!',
    streakTitle: '🔥 스트릭이 끊길 것 같아요!',
    streakBody: '오늘 자정 전에 레슨 하나만 완료하면 스트릭을 지킬 수 있어요!',
    lessonTitle: '레슨 완료! 🎉',
    lessonBody: ' XP 획득! 오늘도 대단해요!',
  },
  proUpgrade: {
    heroSub: '한국어 실력을 한 단계 끌어올리세요',
    benefitsTitle: 'PRO 혜택',
    benefit1Title: '비즈니스 회화', benefit1Desc: '전문적인 한국어 비즈니스 표현 마스터',
    benefit2Title: 'TOPIK 시험 준비', benefit2Desc: 'AI와 함께하는 실전 TOPIK 훈련',
    benefit3Title: '무제한 AI 대화', benefit3Desc: '대화 횟수 제한 없이 연습하세요',
    benefit4Title: '심화 문법 분석', benefit4Desc: '자세한 문법 피드백과 교정',
    benefit5Title: '리더보드 뱃지', benefit5Desc: 'PRO 전용 배지와 순위 표시',
    planTitle: '요금제 선택',
    monthly: '월간', yearly: '연간', yearlyBadge: '40% 할인',
    subscribeMonthly: '월간 구독 시작하기',
    subscribeYearly: '연간 구독 시작하기',
    disclaimer: '언제든지 취소할 수 있습니다. 구독은 자동 갱신됩니다.',
    successTitle: '구독 완료!', successMsg: 'HANURI PRO에 오신 것을 환영해요! 모든 PRO 기능이 잠금 해제되었습니다.', successBtn: '시작하기',
  },
};

const es: Translations = {
  tabs: { home: 'Inicio', lessons: 'Lecciones', aiChat: 'Chat IA', ranking: 'Ranking', profile: 'Yo' },
  splash: {
    slogan: 'Conecta el mundo a través del coreano',
    startFree: '🚀 Empezar gratis',
    haveAccount: 'Ya tengo una cuenta',
    or: 'o',
    googleLogin: 'Continuar con Google',
    appleLogin: 'Continuar con Apple',
    loginFailedTitle: 'Error de inicio de sesión',
    loginFailedMsg: 'Hubo un problema con Google. Por favor, inténtalo de nuevo.',
  },
  onboarding: {
    langTitle: '¿Qué idioma hablas?', langSubtitle: '어떤 언어로 설명해 드릴까요?', next: 'Siguiente →',
    goalTitle: '¿Por qué aprendes coreano?',
    goals: { kpop: 'K-Pop & K-Drama', travel: 'Viajar a Corea', business: 'Negocios & Carrera', topik: 'Examen TOPIK', relationship: 'Amigos/Pareja coreana' },
    levelTitle: '¿Cuál es tu nivel actual de coreano?',
    levels: { absolute: 'Principiante total', canRead: 'Puedo leer Hangul', basicConv: 'Conversación básica', intermediate: 'Intermedio o superior' },
    levelTest: '→ Verificar con prueba de nivel',
    timeTitle: '¿Cuántos minutos al día?',
    timeCasual: 'Casual', timeRecommended: 'Recomendado', timeIntensive: 'Intensivo', recommended: '⭐',
    timeTip: '💡 15 min/día → conversación básica en 3 meses!',
    notifTitle: 'Configura tu recordatorio de estudio',
    notifMorning: 'Mañana 8:00', notifEvening: 'Tarde 7:00', notifNight: 'Noche 10:00', notifCustom: 'Personalizado',
    startApp: 'Comenzar 🚀', skip: 'Omitir',
  },
  home: {
    greeting: '¡Hola! 👋', goalPrefix: 'Meta:',
    streakLabel: 'Racha', xpLabel: 'XP Total', completedLabel: 'Lecciones',
    dailyGoalTitle: 'Meta de hoy', minUnit: 'min',
    goalAchieved: '🎉 ¡Meta diaria lograda!', startFirstLesson: '¡Comienza tu primera lección hoy!',
    levelProgress: 'Progreso de nivel', xpUntilNext: 'XP para el siguiente nivel',
    startNow: '📍 Comenzar ahora', startLessonBtn: '▶ Iniciar lección',
    quickStart: '⚡ Inicio rápido', aiChatLabel: 'Chat IA', aiChatSub: 'Habla libre',
    todaysWord: 'Palabra del día', todaysWordSub: '5 min', kpop: 'K-POP', comingSoon: 'Próximamente',
  },
  goalLabels: { kpop: 'K-POP / Drama', travel: 'Viaje', business: 'Negocios', topik: 'Examen TOPIK', relationship: 'Relaciones' },
  lessons: { title: '📚 Lecciones', comingSoon: 'Próximamente', minUnit: 'min' },
  lesson: {
    flashcard: 'Tarjetas', quiz: 'Quiz', fillBlank: 'Completar', pronunciation: 'Pronunciación',
    tapToSee: 'Toca para ver el significado', listen: '🔊 Escuchar', listenAgain: '🔊 Escuchar de nuevo',
    nextCard: 'Siguiente →', startQuiz: 'Empezar Quiz →',
    chooseAnswer: 'Elige el significado', correct: '🎉 ¡Correcto!', wrongPrefix: '😅 Respuesta:',
    next: 'Siguiente →', toFillBlank: 'Completar →', toPronunciation: 'Pronunciación →',
    fillBlankInstruction: 'Elige la palabra correcta',
    tapMic: 'Toca el micrófono para repetir', recording: '🔴 Grabando... (toca para terminar)',
    listenFirst: '🔊 Escuchar primero', scoreUnit: 'pts', recognized: 'Reconocido:',
    nextWord: 'Siguiente palabra →', lessonComplete: 'Completado 🎊',
    lessonNotFound: 'Lección no encontrada.', pronError: 'Error. Por favor intenta de nuevo.',
  },
  aiChat: {
    convUnit: 'conversaciones', end: 'Terminar', inputPlaceholder: 'Escribe en coreano...',
    typing: 'Escribiendo...', notFound: 'Escenario no encontrado.', connectionError: 'Error de conexión. Por favor intenta de nuevo. 😅',
  },
  aiHub: {
    title: '🗣️ Chat IA', subtitle: 'Elige un escenario y practica coreano con IA',
    freeScenarios: 'Escenarios gratuitos', proScenarios: 'Escenarios PRO', upgrade: '👑 Actualizar', proLocked: 'Actualiza a PRO para desbloquear',
    difficulty: { 1: 'Principiante', 2: 'Básico', 3: 'Intermedio', 4: 'Avanzado', 5: 'Experto' },
    tipTitle: '💡 Consejos de Chat IA',
    tip1: '• ¡No pasa nada si te equivocas! La IA corrige automáticamente',
    tip2: '• Hablar solo en coreano mejora tu nivel mucho más rápido',
    tip3: '• Asegúrate de leer las partes [교정:]',
  },
  profile: {
    learnerSuffix: 'Estudiante', goalSuffix: 'Meta',
    xpLabel: 'XP Total', streakLabel: '🔥 Racha', completedLabel: 'Lecciones',
    levelProgress: 'Progreso de nivel', xpUntilNext: 'XP para siguiente nivel',
    badges: '🏅 Insignias', settings: '⚙️ Ajustes',
    notifLabel: '📅 Recordatorio de estudio', notifHint: 'Recordatorio diario a las 8pm',
    dailyGoal: '🎯 Meta diaria', nativeLang: '🌍 Idioma nativo', signOut: 'Cerrar sesión',
    upgradeTitle: 'Actualizar a HANURI PRO', upgradeSub: 'Negocios · TOPIK · Chat IA ilimitado',
    notifPermTitle: 'Permiso requerido', notifPermMsg: 'Permite notificaciones en Ajustes.',
    confirm: 'OK',
    signOutConfirmTitle: 'Cerrar sesión', signOutConfirmMsg: '¿Seguro que quieres cerrar sesión?', cancel: 'Cancelar',
    badgeNames: { firstLesson: 'Primera lección', weekStreak: 'Racha 7 días', vocab100: 'Maestro vocab', aiChat5: 'Campeón IA', perfectQuiz: 'Maestro quiz', levelUp: 'Subir nivel' },
    badgeDescs: { firstLesson: 'Completa primera lección', weekStreak: '7 días seguidos', vocab100: 'Alcanza 500 XP', aiChat5: 'Inicia chat IA', perfectQuiz: '100% en quiz', levelUp: 'Alcanza siguiente nivel' },
  },
  leaderboard: { title: '🏆 Ranking', subtitle: 'Esta semana por XP', meSuffix: '(Yo)', notice: '💡 ¡Completa lecciones y chats IA para ganar XP y subir en el ranking!' },
  lessonComplete: {
    title: '¡Lección completada!', perfect: '¡Perfecto!', great: '¡Bien hecho!', tryAgain: '¡Inténtalo de nuevo!',
    accuracy: 'Precisión', xpEarned: 'XP ganado', wordsLearned: 'Palabras',
    expressionsTitle: 'Expresiones de hoy', goHome: 'Volver al inicio', nextLesson: 'Ver siguiente lección',
  },
  pron: {
    perfect: '¡Perfecto! Tu pronunciación es precisa. 🎉',
    good: '¡Bien! Practica "{words}" un poco más. ⭐',
    practice: 'Sigue practicando. Enfócate en "{words}". 💪',
    tryAgain: 'Inténtalo de nuevo despacio. ¡Ánimo! 🔄',
    error: 'Ocurrió un error. Por favor intenta de nuevo.',
  },
  notifContent: {
    dailyTitle: '¡Hora de estudiar coreano! 🇰🇷',
    dailyBody: 'Un poco cada día — ¡empieza la lección de hoy!',
    streakTitle: '🔥 ¡Tu racha está en riesgo!',
    streakBody: '¡Completa una lección antes de medianoche para mantener tu racha!',
    lessonTitle: '¡Lección completada! 🎉',
    lessonBody: ' XP ganado. ¡Gran trabajo hoy!',
  },
  proUpgrade: {
    heroSub: 'Lleva tu coreano al siguiente nivel',
    benefitsTitle: 'Beneficios PRO',
    benefit1Title: 'Coreano de negocios', benefit1Desc: 'Domina expresiones profesionales en coreano',
    benefit2Title: 'Preparación TOPIK', benefit2Desc: 'Entrenamiento TOPIK real con IA',
    benefit3Title: 'Chat IA ilimitado', benefit3Desc: 'Practica sin límites de conversación',
    benefit4Title: 'Gramática avanzada', benefit4Desc: 'Retroalimentación y corrección detallada',
    benefit5Title: 'Insignia de ranking', benefit5Desc: 'Insignias exclusivas PRO y posición en ranking',
    planTitle: 'Elige un plan',
    monthly: 'Mensual', yearly: 'Anual', yearlyBadge: '40% descuento',
    subscribeMonthly: 'Empezar suscripción mensual',
    subscribeYearly: 'Empezar suscripción anual',
    disclaimer: 'Cancela cuando quieras. La suscripción se renueva automáticamente.',
    successTitle: '¡Suscrito!', successMsg: '¡Bienvenido a HANURI PRO! Todas las funciones PRO están desbloqueadas.', successBtn: 'Empezar',
  },
};

const zh: Translations = {
  tabs: { home: '主页', lessons: '课程', aiChat: 'AI对话', ranking: '排名', profile: '我' },
  splash: {
    slogan: '用韩语连接世界',
    startFree: '🚀 免费开始',
    haveAccount: '我已有账号',
    or: '或者',
    googleLogin: '使用Google继续',
    appleLogin: '使用Apple继续',
    loginFailedTitle: '登录失败',
    loginFailedMsg: 'Google登录出现问题，请重试。',
  },
  onboarding: {
    langTitle: '你使用哪种语言?', langSubtitle: '어떤 언어로 설명해 드릴까요?', next: '下一步 →',
    goalTitle: '你为什么学韩语?',
    goals: { kpop: 'K-Pop & K-Drama', travel: '韩国旅行', business: '商务职场', topik: 'TOPIK考试', relationship: '韩国朋友/伴侣' },
    levelTitle: '你目前的韩语水平?',
    levels: { absolute: '完全零基础', canRead: '能读韩文字母', basicConv: '基础对话', intermediate: '中级以上' },
    levelTest: '→ 通过水平测试确认',
    timeTitle: '每天学习多少分钟?',
    timeCasual: '轻松', timeRecommended: '推荐', timeIntensive: '强化', recommended: '⭐',
    timeTip: '💡 每天15分钟 → 3个月后可进行基础对话！',
    notifTitle: '设置学习提醒',
    notifMorning: '早上 8:00', notifEvening: '下午 7:00', notifNight: '晚上 10:00', notifCustom: '自定义',
    startApp: '开始 🚀', skip: '跳过',
  },
  home: {
    greeting: '你好! 👋', goalPrefix: '目标:',
    streakLabel: '连续学习', xpLabel: '总XP', completedLabel: '已完成',
    dailyGoalTitle: '今日目标', minUnit: '分钟',
    goalAchieved: '🎉 今日目标达成！', startFirstLesson: '开始今天的第一节课吧！',
    levelProgress: '等级进度', xpUntilNext: 'XP到下一级',
    startNow: '📍 立即开始', startLessonBtn: '▶ 开始课程',
    quickStart: '⚡ 快速开始', aiChatLabel: 'AI对话', aiChatSub: '自由对话',
    todaysWord: '今日单词', todaysWordSub: '5分钟', kpop: 'K-POP', comingSoon: '即将推出',
  },
  goalLabels: { kpop: 'K-POP / 韩剧', travel: '旅行', business: '商务', topik: 'TOPIK考试', relationship: '人际关系' },
  lessons: { title: '📚 课程', comingSoon: '即将推出', minUnit: '分钟' },
  lesson: {
    flashcard: '单词卡', quiz: '测验', fillBlank: '填空', pronunciation: '发音练习',
    tapToSee: '点击查看含义', listen: '🔊 听', listenAgain: '🔊 再听一次',
    nextCard: '下一张 →', startQuiz: '开始测验 →',
    chooseAnswer: '选择含义', correct: '🎉 正确！', wrongPrefix: '😅 答案:',
    next: '下一个 →', toFillBlank: '填空练习 →', toPronunciation: '发音练习 →',
    fillBlankInstruction: '选择正确的单词',
    tapMic: '点击麦克风跟读', recording: '🔴 录音中... (点击完成)',
    listenFirst: '🔊 先听', scoreUnit: '分', recognized: '识别结果:',
    nextWord: '下一个单词 →', lessonComplete: '课程完成 🎊',
    lessonNotFound: '找不到课程。', pronError: '发生错误，请重试。',
  },
  aiChat: {
    convUnit: '条对话', end: '结束', inputPlaceholder: '用韩语输入...',
    typing: '输入中...', notFound: '找不到场景。', connectionError: '连接出现问题，请稍后重试。 😅',
  },
  aiHub: {
    title: '🗣️ AI对话', subtitle: '选择场景，与AI用韩语对话',
    freeScenarios: '免费场景', proScenarios: 'PRO场景', upgrade: '👑 升级', proLocked: '升级到PRO即可使用',
    difficulty: { 1: '初级', 2: '初中级', 3: '中级', 4: '中高级', 5: '高级' },
    tipTitle: '💡 AI对话技巧',
    tip1: '• 说错了没关系！AI会自动纠正',
    tip2: '• 只用韩语对话，进步更快',
    tip3: '• 一定要读[교정:]部分',
  },
  profile: {
    learnerSuffix: '学习者', goalSuffix: '目标',
    xpLabel: '总XP', streakLabel: '🔥 连续', completedLabel: '已完成',
    levelProgress: '等级进度', xpUntilNext: 'XP到下一级',
    badges: '🏅 徽章', settings: '⚙️ 设置',
    notifLabel: '📅 学习提醒', notifHint: '每天晚8点提醒',
    dailyGoal: '🎯 每日目标', nativeLang: '🌍 母语', signOut: '退出登录',
    upgradeTitle: '升级到 HANURI PRO', upgradeSub: '商务 · TOPIK · 无限AI对话',
    notifPermTitle: '需要权限', notifPermMsg: '请在设置中允许通知。',
    confirm: '确定',
    signOutConfirmTitle: '退出登录', signOutConfirmMsg: '确定要退出登录吗？', cancel: '取消',
    badgeNames: { firstLesson: '第一课', weekStreak: '7天连续', vocab100: '单词达人', aiChat5: 'AI高手', perfectQuiz: '测验大师', levelUp: '升级' },
    badgeDescs: { firstLesson: '完成第一课', weekStreak: '连续7天', vocab100: '达到500XP', aiChat5: '开始AI对话', perfectQuiz: '测验100%', levelUp: '到达下一级' },
  },
  leaderboard: { title: '🏆 排名', subtitle: '本周XP排名', meSuffix: '(我)', notice: '💡 完成课程和AI对话来获得XP，提升排名！' },
  lessonComplete: {
    title: '课程完成！', perfect: '完美！', great: '做得好！', tryAgain: '再次挑战！',
    accuracy: '正确率', xpEarned: '获得XP', wordsLearned: '学习单词',
    expressionsTitle: '今日学习的表达', goHome: '返回主页', nextLesson: '查看下一课',
  },
  pron: {
    perfect: '完美！发音非常准确。🎉',
    good: '很好！多练习"{words}"。⭐',
    practice: '继续练习。专注于"{words}"。💪',
    tryAgain: '再慢慢试一次。加油！🔄',
    error: '发生错误，请重试。',
  },
  notifContent: {
    dailyTitle: '今天学韩语了吗？🇰🇷',
    dailyBody: '每天一点点 — 开始今天的课程吧！',
    streakTitle: '🔥 你的连续学习记录快断了！',
    streakBody: '午夜前完成一节课就能保住连续记录！',
    lessonTitle: '课程完成！🎉',
    lessonBody: ' XP 获得！今天也很棒！',
  },
  proUpgrade: {
    heroSub: '将您的韩语提升到新水平',
    benefitsTitle: 'PRO 权益',
    benefit1Title: '商务韩语', benefit1Desc: '掌握专业韩语商务表达',
    benefit2Title: 'TOPIK 备考', benefit2Desc: '与AI一起进行真实TOPIK训练',
    benefit3Title: '无限AI对话', benefit3Desc: '无次数限制练习对话',
    benefit4Title: '深化语法分析', benefit4Desc: '详细的语法反馈和纠正',
    benefit5Title: '排行榜徽章', benefit5Desc: 'PRO专属徽章和排名显示',
    planTitle: '选择套餐',
    monthly: '月度', yearly: '年度', yearlyBadge: '优惠40%',
    subscribeMonthly: '开始月度订阅',
    subscribeYearly: '开始年度订阅',
    disclaimer: '随时可以取消。订阅自动续费。',
    successTitle: '订阅成功！', successMsg: '欢迎加入 HANURI PRO！所有PRO功能已解锁。', successBtn: '开始',
  },
};

const ja: Translations = {
  tabs: { home: 'ホーム', lessons: 'レッスン', aiChat: 'AIチャット', ranking: 'ランキング', profile: '私' },
  splash: {
    slogan: '韓国語で世界をつなぐ',
    startFree: '🚀 無料で始める',
    haveAccount: 'すでにアカウントがあります',
    or: 'または',
    googleLogin: 'Googleで続ける',
    appleLogin: 'Appleで続ける',
    loginFailedTitle: 'ログイン失敗',
    loginFailedMsg: 'Googleログイン中に問題が発生しました。もう一度お試しください。',
  },
  onboarding: {
    langTitle: 'どの言語を使いますか？', langSubtitle: '어떤 언어로 설명해 드릴까요?', next: '次へ →',
    goalTitle: 'なぜ韓国語を学びますか？',
    goals: { kpop: 'K-Pop & K-Drama', travel: '韓国旅行', business: 'ビジネス・就職', topik: 'TOPIK試験', relationship: '韓国人の友達/パートナー' },
    levelTitle: '現在の韓国語レベルは？',
    levels: { absolute: '完全な初心者', canRead: 'ハングルは読める', basicConv: '基礎会話ができる', intermediate: '中級以上' },
    levelTest: '→ レベルテストで確認する',
    timeTitle: '1日何分学習しますか？',
    timeCasual: '気軽に', timeRecommended: 'おすすめ', timeIntensive: '集中学習', recommended: '⭐',
    timeTip: '💡 1日15分 → 3ヶ月後に基礎会話ができる！',
    notifTitle: '学習リマインダーを設定',
    notifMorning: '午前 8:00', notifEvening: '午後 7:00', notifNight: '夜 10:00', notifCustom: 'カスタム',
    startApp: '始める 🚀', skip: 'スキップ',
  },
  home: {
    greeting: 'こんにちは！ 👋', goalPrefix: '目標:',
    streakLabel: '連続学習', xpLabel: '合計XP', completedLabel: 'レッスン',
    dailyGoalTitle: '今日の目標', minUnit: '分',
    goalAchieved: '🎉 今日の目標達成！', startFirstLesson: '今日最初のレッスンを始めましょう！',
    levelProgress: 'レベル進捗', xpUntilNext: 'XPで次のレベルへ',
    startNow: '📍 今すぐ始める', startLessonBtn: '▶ レッスン開始',
    quickStart: '⚡ クイックスタート', aiChatLabel: 'AIチャット', aiChatSub: 'フリートーク',
    todaysWord: '今日の単語', todaysWordSub: '5分', kpop: 'K-POP', comingSoon: '近日公開',
  },
  goalLabels: { kpop: 'K-POP / ドラマ', travel: '旅行', business: 'ビジネス', topik: 'TOPIK試験', relationship: '人間関係' },
  lessons: { title: '📚 レッスン', comingSoon: '準備中', minUnit: '分' },
  lesson: {
    flashcard: '単語カード', quiz: 'クイズ', fillBlank: '穴埋め', pronunciation: '発音練習',
    tapToSee: 'タップして意味を確認', listen: '🔊 聞く', listenAgain: '🔊 もう一度聞く',
    nextCard: '次のカード →', startQuiz: 'クイズ開始 →',
    chooseAnswer: '意味を選んでください', correct: '🎉 正解！', wrongPrefix: '😅 正解:',
    next: '次へ →', toFillBlank: '穴埋め →', toPronunciation: '発音練習 →',
    fillBlankInstruction: '正しい言葉を選んでください',
    tapMic: 'マイクをタップして繰り返す', recording: '🔴 録音中... (タップして完了)',
    listenFirst: '🔊 まず聞く', scoreUnit: '点', recognized: '認識結果:',
    nextWord: '次の単語 →', lessonComplete: 'レッスン完了 🎊',
    lessonNotFound: 'レッスンが見つかりません。', pronError: 'エラーが発生しました。再試行してください。',
  },
  aiChat: {
    convUnit: '件の会話', end: '終了', inputPlaceholder: '韓国語で入力してください...',
    typing: '入力中...', notFound: 'シナリオが見つかりません。', connectionError: '接続に問題があります。しばらくしてから再試行してください。 😅',
  },
  aiHub: {
    title: '🗣️ AIチャット', subtitle: 'シナリオを選んでAIと韓国語で話しましょう',
    freeScenarios: '無料シナリオ', proScenarios: 'PROシナリオ', upgrade: '👑 アップグレード', proLocked: 'PROにアップグレードすると利用できます',
    difficulty: { 1: '初級', 2: '初中級', 3: '中級', 4: '中上級', 5: '上級' },
    tipTitle: '💡 AIチャットのコツ',
    tip1: '• 間違えても大丈夫！AIが自動修正します',
    tip2: '• 韓国語だけで話すと上達が早い',
    tip3: '• [교정:]の部分を必ず読みましょう',
  },
  profile: {
    learnerSuffix: '学習者', goalSuffix: '目標',
    xpLabel: '合計XP', streakLabel: '🔥 連続', completedLabel: '完了レッスン',
    levelProgress: 'レベル進捗', xpUntilNext: 'XPで次のレベルへ',
    badges: '🏅 バッジ', settings: '⚙️ 設定',
    notifLabel: '📅 学習リマインダー', notifHint: '毎日20時にリマインダー',
    dailyGoal: '🎯 1日の目標', nativeLang: '🌍 母国語', signOut: 'サインアウト',
    upgradeTitle: 'HANURI PROにアップグレード', upgradeSub: 'ビジネス · TOPIK · 無制限AIチャット',
    notifPermTitle: '権限が必要', notifPermMsg: '設定アプリで通知を許可してください。',
    confirm: 'OK',
    signOutConfirmTitle: 'サインアウト', signOutConfirmMsg: 'サインアウトしますか？', cancel: 'キャンセル',
    badgeNames: { firstLesson: '最初のレッスン', weekStreak: '7日連続', vocab100: '単語の達人', aiChat5: 'AIチャンプ', perfectQuiz: 'クイズマスター', levelUp: 'レベルアップ' },
    badgeDescs: { firstLesson: '最初のレッスン完了', weekStreak: '7日連続学習', vocab100: '500XP達成', aiChat5: 'AIチャット開始', perfectQuiz: 'クイズ100%', levelUp: '次のレベルへ' },
  },
  leaderboard: { title: '🏆 ランキング', subtitle: '今週のXP順', meSuffix: '(私)', notice: '💡 レッスン完了とAIチャットでXPを獲得してランクアップしよう！' },
  lessonComplete: {
    title: 'レッスン完了！', perfect: '完璧！', great: 'よくできました！', tryAgain: '再挑戦しよう！',
    accuracy: '正答率', xpEarned: 'XP獲得', wordsLearned: '学習単語',
    expressionsTitle: '今日覚えた表現', goHome: 'ホームへ戻る', nextLesson: '次のレッスンへ',
  },
  pron: {
    perfect: '完璧！発音が正確です。🎉',
    good: 'よくできました！"{words}"をもう少し練習しましょう。⭐',
    practice: 'もう少し練習しましょう。"{words}"に集中して。💪',
    tryAgain: 'もう一度ゆっくり読んでみてください。頑張って！🔄',
    error: 'エラーが発生しました。再試行してください。',
  },
  notifContent: {
    dailyTitle: '今日韓国語を勉強しましたか？🇰🇷',
    dailyBody: '毎日少しずつ — 今日のレッスンを始めましょう！',
    streakTitle: '🔥 ストリークが途切れそうです！',
    streakBody: '今日の真夜中前にレッスンを一つ完了してストリークを守りましょう！',
    lessonTitle: 'レッスン完了！🎉',
    lessonBody: ' XP獲得！今日も素晴らしい！',
  },
  proUpgrade: {
    heroSub: '韓国語をさらに上のレベルへ',
    benefitsTitle: 'PRO特典',
    benefit1Title: 'ビジネス韓国語', benefit1Desc: 'プロフェッショナルなビジネス表現をマスター',
    benefit2Title: 'TOPIK試験準備', benefit2Desc: 'AIと一緒に本番TOPIK訓練',
    benefit3Title: '無制限AIチャット', benefit3Desc: '会話回数制限なしで練習',
    benefit4Title: '高度な文法分析', benefit4Desc: '詳細な文法フィードバックと訂正',
    benefit5Title: 'リーダーボードバッジ', benefit5Desc: 'PRO限定バッジとランキング表示',
    planTitle: 'プランを選択',
    monthly: '月次', yearly: '年次', yearlyBadge: '40%オフ',
    subscribeMonthly: '月次サブスクリプション開始',
    subscribeYearly: '年次サブスクリプション開始',
    disclaimer: 'いつでもキャンセルできます。サブスクリプションは自動更新されます。',
    successTitle: '購読完了！', successMsg: 'HANURI PROへようこそ！すべてのPRO機能が解放されました。', successBtn: '始める',
  },
};

const vi: Translations = {
  tabs: { home: 'Trang chủ', lessons: 'Bài học', aiChat: 'Chat AI', ranking: 'Xếp hạng', profile: 'Tôi' },
  splash: {
    slogan: 'Kết nối thế giới qua tiếng Hàn',
    startFree: '🚀 Bắt đầu miễn phí',
    haveAccount: 'Tôi đã có tài khoản',
    or: 'hoặc',
    googleLogin: 'Tiếp tục với Google',
    appleLogin: 'Tiếp tục với Apple',
    loginFailedTitle: 'Đăng nhập thất bại',
    loginFailedMsg: 'Có vấn đề với đăng nhập Google. Vui lòng thử lại.',
  },
  onboarding: {
    langTitle: 'Bạn nói ngôn ngữ nào?', langSubtitle: '어떤 언어로 설명해 드릴까요?', next: 'Tiếp theo →',
    goalTitle: 'Tại sao bạn học tiếng Hàn?',
    goals: { kpop: 'K-Pop & K-Drama', travel: 'Du lịch Hàn Quốc', business: 'Kinh doanh & Sự nghiệp', topik: 'Thi TOPIK', relationship: 'Bạn bè/Người yêu Hàn' },
    levelTitle: 'Trình độ tiếng Hàn hiện tại?',
    levels: { absolute: 'Hoàn toàn mới bắt đầu', canRead: 'Có thể đọc Hangul', basicConv: 'Hội thoại cơ bản', intermediate: 'Trung cấp trở lên' },
    levelTest: '→ Kiểm tra với bài test trình độ',
    timeTitle: 'Học bao nhiêu phút mỗi ngày?',
    timeCasual: 'Nhẹ nhàng', timeRecommended: 'Khuyến nghị', timeIntensive: 'Chuyên sâu', recommended: '⭐',
    timeTip: '💡 15 phút/ngày → hội thoại cơ bản sau 3 tháng!',
    notifTitle: 'Đặt nhắc nhở học tập',
    notifMorning: 'Sáng 8:00', notifEvening: 'Chiều 7:00', notifNight: 'Tối 10:00', notifCustom: 'Tùy chỉnh',
    startApp: 'Bắt đầu 🚀', skip: 'Bỏ qua',
  },
  home: {
    greeting: 'Xin chào! 👋', goalPrefix: 'Mục tiêu:',
    streakLabel: 'Chuỗi học', xpLabel: 'Tổng XP', completedLabel: 'Bài học',
    dailyGoalTitle: 'Mục tiêu hôm nay', minUnit: 'phút',
    goalAchieved: '🎉 Đạt mục tiêu hôm nay!', startFirstLesson: 'Bắt đầu bài học đầu tiên hôm nay!',
    levelProgress: 'Tiến độ cấp độ', xpUntilNext: 'XP đến cấp tiếp theo',
    startNow: '📍 Bắt đầu ngay', startLessonBtn: '▶ Bắt đầu bài học',
    quickStart: '⚡ Bắt đầu nhanh', aiChatLabel: 'Chat AI', aiChatSub: 'Hội thoại tự do',
    todaysWord: 'Từ hôm nay', todaysWordSub: '5 phút', kpop: 'K-POP', comingSoon: 'Sắp ra mắt',
  },
  goalLabels: { kpop: 'K-POP / Phim', travel: 'Du lịch', business: 'Kinh doanh', topik: 'Thi TOPIK', relationship: 'Quan hệ' },
  lessons: { title: '📚 Bài học', comingSoon: 'Sắp ra mắt', minUnit: 'phút' },
  lesson: {
    flashcard: 'Thẻ từ vựng', quiz: 'Bài kiểm tra', fillBlank: 'Điền vào chỗ trống', pronunciation: 'Luyện phát âm',
    tapToSee: 'Nhấn để xem nghĩa', listen: '🔊 Nghe', listenAgain: '🔊 Nghe lại',
    nextCard: 'Thẻ tiếp theo →', startQuiz: 'Bắt đầu kiểm tra →',
    chooseAnswer: 'Chọn nghĩa', correct: '🎉 Đúng rồi!', wrongPrefix: '😅 Đáp án:',
    next: 'Tiếp theo →', toFillBlank: 'Điền chỗ trống →', toPronunciation: 'Luyện phát âm →',
    fillBlankInstruction: 'Chọn từ đúng',
    tapMic: 'Nhấn mic để lặp lại', recording: '🔴 Đang ghi... (nhấn để kết thúc)',
    listenFirst: '🔊 Nghe trước', scoreUnit: 'điểm', recognized: 'Nhận diện:',
    nextWord: 'Từ tiếp theo →', lessonComplete: 'Hoàn thành 🎊',
    lessonNotFound: 'Không tìm thấy bài học.', pronError: 'Lỗi xảy ra. Vui lòng thử lại.',
  },
  aiChat: {
    convUnit: 'cuộc trò chuyện', end: 'Kết thúc', inputPlaceholder: 'Nhập bằng tiếng Hàn...',
    typing: 'Đang nhập...', notFound: 'Không tìm thấy tình huống.', connectionError: 'Lỗi kết nối. Vui lòng thử lại. 😅',
  },
  aiHub: {
    title: '🗣️ Chat AI', subtitle: 'Chọn tình huống và luyện tiếng Hàn với AI',
    freeScenarios: 'Tình huống miễn phí', proScenarios: 'Tình huống PRO', upgrade: '👑 Nâng cấp', proLocked: 'Nâng cấp lên PRO để mở khóa',
    difficulty: { 1: 'Sơ cấp', 2: 'Sơ-Trung cấp', 3: 'Trung cấp', 4: 'Trung-Cao cấp', 5: 'Cao cấp' },
    tipTitle: '💡 Mẹo Chat AI',
    tip1: '• Không sao nếu sai! AI sẽ tự động sửa',
    tip2: '• Chỉ nói tiếng Hàn giúp bạn tiến bộ nhanh hơn',
    tip3: '• Nhớ đọc phần [교정:]',
  },
  profile: {
    learnerSuffix: 'Học viên', goalSuffix: 'Mục tiêu',
    xpLabel: 'Tổng XP', streakLabel: '🔥 Chuỗi', completedLabel: 'Bài học',
    levelProgress: 'Tiến độ cấp độ', xpUntilNext: 'XP đến cấp tiếp theo',
    badges: '🏅 Huy hiệu', settings: '⚙️ Cài đặt',
    notifLabel: '📅 Nhắc nhở học tập', notifHint: 'Nhắc nhở lúc 8 giờ tối mỗi ngày',
    dailyGoal: '🎯 Mục tiêu hàng ngày', nativeLang: '🌍 Ngôn ngữ mẹ đẻ', signOut: 'Đăng xuất',
    upgradeTitle: 'Nâng cấp lên HANURI PRO', upgradeSub: 'Kinh doanh · TOPIK · Chat AI không giới hạn',
    notifPermTitle: 'Cần cấp quyền', notifPermMsg: 'Vui lòng cho phép thông báo trong Cài đặt.',
    confirm: 'OK',
    signOutConfirmTitle: 'Đăng xuất', signOutConfirmMsg: 'Bạn có chắc muốn đăng xuất không?', cancel: 'Hủy',
    badgeNames: { firstLesson: 'Bài học đầu', weekStreak: '7 ngày liên tục', vocab100: 'Bậc thầy từ vựng', aiChat5: 'Vô địch AI', perfectQuiz: 'Thạc sĩ quiz', levelUp: 'Lên cấp' },
    badgeDescs: { firstLesson: 'Hoàn thành bài học đầu', weekStreak: '7 ngày liên tiếp', vocab100: 'Đạt 500 XP', aiChat5: 'Bắt đầu chat AI', perfectQuiz: '100% quiz', levelUp: 'Đạt cấp tiếp theo' },
  },
  leaderboard: { title: '🏆 Xếp hạng', subtitle: 'XP tuần này', meSuffix: '(Tôi)', notice: '💡 Hoàn thành bài học và chat AI để kiếm XP và leo bảng xếp hạng!' },
  lessonComplete: {
    title: 'Hoàn thành bài học!', perfect: 'Hoàn hảo!', great: 'Làm tốt lắm!', tryAgain: 'Thử lại nào!',
    accuracy: 'Độ chính xác', xpEarned: 'XP kiếm được', wordsLearned: 'Từ vựng',
    expressionsTitle: 'Biểu đạt hôm nay', goHome: 'Về trang chủ', nextLesson: 'Bài học tiếp theo',
  },
  pron: {
    perfect: 'Hoàn hảo! Phát âm của bạn rất chính xác. 🎉',
    good: 'Làm tốt! Luyện thêm "{words}" nhé. ⭐',
    practice: 'Tiếp tục luyện tập. Tập trung vào "{words}". 💪',
    tryAgain: 'Thử lại từ từ nhé. Cố lên! 🔄',
    error: 'Có lỗi xảy ra. Vui lòng thử lại.',
  },
  notifContent: {
    dailyTitle: 'Đã học tiếng Hàn hôm nay chưa? 🇰🇷',
    dailyBody: 'Mỗi ngày một chút — bắt đầu bài học hôm nay nhé!',
    streakTitle: '🔥 Chuỗi ngày học của bạn sắp bị mất!',
    streakBody: 'Hoàn thành một bài học trước nửa đêm để duy trì chuỗi ngày học!',
    lessonTitle: 'Hoàn thành bài học! 🎉',
    lessonBody: ' XP đã nhận! Tuyệt vời hôm nay!',
  },
  proUpgrade: {
    heroSub: 'Nâng tiếng Hàn của bạn lên tầm cao mới',
    benefitsTitle: 'Quyền lợi PRO',
    benefit1Title: 'Tiếng Hàn kinh doanh', benefit1Desc: 'Thành thạo biểu đạt kinh doanh tiếng Hàn chuyên nghiệp',
    benefit2Title: 'Luyện thi TOPIK', benefit2Desc: 'Luyện TOPIK thực tế cùng AI',
    benefit3Title: 'Chat AI không giới hạn', benefit3Desc: 'Luyện tập không giới hạn cuộc trò chuyện',
    benefit4Title: 'Phân tích ngữ pháp nâng cao', benefit4Desc: 'Phản hồi và sửa lỗi ngữ pháp chi tiết',
    benefit5Title: 'Huy hiệu bảng xếp hạng', benefit5Desc: 'Huy hiệu PRO độc quyền và hiển thị thứ hạng',
    planTitle: 'Chọn gói',
    monthly: 'Hàng tháng', yearly: 'Hàng năm', yearlyBadge: 'Giảm 40%',
    subscribeMonthly: 'Bắt đầu đăng ký hàng tháng',
    subscribeYearly: 'Bắt đầu đăng ký hàng năm',
    disclaimer: 'Hủy bất cứ lúc nào. Đăng ký tự động gia hạn.',
    successTitle: 'Đã đăng ký!', successMsg: 'Chào mừng đến với HANURI PRO! Tất cả tính năng PRO đã được mở khóa.', successBtn: 'Bắt đầu',
  },
};

export const translations: Record<NativeLanguage, Translations> = { en, ko, es, zh, ja, vi };
