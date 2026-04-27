import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconMic from '@/assets/icons/mic.svg';
import iconMicOff from '@/assets/icons/mic-off.svg';
import iconMessageCircle from '@/assets/icons/message-circle.svg';
import FloatingTabBar from '@/components/floating-tab-bar';
import { getAsrManager, isAsrSupported, AsrStopResult } from '@/utils/asr';

import './index.less';

const MAX_RECORDING_SECONDS = 60;
const LONG_PRESS_MS = 300;

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function ListenPage() {
  const [isListening, setIsListening] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTimeRef = useRef(0);
  const recorderRef = useRef<ReturnType<typeof Taro.getRecorderManager> | null>(null);
  const startedAtRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const cancellingRef = useRef(false);
  const recordingStartedRef = useRef(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getRecorder = () => {
    if (!recorderRef.current) recorderRef.current = Taro.getRecorderManager();
    return recorderRef.current;
  };

  useDidShow(() => {
    setIsListening(false);
    setIsCancelling(false);
    setRecordingTime(0);
    latestTimeRef.current = 0;
    recordingStartedRef.current = false;
  });

  useDidHide(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (recordingStartedRef.current && recorderRef.current) {
      try { recorderRef.current.stop(); } catch (_) {}
    }
  });

  useEffect(() => {
    if (isListening) {
      startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        latestTimeRef.current = elapsed;
        setRecordingTime(Math.min(elapsed, MAX_RECORDING_SECONDS));
        if (elapsed >= MAX_RECORDING_SECONDS && recordingStartedRef.current) {
          getRecorder().stop();
        }
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isListening]);

  const goToChatWithVoice = (tempFilePath: string, durationSec: number, transcript: string) => {
    Taro.setStorageSync('pending-voice', {
      tempFilePath,
      duration: formatDuration(durationSec),
      durationSec,
      transcript,
      ts: Date.now(),
    });
    Taro.navigateTo({ url: '/pages/chat/index?voiceMessage=1' });
  };

  const beginActualRecording = () => {
    recordingStartedRef.current = true;
    setIsListening(true);

    // Try the WeChat 同声传译插件 first (records + transcribes in one shot).
    // Fall back to plain RecorderManager if the plugin isn't installed.
    const asr = isAsrSupported() ? getAsrManager() : null;

    if (asr) {
      asr.onStart(() => setIsListening(true));
      asr.onStop((res: AsrStopResult) => {
        recordingStartedRef.current = false;
        setIsListening(false);
        setIsCancelling(false);
        const file = res?.tempFilePath;
        const dur = Math.max(1, Math.round((res?.duration || 0) / 1000));
        const transcript = res?.result || '';
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
        setTimeout(() => goToChatWithVoice(file, dur, transcript), 200);
      });
      asr.onError((err: any) => {
        recordingStartedRef.current = false;
        setIsListening(false);
        setIsCancelling(false);
        console.warn('ASR error', err);
        Taro.showToast({ title: '录音出错', icon: 'none' });
      });
      asr.start({ duration: MAX_RECORDING_SECONDS * 1000, lang: 'zh_CN' });
      return;
    }

    // Fallback path: plain recorder, no transcript
    const rec = getRecorder();
    rec.onStart(() => setIsListening(true));
    rec.onStop((res: any) => {
      recordingStartedRef.current = false;
      setIsListening(false);
      setIsCancelling(false);
      const dur = latestTimeRef.current || Math.round((res?.duration || 0) / 1000);
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
      setTimeout(() => goToChatWithVoice(file, dur, ''), 200);
    });
    rec.onError((err: any) => {
      recordingStartedRef.current = false;
      setIsListening(false);
      setIsCancelling(false);
      console.warn('recorder error', err);
      Taro.showToast({ title: '录音出错', icon: 'none' });
    });
    rec.start({
      duration: MAX_RECORDING_SECONDS * 1000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
    });
  };

  const handleMicTouchStart = async (e: any) => {
    if (pressTimerRef.current || recordingStartedRef.current) return;

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
      setIsListening(false);
    }
  };

  const goToTextChat = () => {
    Taro.navigateTo({ url: '/pages/chat/index' });
  };

  return (
    <View className="listen-root">
      <Image className="listen-bg" src={bgImage} mode="aspectFill" />
      <View className="listen-vignette-main" />
      <View className="listen-vignette-top" />
      <View className="listen-vignette-bottom" />
      <View className="listen-glow-left" />
      <View className="listen-glow-right" />

      <View className="listen-header">
        <Text className="listen-title">倾 听</Text>
      </View>

      <View className={`listen-body ${isListening ? 'is-recording' : ''}`}>
        <View className="insp-card">
          <Text className="insp-emoji">✨</Text>
          <Text className="insp-text">今日爱情灵感：记得对微小的付出说声谢谢</Text>
        </View>

        <View className="listen-center">
          <View className="mic-field">
            <View className={`ring ring-1 ${isListening ? 'is-active' : ''}`} />
            <View className={`ring ring-2 ${isListening ? 'is-active' : ''}`} />
            <View className={`ring ring-3 ${isListening ? 'is-active' : ''}`} />

            <View className={`halo ${isListening ? 'is-active' : ''}`} />
            <View className={`inner-glow ${isListening ? 'is-active' : ''}`} />

            <View
              className={`mic-btn ${isListening ? 'is-active' : ''} ${isCancelling ? 'is-cancelling' : ''}`}
              onTouchStart={handleMicTouchStart}
              onTouchMove={handleMicTouchMove}
              onTouchEnd={handleMicTouchEnd}
              onTouchCancel={handleMicTouchEnd}
            >
              {isListening ? (
                <View className="mic-btn-inner">
                  <View className="waveform">
                    {[0.5, 0.8, 1.0, 0.7, 0.9, 0.6, 1.0, 0.8, 0.5].map((h, i) => (
                      <View
                        key={i}
                        className={`wave-bar wave-bar-${i}`}
                        style={{ height: `${h * 56}rpx` }}
                      />
                    ))}
                  </View>
                  <Image className="mic-off-icon" src={iconMicOff} mode="aspectFit" />
                </View>
              ) : (
                <Image className="mic-icon" src={iconMic} mode="aspectFit" />
              )}
            </View>
          </View>

          <View className="mic-caption">
            {isListening ? (
              isCancelling ? (
                <View className="caption-recording">
                  <Text className="rec-text" style={{ color: 'rgba(255,140,140,0.95)' }}>
                    松开手指，取消发送
                  </Text>
                </View>
              ) : (
                <View className="caption-recording">
                  <View className="rec-dot" />
                  <Text className="rec-text">
                    正在录音 {formatDuration(recordingTime)}
                  </Text>
                </View>
              )
            ) : (
              <Text className="idle-text">长按开始录音</Text>
            )}
            <Text className="hint-text">
              {isListening
                ? (isCancelling ? '上滑取消 · 松开放弃' : '上滑取消 · 松开发送')
                : '按住麦克风 · 上滑取消'}
            </Text>

            <View className="text-chat-pill" onClick={goToTextChat} hoverClass="text-chat-pill--hover">
              <Image className="msg-icon" src={iconMessageCircle} mode="aspectFit" />
              <Text className="msg-label">文字倾诉</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recording mask: blocks tabs + insp card etc when actively recording.
       * Sits BEHIND the mic-field (raised via z-index when recording) so the
       * mic stays visible and finger touchmove/touchend continue to fire. */}
      {isListening && <View className="listen-rec-mask" />}

      <FloatingTabBar active="listen" />
    </View>
  );
}
