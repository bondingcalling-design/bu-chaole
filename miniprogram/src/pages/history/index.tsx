import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useDidShow } from '@tarojs/taro';
import { useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';

import './index.less';

interface ReportRecord {
  id: string;
  createdAt: number;
  report: {
    title: string;
    summary: string;
    emotions: string[];
  };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `今天 · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<ReportRecord[]>([]);

  const load = () => {
    try {
      const history = Taro.getStorageSync('report-history');
      if (Array.isArray(history)) setRecords(history);
      else setRecords([]);
    } catch (_) {
      setRecords([]);
    }
  };

  useLoad(load);
  useDidShow(load);

  const goBack = () => {
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/review/index' }));
  };

  const openReport = (rec: ReportRecord) => {
    Taro.setStorageSync('latest-report', rec);
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  return (
    <View className="history-root">
      <Image className="history-bg" src={bgImage} mode="aspectFill" />
      <View className="history-frost" />

      <View className="history-header">
        <View className="history-back" onClick={goBack} hoverClass="history-back--hover">
          <Image className="history-back-icon" src={iconBack} mode="aspectFit" />
        </View>
        <Text className="history-title">历史复盘</Text>
        <View className="history-spacer" />
      </View>

      {records.length === 0 ? (
        <View className="history-empty">
          <Text className="history-empty-emoji">🕊️</Text>
          <Text className="history-empty-text">还没有复盘记录</Text>
          <Text className="history-empty-hint">先去和小听聊聊，聊完会在这里留下回顾</Text>
        </View>
      ) : (
        <ScrollView className="history-scroll" scrollY showScrollbar={false}>
          <View className="history-list">
            {records.map((rec) => (
              <View
                key={rec.id}
                className="history-item"
                hoverClass="history-item--hover"
                onClick={() => openReport(rec)}
              >
                <Text className="item-date">{formatDate(rec.createdAt)}</Text>
                <Text className="item-title">{rec.report?.title || '心绪回顾'}</Text>
                <Text className="item-summary">{rec.report?.summary || ''}</Text>
                {rec.report?.emotions?.length > 0 && (
                  <View className="item-chips">
                    {rec.report.emotions.slice(0, 3).map((e, i) => (
                      <View key={i} className="item-chip">
                        <Text className="item-chip-text">{e}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            <View className="history-foot-space" />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
