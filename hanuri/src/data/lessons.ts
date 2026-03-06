import { NativeLanguage } from '../types';

export interface VocabCard {
  id: string;
  korean: string;
  romanization: string;
  translations: Record<NativeLanguage, string>;
  emoji?: string;
}

export interface FillBlankExercise {
  id: string;
  before: string;   // text before the blank
  after: string;    // text after the blank
  answer: string;   // the correct word/phrase
  choices: string[]; // all choices including answer (3-4 items)
  hint: string;     // English translation of the sentence
}

export interface LessonData {
  id: string;
  level: number;
  unit: number;
  order: number;
  title: string;
  titleKo: string;
  emoji: string;
  xpReward: number;
  estimatedMinutes: number;
  vocabulary: VocabCard[];
  fillInBlanks?: FillBlankExercise[];
}

export interface UnitData {
  unit: number;
  title: string;
  titleKo: string;
  lessons: LessonData[];
}

export interface LevelData {
  level: number;
  title: string;
  titleKo: string;
  emoji: string;
  units: UnitData[];
}

// Helper: get the meaning in a given language (falls back to English)
export function getMeaning(card: VocabCard, lang: NativeLanguage = 'en'): string {
  return card.translations[lang] ?? card.translations['en'];
}

// ─── Level 1: Basics ─────────────────────────────────────────────────────────

