import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useDidShow, useRouter } from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import iconSend from '@/assets/icons/send.svg';
import iconMicSmall from '@/assets/icons/mic-small.svg';
import iconFileText from '@/assets/icons/file-text.svg';
import iconClock from '@/assets/icons/clock.svg';
import iconMessagePlus from '@/assets/icons/message-plus.svg';
import { getAsrManager, isAsrSupported, AsrStopResult, transcribeFile } from '@/utils/asr';
import {
  archiveDraft,
  clearCurrent,
  getCurrent,
  saveCurrent,
  takeResume,
} from '@/utils/chatDrafts';
import { detectCrisis, showCrisisModal } from '@/utils/crisisDetect';
import { detectHostility, sanitizeHostileForModel, showHostilityModal } from '@/utils/intentDetect';
import { ensureRecordPermission } from '@/utils/recordPerm';

import './index.less';

type Role = 'user' | 'ai';
type Kind = 'text' | 'voice';

interface Message {
  id: string;
  role: Role;
  kind?: Kind;
  text: string;
  voicePath?: string;
  duration?: string;
  asrPending?: boolean; // voice bubble shown before ASR completes
}

const INITIAL_MESSAGES: Message[] = [
  { id: 'seed-1', role: 'ai', text: '嗨，我在这里，随时倾听你。今天发生了什么？' },
];

const FALLBACK_REPLY = '我听着呢，你继续说。';

// Lazy initial-state read: prefer a draft the user just clicked into from
// history, then fall back to the in-flight conversation persisted to storage,
// finally the fresh seed. Doing this in the useState initializer (vs. useLoad)
// avoids the seed flashing on screen before the saved messages swap in.
const readInitialMessages = (): { messages: Message[]; id?: string } => {
  try {
    const resume = takeResume();
    if (resume && resume.messages.length > 0) {
      // Persist immediately so the in-effect "current" matches what we render
      saveCurrent(resume.messages as Message[], resume.id);
      return { messages: resume.messages as Message[], id: resume.id };
    }
    const cur = getCurrent();
    if (cur && cur.messages.length > 0) {
      return { messages: cur.messages as Message[], id: cur.id };
    }
  } catch (_) {}
  return { messages: INITIAL_MESSAGES };
};

