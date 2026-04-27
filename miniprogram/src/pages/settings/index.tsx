import { View, Text, Image, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';

import './index.less';

interface Flags {
  hapticFeedback: boolean;
  reduceMotion: boolean;
  saveConversation: boolean;
}

const FLAGS_KEY = 'listen-settings-flags';
const DEFAULT_FLAGS: Flags = {
  hapticFeedback: true,
  reduceMotion: false,
  saveConversation: true,
};

export default function SettingsPage() {
  const [flags, setFlags] = useState<Flags>(DEFAULT_FLAGS);

  useEffect(() => {
    try {
      const saved = Taro.getStorageSync(FLAGS_KEY);
      if (saved && typeof saved === 'object') {
        setFlags({ ...DEFAULT_FLAGS, ...saved });
      }
    } catch (_) {}
  }, []);

  const toggle = (key: keyof Flags) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      Taro.setStorageSync(FLAGS_KEY, next);
      return next;
    });
  };

  const goBack = () => Taro.navigateBack();

  const clearHistory = () => {
    Taro.showModal({
      title: '清空所有历史复盘？',
      content: '该操作不可恢复。',
      confirmText: '清空',
      confirmColor: '#e66',
      success: (r) => {
        if (r.confirm) {
          Taro.removeStorageSync('report-history');
          Taro.removeStorageSync('latest-report');
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className="settings-root">
      <Image className="settings-bg" src={bgImage} mode="aspectFill" />
      <View className="settings-frost" />

      <View className="settings-header">
        <View className="settings-back" onClick={goBack} hoverClass="settings-back--hover">
          <Image className="settings-back-icon" src={iconBack} mode="aspectFit" />
        </View>
        <Text className="settings-title">设 置</Text>
        <View className="settings-spacer" />
      </View>

      <View className="settings-body">
        <View className="settings-card">
          <View className="settings-row has-divider">
            <View className="settings-row-left">
              <Text className="settings-row-label">触感反馈</Text>
              <Text className="settings-row-hint">操作时的轻微震动</Text>
            </View>
            <Switch
              checked={flags.hapticFeedback}
              color="#7ab8ff"
              onChange={() => toggle('hapticFeedback')}
            />
          </View>
          <View className="settings-row has-divider">
            <View className="settings-row-left">
              <Text className="settings-row-label">减少动效</Text>
              <Text className="settings-row-hint">降低动画强度，省电</Text>
            </View>
            <Switch
              checked={flags.reduceMotion}
              color="#7ab8ff"
              onChange={() => toggle('reduceMotion')}
            />
          </View>
          <View className="settings-row">
            <View className="settings-row-left">
              <Text className="settings-row-label">保存对话记录</Text>
              <Text className="settings-row-hint">关闭后不再本地保存倾诉内容</Text>
            </View>
            <Switch
              checked={flags.saveConversation}
              color="#7ab8ff"
              onChange={() => toggle('saveConversation')}
            />
          </View>
        </View>

        <View className="settings-card danger-card" hoverClass="settings-card--hover" onClick={clearHistory}>
          <Text className="danger-label">清空历史复盘</Text>
        </View>

        <Text className="settings-foot">倾听 · v0.1 MVP</Text>
      </View>
    </View>
  );
}
