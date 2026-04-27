import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';

import './index.less';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const MOOD_OPTIONS = [
  { emoji: '😊', label: '愉快' },
  { emoji: '😌', label: '平静' },
  { emoji: '😔', label: '低落' },
  { emoji: '🥺', label: '委屈' },
  { emoji: '😤', label: '烦躁' },
];

const MILESTONES = [
  { days: 7,  label: '坚持一周',   emoji: '🌱', reward: '+100 经验' },
  { days: 14, label: '两周达人',   emoji: '🌿', reward: '+200 经验' },
  { days: 30, label: '月度坚守',   emoji: '🌳', reward: '+500 经验 + 专属徽章' },
  { days: 60, label: '两月荣耀',   emoji: '🏔️', reward: '+1000 经验 + VIP 7天' },
];

const STORAGE_KEY = 'checkin-records-v1';

interface Records { [dateStr: string]: string }

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function startWeekday(y: number, m: number) {
  // Convert JS weekday (0=Sun..6=Sat) to ISO Mon-first index (0=Mon..6=Sun)
  const w = new Date(y, m, 1).getDay();
  return (w + 6) % 7;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function calcStreak(records: Records) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (records[k]) streak += 1;
    else if (i > 0) break; // gap → end streak (skip first iteration since today might not be checked)
  }
  // Handle special case: if today isn't checked, streak counts from yesterday
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  if (!records[todayKey] && streak > 0) {
    // streak already correctly counted from yesterday
  }
  return streak;
}

export default function CheckinPage() {
  const [now] = useState(() => new Date());
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const [records, setRecords] = useState<Records>({});
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    try {
      const r = Taro.getStorageSync(STORAGE_KEY);
      if (r && typeof r === 'object') setRecords(r);
    } catch (_) {}
  }, []);

  const todayKey = dateKey(year, month, today);
  const checkedToday = !!records[todayKey];
  const streak = useMemo(() => calcStreak(records), [records]);
  const totalChecked = useMemo(() => Object.keys(records).length, [records]);

  const cells = useMemo(() => {
    const start = startWeekday(year, month);
    const dim = daysInMonth(year, month);
    const totalCells = Math.ceil((start + dim) / 7) * 7;
    return Array.from({ length: totalCells }, (_, i) => {
      const day = i - start + 1;
      return day >= 1 && day <= dim ? day : null;
    });
  }, [year, month]);

  const goBack = () =>
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/profile/index' }));

  const handleCheckIn = () => {
    if (checkedToday) {
      Taro.showToast({ title: '今天已经打卡啦', icon: 'none' });
      return;
    }
    setShowPicker(true);
  };

  const pickMood = (emoji: string) => {
    const next = { ...records, [todayKey]: emoji };
    setRecords(next);
    Taro.setStorageSync(STORAGE_KEY, next);
    setShowPicker(false);
    Taro.showToast({ title: '打卡成功 ✨', icon: 'none' });
  };

  const closePicker = () => setShowPicker(false);

  return (
    <View className="ck-root">
      <Image className="ck-bg" src={bgImage} mode="aspectFill" />
      <View className="ck-frost" />

      <View className="ck-header">
        <View className="ck-back" onClick={goBack} hoverClass="ck-back--hover">
          <Image className="ck-back-icon" src={iconBack} mode="aspectFit" />
          <Text className="ck-back-text">返回</Text>
        </View>
        <Text className="ck-title">每日打卡</Text>
        <View className="ck-spacer" />
      </View>

      <ScrollView className="ck-scroll" scrollY showScrollbar={false}>
        <View className="ck-body">
          {/* Streak hero */}
          <View className="streak-card">
            <View className="streak-flame">
              <Text className="streak-flame-emoji">🔥</Text>
            </View>
            <Text className="streak-num">{streak}</Text>
            <Text className="streak-label">连续打卡天数</Text>
            <Text className="streak-sub">本月累计 {totalChecked} 天</Text>
          </View>

          {/* Today CTA */}
          <View
            className={`today-cta ${checkedToday ? 'is-done' : ''}`}
            onClick={handleCheckIn}
            hoverClass="today-cta--hover"
          >
            {checkedToday ? (
              <>
                <Text className="cta-emoji">{records[todayKey]}</Text>
                <View className="cta-text-wrap">
                  <Text className="cta-title">今日已打卡</Text>
                  <Text className="cta-sub">明天继续，保持节奏 🌟</Text>
                </View>
              </>
            ) : (
              <>
                <Text className="cta-emoji">✨</Text>
                <View className="cta-text-wrap">
                  <Text className="cta-title">今日打卡</Text>
                  <Text className="cta-sub">记录此刻心情</Text>
                </View>
                <Text className="cta-arrow">›</Text>
              </>
            )}
          </View>

          {/* Calendar */}
          <View className="cal-card">
            <Text className="cal-month">{year} 年 {month + 1} 月</Text>
            <View className="cal-weekdays">
              {WEEKDAYS.map((w) => (
                <Text key={w} className="cal-weekday">{w}</Text>
              ))}
            </View>
            <View className="cal-grid">
              {cells.map((day, i) => {
                if (day === null) return <View key={`b-${i}`} className="cal-cell cal-cell-blank" />;
                const k = dateKey(year, month, day);
                const mood = records[k];
                const isToday = day === today;
                return (
                  <View
                    key={k}
                    className={`cal-cell ${mood ? 'is-checked' : ''} ${isToday ? 'is-today' : ''}`}
                  >
                    {mood ? (
                      <Text className="cal-cell-emoji">{mood}</Text>
                    ) : (
                      <Text className="cal-cell-day">{day}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Milestones */}
          <View className="ms-section">
            <Text className="ms-title">里程碑</Text>
            <View className="ms-list">
              {MILESTONES.map((m) => {
                const done = streak >= m.days;
                return (
                  <View key={m.days} className={`ms-item ${done ? 'is-done' : ''}`}>
                    <Text className="ms-emoji">{m.emoji}</Text>
                    <View className="ms-text">
                      <Text className="ms-label">{m.label}（{m.days} 天）</Text>
                      <Text className="ms-reward">{m.reward}</Text>
                    </View>
                    {done && <Text className="ms-check">✓</Text>}
                  </View>
                );
              })}
            </View>
          </View>

          <View className="ck-foot-space" />
        </View>
      </ScrollView>

      {/* Mood picker overlay */}
      {showPicker && (
        <View className="picker-mask" onClick={closePicker}>
          <View className="picker-card" catchMove>
            <Text className="picker-title">今天的心情是？</Text>
            <View className="picker-row">
              {MOOD_OPTIONS.map((m) => (
                <View
                  key={m.emoji}
                  className="picker-item"
                  hoverClass="picker-item--hover"
                  onClick={() => pickMood(m.emoji)}
                >
                  <Text className="picker-emoji">{m.emoji}</Text>
                  <Text className="picker-label">{m.label}</Text>
                </View>
              ))}
            </View>
            <View className="picker-cancel" onClick={closePicker} hoverClass="picker-cancel--hover">
              <Text className="picker-cancel-text">取消</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