export default function ChatPage() {
  const router = useRouter();

  // Lazy initializer — runs exactly once on mount so the side-effecting
  // takeResume() inside doesn't fire on every re-render.
  const [initial] = useState(readInitialMessages);
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const conversationIdRef = useRef<string | undefined>(initial.id);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bridgePulsing, setBridgePulsing] = useState(false);
  const [scrollAnchor, setScrollAnchor] = useState('');
  // P0-5: typewriter / streaming illusion. The reply arrives whole from the
  // cloud function but we reveal it character-by-character to soften the
  // wait gap and make the AI feel "alive". Only one message types at a time.
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typingProgress, setTypingProgress] = useState(0);

  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const progressPct = Math.min(92, 30 + userMsgCount * 15);

  // Persist the in-flight conversation on every change so the user can leave
  // the page (or background the app) and come back without losing it. Only
  // touches storage once there's actual user content to save. We sync the
  // local id ref back from storage on first save so subsequent archives can
  // overwrite the same draft slot instead of creating duplicates.
  useEffect(() => {
    if (userMsgCount === 0) return;
    saveCurrent(messages, conversationIdRef.current);
    if (!conversationIdRef.current) {
      const cur = getCurrent();
      if (cur) conversationIdRef.current = cur.id;
    }
  }, [messages, userMsgCount]);

  // Returning to chat from history → drafts: takeResume() consumes the
  // handoff, archives the current chat (if any) into drafts, and swaps in
  // the picked draft. Use a functional setState so we read the latest
  // messages without depending on closure freshness in useDidShow.
  useDidShow(() => {
    const resume = takeResume();
    if (!resume || resume.messages.length === 0) return;
    setMessages((prev) => {
      if (prev.some((m) => m.role === 'user')) {
        archiveDraft(prev, conversationIdRef.current);
      }
      return resume.messages as Message[];
    });
    conversationIdRef.current = resume.id;
    saveCurrent(resume.messages as Message[], resume.id);
  });

  // P0-9: restore draft on entry. Draft is wiped after a successful send so
  // it doesn't bleed into the next conversation. Also re-check on every
  // useDidShow — useLoad alone is unreliable in Skyline when the page is
  // preloaded by the framework before the first visible render.
  const restoreDraft = () => {
    try {
      const draft = Taro.getStorageSync('chat-draft');
      // Only restore if the user hasn't started typing yet — never clobber
      // in-flight input on tab return.
      if (typeof draft === 'string' && draft.length > 0) {
        setInput((cur) => (cur ? cur : draft));
      }
    } catch (_) {}
  };
  useLoad(restoreDraft);
  useDidShow(restoreDraft);

  useLoad(() => {
    if (router.params.voiceMessage === '1') {
      try {
        const v = Taro.getStorageSync('pending-voice') as
          | { tempFilePath: string; duration: string; durationSec: number; transcript?: string; pendingAsr?: boolean; ts: number }
          | '';
        Taro.removeStorageSync('pending-voice');
        if (v && typeof v === 'object' && v.tempFilePath) {
          const transcript = (v.transcript || '').trim();
          const voiceMsgId = `v-${v.ts}`;
          const voiceMsg: Message = {
            id: voiceMsgId,
            role: 'user',
            kind: 'voice',
            text: transcript || (v.pendingAsr ? '识别中…' : '（未识别到内容；可继续打字补充）'),
            voicePath: v.tempFilePath,
            duration: v.duration,
            asrPending: !!v.pendingAsr && !transcript,
          };
          setMessages((prev) => [...prev, voiceMsg]);
          if (transcript) {
            // Came pre-transcribed (legacy path). Reply right away.
            setTimeout(() => triggerAiReplyForTranscript(transcript), 200);
          } else if (v.pendingAsr) {
            // Optimistic path: bubble is on screen, run ASR in background
            // and update the bubble + trigger AI when text arrives.
            transcribeFile(v.tempFilePath).then((text) => {
              const trimmed = (text || '').trim();
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === voiceMsgId
                    ? {
                        ...m,
                        text: trimmed || '（未识别到内容；可继续打字补充）',
                        asrPending: false,
                      }
                    : m,
                ),
              );
              if (trimmed) triggerAiReplyForTranscript(trimmed);
            });
          }
        }
      } catch (e) {
        console.warn('pending-voice read failed', e);
      }
    }
  });

  const triggerAiReplyForTranscript = async (transcript: string) => {
    setIsTyping(true);
    const history: Message[] = [
      ...messages,
      { id: `u-asr-${Date.now()}`, role: 'user', text: transcript },
    ];
    const reply = await callDoubao(history);
    const aiId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: reply }]);
    setIsTyping(false);
    beginTypewriter(aiId);
  };

  // Auto-scroll: toggle between two sentinel IDs so ScrollView always sees a
  // changed value and re-fires scrollIntoView. Two regimes:
  //   1. Bubble add / typing-dot toggle — wait 80ms so the new node is mounted
  //      in Skyline before scrollIntoView measures it.
  //   2. Typewriter rolling — fire immediately but only every 4 chars so the
  //      ScrollView's smooth-scroll animation gets time to play instead of
  //      being interrupted on every keystroke (which looked stuck before).
  useEffect(() => {
    const isTypewriter = !!typingMessageId;
    if (isTypewriter && typingProgress % 4 !== 0) return;
    const delay = isTypewriter ? 0 : 80;
    const t = setTimeout(() => {
      setScrollAnchor((prev) =>
        prev === 'chat-bottom-a' ? 'chat-bottom-b' : 'chat-bottom-a'
      );
    }, delay);
    return () => clearTimeout(t);
  }, [messages.length, isTyping, typingMessageId, typingProgress]);

  // P0-5: drive the typewriter. Advance one character every 32ms — fast enough
  // to feel snappy on short replies, slow enough to read.
  useEffect(() => {
    if (!typingMessageId) return;
    const target = messages.find((m) => m.id === typingMessageId)?.text || '';
    if (typingProgress >= target.length) {
      setTypingMessageId(null);
      return;
    }
    // 10ms per char ≈ 60 字 in 0.6s — keep up with the eye after the model
    // generation completes. The TTFT (typing dots → first char) dominates
    // perceived latency, so reveal speed matters less than feeling responsive.
    const t = setTimeout(() => setTypingProgress((p) => p + 1), 10);
    return () => clearTimeout(t);
  }, [typingMessageId, typingProgress, messages]);

  const beginTypewriter = (id: string) => {
    setTypingMessageId(id);
    setTypingProgress(0);
  };

  const failureCountRef = useRef(0);
  const audioRef = useRef<ReturnType<typeof Taro.createInnerAudioContext> | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  // P0-10: once the user has dismissed the "去树洞发泄" suggestion in this
  // session, don't keep re-popping the modal on every subsequent angry line —
  // just let them keep chatting (sanitized) without interruption.
  const hostilityModalDismissedRef = useRef(false);

  // ── Long-press recording in chat ────────────────────────────────
  const recorderRef = useRef<ReturnType<typeof Taro.getRecorderManager> | null>(null);
  const recordStartedAtRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const cancellingRef = useRef(false);
  const recordingStartedRef = useRef(false); // synchronous state for touch handlers
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null); // long-press confirmation timer
  const pressFiredRef = useRef(false); // did the long-press timer actually fire?
  // Tracks whether the finger is still on the mic. Survives across the
  // permission-modal await — if the user releases while the system dialog is
  // still up, we use this flag to abort instead of starting a runaway recording.
  const isPressingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const LONG_PRESS_MS = 300;

  const getRecorder = () => {
    if (!recorderRef.current) recorderRef.current = Taro.getRecorderManager();
    return recorderRef.current;
  };

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVoiceCaptured = async (
    file: string,
    dur: number,
    transcript: string,
  ) => {
    const trimmedTranscript = transcript.trim();

    // Optimistic path: bubble first with "识别中…", then ASR in background.
    // This makes the chat feel responsive even though the network roundtrip
    // is the same.
    if (!trimmedTranscript) {
      const voiceMsgId = `v-${Date.now()}`;
      const voiceMsg: Message = {
        id: voiceMsgId,
        role: 'user',
        kind: 'voice',
        text: '识别中…',
        voicePath: file,
        duration: fmt(dur),
        asrPending: true,
      };
      setMessages((prev) => [...prev, voiceMsg]);

      const text = (await transcribeFile(file)).trim();

      // Crisis check on the late-arriving transcript
      if (text && detectCrisis(text)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === voiceMsgId ? { ...m, text, asrPending: false } : m)),
        );
        const choice = await showCrisisModal();
        if (choice === 'call') return;
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === voiceMsgId
              ? { ...m, text: text || '（未识别到内容；可继续打字补充）', asrPending: false }
              : m,
          ),
        );
      }

      if (text) {
        setIsTyping(true);
        // Build history off the latest committed messages by reading state
        // through the functional updater pattern.
        setMessages((prev) => {
          const history: Message[] = [
            ...prev,
            { id: `u-asr-${Date.now()}`, role: 'user', text },
          ];
          callDoubao(history).then((reply) => {
            const aiId = `a-${Date.now()}`;
            setMessages((p) => [...p, { id: aiId, role: 'ai', text: reply }]);
            setIsTyping(false);
            beginTypewriter(aiId);
          });
          return prev;
        });
      }
      return;
    }

    // Pre-transcribed path (legacy / external): show bubble + reply directly.
    if (detectCrisis(trimmedTranscript)) {
      const choice = await showCrisisModal();
      if (choice === 'call') {
        const voiceMsg: Message = {
          id: `v-${Date.now()}`,
          role: 'user',
          kind: 'voice',
          text: trimmedTranscript,
          voicePath: file,
          duration: fmt(dur),
        };
        setMessages((prev) => [...prev, voiceMsg]);
        return;
      }
    }

    const voiceMsg: Message = {
      id: `v-${Date.now()}`,
      role: 'user',
      kind: 'voice',
      text: trimmedTranscript,
      voicePath: file,
      duration: fmt(dur),
    };
    const next = [...messages, voiceMsg];
    setMessages(next);
    setIsTyping(true);
    const history: Message[] = [
      ...next,
      { id: `u-asr-${Date.now()}`, role: 'user', text: trimmedTranscript },
    ];
    callDoubao(history).then((reply) => {
      const aiId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: reply }]);
      setIsTyping(false);
      beginTypewriter(aiId);
    });
  };

  const beginActualRecording = () => {
    if (recordingStartedRef.current) return;
    pressFiredRef.current = true;
    stopAudio();
    recordingStartedRef.current = true;
    recordStartedAtRef.current = Date.now();
    setIsRecording(true);

    const asr = isAsrSupported() ? getAsrManager() : null;

    if (asr) {
      asr.onStart(() => setIsRecording(true));
      asr.onStop((res: AsrStopResult) => {
        recordingStartedRef.current = false;
        setIsRecording(false);
        setIsCancelling(false);
        const file = res?.tempFilePath;
        const dur = Math.max(1, Math.round((res?.duration || 0) / 1000));
        if (cancellingRef.current) {
          cancellingRef.current = false;
          return;
        }
        if (!file) {
          Taro.showToast({ title: '录音保存失败', icon: 'none' });
          return;
        }
        if (dur < 1) {
          Taro.showToast({ title: '说话太短啦', icon: 'none' });
          return;
        }
        handleVoiceCaptured(file, dur, res?.result || '');
      });
      asr.onError((err: any) => {
        recordingStartedRef.current = false;
        setIsRecording(false);
        setIsCancelling(false);
        console.warn('chat ASR error', err);
        Taro.showToast({ title: '录音出错', icon: 'none' });
      });
      asr.start({ duration: 60 * 1000, lang: 'zh_CN' });
      return;
    }

    // Fallback path: plain recorder, voice bubble without transcript
    const rec = getRecorder();
    rec.onStart(() => setIsRecording(true));
    rec.onStop((res: any) => {
      recordingStartedRef.current = false;
      setIsRecording(false);
      setIsCancelling(false);
      const dur = Math.max(1, Math.round((Date.now() - recordStartedAtRef.current) / 1000));
      const file = res?.tempFilePath;
      if (cancellingRef.current) {
        cancellingRef.current = false;
        return;
      }
      if (!file) {
        Taro.showToast({ title: '录音保存失败', icon: 'none' });
        return;
      }
      if (dur < 1) {
        Taro.showToast({ title: '说话太短啦', icon: 'none' });
        return;
      }
      handleVoiceCaptured(file, dur, '');
    });
    rec.onError((err: any) => {
      recordingStartedRef.current = false;
      setIsRecording(false);
      setIsCancelling(false);
      console.warn('chat recorder error', err);
      Taro.showToast({ title: '录音出错', icon: 'none' });
    });

    rec.start({
      duration: 60 * 1000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
    });
  };

  const handleMicTouchStart = (e: any) => {
    if (pressTimerRef.current || recordingStartedRef.current) return; // guard

    // Synchronous setup — auth check is deferred into the timer callback so
    // a short tap can clear the timer and surface the toast hint without ever
    // showing a permission modal.
    cancellingRef.current = false;
    setIsCancelling(false);
    pressFiredRef.current = false;
    isPressingRef.current = true;
    startYRef.current = e?.touches?.[0]?.clientY ?? null;

    pressTimerRef.current = setTimeout(async () => {
      pressTimerRef.current = null;
      const granted = await ensureRecordPermission();
      // User may have lifted the finger while the permission modal was up.
      // Without this guard a runaway recording would start with no way to stop
      // it short of the 60s ceiling.
      if (!isPressingRef.current) return;
      if (!granted) return;
      beginActualRecording();
    }, LONG_PRESS_MS);
  };

  const handleMicTouchMove = (e: any) => {
    if (!recordingStartedRef.current || startYRef.current === null) return;
    const y = e?.touches?.[0]?.clientY;
    if (typeof y !== 'number') return;
    const cancelling = startYRef.current - y > 80;
    if (cancelling !== cancellingRef.current) {
      cancellingRef.current = cancelling;
      setIsCancelling(cancelling);
    }
  };

  const handleMicTouchEnd = () => {
    startYRef.current = null;
    isPressingRef.current = false;
    // Released before long-press fired → it was just a tap
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
      Taro.showToast({ title: '长按麦克风开始录音', icon: 'none' });
      return;
    }
    if (!recordingStartedRef.current) return;
    try {
      const asr = isAsrSupported() ? getAsrManager() : null;
      if (asr) asr.stop();
      else getRecorder().stop();
    } catch (_) {
      recordingStartedRef.current = false;
      setIsRecording(false);
    }
  };

  // After our audio ends, allow OS to resume system music (Spotify/Music etc.)
  const releaseAudioFocus = () => {
    try {
      Taro.setInnerAudioOption({ mixWithOther: true, obeyMuteSwitch: false });
    } catch (_) {}
  };

  const stopAudio = () => {
    if (audioRef.current) {
      try { audioRef.current.stop(); } catch (_) {}
      audioRef.current.destroy();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
    releaseAudioFocus();
  };

  const toggleVoice = (msg: Message) => {
    if (!msg.voicePath) return;
    if (playingVoiceId === msg.id) {
      stopAudio();
      return;
    }
    stopAudio();
    // Take audio focus right before play so system music pauses
    try {
      Taro.setInnerAudioOption({ mixWithOther: false, obeyMuteSwitch: false });
    } catch (_) {}
    const ctx = Taro.createInnerAudioContext();
    audioRef.current = ctx;
    ctx.src = msg.voicePath;
    ctx.onPlay(() => setPlayingVoiceId(msg.id));
    ctx.onEnded(() => {
      setPlayingVoiceId(null);
      ctx.destroy();
      if (audioRef.current === ctx) audioRef.current = null;
      releaseAudioFocus();
    });
    ctx.onError((err) => {
      console.warn('audio error', err);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setPlayingVoiceId(null);
      ctx.destroy();
      if (audioRef.current === ctx) audioRef.current = null;
      releaseAudioFocus();
    });
    ctx.play();
  };

  useEffect(() => () => { stopAudio(); }, []);

  const goToErrorPage = (code: string, msg: string) => {
    Taro.redirectTo({
      url: `/pages/error/index?code=${encodeURIComponent(code)}&msg=${encodeURIComponent(msg)}`,
    });
  };

  const callDoubao = async (history: Message[]) => {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'doubao',
        data: {
          mode: 'chat',
          messages: history.map((m) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.role === 'ai'
              ? m.text
              : (detectHostility(m.text) ? sanitizeHostileForModel(m.text) : m.text),
          })),
        },
      });
      const result: any = res.result;
      if (result?.ok && result.reply) {
        failureCountRef.current = 0;
        return result.reply as string;
      }
      console.warn('doubao fn error', result);
      failureCountRef.current += 1;
      // Hard config errors → show the error page immediately so the user knows
      const errStr = String(result?.error || '');
      if (errStr.includes('env vars') || errStr.includes('401') || errStr.includes('403')) {
        goToErrorPage('AUTH', '密钥/接入点未配置');
        return FALLBACK_REPLY;
      }
      // 3 consecutive transient failures → also escalate
      if (failureCountRef.current >= 3) {
        goToErrorPage('503', '服务暂时不稳定');
      }
      return FALLBACK_REPLY;
    } catch (err) {
      console.error('doubao call failed', err);
      failureCountRef.current += 1;
      if (failureCountRef.current >= 3) {
        goToErrorPage('NET', '网络异常，请稍后再试');
      }
      return FALLBACK_REPLY;
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    if (trimmed.length > 500) return;
    // P0-10: hostility intent gate. Suggest 树洞 the FIRST time we see a
    // genuinely attacking message, but don't keep popping the modal — and
    // don't bail to a canned local reply on "continue", just let doubao
    // handle it with the sanitized prompt (still safer than raw passthrough).
    const isHostile = detectHostility(trimmed);
    if (isHostile && !hostilityModalDismissedRef.current) {
      const choice = await showHostilityModal();
      if (choice === 'treehouse') {
        // Hand off the current draft so 树洞 can pre-fill it.
        try { Taro.setStorageSync('treehouse-handoff', trimmed); } catch (_) {}
        try { Taro.removeStorageSync('chat-draft'); } catch (_) {}
        Taro.redirectTo({ url: '/pages/treehouse/index' }).catch(() => {
          Taro.reLaunch({ url: '/pages/treehouse/index' });
        });
        return;
      }
      // User picked "继续聊" — mark dismissed so we never re-prompt this
      // session, then fall through into the normal send path (which will
      // sanitize the hostile content before handing it to doubao).
      hostilityModalDismissedRef.current = true;
    }

    // Crisis safety net (PRD 5.2): prompt the hotline before sending to AI.
    // Run after hostility so outward attacks like "你去死" go to treehouse,
    // while self-harm language still gets the hotline flow.
    if (!isHostile && detectCrisis(trimmed)) {
      const choice = await showCrisisModal();
      if (choice === 'call') {
        return;
      }
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    // P0-9: draft was just sent, clear it
    try { Taro.removeStorageSync('chat-draft'); } catch (_) {}
    setIsTyping(true);

    const replyText = await callDoubao(nextHistory);
    const aiId = `a-${Date.now()}`;
    const aiMsg: Message = {
      id: aiId,
      role: 'ai',
      text: replyText,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    beginTypewriter(aiId);
  };

  const handleBridge = () => {
    if (bridgePulsing) return;
    if (userMsgCount < 1) {
      Taro.showToast({ title: '先说点什么吧', icon: 'none' });
      return;
    }
    setBridgePulsing(true);
    // Cache the conversation so loading/report pages can read it
    Taro.setStorageSync('pending-report-conversation', messages);
    setTimeout(async () => {
      setBridgePulsing(false);
      // Re-anchor the navigation stack so that BOTH the left-arrow back AND
      // the system back from the report page land on the review tab.
      // Stack target: [review, loading] → after loading redirectTo: [review, report]
      try {
        await Taro.reLaunch({ url: '/pages/review/index' });
        await Taro.navigateTo({ url: '/pages/loading/index' });
      } catch (_) {
        Taro.navigateTo({ url: '/pages/loading/index' });
      }
    }, 520);
  };

  const goBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: '/pages/listen/index' });
    });
  };

  // ── New conversation ───────────────────────────────────────────
  // Archive the current chat as a draft (so it shows in history → drafts),
  // then reset the page to the seed state. Called from the top-right "新对话"
  // button. Skips the modal when there's nothing to save.
  const handleNewConversation = async () => {
    if (userMsgCount === 0) {
      Taro.showToast({ title: '当前还没有对话', icon: 'none' });
      return;
    }
    const res = await Taro.showModal({
      title: '开始新对话',
      content: '当前对话会保存到草稿，可以在「历史」里继续聊',
      confirmText: '保存并新建',
      cancelText: '取消',
      confirmColor: '#7AB7FF',
    });
    if (!res.confirm) return;
    archiveDraft(messages, conversationIdRef.current);
    clearCurrent();
    conversationIdRef.current = undefined;
    setMessages(INITIAL_MESSAGES);
    setInput('');
    try { Taro.removeStorageSync('chat-draft'); } catch (_) {}
    stopAudio();
  };

  // Open history → drafts tab
  const goToDrafts = () => {
    Taro.navigateTo({ url: '/pages/history/index?tab=drafts' });
  };

  // ── Per-message actions ────────────────────────────────────────
  // WeChat-style long press: ActionSheet with 复制 / 删除. Voice messages
  // copy their transcript text. Deleting only removes the bubble locally;
  // we don't ripple to the AI history (the user can ask again if needed).
  const handleBubbleLongPress = (msg: Message) => {
    Taro.showActionSheet({
      itemList: ['复制', '删除'],
    })
      .then(async (res) => {
        if (res.tapIndex === 0) {
          const text = (msg.text || '').trim();
          if (!text) {
            Taro.showToast({ title: '没有可复制的文字', icon: 'none' });
            return;
          }
          try {
            await Taro.setClipboardData({ data: text });
          } catch (_) {}
        } else if (res.tapIndex === 1) {
          const confirm = await Taro.showModal({
            title: '删除消息',
            content: '这条消息将从当前对话中移除',
            confirmText: '删除',
            cancelText: '取消',
            confirmColor: '#FF6F8A',
          });
          if (!confirm.confirm) return;
          if (playingVoiceId === msg.id) stopAudio();
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }
      })
      .catch(() => {});
  };

  return (
    <View className="chat-root">
      <Image className="chat-bg" src={bgImage} mode="aspectFill" />
      <View className="chat-vignette-main" />
      <View className="chat-vignette-top" />
      <View className="chat-vignette-bottom" />

      {/* Nav row — three round glass buttons on the left, leaving the
          system capsule on the right untouched. */}
      <View className="chat-nav">
        <View className="chat-back" onClick={goBack} hoverClass="chat-back--hover">
          <Image className="chat-back-icon" src={iconBack} mode="aspectFit" />
        </View>
        <View
          className="chat-back chat-nav-icon-btn"
          onClick={goToDrafts}
          hoverClass="chat-back--hover"
        >
          <Image className="chat-nav-icon" src={iconClock} mode="aspectFit" />
        </View>
        <View
          className="chat-back chat-nav-icon-btn chat-nav-icon-btn-primary"
          onClick={handleNewConversation}
          hoverClass="chat-back--hover"
        >
          <Image className="chat-nav-icon" src={iconMessagePlus} mode="aspectFit" />
        </View>
      </View>

      {/* Progress bar */}
      <View className="chat-progress">
        <View className="cp-row">
          <View className="cp-label-wrap">
            <View className="cp-dot" />
            <Text className="cp-label">倾诉完整度</Text>
          </View>
          <Text className="cp-pct">{progressPct}%</Text>
        </View>
        <View className="cp-track">
          <View className="cp-fill" style={{ width: `${progressPct}%` }}>
            <View className="cp-tip" />
          </View>
        </View>
        <Text className="cp-hint">再多说一点，我能分析得更准</Text>
      </View>

      {/* Chat list */}
      <ScrollView
        className="chat-scroll"
        scrollY
        scrollIntoView={scrollAnchor}
        scrollWithAnimation
        enhanced
        showScrollbar={false}
      >
        <View className="chat-list">
          <View className="time-label-wrap">
            <Text className="time-label">今天 · 刚刚</Text>
          </View>

          {messages.map((msg) => {
            if (msg.role === 'ai') {
              const isStreaming = msg.id === typingMessageId;
              const display = isStreaming ? msg.text.slice(0, typingProgress) : msg.text;
              return (
                <View key={msg.id} id={msg.id} className="msg-row msg-row-ai">
                  <View className="avatar">
                    <Text className="avatar-emoji">🤍</Text>
                  </View>
                  <View
                    className="bubble bubble-ai"
                    onLongPress={() => handleBubbleLongPress(msg)}
                  >
                    <Text className="bubble-text bubble-text-ai">
                      {display}
                      {isStreaming && <Text className="typewriter-caret">▍</Text>}
                    </Text>
                  </View>
                </View>
              );
            }
            if (msg.kind === 'voice') {
              const playing = playingVoiceId === msg.id;
              return (
                <View key={msg.id} id={msg.id} className="msg-row msg-row-user msg-row-voice">
                  <View
                    className={`bubble bubble-voice ${playing ? 'is-playing' : ''}`}
                    onClick={() => toggleVoice(msg)}
                    onLongPress={() => handleBubbleLongPress(msg)}
                    hoverClass="bubble-voice--hover"
                  >
                    <View className="voice-play-icon">
                      <Text className="voice-play-glyph">{playing ? '❚❚' : '▶'}</Text>
                    </View>
                    <View className={`voice-wave ${playing ? 'is-playing' : ''}`}>
                      {[0.6, 0.9, 0.5, 1.0, 0.7, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
                        <View
                          key={i}
                          className={`voice-wave-bar voice-wave-bar-${i}`}
                          style={{ height: `${h * 30}rpx` }}
                        />
                      ))}
                    </View>
                    <Text className="voice-duration">{msg.duration || '0:00'}</Text>
                  </View>
                  <View className={`voice-asr-hint ${msg.asrPending ? 'is-pending' : ''}`}>
                    <Text className="voice-asr-hint-text">{msg.text}</Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={msg.id} id={msg.id} className="msg-row msg-row-user">
                <View
                  className="bubble bubble-user"
                  onLongPress={() => handleBubbleLongPress(msg)}
                >
                  <Text className="bubble-text bubble-text-user">{msg.text}</Text>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View className="msg-row msg-row-ai">
              <View className="avatar">
                <Text className="avatar-emoji">🤍</Text>
              </View>
              <View className="bubble bubble-ai typing-bubble">
                <View className="typing-dot typing-dot-0" />
                <View className="typing-dot typing-dot-1" />
                <View className="typing-dot typing-dot-2" />
              </View>
            </View>
          )}

          {/* Sentinels for scroll-into-view (alternated each update) */}
          <View id="chat-bottom-a" className="chat-bottom-sentinel" />
          <View id="chat-bottom-b" className="chat-bottom-sentinel" />
        </View>
      </ScrollView>

      {/* Bottom area */}
      <View className="chat-bottom">
        {/* Bridge button */}
        <View
          className={`bridge-btn ${bridgePulsing ? 'is-pulsing' : ''}`}
          onClick={handleBridge}
          hoverClass="bridge-btn--hover"
        >
          <Image className="bridge-icon" src={iconFileText} mode="aspectFit" />
          <Text className="bridge-label">结束倾诉，帮我生成复盘报告</Text>
        </View>

        {/* Input bar */}
        <View className="input-bar">
          <Textarea
            className="input-textarea"
            value={input}
            placeholder="输入你的感受...（最多500字）"
            placeholderClass="input-placeholder"
            maxlength={500}
            autoHeight
            showConfirmBar={false}
            adjustPosition
            fixed
            cursorSpacing={24}
            disableDefaultPadding
            onInput={(e) => {
              const v = e.detail.value;
              setInput(v);
              // P0-9: hard-bind draft to storage on every keystroke so the
              // user never loses input on app kill / page leave / crash.
              try { Taro.setStorageSync('chat-draft', v); } catch (_) {}
            }}
          />

          {input.trim().length > 0 ? (
            <View
              className="send-btn"
              onClick={sendMessage}
              hoverClass="send-btn--hover"
            >
              <Image className="send-icon" src={iconSend} mode="aspectFit" />
            </View>
          ) : (
            <View
              className={`mic-sm-btn ${isRecording ? 'is-recording' : ''}`}
              onTouchStart={handleMicTouchStart}
              onTouchMove={handleMicTouchMove}
              onTouchEnd={handleMicTouchEnd}
              onTouchCancel={handleMicTouchEnd}
            >
              <Image className="mic-sm-icon" src={iconMicSmall} mode="aspectFit" />
            </View>
          )}
        </View>

      </View>

      {/* Recording overlay */}
      {isRecording && (
        <View className="rec-overlay" catchMove>
          <View className="rec-card">
            {isCancelling ? (
              <>
                <View className="rec-cancel-circle">
                  <Text className="rec-cancel-emoji">🗑️</Text>
                </View>
                <Text className="rec-cancel-text">松开手指，取消发送</Text>
              </>
            ) : (
              <>
                <View className="rec-mic-stack">
                  <View className="rec-ring rec-ring-1" />
                  <View className="rec-ring rec-ring-2" />
                  <View className="rec-ring rec-ring-3" />
                  <View className="rec-mic-core">
                    <Image className="rec-mic-icon" src={iconMicSmall} mode="aspectFit" />
                  </View>
                </View>
                <Text className="rec-tip">松开发送 · 上滑取消</Text>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
