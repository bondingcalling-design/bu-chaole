import { View, Text, Image } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useEffect, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';

import './index.less';

const PROCESSING_STEPS = [
  '提取核心矛盾点...',
  '识别深层动机...',
  '分析情绪波动模式...',
  '构建心理动力图谱...',
  '生成个性化建议...',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface Report {
  title: string;
  summary: string;
  emotions: string[];
  insights: string[];
  suggestions: string[];
}

const MIN_DISPLAY_MS = 3200;

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  // Cycle steps
  useEffect(() => {
    const i = setInterval(() => {
      setCurrentStep((s) => (s + 1) % PROCESSING_STEPS.length);
    }, 1600);
    return () => clearInterval(i);
  }, []);

  useLoad(() => {
    generateReport();
  });

  const generateReport = async () => {
    const startedAt = Date.now();
    let conversation: ChatMessage[] = [];
    try {
      conversation = Taro.getStorageSync('pending-report-conversation') || [];
    } catch (_) {}

    if (!Array.isArray(conversation) || conversation.length === 0) {
      // No conversation — bail back to chat
      Taro.showToast({ title: '没有找到对话内容', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 800);
      return;
    }

    let report: Report | null = null;
    let rawText = '';

    try {
      const res = await Taro.cloud.callFunction({
        name: 'doubao',
        data: {
          mode: 'report',
          messages: conversation.map((m) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        },
      });
      const result: any = res.result;
      console.log('[loading] doubao report result', {
        ok: result?.ok,
        hasReport: !!result?.report,
        reportKeys: result?.report ? Object.keys(result.report) : null,
        finishReason: result?.finishReason,
        parseError: result?.parseError,
        rawLen: result?.raw?.length,
        rawHead: result?.raw?.slice?.(0, 120),
        usage: result?.usage,
      });
      if (result?.ok) {
        report = result.report || null;
        rawText = result.raw || '';
      } else {
        console.warn('report fn error', result);
      }
    } catch (err) {
      console.error('report call failed', err);
    }

    if (!report) {
      // Fallback minimal report so the MVP chain still closes
      report = {
        title: '今日心绪',
        summary: '我们刚聊了一会儿，先用这份简单回顾作为底稿吧。',
        emotions: ['复杂'],
        insights: ['你愿意开口，就是第一步。'],
        suggestions: ['明天再跟我聊聊，让我更了解你。'],
      };
    }

    // Save report + append to history
    const now = Date.now();
    const record = {
      id: `r-${now}`,
      createdAt: now,
      report,
      rawText,
      conversation,
    };
    Taro.setStorageSync('latest-report', record);

    try {
      const history = Taro.getStorageSync('report-history') || [];
      const nextHistory = [record, ...(Array.isArray(history) ? history : [])].slice(0, 100);
      Taro.setStorageSync('report-history', nextHistory);
    } catch (_) {}

    // Clear the pending conversation so re-clicking "结束倾诉" from a stale
    // chat won't blindly re-run with the same messages.
    try {
      Taro.removeStorageSync('pending-report-conversation');
    } catch (_) {}

    // Hold for minimum display time so the animation doesn't flash
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(() => {
      Taro.redirectTo({ url: '/pages/report/index' });
    }, wait);
  };

  return (
    <View className="loading-root">
      <Image className="loading-bg" src={bgImage} mode="aspectFill" />
      <View className="loading-frost" />
      <View className="loading-radial" />

      <View className="loading-content">
        {/* Breathing halo */}
        <View className="halo-wrap">
          <View className="halo-outer" />
          <View className="halo-mid" />
          <View className="halo-core">
            <View className="halo-dot" />
          </View>
        </View>

        {/* Main title */}
        <Text className="loading-title">正在用心理学模型分析你们的对话…</Text>

        {/* Processing step (cross-fade by key) */}
        <View className="loading-step-wrap">
          <Text key={currentStep} className="loading-step">
            {PROCESSING_STEPS[currentStep]}
          </Text>
        </View>

        {/* Progress dots */}
        <View className="loading-dots">
          {PROCESSING_STEPS.map((_, i) => (
            <View
              key={i}
              className={`loading-dot ${i === currentStep ? 'is-active' : ''}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