const LEVEL_1: LevelData = {
  level: 1,
  title: 'Beginner',
  titleKo: '초급',
  emoji: '🌱',
  units: [
    {
      unit: 1,
      title: 'Greetings',
      titleKo: '인사',
      lessons: [
        {
          id: 'l1u1l1',
          level: 1, unit: 1, order: 1,
          title: 'Basic Greetings',
          titleKo: '기본 인사',
          emoji: '👋',
          xpReward: 20,
          estimatedMinutes: 5,
          vocabulary: [
            { id: 'v1', korean: '안녕하세요', romanization: 'annyeonghaseyo', emoji: '👋',
              translations: { en: 'Hello', es: 'Hola', zh: '你好', ja: 'こんにちは', vi: 'Xin chào' } },
            { id: 'v2', korean: '감사합니다', romanization: 'gamsahamnida', emoji: '🙏',
              translations: { en: 'Thank you', es: 'Gracias', zh: '谢谢', ja: 'ありがとう', vi: 'Cảm ơn' } },
            { id: 'v3', korean: '죄송합니다', romanization: 'joesonghamnida', emoji: '😔',
              translations: { en: "I'm sorry", es: 'Lo siento', zh: '对不起', ja: 'すみません', vi: 'Xin lỗi' } },
            { id: 'v4', korean: '괜찮아요', romanization: 'gwaenchanayo', emoji: '😊',
              translations: { en: "It's okay", es: 'Está bien', zh: '没关系', ja: '大丈夫', vi: 'Không sao' } },
            { id: 'v5', korean: '잘 지내세요?', romanization: 'jal jinaseyo?', emoji: '🤗',
              translations: { en: 'How are you?', es: '¿Cómo estás?', zh: '你好吗?', ja: 'お元気ですか？', vi: 'Bạn khỏe không?' } },
          ],
          fillInBlanks: [
            { id: 'fb1', before: '', after: '!', answer: '안녕하세요',
              choices: ['안녕하세요', '감사합니다', '죄송합니다', '괜찮아요'],
              hint: 'Hello!' },
            { id: 'fb2', before: '도움 주셔서 ', after: '.', answer: '감사합니다',
              choices: ['감사합니다', '안녕하세요', '괜찮아요', '잘 지내세요?'],
              hint: 'Thank you for your help.' },
            { id: 'fb3', before: '늦어서 ', after: '.', answer: '죄송합니다',
              choices: ['죄송합니다', '감사합니다', '괜찮아요', '안녕하세요'],
              hint: "I'm sorry for being late." },
          ],
        },
        {
          id: 'l1u1l2',
          level: 1, unit: 1, order: 2,
          title: 'Self Introduction',
          titleKo: '자기 소개',
          emoji: '🙋',
          xpReward: 20,
          estimatedMinutes: 5,
          vocabulary: [
            { id: 'v6', korean: '제 이름은', romanization: 'je ireumeun', emoji: '📛',
              translations: { en: 'My name is', es: 'Mi nombre es', zh: '我叫', ja: '私の名前は', vi: 'Tên tôi là' } },
            { id: 'v7', korean: '반갑습니다', romanization: 'bangapseumnida', emoji: '🤝',
              translations: { en: 'Nice to meet you', es: 'Mucho gusto', zh: '很高兴认识你', ja: 'はじめまして', vi: 'Rất vui được gặp bạn' } },
            { id: 'v8', korean: '이름이 뭐예요?', romanization: 'ireumi mwoyeyo?', emoji: '❓',
              translations: { en: "What's your name?", es: '¿Cómo te llamas?', zh: '你叫什么名字?', ja: 'お名前は？', vi: 'Tên bạn là gì?' } },
            { id: 'v9', korean: '어디서 왔어요?', romanization: 'eodiseo wasseoyo?', emoji: '🌍',
              translations: { en: 'Where are you from?', es: '¿De dónde eres?', zh: '你从哪里来?', ja: 'どこから来ましたか？', vi: 'Bạn đến từ đâu?' } },
            { id: 'v10', korean: '저는 학생이에요', romanization: 'jeoneun haksaengieyo', emoji: '📚',
              translations: { en: 'I am a student', es: 'Soy estudiante', zh: '我是学生', ja: '私は学生です', vi: 'Tôi là học sinh' } },
          ],
          fillInBlanks: [
            { id: 'fb4', before: '', after: ' 김민준이에요.', answer: '제 이름은',
              choices: ['제 이름은', '반갑습니다', '어디서 왔어요?', '저는 학생이에요'],
              hint: 'My name is Kim Minjun.' },
            { id: 'fb5', before: '처음 뵙겠습니다, ', after: '!', answer: '반갑습니다',
              choices: ['반갑습니다', '제 이름은', '이름이 뭐예요?', '저는 학생이에요'],
              hint: 'How do you do, nice to meet you!' },
            { id: 'fb6', before: '', after: '? 저는 미국에서 왔어요.', answer: '어디서 왔어요?',
              choices: ['어디서 왔어요?', '이름이 뭐예요?', '반갑습니다', '저는 학생이에요'],
              hint: "Where are you from? I'm from America." },
          ],
        },
        {
          id: 'l1u1l3',
          level: 1, unit: 1, order: 3,
          title: 'Farewells',
          titleKo: '작별 인사',
          emoji: '🌅',
          xpReward: 20,
          estimatedMinutes: 5,
          vocabulary: [
            { id: 'v11', korean: '안녕히 가세요', romanization: 'annyeonghi gaseyo', emoji: '🚶',
              translations: { en: 'Goodbye (to one leaving)', es: 'Adiós (al que se va)', zh: '再见 (对离开的人)', ja: 'さようなら(去る人へ)', vi: 'Tạm biệt (người ra đi)' } },
            { id: 'v12', korean: '안녕히 계세요', romanization: 'annyeonghi gyeseyo', emoji: '🏠',
              translations: { en: 'Goodbye (to one staying)', es: 'Adiós (al que se queda)', zh: '再见 (对留下的人)', ja: 'さようなら(残る人へ)', vi: 'Tạm biệt (người ở lại)' } },
            { id: 'v13', korean: '또 만나요', romanization: 'tto mannayo', emoji: '🔄',
              translations: { en: 'See you again', es: 'Hasta luego', zh: '再见', ja: 'またね', vi: 'Hẹn gặp lại' } },
            { id: 'v14', korean: '내일 봐요', romanization: 'naeil bwayo', emoji: '📅',
              translations: { en: 'See you tomorrow', es: 'Hasta mañana', zh: '明天见', ja: 'また明日', vi: 'Hẹn gặp ngày mai' } },
            { id: 'v15', korean: '좋은 하루 보내세요', romanization: 'joeun haru bonaeseyo', emoji: '☀️',
              translations: { en: 'Have a good day', es: 'Que tengas un buen día', zh: '祝你有美好的一天', ja: '良い一日を', vi: 'Chúc bạn một ngày tốt lành' } },
          ],
          fillInBlanks: [
            { id: 'fb7', before: '가시는 분께: ', after: '.', answer: '안녕히 가세요',
              choices: ['안녕히 가세요', '안녕히 계세요', '또 만나요', '내일 봐요'],
              hint: 'To the one leaving: Goodbye.' },
            { id: 'fb8', before: '남으시는 분께: ', after: '.', answer: '안녕히 계세요',
              choices: ['안녕히 계세요', '안녕히 가세요', '내일 봐요', '또 만나요'],
              hint: 'To the one staying: Goodbye.' },
            { id: 'fb9', before: '나중에 ', after: '!', answer: '또 만나요',
              choices: ['또 만나요', '내일 봐요', '안녕히 가세요', '좋은 하루 보내세요'],
              hint: 'See you again later!' },
          ],
        },
      ],
    },
    {
      unit: 2,
      title: 'Numbers & Colors',
      titleKo: '숫자와 색깔',
      lessons: [
        {
          id: 'l1u2l1',
          level: 1, unit: 2, order: 4,
          title: 'Numbers 1–10',
          titleKo: '숫자 1~10',
          emoji: '🔢',
          xpReward: 25,
          estimatedMinutes: 7,
          vocabulary: [
            { id: 'v16', korean: '일', romanization: 'il', emoji: '1️⃣',
              translations: { en: 'One (1)', es: 'Uno (1)', zh: '一 (1)', ja: '一 (1)', vi: 'Một (1)' } },
            { id: 'v17', korean: '이', romanization: 'i', emoji: '2️⃣',
              translations: { en: 'Two (2)', es: 'Dos (2)', zh: '二 (2)', ja: '二 (2)', vi: 'Hai (2)' } },
            { id: 'v18', korean: '삼', romanization: 'sam', emoji: '3️⃣',
              translations: { en: 'Three (3)', es: 'Tres (3)', zh: '三 (3)', ja: '三 (3)', vi: 'Ba (3)' } },
            { id: 'v19', korean: '사', romanization: 'sa', emoji: '4️⃣',
              translations: { en: 'Four (4)', es: 'Cuatro (4)', zh: '四 (4)', ja: '四 (4)', vi: 'Bốn (4)' } },
            { id: 'v20', korean: '오', romanization: 'o', emoji: '5️⃣',
              translations: { en: 'Five (5)', es: 'Cinco (5)', zh: '五 (5)', ja: '五 (5)', vi: 'Năm (5)' } },
            { id: 'v21', korean: '육', romanization: 'yuk', emoji: '6️⃣',
              translations: { en: 'Six (6)', es: 'Seis (6)', zh: '六 (6)', ja: '六 (6)', vi: 'Sáu (6)' } },
            { id: 'v22', korean: '칠', romanization: 'chil', emoji: '7️⃣',
              translations: { en: 'Seven (7)', es: 'Siete (7)', zh: '七 (7)', ja: '七 (7)', vi: 'Bảy (7)' } },
            { id: 'v23', korean: '팔', romanization: 'pal', emoji: '8️⃣',
              translations: { en: 'Eight (8)', es: 'Ocho (8)', zh: '八 (8)', ja: '八 (8)', vi: 'Tám (8)' } },
            { id: 'v24', korean: '구', romanization: 'gu', emoji: '9️⃣',
              translations: { en: 'Nine (9)', es: 'Nueve (9)', zh: '九 (9)', ja: '九 (9)', vi: 'Chín (9)' } },
            { id: 'v25', korean: '십', romanization: 'sip', emoji: '🔟',
              translations: { en: 'Ten (10)', es: 'Diez (10)', zh: '十 (10)', ja: '十 (10)', vi: 'Mười (10)' } },
          ],
          fillInBlanks: [
            { id: 'fb10', before: '일, 이, ', after: ', 사, 오', answer: '삼',
              choices: ['삼', '육', '칠', '팔'],
              hint: '1, 2, 3, 4, 5' },
            { id: 'fb11', before: '육, 칠, ', after: ', 구, 십', answer: '팔',
              choices: ['팔', '삼', '사', '오'],
              hint: '6, 7, 8, 9, 10' },
            { id: 'fb12', before: '오 더하기 오는 ', after: '이에요.', answer: '십',
              choices: ['십', '구', '팔', '칠'],
              hint: '5 plus 5 is 10.' },
          ],
        },
        {
          id: 'l1u2l2',
          level: 1, unit: 2, order: 5,
          title: 'Basic Colors',
          titleKo: '기본 색깔',
          emoji: '🎨',
          xpReward: 25,
          estimatedMinutes: 6,
          vocabulary: [
            { id: 'v26', korean: '빨간색', romanization: 'ppalgansaek', emoji: '🔴',
              translations: { en: 'Red', es: 'Rojo', zh: '红色', ja: '赤', vi: 'Màu đỏ' } },
            { id: 'v27', korean: '파란색', romanization: 'paransaek', emoji: '🔵',
              translations: { en: 'Blue', es: 'Azul', zh: '蓝色', ja: '青', vi: 'Màu xanh lam' } },
            { id: 'v28', korean: '노란색', romanization: 'noransaek', emoji: '🟡',
              translations: { en: 'Yellow', es: 'Amarillo', zh: '黄色', ja: '黄色', vi: 'Màu vàng' } },
            { id: 'v29', korean: '초록색', romanization: 'choroksaek', emoji: '🟢',
              translations: { en: 'Green', es: 'Verde', zh: '绿色', ja: '緑', vi: 'Màu xanh lá' } },
            { id: 'v30', korean: '하얀색', romanization: 'hayansaek', emoji: '⬜',
              translations: { en: 'White', es: 'Blanco', zh: '白色', ja: '白', vi: 'Màu trắng' } },
            { id: 'v31', korean: '검정색', romanization: 'geomjeongsaek', emoji: '⬛',
              translations: { en: 'Black', es: 'Negro', zh: '黑色', ja: '黒', vi: 'Màu đen' } },
          ],
          fillInBlanks: [
            { id: 'fb13', before: '하늘은 ', after: '이에요.', answer: '파란색',
              choices: ['파란색', '빨간색', '초록색', '노란색'],
              hint: 'The sky is blue.' },
            { id: 'fb14', before: '태양은 ', after: '이에요.', answer: '노란색',
              choices: ['노란색', '파란색', '하얀색', '빨간색'],
              hint: 'The sun is yellow.' },
            { id: 'fb15', before: '눈은 ', after: '이에요.', answer: '하얀색',
              choices: ['하얀색', '검정색', '초록색', '파란색'],
              hint: 'Snow is white.' },
          ],
        },
      ],
    },
    {
      unit: 3,
      title: 'Daily Life',
      titleKo: '일상 표현',
      lessons: [
        {
          id: 'l1u3l1',
          level: 1, unit: 3, order: 6,
          title: 'Food & Drink',
          titleKo: '음식과 음료',
          emoji: '🍜',
          xpReward: 30,
          estimatedMinutes: 7,
          vocabulary: [
            { id: 'v32', korean: '밥', romanization: 'bap', emoji: '🍚',
              translations: { en: 'Rice / Meal', es: 'Arroz / Comida', zh: '饭 / 饭食', ja: 'ご飯', vi: 'Cơm / Bữa ăn' } },
            { id: 'v33', korean: '물', romanization: 'mul', emoji: '💧',
              translations: { en: 'Water', es: 'Agua', zh: '水', ja: '水', vi: 'Nước' } },
            { id: 'v34', korean: '커피', romanization: 'keopi', emoji: '☕',
              translations: { en: 'Coffee', es: 'Café', zh: '咖啡', ja: 'コーヒー', vi: 'Cà phê' } },
            { id: 'v35', korean: '맛있어요', romanization: 'massisseoyo', emoji: '😋',
              translations: { en: "It's delicious", es: 'Está delicioso', zh: '好吃', ja: '美味しい', vi: 'Ngon lắm' } },
            { id: 'v36', korean: '배고파요', romanization: 'baegopayo', emoji: '🤤',
              translations: { en: "I'm hungry", es: 'Tengo hambre', zh: '我饿了', ja: 'お腹が空いた', vi: 'Tôi đói' } },
            { id: 'v37', korean: '배불러요', romanization: 'baebulleoyo', emoji: '😌',
              translations: { en: "I'm full", es: 'Estoy lleno/a', zh: '我吃饱了', ja: 'お腹がいっぱい', vi: 'Tôi no rồi' } },
          ],
          fillInBlanks: [
            { id: 'fb16', before: '이 음식 정말 ', after: '!', answer: '맛있어요',
              choices: ['맛있어요', '배고파요', '배불러요', '물'],
              hint: 'This food is really delicious!' },
            { id: 'fb17', before: '점심을 못 먹었어요. 너무 ', after: '.', answer: '배고파요',
              choices: ['배고파요', '배불러요', '맛있어요', '커피'],
              hint: "I didn't eat lunch. I'm very hungry." },
            { id: 'fb18', before: '', after: ' 한 잔 주세요.', answer: '물',
              choices: ['물', '커피', '밥', '맛있어요'],
              hint: 'Please give me a glass of water.' },
          ],
        },
        {
          id: 'l1u3l2',
          level: 1, unit: 3, order: 7,
          title: 'Shopping',
          titleKo: '쇼핑',
          emoji: '🛍️',
          xpReward: 30,
          estimatedMinutes: 7,
          vocabulary: [
            { id: 'v38', korean: '얼마예요?', romanization: 'eolmayeyo?', emoji: '💰',
              translations: { en: 'How much is it?', es: '¿Cuánto cuesta?', zh: '多少钱?', ja: 'いくらですか？', vi: 'Bao nhiêu tiền?' } },
            { id: 'v39', korean: '주세요', romanization: 'juseyo', emoji: '🙏',
              translations: { en: 'Please give me', es: 'Por favor dame', zh: '请给我', ja: 'ください', vi: 'Cho tôi... với' } },
            { id: 'v40', korean: '비싸요', romanization: 'bissayo', emoji: '💸',
              translations: { en: "It's expensive", es: 'Es caro', zh: '贵', ja: '高い', vi: 'Đắt quá' } },
            { id: 'v41', korean: '싸요', romanization: 'ssayo', emoji: '🏷️',
              translations: { en: "It's cheap", es: 'Es barato', zh: '便宜', ja: '安い', vi: 'Rẻ quá' } },
            { id: 'v42', korean: '카드 돼요?', romanization: 'kadeu dwaeyo?', emoji: '💳',
              translations: { en: 'Do you accept cards?', es: '¿Aceptan tarjetas?', zh: '可以刷卡吗?', ja: 'カードは使えますか？', vi: 'Có nhận thẻ không?' } },
          ],
          fillInBlanks: [
            { id: 'fb19', before: '이 가방 ', after: '?', answer: '얼마예요?',
              choices: ['얼마예요?', '비싸요', '싸요', '주세요'],
              hint: 'How much is this bag?' },
            { id: 'fb20', before: '아메리카노 한 잔 ', after: '.', answer: '주세요',
              choices: ['주세요', '얼마예요?', '비싸요', '카드 돼요?'],
              hint: 'Please give me an Americano.' },
            { id: 'fb21', before: '현금 없어요. ', after: '?', answer: '카드 돼요?',
              choices: ['카드 돼요?', '얼마예요?', '비싸요', '싸요'],
              hint: "I don't have cash. Do you accept cards?" },
          ],
        },
      ],
    },
  ],
};

