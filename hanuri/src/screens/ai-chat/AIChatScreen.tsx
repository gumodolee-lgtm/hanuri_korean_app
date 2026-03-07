import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { ChatMessage } from '../../types';
import { getScenarioById } from '../../data/scenarios';
import { sendMessage, parseCorrection } from '../../services/aiService';
import { useUserStore } from '../../store/userStore';
import { speakKorean } from '../../utils/tts';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';

type NavProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'AIChat'>;

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const { message: text, correction } = parseCorrection(message.content);

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && <Text style={styles.aiAvatar}>🤖</Text>}
      <View style={styles.bubbleWrapper}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{text}</Text>
        </View>
        {!isUser && (
          <TouchableOpacity onPress={() => speakKorean(text)} style={styles.ttsBtn}>
            <Text style={styles.ttsBtnText}>🔊</Text>
          </TouchableOpacity>
        )}
        {correction && (
          <View style={styles.correctionBox}>
            <Text style={styles.correctionIcon}>✏️</Text>
            <Text style={styles.correctionText}>{correction}</Text>
          </View>
        )}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const t = useT();
  return (
    <View style={styles.bubbleRow}>
      <Text style={styles.aiAvatar}>🤖</Text>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <ActivityIndicator size="small" color={colors.gray} />
        <Text style={styles.typingText}>{t.aiChat.typing}</Text>
      </View>
    </View>
  );
}

export default function AIChatScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { addXP } = useUserStore();
  const t = useT();

  const scenarioId = route.params?.scenarioId ?? 'cafe';
  const scenario = getScenarioById(scenarioId);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!scenario) return [];
    return [{
      id: 'starter',
      role: 'assistant',
      content: scenario.starterMessage,
      timestamp: new Date(),
    }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !scenario) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const allMessages = [...messages, userMsg];
      const reply = await sendMessage(scenario.systemPrompt, allMessages, scenarioId);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Award 2 XP per message sent
      addXP(2);
      setXpEarned((prev) => prev + 2);
      scrollToBottom();
    } catch (err) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t.aiChat.connectionError,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, scenario, scenarioId, addXP]);

  if (!scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: spacing.lg, color: colors.gray }}>{t.aiChat.notFound}</Text>
      </SafeAreaView>
    );
  }

  const userMessageCount = messages.filter((m) => m.role === 'user').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{scenario.emoji}</Text>
          <View>
            <Text style={styles.headerTitle}>{scenario.titleKo}</Text>
            <Text style={styles.headerSub}>{userMessageCount} {t.aiChat.convUnit} · +{xpEarned} XP</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.endBtnText}>{t.aiChat.end}</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Scenario context banner */}
          <View style={styles.contextBanner}>
            <Text style={styles.contextText}>📍 {scenario.description}</Text>
          </View>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}
          <View style={{ height: spacing.md }} />
        </ScrollView>

        {/* Quick reply suggestions */}
        {userMessageCount === 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestions}
          >
            {scenario.quickReplies.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => setInput(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t.aiChat.inputPlaceholder}
            placeholderTextColor={colors.gray}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>▶</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  backBtnText: { fontSize: 28, color: colors.dark, lineHeight: 32 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerEmoji: { fontSize: 28 },
  headerTitle: { ...typography.body, color: colors.dark, fontWeight: '700' },
  headerSub: { ...typography.caption, color: colors.gray },
  endBtn: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  endBtnText: { ...typography.caption, color: colors.gray },

  messageList: {
    padding: spacing.md,
    gap: spacing.md,
  },

  contextBanner: {
    backgroundColor: colors.secondary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  contextText: { ...typography.caption, color: colors.dark, textAlign: 'center' },

  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '85%',
  },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: { fontSize: 24, marginBottom: 4 },
  bubbleWrapper: { gap: 4 },
  bubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: 280,
  },
  bubbleAI: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { ...typography.body, color: colors.dark, lineHeight: 22 },
  ttsBtn: { alignSelf: 'flex-start' },
  ttsBtnText: { fontSize: 16 },
  bubbleTextUser: { color: colors.white },

  correctionBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD93D',
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    maxWidth: 280,
  },
  correctionIcon: { fontSize: 12 },
  correctionText: { fontSize: 12, color: colors.dark, flex: 1, lineHeight: 18 },

  timestamp: { fontSize: 10, color: colors.gray },

  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  typingText: { ...typography.caption, color: colors.gray },

  suggestions: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  suggestionText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.dark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
