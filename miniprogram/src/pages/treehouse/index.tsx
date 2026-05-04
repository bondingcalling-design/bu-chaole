import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useDidHide, useLoad, useDidShow, useUnload } from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import FloatingTabBar from '@/components/floating-tab-bar';
import iconSend from '@/assets/icons/send.svg';
import { detectCrisis, showCrisisModal } from '@/utils/crisisDetect';
import { detectHostility, sanitizeHostileForModel } from '@/utils/intentDetect';

import './index.less';

interface Msg {
  id: string;
  role: 'user' | 'tree';
  text: string;
}

const SEED: Msg[] = [
  { id: 'seed', role: 'tree', text: '这里是树洞，没人会评价你。把心里话扔进来，扔完就忘。' },
];

const FALLBACK_REPLY = '我听着呢，再说说。';

export default function TreehousePage() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [scrollAnchor, setScrollAnchor] = useState('a');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingProgress, setTypingProgress] = useState(0);
  const failureCountRef = useRef(0);

  // P0-11 阅后即焚: any handoff prefill is consumed once. Conversation is
  // never persisted (treehouse-conv key is forcibly cleared on every entry).
  const consumeHandoff = () => {
    try {
      const handoff = Taro.getStorageSync('treehouse-handoff');
      if (typeof handoff === 'string' && handoff.trim()) {
        setInput(handoff);
      }
    } catch (_) {}
    try { Taro.removeStorageSync('treehouse-handoff'); } catch (_) {}
    try { Taro.removeStorageSync('treehouse-conv'); } catch (_) {}
  };
  useLoad(consumeHandoff);
  // Tab pages don't unmount when you switch away — useDidShow runs each
  // time you re-enter the 树洞 tab, so we re-check the handoff key in case
  // the user came in through the 小听 hostility gate after first load.
  useDidShow(consumeHandoff);

  // Burn the in-memory log when the tab goes off-screen. The "阅后即焚"
  // contract: leaving 树洞 wipes the venting, even from this process.
  const burn = () => {
    setMessages(SEED);
    setInput('');
    setTypingMessageId(null);
    setTypingProgress(0);
    try {
      Taro.removeStorageSync('treehouse-conv');
      Taro.removeStorageSync('treehouse-handoff');
    } catch (_) {}
  };
  useDidHide(burn);
  useUnload(burn);

  useEffect(() => {
    const t = setTimeout(() => setScrollAnchor((p) => (p === 'a' ? 'b' : 'a')), 80);
    return () => clearTimeout(t);
  }, [messages.length, isThinking]);

  useEffect(() => {
    if (!typingMessageId) return;
    const target = messages.find((m) => m.id === typingMessageId)?.text || '';
    if (typingProgress >= target.length) {
      setTypingMessageId(null);
      return;
    }
    const t = setTimeout(() => setTypingProgress((p) => p + 1), 18);
    return () => clearTimeout(t);
  }, [typingMessageId, typingProgress, messages]);

  const callTreehouse = async (history: Msg[]): Promise<string> => {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'doubao',
        data: {
          mode: 'treehouse',
          messages: history.map((m) => ({
            role: m.role === 'tree' ? 'assistant' : 'user',
            content: m.role === 'tree'
              ? m.text
              : (detectHostility(m.text) ? sanitizeHostileForModel(m.text) : m.text),
          })),
        },
      });
      const r: any = res.result;
      if (r?.ok && r.reply) {
        failureCountRef.current = 0;
        return r.reply as string;
      }
      console.warn('treehouse fn error', r);
      failureCountRef.current += 1;
      return FALLBACK_REPLY;
    } catch (e) {
      console.error('treehouse call failed', e);
      failureCountRef.current += 1;
      return FALLBACK_REPLY;
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    if (trimmed.length > 500) return;

    const isHostile = detectHostility(trimmed);
    if (!isHostile && detectCrisis(trimmed)) {
      const choice = await showCrisisModal();
      if (choice === 'call') return;
    }

    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsThinking(true);

    const reply = await callTreehouse(next);
    const treeId = `t-${Date.now()}`;
    setMessages((prev) => [...prev, { id: treeId, role: 'tree', text: reply }]);
    setIsThinking(false);
    setTypingMessageId(treeId);
    setTypingProgress(0);
  };

  return (
    <View className="th-root">
      <Image className="th-bg" src={bgImage} mode="aspectFill" />
      <View className="th-vignette-main" />
      <View className="th-vignette-top" />
      <View className="th-vignette-bottom" />

      {/* Header — no back button: this IS the 树洞 tab */}
      <View className="th-nav">
        <View className="th-nav-title-wrap">
          <Text className="th-nav-title">🌳 树洞</Text>
          <Text className="th-nav-sub">完全顺着你 · 离开即焚</Text>
        </View>
      </View>

      <ScrollView
        className="th-scroll"
        scrollY
        showScrollbar={false}
        scrollIntoView={`th-bottom-${scrollAnchor}`}
        scrollWithAnimation
      >
        <View className="th-list">
          {messages.map((msg) => {
            if (msg.role === 'tree') {
              const streaming = msg.id === typingMessageId;
              const display = streaming ? msg.text.slice(0, typingProgress) : msg.text;
              return (
                <View key={msg.id} className="msg-row msg-row-tree">
                  <View className="tree-avatar">
                    <Text className="tree-avatar-emoji">🌳</Text>
                  </View>
                  <View className="bubble bubble-tree">
                    <Text className="bubble-text bubble-text-tree">
                      {display}
                      {streaming && <Text className="th-caret">▍</Text>}
                    </Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={msg.id} className="msg-row msg-row-user">
                <View className="bubble bubble-user">
                  <Text className="bubble-text bubble-text-user">{msg.text}</Text>
                </View>
              </View>
            );
          })}

          {isThinking && (
            <View className="msg-row msg-row-tree">
              <View className="tree-avatar">
                <Text className="tree-avatar-emoji">🌳</Text>
              </View>
              <View className="bubble bubble-tree typing-bubble">
                <View className="typing-dot typing-dot-0" />
                <View className="typing-dot typing-dot-1" />
                <View className="typing-dot typing-dot-2" />
              </View>
            </View>
          )}

          <View id="th-bottom-a" className="th-bottom-sentinel" />
          <View id="th-bottom-b" className="th-bottom-sentinel" />
        </View>
      </ScrollView>

      {/* Bottom area — sits above the floating tab bar */}
      <View className="th-bottom">
        <View className="th-shred-row">
          <View
            className="th-breathe-pill"
            onClick={() => Taro.navigateTo({ url: '/pages/breathe/index' })}
            hoverClass="th-breathe-pill--hover"
          >
            <Text className="th-breathe-emoji">🌬️</Text>
            <Text className="th-breathe-text">深呼吸 30 秒</Text>
          </View>
          <View className="th-shred-hint">
            <Text className="th-shred-emoji">🔥</Text>
            <Text className="th-shred-text">离开即焚</Text>
          </View>
        </View>

        <View className="th-input-bar">
          <Textarea
            className="th-input"
            value={input}
            placeholder="想骂谁就骂，想吐什么就吐…"
            placeholderClass="th-input-placeholder"
            maxlength={500}
            autoHeight
            showConfirmBar={false}
            adjustPosition
            fixed
            cursorSpacing={24}
            disableDefaultPadding
            onInput={(e) => setInput(e.detail.value)}
          />

          <View
            className={`th-send-btn ${input.trim().length > 0 && !isThinking ? 'is-active' : ''}`}
            onClick={sendMessage}
            hoverClass="th-send-btn--hover"
          >
            <Image className="th-send-icon" src={iconSend} mode="aspectFit" />
          </View>
        </View>
      </View>

      <FloatingTabBar active="treehouse" />
    </View>
  );
}