// ─── Level 2: Elementary ─────────────────────────────────────────────────────

const LEVEL_2: LevelData = {
  level: 2,
  title: 'Elementary',
  titleKo: '초중급',
  emoji: '🌿',
  units: [
    // ── Unit 1: Numbers & Time ───────────────────────────────────────────────
    {
      unit: 1,
      title: 'Numbers & Time',
      titleKo: '숫자와 시간',
      lessons: [
        {
          id: 'l2u1l1',
          level: 2, unit: 1, order: 1,
          title: 'Korean Numbers',
          titleKo: '한국 숫자',
          emoji: '🔢',
          xpReward: 30,
          estimatedMinutes: 7,
          vocabulary: [
            { id: 'v43', korean: '일', romanization: 'il', emoji: '1️⃣',
              translations: { en: 'One (sino)', es: 'Uno (sino)', zh: '一', ja: '一', vi: 'Một (sino)' } },
            { id: 'v44', korean: '이', romanization: 'i', emoji: '2️⃣',
              translations: { en: 'Two (sino)', es: 'Dos (sino)', zh: '二', ja: '二', vi: 'Hai (sino)' } },
            { id: 'v45', korean: '삼', romanization: 'sam', emoji: '3️⃣',
              translations: { en: 'Three (sino)', es: 'Tres (sino)', zh: '三', ja: '三', vi: 'Ba (sino)' } },
            { id: 'v46', korean: '십', romanization: 'sip', emoji: '🔟',
              translations: { en: 'Ten (sino)', es: 'Diez (sino)', zh: '十', ja: '十', vi: 'Mười (sino)' } },
            { id: 'v47', korean: '백', romanization: 'baek', emoji: '💯',
              translations: { en: 'Hundred', es: 'Cien', zh: '百', ja: '百', vi: 'Một trăm' } },
            { id: 'v48', korean: '몇 번이에요?', romanization: 'myeot beonieyo?', emoji: '❓',
              translations: { en: 'What number?', es: '¿Qué número?', zh: '几号？', ja: '何番ですか？', vi: 'Số mấy?' } },
          ],
        },
        {
          id: 'l2u1l2',
          level: 2, unit: 1, order: 2,
          title: 'Telling Time',
          titleKo: '시간 말하기',
          emoji: '⏰',
          xpReward: 35,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v49', korean: '지금 몇 시예요?', romanization: 'jigeum myeot siyeyo?', emoji: '🕐',
              translations: { en: 'What time is it now?', es: '¿Qué hora es ahora?', zh: '现在几点？', ja: '今何時ですか？', vi: 'Bây giờ mấy giờ?' } },
            { id: 'v50', korean: '오전', romanization: 'ojeon', emoji: '🌅',
              translations: { en: 'AM / Morning', es: 'AM / Mañana', zh: '上午', ja: '午前', vi: 'Buổi sáng (AM)' } },
            { id: 'v51', korean: '오후', romanization: 'ohu', emoji: '🌞',
              translations: { en: 'PM / Afternoon', es: 'PM / Tarde', zh: '下午', ja: '午後', vi: 'Buổi chiều (PM)' } },
            { id: 'v52', korean: '분', romanization: 'bun', emoji: '⏱️',
              translations: { en: 'Minute', es: 'Minuto', zh: '分钟', ja: '分', vi: 'Phút' } },
            { id: 'v53', korean: '시', romanization: 'si', emoji: '🕰️',
              translations: { en: "O'clock / Hour", es: 'En punto / Hora', zh: '点钟 / 小时', ja: '時', vi: 'Giờ' } },
            { id: 'v54', korean: '반', romanization: 'ban', emoji: '🕧',
              translations: { en: 'Half (30 min)', es: 'Y media', zh: '半', ja: '半', vi: 'Rưỡi' } },
          ],
        },
      ],
    },

    // ── Unit 2: Transportation ───────────────────────────────────────────────
    {
      unit: 2,
      title: 'Transportation',
      titleKo: '교통',
      lessons: [
        {
          id: 'l2u2l1',
          level: 2, unit: 2, order: 3,
          title: 'Getting Around',
          titleKo: '이동하기',
          emoji: '🚇',
          xpReward: 35,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v55', korean: '어디에 가요?', romanization: 'eodie gayo?', emoji: '🗺️',
              translations: { en: 'Where are you going?', es: '¿Adónde vas?', zh: '你去哪里？', ja: 'どこへ行きますか？', vi: 'Bạn đi đâu vậy?' } },
            { id: 'v56', korean: '지하철', romanization: 'jihacheol', emoji: '🚇',
              translations: { en: 'Subway', es: 'Metro', zh: '地铁', ja: '地下鉄', vi: 'Tàu điện ngầm' } },
            { id: 'v57', korean: '버스', romanization: 'beoseu', emoji: '🚌',
              translations: { en: 'Bus', es: 'Autobús', zh: '公共汽车', ja: 'バス', vi: 'Xe buýt' } },
            { id: 'v58', korean: '택시', romanization: 'taeksi', emoji: '🚕',
              translations: { en: 'Taxi', es: 'Taxi', zh: '出租车', ja: 'タクシー', vi: 'Taxi' } },
            { id: 'v59', korean: '얼마나 걸려요?', romanization: 'eolmana geollyeoyo?', emoji: '⏳',
              translations: { en: 'How long does it take?', es: '¿Cuánto tiempo tarda?', zh: '要多久？', ja: 'どのくらいかかりますか？', vi: 'Mất bao lâu?' } },
            { id: 'v60', korean: '내려 주세요', romanization: 'naeryeo juseyo', emoji: '🛑',
              translations: { en: 'Please let me off here', es: 'Por favor déjeme aquí', zh: '请让我在这里下车', ja: 'ここで降ろしてください', vi: 'Cho tôi xuống ở đây' } },
          ],
        },
        {
          id: 'l2u2l2',
          level: 2, unit: 2, order: 4,
          title: 'Asking Directions',
          titleKo: '길 묻기',
          emoji: '🗺️',
          xpReward: 40,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v61', korean: '어떻게 가요?', romanization: 'eotteoke gayo?', emoji: '🧭',
              translations: { en: 'How do I get there?', es: '¿Cómo llego allí?', zh: '怎么去？', ja: 'どうやって行きますか？', vi: 'Đi thế nào?' } },
            { id: 'v62', korean: '오른쪽', romanization: 'oreunjjok', emoji: '➡️',
              translations: { en: 'Right', es: 'Derecha', zh: '右边', ja: '右', vi: 'Bên phải' } },
            { id: 'v63', korean: '왼쪽', romanization: 'oenjjok', emoji: '⬅️',
              translations: { en: 'Left', es: 'Izquierda', zh: '左边', ja: '左', vi: 'Bên trái' } },
            { id: 'v64', korean: '직진', romanization: 'jikjin', emoji: '⬆️',
              translations: { en: 'Straight ahead', es: 'Todo recto', zh: '直走', ja: 'まっすぐ', vi: 'Đi thẳng' } },
            { id: 'v65', korean: '근처에', romanization: 'geuncheoe', emoji: '📍',
              translations: { en: 'Near / Nearby', es: 'Cerca de', zh: '附近', ja: '近くに', vi: 'Gần đây' } },
            { id: 'v66', korean: '길을 잃었어요', romanization: 'gireul ireoesseoyo', emoji: '😕',
              translations: { en: "I'm lost", es: 'Estoy perdido/a', zh: '我迷路了', ja: '道に迷いました', vi: 'Tôi bị lạc' } },
          ],
        },
      ],
    },

    // ── Unit 3: Weather & Feelings ───────────────────────────────────────────
    {
      unit: 3,
      title: 'Weather & Feelings',
      titleKo: '날씨와 감정',
      lessons: [
        {
          id: 'l2u3l1',
          level: 2, unit: 3, order: 5,
          title: 'Weather',
          titleKo: '날씨',
          emoji: '🌤️',
          xpReward: 35,
          estimatedMinutes: 7,
          vocabulary: [
            { id: 'v67', korean: '오늘 날씨 어때요?', romanization: 'oneul nalsi eottaeyo?', emoji: '🌡️',
              translations: { en: "How's the weather today?", es: '¿Cómo está el tiempo hoy?', zh: '今天天气怎么样？', ja: '今日の天気は？', vi: 'Hôm nay thời tiết thế nào?' } },
            { id: 'v68', korean: '더워요', romanization: 'deowoyo', emoji: '🥵',
              translations: { en: "It's hot", es: 'Hace calor', zh: '很热', ja: '暑いです', vi: 'Trời nóng' } },
            { id: 'v69', korean: '추워요', romanization: 'chuwoyo', emoji: '🥶',
              translations: { en: "It's cold", es: 'Hace frío', zh: '很冷', ja: '寒いです', vi: 'Trời lạnh' } },
            { id: 'v70', korean: '비가 와요', romanization: 'biga wayo', emoji: '🌧️',
              translations: { en: "It's raining", es: 'Está lloviendo', zh: '在下雨', ja: '雨が降っています', vi: 'Trời đang mưa' } },
            { id: 'v71', korean: '맑아요', romanization: 'malgayo', emoji: '☀️',
              translations: { en: "It's sunny / clear", es: 'Está soleado', zh: '晴朗', ja: '晴れています', vi: 'Trời nắng đẹp' } },
            { id: 'v72', korean: '흐려요', romanization: 'heuryeoyo', emoji: '☁️',
              translations: { en: "It's cloudy", es: 'Está nublado', zh: '阴天', ja: '曇りです', vi: 'Trời nhiều mây' } },
          ],
        },
        {
          id: 'l2u3l2',
          level: 2, unit: 3, order: 6,
          title: 'Emotions',
          titleKo: '감정 표현',
          emoji: '😊',
          xpReward: 40,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v73', korean: '기뻐요', romanization: 'gippeoyo', emoji: '😄',
              translations: { en: "I'm happy", es: 'Estoy feliz', zh: '我很高兴', ja: '嬉しいです', vi: 'Tôi vui' } },
            { id: 'v74', korean: '슬퍼요', romanization: 'seulpeoyo', emoji: '😢',
              translations: { en: "I'm sad", es: 'Estoy triste', zh: '我很难过', ja: '悲しいです', vi: 'Tôi buồn' } },
            { id: 'v75', korean: '피곤해요', romanization: 'pigonhaeyo', emoji: '😴',
              translations: { en: "I'm tired", es: 'Estoy cansado/a', zh: '我很累', ja: '疲れています', vi: 'Tôi mệt' } },
            { id: 'v76', korean: '걱정돼요', romanization: 'geokjeongdwaeyo', emoji: '😟',
              translations: { en: "I'm worried", es: 'Estoy preocupado/a', zh: '我很担心', ja: '心配です', vi: 'Tôi lo lắng' } },
            { id: 'v77', korean: '신나요', romanization: 'sinnayo', emoji: '🎉',
              translations: { en: "I'm excited", es: 'Estoy emocionado/a', zh: '我很兴奋', ja: '興奮しています', vi: 'Tôi hào hứng' } },
            { id: 'v78', korean: '화가 나요', romanization: 'hwaga nayo', emoji: '😠',
              translations: { en: "I'm angry", es: 'Estoy enojado/a', zh: '我生气了', ja: '怒っています', vi: 'Tôi tức giận' } },
          ],
        },
      ],
    },
  ],
};

