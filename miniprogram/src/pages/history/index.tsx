import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useLoad, useDidShow, useRouter } from '@tarojs/taro';
import { useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import {
  ChatDraft,
  deleteDraft,
  loadDrafts,
  setResume,
} from '@/utils/chatDrafts';

import './index.less';

interface ReportRecord {
  id: string;
  createdAt: number;
  report: {
    title: string;
    summary: string;
    emotions: string[];
  };
  // Older records (pre-fork-feature) may not have this — guard at use site.
  conversation?: import('@/utils/chatDrafts').DraftMessage[];
}

type Tab = 'reports' | 'drafts';

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

function draftSnippet(draft: ChatDraft): string {
  // Prefer the latest user message so the user can recognise where they
  // left off — the title (first user message) is shown as the header.
  for (let i = draft.messages.length - 1; i >= 0; i--) {
    const m = draft.messages[i];
    if (m.role === 'user' && m.text) return m.text;
  }
  return '';
}

export default function HistoryPage() {
  const router = useRouter();
  const initialTab: Tab = router.params.tab === 'drafts' ? 'drafts' : 'reports';

  const [tab, setTab] = useState<Tab>(initialTab);
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [drafts, setDrafts] = useState<ChatDraft[]>([]);

  const load = () => {
    try {
      const history = Taro.getStorageSync('report-history');
      if (Array.isArray(history)) setRecords(history);
      else setRecords([]);
    } catch (_) {
      setRecords([]);
    }
    setDrafts(loadDrafts());
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

  // Long-press menu on a finished report. Two actions: fork the original
  // conversation into a fresh chat, or remove the report from history.
  const handleReportLongPress = (rec: ReportRecord) => {
    const canFork = Array.isArray(rec.conversation) && rec.conversation.length > 0;
    const items = canFork ? ['继续这段对话', '删除'] : ['删除'];
    Taro.showActionSheet({ itemList: items })
      .then(async (res) => {
        if (canFork && res.tapIndex === 0) {
          setResume({ id: `c-fork-${Date.now()}`, messages: rec.conversation! });
          Taro.navigateTo({ url: '/pages/chat/index' }).catch(() => {
            Taro.reLaunch({ url: '/pages/chat/index' });
          });
          return;
        }
        // Last index is always "删除"
        const isDelete = res.tapIndex === items.length - 1;
        if (!isDelete) return;
        const confirm = await Taro.showModal({
          title: '删除复盘',
          content: '删除后无法恢复',
          confirmText: '删除',
          cancelText: '取消',
          confirmColor: '#FF6F8A',
        });
        if (!confirm.confirm) return;
        const next = records.filter((r) => r.id !== rec.id);
        setRecords(next);
        try { Taro.setStorageSync('report-history', next); } catch (_) {}
      })
      .catch(() => {});
  };

  // Resume a draft into the chat page. The chat page consumes the handoff
  // on useDidShow / mount and archives whatever conversation it had.
  const openDraft = (draft: ChatDraft) => {
    setResume({ id: draft.id, messages: draft.messages });
    // The picked draft becomes the live chat — drop it from the drafts list
    // so we don't show it as both "current" and "saved".
    deleteDraft(draft.id);
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    Taro.navigateTo({ url: '/pages/chat/index' }).catch(() => {
      Taro.reLaunch({ url: '/pages/chat/index' });
    });
  };

  const removeDraft = async (draft: ChatDraft) => {
    const res = await Taro.showModal({
      title: '删除草稿',
      content: '删除后无法恢复',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#FF6F8A',
    });
    if (!res.confirm) return;
    deleteDraft(draft.id);
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
  };

  return (
    <View className="history-root">
      <Image className="history-bg" src={bgImage} mode="aspectFill" />
      <View className="history-frost" />

      <View className="history-header">
        <View className="history-back" onClick={goBack} hoverClass="history-back--hover">
          <Image className="history-back-icon" src={iconBack} mode="aspectFit" />
        </View>
        <Text className="history-title">历史</Text>
        <View className="history-spacer" />
      </View>

      {/* Tabs */}
      <View className="history-tabs">
        <View
          className={`history-tab ${tab === 'reports' ? 'is-active' : ''}`}
          onClick={() => setTab('reports')}
        >
          <Text className="history-tab-text">已复盘</Text>
          {records.length > 0 && (
            <Text className="history-tab-count">{records.length}</Text>
          )}
        </View>
        <View
          className={`history-tab ${tab === 'drafts' ? 'is-active' : ''}`}
          onClick={() => setTab('drafts')}
        >
          <Text className="history-tab-text">草稿中</Text>
          {drafts.length > 0 && (
            <Text className="history-tab-count">{drafts.length}</Text>
          )}
        </View>
      </View>

      {tab === 'reports' &&
        (records.length === 0 ? (
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
                  onLongPress={() => handleReportLongPress(rec)}
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
        ))}

      {tab === 'drafts' &&
        (drafts.length === 0 ? (
          <View className="history-empty">
            <Text className="history-empty-emoji">📝</Text>
            <Text className="history-empty-text">还没有草稿</Text>
            <Text className="history-empty-hint">未生成报告的对话会自动存到这里，保留 30 天</Text>
          </View>
        ) : (
          <ScrollView className="history-scroll" scrollY showScrollbar={false}>
            <View className="history-list">
              {drafts.map((d) => (
                <View
                  key={d.id}
                  className="history-item draft-item"
                  hoverClass="history-item--hover"
                  onClick={() => openDraft(d)}
                  onLongPress={() => removeDraft(d)}
                >
                  <View className="draft-row">
                    <Text className="item-date">{formatDate(d.updatedAt)}</Text>
                    <Text className="draft-count">{d.messages.filter((m) => m.role === 'user').length} 条</Text>
                  </View>
                  <Text className="item-title">{d.title}</Text>
                  {draftSnippet(d) && (
                    <Text className="item-summary">{draftSnippet(d)}</Text>
                  )}
                  <Text className="draft-hint">点击继续聊 · 长按可删除</Text>
                </View>
              ))}
              <View className="history-foot-space" />
            </View>
          </ScrollView>
        ))}
    </View>
  );
}
