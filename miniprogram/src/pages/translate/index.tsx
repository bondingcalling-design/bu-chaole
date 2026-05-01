import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import iconSend from '@/assets/icons/send.svg';

import './index.less';

type Tone = 'tender' | 'rational' | 'direct';

const TONES: { key: Tone; label: string; emoji: string; hint: string }[] = [
  { key: 'tender',   label: '温柔', emoji: '🤍', hint: '先共情，再说需求' },
  { key: 'rational', label: '客观', emoji: '🧊', hint: '陈述事实+诉求，不评判' },
  { key: 'direct',   label: '直白', emoji: '🎯', hint: '坚定但不攻击' },
];

const FALLBACK_LINE = '（翻译失败，再试一次）';

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [activeTone, setActiveTone] = useState<Tone>('tender');
  const [translations, setTranslations] = useState<Record<Tone, string>>({
    tender: '',
    rational: '',
    direct: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // Cloud functions don't support SSE response, so we fake the stream by
  // typewriter-revealing the active tone's text after the call resolves.
  const [streamProgress, setStreamProgress] = useState(0);
  const streamTargetRef = useRef('');
  const failureCountRef = useRef(0);

  // Drive the typewriter for whichever tone is currently active.
  useEffect(() => {
    const target = translations[activeTone] || '';
    streamTargetRef.current = target;
    if (!target) {
      setStreamProgress(0);
      return;
    }
    if (streamProgress >= target.length) return;
    const t = setTimeout(() => setStreamProgress((p) => p + 1), 20);
    return () => clearTimeout(t);
  }, [streamProgress, translations, activeTone]);

  // Switching tone resets the typewriter to the start of that tone's text.
  const switchTone = (t: Tone) => {
    if (t === activeTone) return;
    setActiveTone(t);
    setStreamProgress(0);
  };

  const goBack = () => {
    Taro.navigateBack().catch(() => {
      Taro.switchTab({ url: '/pages/listen/index' });
    });
  };

  const callTranslate = async (text: string) => {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'doubao',
        data: {
          mode: 'translate',
          messages: [{ role: 'user', content: text }],
        },
      });
      const r: any = res.result;
      if (r?.ok && r.translations) {
        failureCountRef.current = 0;
        return r.translations as Record<Tone, string>;
      }
      console.warn('translate fn error', r);
      failureCountRef.current += 1;
      return null;
    } catch (e) {
      console.error('translate call failed', e);
      failureCountRef.current += 1;
      return null;
    }
  };

  const doTranslate = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    if (trimmed.length > 500) {
      Taro.showToast({ title: '最多 500 字', icon: 'none' });
      return;
    }
    setIsLoading(true);
    setTranslations({ tender: '', rational: '', direct: '' });
    setStreamProgress(0);

    const result = await callTranslate(trimmed);
    setIsLoading(false);
    if (!result) {
      Taro.showToast({ title: '翻译失败，请重试', icon: 'none' });
      setTranslations({
        tender: FALLBACK_LINE,
        rational: FALLBACK_LINE,
        direct: FALLBACK_LINE,
      });
      return;
    }
    setTranslations({
      tender:   typeof result.tender   === 'string' ? result.tender   : FALLBACK_LINE,
      rational: typeof result.rational === 'string' ? result.rational : FALLBACK_LINE,
      direct:   typeof result.direct   === 'string' ? result.direct   : FALLBACK_LINE,
    });
    setStreamProgress(0);
  };

  const copyActive = () => {
    const text = translations[activeTone] || '';
    if (!text || text === FALLBACK_LINE) return;
    Taro.setClipboardData({ data: text });
  };

  const display = (() => {
    const target = translations[activeTone] || '';
    if (!target) return '';
    return target.slice(0, streamProgress);
  })();
  const isStreaming = !!translations[activeTone] && streamProgress < (translations[activeTone] || '').length;
  const hasResult = !!translations[activeTone];

  return (
    <View className="tr-root">
      <Image className="tr-bg" src={bgImage} mode="aspectFill" />
      <View className="tr-vignette-main" />
      <View className="tr-vignette-top" />
      <View className="tr-vignette-bottom" />

      <View className="tr-nav">
        <View className="tr-back" onClick={goBack} hoverClass="tr-back--hover">
          <Image className="tr-back-icon" src={iconBack} mode="aspectFit" />
        </View>
        <View className="tr-nav-title-wrap">
          <Text className="tr-nav-title">高情商翻译</Text>
          <Text className="tr-nav-sub">把气话改写成 Ta 听得进去的话</Text>
        </View>
        <View className="tr-nav-spacer" />
      </View>

      <ScrollView className="tr-scroll" scrollY showScrollbar={false}>
        <View className="tr-body">
          {/* Input card */}
          <View className="tr-card tr-input-card">
            <Text className="tr-card-title">你想说的（原话 / 气话）</Text>
            <Textarea
              className="tr-input"
              value={input}
              placeholder="比如：你怎么又忘记我说过的事，根本没把我放心上"
              placeholderClass="tr-input-placeholder"
              maxlength={500}
              autoHeight
              showConfirmBar={false}
              adjustPosition
              cursorSpacing={24}
              disableDefaultPadding
              onInput={(e) => setInput(e.detail.value)}
            />
            <View className="tr-input-footer">
              <Text className="tr-counter">{input.length} / 500</Text>
              <View
                className={`tr-go ${isLoading || !input.trim() ? 'is-disabled' : ''}`}
                onClick={doTranslate}
                hoverClass="tr-go--hover"
              >
                <Image className="tr-go-icon" src={iconSend} mode="aspectFit" />
                <Text className="tr-go-text">{isLoading ? '翻译中…' : '翻译'}</Text>
              </View>
            </View>
          </View>

          {/* Tone selector */}
          <View className="tr-tones">
            {TONES.map((t) => (
              <View
                key={t.key}
                className={`tr-tone ${activeTone === t.key ? 'is-active' : ''}`}
                onClick={() => switchTone(t.key)}
                hoverClass="tr-tone--hover"
              >
                <Text className="tr-tone-emoji">{t.emoji}</Text>
                <Text className="tr-tone-label">{t.label}</Text>
                <Text className="tr-tone-hint">{t.hint}</Text>
              </View>
            ))}
          </View>

          {/* Output card */}
          <View className="tr-card tr-output-card">
            <View className="tr-output-head">
              <Text className="tr-output-title">
                {TONES.find((t) => t.key === activeTone)?.emoji}{' '}
                {TONES.find((t) => t.key === activeTone)?.label}版
              </Text>
              {hasResult && !isStreaming && translations[activeTone] !== FALLBACK_LINE && (
                <View className="tr-copy" onClick={copyActive} hoverClass="tr-copy--hover">
                  <Text className="tr-copy-text">复制</Text>
                </View>
              )}
            </View>

            {!hasResult && !isLoading && (
              <Text className="tr-empty">输入想说的话，选个语气，让我帮你重写</Text>
            )}

            {isLoading && (
              <View className="tr-loading">
                <View className="tr-loading-dot tr-loading-dot-0" />
                <View className="tr-loading-dot tr-loading-dot-1" />
                <View className="tr-loading-dot tr-loading-dot-2" />
              </View>
            )}

            {hasResult && (
              <Text className="tr-output-text">
                {display}
                {isStreaming && <Text className="tr-caret">▍</Text>}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