// ─── Level 3: Daily Talk ─────────────────────────────────────────────────────

const LEVEL_3: LevelData = {
  level: 3,
  title: 'Daily Talk',
  titleKo: '일상 대화',
  emoji: '🌳',
  units: [
    // ── Unit 1: Café ────────────────────────────────────────────────────────
    {
      unit: 1,
      title: 'Café',
      titleKo: '카페',
      lessons: [
        {
          id: 'l3u1l1',
          level: 3, unit: 1, order: 1,
          title: 'Ordering at a Café',
          titleKo: '카페에서 주문하기',
          emoji: '☕',
          xpReward: 40,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v79', korean: '카페라떼', romanization: 'kapeollatte', emoji: '☕',
              translations: { en: 'Café latte', es: 'Café con leche', zh: '拿铁咖啡', ja: 'カフェラテ', vi: 'Cà phê sữa' } },
            { id: 'v80', korean: '아이스로', romanization: 'aiseuro', emoji: '🧊',
              translations: { en: 'Iced (please)', es: 'Con hielo', zh: '冰的', ja: 'アイスで', vi: 'Uống đá' } },
            { id: 'v81', korean: '따뜻하게', romanization: 'ttatteutage', emoji: '♨️',
              translations: { en: 'Hot (please)', es: 'Caliente', zh: '热的', ja: '温かく', vi: 'Uống nóng' } },
            { id: 'v82', korean: '테이크아웃', romanization: 'teikeuaut', emoji: '🥤',
              translations: { en: 'Takeout / To go', es: 'Para llevar', zh: '带走', ja: 'テイクアウト', vi: 'Mang đi' } },
            { id: 'v83', korean: '사이즈', romanization: 'saijeu', emoji: '📏',
              translations: { en: 'Size', es: 'Tamaño', zh: '尺寸', ja: 'サイズ', vi: 'Kích cỡ' } },
            { id: 'v84', korean: '결제할게요', romanization: 'gyeoljaehalgeyo', emoji: '💳',
              translations: { en: "I'll pay now", es: 'Voy a pagar', zh: '我来付款', ja: '支払います', vi: 'Tôi sẽ thanh toán' } },
          ],
          fillInBlanks: [
            { id: 'fb22', before: '카페라떼 한 잔 ', after: '.', answer: '주세요',
              choices: ['주세요', '결제할게요', '테이크아웃', '아이스로'],
              hint: 'Please give me one café latte.' },
            { id: 'fb23', before: '뜨거운 거 말고 ', after: ' 주세요.', answer: '아이스로',
              choices: ['아이스로', '따뜻하게', '테이크아웃', '사이즈'],
              hint: 'Not hot, iced please.' },
            { id: 'fb24', before: '여기서 드세요? 아니면 ', after: '?', answer: '테이크아웃',
              choices: ['테이크아웃', '아이스로', '결제할게요', '사이즈'],
              hint: 'Eating here or takeout?' },
          ],
        },
        {
          id: 'l3u1l2',
          level: 3, unit: 1, order: 2,
          title: 'Café Menu',
          titleKo: '카페 메뉴',
          emoji: '🧋',
          xpReward: 40,
          estimatedMinutes: 8,
          vocabulary: [
            { id: 'v85', korean: '아메리카노', romanization: 'americano', emoji: '☕',
              translations: { en: 'Americano', es: 'Americano', zh: '美式咖啡', ja: 'アメリカーノ', vi: 'Cà phê americano' } },
            { id: 'v86', korean: '녹차 라떼', romanization: 'nokcha latte', emoji: '🍵',
              translations: { en: 'Green tea latte', es: 'Latte de té verde', zh: '绿茶拿铁', ja: '抹茶ラテ', vi: 'Latte trà xanh' } },
            { id: 'v87', korean: '케이크', romanization: 'keikeu', emoji: '🍰',
              translations: { en: 'Cake', es: 'Pastel', zh: '蛋糕', ja: 'ケーキ', vi: 'Bánh ngọt' } },
            { id: 'v88', korean: '설탕', romanization: 'seoltang', emoji: '🍬',
              translations: { en: 'Sugar', es: 'Azúcar', zh: '糖', ja: '砂糖', vi: 'Đường' } },
            { id: 'v89', korean: '시럽', romanization: 'sireoп', emoji: '🫙',
              translations: { en: 'Syrup', es: 'Jarabe', zh: '糖浆', ja: 'シロップ', vi: 'Siro' } },
            { id: 'v90', korean: '조각', romanization: 'jogak', emoji: '✂️',
              translations: { en: 'Slice / Piece', es: 'Trozo', zh: '一块', ja: 'ひとかけら', vi: 'Miếng' } },
          ],
          fillInBlanks: [
            { id: 'fb25', before: '너무 써요. ', after: ' 넣어 주세요.', answer: '설탕',
              choices: ['설탕', '시럽', '케이크', '조각'],
              hint: "It's too bitter. Please add sugar." },
            { id: 'fb26', before: '케이크 한 ', after: ' 주세요.', answer: '조각',
              choices: ['조각', '설탕', '시럽', '아메리카노'],
              hint: 'Please give me one slice of cake.' },
            { id: 'fb27', before: '', after: ' 한 잔 주세요.', answer: '아메리카노',
              choices: ['아메리카노', '녹차 라떼', '케이크', '설탕'],
              hint: 'Please give me one Americano.' },
          ],
        },
      ],
    },

    // ── Unit 2: Restaurant ──────────────────────────────────────────────────
    {
      unit: 2,
      title: 'Restaurant',
      titleKo: '음식점',
      lessons: [
        {
          id: 'l3u2l1',
          level: 3, unit: 2, order: 3,
          title: 'Ordering Food',
          titleKo: '음식 주문하기',
          emoji: '🍽️',
          xpReward: 45,
          estimatedMinutes: 9,
          vocabulary: [
            { id: 'v91', korean: '메뉴판', romanization: 'menupan', emoji: '📋',
              translations: { en: 'Menu', es: 'Carta / Menú', zh: '菜单', ja: 'メニュー', vi: 'Thực đơn' } },
            { id: 'v92', korean: '추천해 주세요', romanization: 'chucheonhae juseyo', emoji: '👍',
              translations: { en: 'Please recommend something', es: 'Por favor recomiende algo', zh: '请推荐一下', ja: 'おすすめを教えてください', vi: 'Xin hãy gợi ý cho tôi' } },
            { id: 'v93', korean: '맵지 않게', romanization: 'maepji ange', emoji: '🌶️',
              translations: { en: 'Not spicy', es: 'Sin picante', zh: '不辣', ja: '辛くしないで', vi: 'Không cay' } },
            { id: 'v94', korean: '포장이요', romanization: 'pojangiyo', emoji: '📦',
              translations: { en: 'To go (food)', es: 'Para llevar', zh: '打包', ja: 'お持ち帰りで', vi: 'Đóng gói mang về' } },
            { id: 'v95', korean: '잠깐만요', romanization: 'jamkkanmanyo', emoji: '🙋',
              translations: { en: 'Excuse me / Just a moment', es: 'Disculpe / Un momento', zh: '请等一下', ja: 'ちょっと待って', vi: 'Xin lỗi / Một chút thôi' } },
            { id: 'v96', korean: '더 주세요', romanization: 'deo juseyo', emoji: '➕',
              translations: { en: 'More please', es: 'Más por favor', zh: '再来一些', ja: 'もっとください', vi: 'Cho thêm nữa' } },
          ],
          fillInBlanks: [
            { id: 'fb28', before: '', after: ' 주세요.', answer: '메뉴판',
              choices: ['메뉴판', '포장이요', '잠깐만요', '더 주세요'],
              hint: 'Please give me the menu.' },
            { id: 'fb29', before: '뭐가 맛있어요? ', after: '.', answer: '추천해 주세요',
              choices: ['추천해 주세요', '맵지 않게', '포장이요', '더 주세요'],
              hint: "What's good here? Please recommend something." },
            { id: 'fb30', before: '매운 거 못 먹어요. ', after: ' 해주세요.', answer: '맵지 않게',
              choices: ['맵지 않게', '추천해 주세요', '포장이요', '잠깐만요'],
              hint: "I can't eat spicy food. Please make it not spicy." },
          ],
        },
        {
          id: 'l3u2l2',
          level: 3, unit: 2, order: 4,
          title: 'Korean Food',
          titleKo: '한식 메뉴',
          emoji: '🍲',
          xpReward: 45,
          estimatedMinutes: 9,
          vocabulary: [
            { id: 'v97', korean: '김치찌개', romanization: 'gimchi jjigae', emoji: '🥘',
              translations: { en: 'Kimchi stew', es: 'Guiso de kimchi', zh: '泡菜锅', ja: 'キムチチゲ', vi: 'Canh kimchi' } },
            { id: 'v98', korean: '불고기', romanization: 'bulgogi', emoji: '🥩',
              translations: { en: 'Bulgogi (marinated beef)', es: 'Bulgogi (carne marinada)', zh: '烤肉 (腌制牛肉)', ja: 'プルコギ', vi: 'Thịt bò bulgogi' } },
            { id: 'v99', korean: '비빔밥', romanization: 'bibimbap', emoji: '🍱',
              translations: { en: 'Bibimbap (mixed rice)', es: 'Bibimbap (arroz mezclado)', zh: '拌饭', ja: 'ビビンバ', vi: 'Cơm trộn bibimbap' } },
            { id: 'v100', korean: '냉면', romanization: 'naengmyeon', emoji: '🍜',
              translations: { en: 'Cold noodles', es: 'Fideos fríos', zh: '冷面', ja: '冷麺', vi: 'Mì lạnh' } },
            { id: 'v101', korean: '삼겹살', romanization: 'samgyeopsal', emoji: '🥓',
              translations: { en: 'Pork belly BBQ', es: 'Panceta a la parrilla', zh: '五花肉烤肉', ja: 'サムギョプサル', vi: 'Thịt ba chỉ nướng' } },
            { id: 'v102', korean: '된장찌개', romanization: 'doenjangjjigae', emoji: '🍵',
              translations: { en: 'Soybean paste stew', es: 'Guiso de pasta de soja', zh: '大酱汤', ja: 'テンジャンチゲ', vi: 'Canh tương đậu' } },
          ],
          fillInBlanks: [
            { id: 'fb31', before: '저는 ', after: ' 좋아해요.', answer: '불고기',
              choices: ['불고기', '냉면', '삼겹살', '된장찌개'],
              hint: 'I like bulgogi.' },
            { id: 'fb32', before: '', after: ' 1인분 주세요.', answer: '삼겹살',
              choices: ['삼겹살', '불고기', '비빔밥', '김치찌개'],
              hint: 'Please give me one serving of pork belly.' },
            { id: 'fb33', before: '여름엔 ', after: ' 먹고 싶어요.', answer: '냉면',
              choices: ['냉면', '김치찌개', '된장찌개', '비빔밥'],
              hint: 'In summer, I want to eat cold noodles.' },
          ],
        },
      ],
    },

    // ── Unit 3: School & Work ───────────────────────────────────────────────
    {
      unit: 3,
      title: 'School & Work',
      titleKo: '학교와 직장',
      lessons: [
        {
          id: 'l3u3l1',
          level: 3, unit: 3, order: 5,
          title: 'At School',
          titleKo: '학교에서',
          emoji: '🏫',
          xpReward: 45,
          estimatedMinutes: 9,
          vocabulary: [
            { id: 'v103', korean: '숙제', romanization: 'sukje', emoji: '📝',
              translations: { en: 'Homework', es: 'Tarea', zh: '作业', ja: '宿題', vi: 'Bài tập về nhà' } },
            { id: 'v104', korean: '시험', romanization: 'siheom', emoji: '📄',
              translations: { en: 'Test / Exam', es: 'Examen', zh: '考试', ja: '試験', vi: 'Kỳ thi' } },
            { id: 'v105', korean: '도서관', romanization: 'doseogwan', emoji: '📚',
              translations: { en: 'Library', es: 'Biblioteca', zh: '图书馆', ja: '図書館', vi: 'Thư viện' } },
            { id: 'v106', korean: '교수님', romanization: 'gyosunim', emoji: '👨‍🏫',
              translations: { en: 'Professor', es: 'Profesor/a', zh: '教授', ja: '教授', vi: 'Giáo sư' } },
            { id: 'v107', korean: '수업', romanization: 'sueop', emoji: '🏫',
              translations: { en: 'Class / Lesson', es: 'Clase', zh: '课', ja: '授業', vi: 'Buổi học' } },
            { id: 'v108', korean: '질문', romanization: 'jilmun', emoji: '❓',
              translations: { en: 'Question', es: 'Pregunta', zh: '问题', ja: '質問', vi: 'Câu hỏi' } },
          ],
          fillInBlanks: [
            { id: 'fb34', before: '', after: ' 언제 제출해요?', answer: '숙제',
              choices: ['숙제', '시험', '수업', '질문'],
              hint: 'When do I submit the homework?' },
            { id: 'fb35', before: '다음 주에 ', after: ' 있어요.', answer: '시험',
              choices: ['시험', '숙제', '수업', '도서관'],
              hint: "There's an exam next week." },
            { id: 'fb36', before: '교수님, ', after: ' 있어요.', answer: '질문',
              choices: ['질문', '숙제', '시험', '수업'],
              hint: 'Professor, I have a question.' },
          ],
        },
        {
          id: 'l3u3l2',
          level: 3, unit: 3, order: 6,
          title: 'At Work',
          titleKo: '직장에서',
          emoji: '💼',
          xpReward: 50,
          estimatedMinutes: 10,
          vocabulary: [
            { id: 'v109', korean: '회의', romanization: 'hoeui', emoji: '👥',
              translations: { en: 'Meeting', es: 'Reunión', zh: '会议', ja: '会議', vi: 'Cuộc họp' } },
            { id: 'v110', korean: '보고서', romanization: 'bogoseo', emoji: '📊',
              translations: { en: 'Report', es: 'Informe', zh: '报告', ja: '報告書', vi: 'Báo cáo' } },
            { id: 'v111', korean: '마감', romanization: 'magam', emoji: '⏰',
              translations: { en: 'Deadline', es: 'Fecha límite', zh: '截止日期', ja: '締め切り', vi: 'Hạn chót' } },
            { id: 'v112', korean: '출근하다', romanization: 'chulgeunhada', emoji: '🏢',
              translations: { en: 'To go to work', es: 'Ir al trabajo', zh: '上班', ja: '出勤する', vi: 'Đi làm' } },
            { id: 'v113', korean: '퇴근하다', romanization: 'toegeunhada', emoji: '🏠',
              translations: { en: 'To leave work', es: 'Salir del trabajo', zh: '下班', ja: '退勤する', vi: 'Tan làm' } },
            { id: 'v114', korean: '야근하다', romanization: 'yageunhada', emoji: '🌙',
              translations: { en: 'To work overtime', es: 'Hacer horas extra', zh: '加班', ja: '残業する', vi: 'Làm thêm giờ' } },
          ],
          fillInBlanks: [
            { id: 'fb37', before: '오늘 ', after: ' 몇 시예요?', answer: '회의',
              choices: ['회의', '보고서', '마감', '출근하다'],
              hint: 'What time is the meeting today?' },
            { id: 'fb38', before: '', after: ' 언제까지예요?', answer: '마감',
              choices: ['마감', '회의', '보고서', '야근하다'],
              hint: 'When is the deadline?' },
            { id: 'fb39', before: '오늘 ', after: ' 해야 해요.', answer: '야근하다',
              choices: ['야근하다', '출근하다', '퇴근하다', '회의'],
              hint: 'I have to work overtime today.' },
          ],
        },
      ],
    },
  ],
};

// ─── All Levels ──────────────────────────────────────────────────────────────

export const ALL_LEVELS: LevelData[] = [LEVEL_1, LEVEL_2, LEVEL_3];

export function getLessonsForLevel(level: number): LessonData[] {
  const lvl = ALL_LEVELS.find((l) => l.level === level);
  if (!lvl) return [];
  return lvl.units.flatMap((u) => u.lessons);
}

export function getLessonById(id: string): LessonData | undefined {
  return ALL_LEVELS.flatMap((l) => l.units.flatMap((u) => u.lessons)).find((l) => l.id === id);
}

export function getFirstLesson(level: number): LessonData | undefined {
  return getLessonsForLevel(level)[0];
}
