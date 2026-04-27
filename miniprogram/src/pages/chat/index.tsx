import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useRouter } from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import iconSend from '@/assets/icons/send.svg';
import iconMicSmall from '@/assets/icons/mic-small.svg';
import iconFileText from '@/assets/icons/file-text.svg';
import { getAsrManager, isAsrSupported, AsrStopResult } from '@/utils/asr';
import { detectCrisis, showCrisisModal } from '@/utils/crisisDetect';

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
}

const INITIAL_MESSAGES: Message[] = [
  { id: 'seed-1', role: 'ai', text: '嗨，我在这里，随时倾听你。今天发生了什么？' },
];

const FALLBACK_REPLY = '我听着呢，你继续说。';

export default function ChatPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bridgePulsing, setBridgePulsing] = useState(false);
  const [scrollAnchor, setScrollAnchor] = useState('');

  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const progressPct = Math.min(92, 30 + userMsgCount * 15);

  useLoad(() => {
    if (router.params.voiceMessage === '1') {
      try {
        const v = Taro.getStorageSync('pending-voice') as
          | { tempFilePath: string; duration: string; durationSec: number; transcript?: string; ts: number }
          | '';
        Taro.removeStorageSync('pending-voice');
        if (v && typeof v === 'object' && v.tempFilePath) {
          const transcript = (v.transcript || '').trim();
          const voiceMsg: Message = {
            id: `v-${v.ts}`,
            role: 'user',
            kind: 'voice',
            text: transcript || '（未识别到内容；可继续打字补充）',
            voicePath: v.tempFilePath,
            duration: v.duration,
          };
          setMessages((prev) => [...prev, voiceMsg]);
          // If we got a transcript, kick off the AI response automatically
          if (transcript) {
            setTimeout(() => triggerAiReplyForTranscript(transcript), 200);
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
    setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'ai', text: reply }]);
    setIsTyping(false);
  };

  // Auto-scroll: toggle between two sentinel IDs so ScrollView always sees a
  // changed value and re-fires scrollIntoView. The 80ms delay gives the new
  // bubble time to mount in Skyline before the scroll happens.
  useEffect(() => {
    const t = setTimeout(() => {
      setScrollAnchor((prev) =>
        prev === 'chat-bottom-a' ? 'chat-bottom-b' : 'chat-bottom-a'
      );
    }, 80);
    return () => clearTimeout(t);
  }, [messages.length, isTyping]);

  const failureCountRef = useRef(0);
  const audioRef = useRef<ReturnType<typeof Taro.createInnerAudioContext> | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // ── Long-press recording in chat ────────────────────────────────
  const recorderRef = useRef<ReturnType<typeof Taro.getRecorderManager> | null>(null);
  const recordStartedAtRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const cancellingRef = useRef(false);
  const recordingStartedRef = useRef(false); // synchronous state for touch handlers
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null); // long-press confirmation timer
  const pressFiredRef = useRef(false); // did the long-press timer actually fire?
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

    // Crisis safety net for voice transcripts too
    if (trimmedTranscript && detectCrisis(trimmedTranscript)) {
      const choice = await showCrisisModal();
      if (choice === 'call') {
        // Show the bubble but skip auto-AI-reply
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

    const text = trimmedTranscript || '（未识别到内容；可继续打字补充）';
    const voiceMsg: Message = {
      id: `v-${Date.now()}`,
      role: 'user',
      kind: 'voice',
      text,
      voicePath: file,
      duration: fmt(dur),
    };
    const next = [...messages, voiceMsg];
    setMessages(next);
    if (trimmedTranscript) {
      setIsTyping(true);
      const history: Message[] = [
        ...next,
        { id: `u-asr-${Date.now()}`, role: 'user', text: trimmedTranscript },
      ];
      callDoubao(history).then((reply) => {
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'ai', text: reply }]);
        setIsTyping(false);
      });
    }
  };

  const beginActualRecording = () => {
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

  const handleMicTouchStart = async (e: any) => {
    if (pressTimerRef.current || recordingStartedRef.current) return; // guard

    // Permission check up-front so the timer doesn't fire after the modal
    try {
      const setting = await Taro.getSetting();
      if (setting.authSetting['scope.record'] === false) {
        const ok = await Taro.showModal({
          title: '需要麦克风权限',
          content: '请在「设置」里允许小程序使用麦克风',
          confirmText: '去开启',
        });
        if (ok.confirm) Taro.openSetting();
        return;
      }
    } catch (_) {}

    cancellingRef.current = false;
    setIsCancelling(false);
    pressFiredRef.current = false;
    startYRef.current = e?.touches?.[0]?.clientY ?? null;

    pressTimerRef.current = setTimeout(() => {
      pressTimerRef.current = null;
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
            content: m.text,
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

    // Crisis safety net (PRD §5.2): prompt the hotline before sending to AI
    if (detectCrisis(trimmed)) {
      const choice = await showCrisisModal();
      if (choice === 'call') {
        // User went to call — don't send the message to AI, but keep in input
        return;
      }
      // 'continue' falls through to normal send
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsTyping(true);

    const replyText = await callDoubao(nextHistory);
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'ai',
      text: replyText,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
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

  return (
    <View className="chat-root">
      <Image className="chat-bg" src={bgImage} mode="aspectFill" />
      <View className="chat-vignette-main" />
      <View className="chat-vignette-top" />
      <View className="chat-vignette-bottom" />

      {/* Nav row */}
      <View className="chat-nav">
        <View className="chat-back" onClick={goBack} hoverClass="chat-back--hover">
          <Image className="chat-back-icon" src={iconBack} mode="aspectFit" />
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
              return (
                <View key={msg.id} id={msg.id} className="msg-row msg-row-ai">
                  <View className="avatar">
                    <Text className="avatar-emoji">🤍</Text>
                  </View>
                  <View className="bubble bubble-ai">
                    <Text className="bubble-text bubble-text-ai">{msg.text}</Text>
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
                  <View className="voice-asr-hint">
                    <Text className="voice-asr-hint-text">{msg.text}</Text>
                  </View>
                </View>
              );
            }
            return (
              <View key={msg.id} id={msg.id} className="msg-row msg-row-user">
                <View className="bubble bubble-user">
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
            onInput={(e) => setInput(e.detail.value)}
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

        {input.trim().length === 0 && !isRecording && (
          <Text className="voice-hint">长按麦克风录音 · 上滑取消发送</Text>
        )}
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
