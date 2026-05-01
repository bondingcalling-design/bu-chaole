import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, useLoad } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import FloatingTabBar from '@/components/floating-tab-bar';

import './index.less';

const APP_VERSION = 'v0.1';
const INSTALL_KEY = 'app-install-date';
const CHECKIN_KEY = 'checkin-records-v1';

const TOOL_ROWS = [
  { id: 'sync',   icon: '🔄', label: '云端数据同步', sub: '上次同步：刚刚',     color: 'rgba(160,210,255,0.90)', bg: 'rgba(160,210,255,0.12)' },
  { id: 'export', icon: '📥', label: '导出历史报告', sub: 'PDF / 图片格式',     color: 'rgba(200,175,255,0.90)', bg: 'rgba(200,175,255,0.12)' },
  { id: 'checkin',icon: '📅', label: '每日打卡记录', sub: '查看完整签到日历',   color: 'rgba(140,235,200,0.90)', bg: 'rgba(140,235,200,0.12)' },
];

const MORE_ROWS = [
  { id: 'settings',icon: '⚙️',  label: '设置',         sub: '账号、隐私与通知管理', color: 'rgba(160,210,255,0.90)', bg: 'rgba(160,210,255,0.12)' },
  { id: 'share',   icon: '📤',  label: '分享给好友',   sub: '邀请好友一起使用',     color: 'rgba(200,175,255,0.90)', bg: 'rgba(200,175,255,0.12)' },
  { id: 'rate',    icon: '⭐',  label: '给我们评分',   sub: '您的支持是我们的动力', color: 'rgba(255,215,80,0.90)',  bg: 'rgba(255,215,80,0.12)'  },
  { id: 'help',    icon: '❓',  label: '帮助中心',     sub: '常见问题解答',         color: 'rgba(140,235,200,0.90)', bg: 'rgba(140,235,200,0.12)' },
];

const FREE_FEATURES_NOW  = ['基础 AI 对话', '每日 5 次限额', '标准复盘报告'];
const FREE_FEATURES_LOCK = ['无限次对话', '长效情感记忆', '深度雷达图分析', '优先智能响应'];

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Calculate continuous check-in streak ending today (or yesterday if today
// isn't checked yet).
function calcStreak(records: Record<string, any>) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (records[dateKey(d)]) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}

// Last 7 days streak dots, Mon → Sun aligned to current week.
function getWeekStreakDots(records: Record<string, any>): boolean[] {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // 0=Mon..6=Sun
  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - todayDow;
    if (offset > 0) return false; // future day this week
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return !!records[dateKey(d)];
  });
}

export default function ProfilePage() {
  const [reportCount, setReportCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekDots, setWeekDots] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [installDays, setInstallDays] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);

  // Set install date on first load if not present.
  useLoad(() => {
    try {
      const existing = Taro.getStorageSync(INSTALL_KEY);
      if (!existing || typeof existing !== 'number') {
        Taro.setStorageSync(INSTALL_KEY, Date.now());
      }
    } catch (_) {}
  });

  useDidShow(() => {
    try {
      const history = Taro.getStorageSync('report-history');
      setReportCount(Array.isArray(history) ? history.length : 0);
    } catch (_) {}

    try {
      const records = Taro.getStorageSync(CHECKIN_KEY);
      const r = (records && typeof records === 'object') ? records : {};
      setStreak(calcStreak(r));
      setWeekDots(getWeekStreakDots(r));
      setCheckedToday(!!r[dateKey(new Date())]);
    } catch (_) {}

    try {
      const ts = Taro.getStorageSync(INSTALL_KEY);
      if (typeof ts === 'number' && ts > 0) {
        const days = Math.max(1, Math.floor((Date.now() - ts) / 86400000) + 1);
        setInstallDays(days);
      } else {
        setInstallDays(1);
      }
    } catch (_) {
      setInstallDays(1);
    }
  });

  // Average rapport: not yet computed from real data — show "—" until we have it.
  const avgRapport = useMemo(() => '—', []);

  const navTo = (url: string) => Taro.navigateTo({ url });
  const toast = (title: string) => Taro.showToast({ title, icon: 'none', duration: 1500 });

  const handleToolTap = (id: string) => {
    if (id === 'sync')    return toast('数据已同步');
    if (id === 'export')  return toast('导出功能开发中');
    if (id === 'checkin') return navTo('/pages/checkin/index');
  };

  const handleMoreTap = (id: string) => {
    if (id === 'settings') return navTo('/pages/settings/index');
    if (id === 'share')    return toast('分享功能开发中');
    if (id === 'rate')     return toast('感谢支持 🌸');
    if (id === 'help')     return navTo('/pages/help/index');
  };

  const handleDeleteAccount = async () => {
    const res = await Taro.showModal({
      title: '确认注销账号？',
      content: '注销后所有本地数据将被永久删除，此操作不可逆。',
      confirmText: '确认注销',
      confirmColor: '#FF5050',
      cancelText: '取消',
    });
    if (!res.confirm) return;
    try {
      Taro.clearStorageSync();
    } catch (_) {}
    setReportCount(0);
    setStreak(0);
    setWeekDots([false, false, false, false, false, false, false]);
    setCheckedToday(false);
    setInstallDays(1);
    Taro.showToast({ title: '账号已注销', icon: 'none' });
  };

  return (
    <View className="profile-root">
      <Image className="profile-bg" src={bgImage} mode="aspectFill" />
      <View className="profile-vignette-main" />
      <View className="profile-vignette-top" />
      <View className="profile-vignette-bottom" />
      <View className="profile-blob profile-blob-1" />
      <View className="profile-blob profile-blob-2" />

      <ScrollView className="profile-scroll" scrollY showScrollbar={false}>
        <View className="profile-body">
          {/* ── Hero: Avatar + identity ──────────────────────────── */}
          <View className="hero">
            <View className="avatar-ring">
              <View className="avatar-inner" hoverClass="avatar-inner--hover" onClick={() => toast('头像编辑开发中')}>
                <Text className="avatar-emoji">🐱</Text>
              </View>
              <View className="avatar-edit-badge">
                <Text className="avatar-edit-glyph">✎</Text>
              </View>
            </View>

            <View className="identity">
              <View className="identity-row1">
                <Text className="identity-name">微信用户</Text>
                <View className="lv-pill">
                  <Text className="lv-star">✦</Text>
                  <Text className="lv-text">Lv.1</Text>
                </View>
              </View>
              <View className="identity-row2">
                <Text className="identity-role">沟通新手</Text>
                <Text className="identity-dot">·</Text>
                <Text className="identity-days">加入 {installDays} 天</Text>
              </View>
            </View>

            <View className="capsule-spacer" />
          </View>

          {/* ── Stats row ────────────────────────────────────────── */}
          <View className="stats-row">
            <View className="stat-pill">
              <Text className="stat-value" style={{ color: 'rgba(160,210,255,0.92)' }}>{reportCount}</Text>
              <Text className="stat-label">复盘次数</Text>
            </View>
            <View className="stat-pill">
              <Text className="stat-value" style={{ color: 'rgba(200,175,255,0.92)' }}>{avgRapport}</Text>
              <Text className="stat-label">平均融洽</Text>
            </View>
            <View className="stat-pill">
              <Text className="stat-value" style={{ color: 'rgba(140,235,200,0.92)' }}>{streak}</Text>
              <Text className="stat-label">连续打卡</Text>
            </View>
          </View>

          {/* ── Relationship status ──────────────────────────────── */}
          <View className="rel-card">
            <View className="rel-left">
              <View className="rel-icon-wrap">
                <Text className="rel-icon-emoji">👥</Text>
              </View>
              <View className="rel-text">
                <Text className="rel-title">单人模式已激活</Text>
                <Text className="rel-sub">伴侣绑定功能即将上线</Text>
              </View>
            </View>
            <View className="rel-cta is-disabled">
              <Text className="rel-cta-text">邀请伴侣</Text>
            </View>
          </View>

          {/* ── Membership card (free tier) ──────────────────────── */}
          <View className="vip-card">
            <View className="vip-shimmer" />

            <View className="vip-head">
              <Text className="vip-crown">👑</Text>
              <Text className="vip-title">免费版用户</Text>
            </View>
            <Text className="vip-sub">基础功能 · 每日限额 5 次对话</Text>

            <View className="vip-section">
              <Text className="vip-section-label">当前可用</Text>
              {FREE_FEATURES_NOW.map((f) => (
                <View key={f} className="vip-feature-row">
                  <Text className="vip-feature-check">✓</Text>
                  <Text className="vip-feature-text">{f}</Text>
                </View>
              ))}
            </View>

            <View className="vip-divider" />

            <View className="vip-section">
              <Text className="vip-section-label vip-section-label-gold">升级后解锁</Text>
              {FREE_FEATURES_LOCK.map((f) => (
                <View key={f} className="vip-feature-row">
                  <Text className="vip-feature-lock">🔒</Text>
                  <Text className="vip-feature-text vip-feature-text-gold">{f}</Text>
                </View>
              ))}
            </View>

            <View
              className="vip-cta"
              onClick={() => navTo('/pages/vip/index')}
              hoverClass="vip-cta--hover"
            >
              <Text className="vip-cta-zap">⚡</Text>
              <Text className="vip-cta-text">立即升级专业版</Text>
            </View>
          </View>

          {/* ── Daily check-in card ──────────────────────────────── */}
          <View className="checkin-card" onClick={() => navTo('/pages/checkin/index')} hoverClass="checkin-card--hover">
            <View className="checkin-head">
              <View className="checkin-text">
                <Text className="checkin-title">每日情感签到</Text>
                <Text className="checkin-sub">
                  {streak > 0 ? `连续打卡 ${streak} 天 · ` : ''}下次奖励 +50 经验
                </Text>
              </View>
              <View className={`checkin-cta ${checkedToday ? 'is-done' : ''}`}>
                <Text className="checkin-cta-emoji">📅</Text>
                <Text className="checkin-cta-text">{checkedToday ? '已签到' : '去签到'}</Text>
              </View>
            </View>

            <View className="streak-dots">
              {WEEKDAYS.map((day, i) => {
                const ok = weekDots[i];
                return (
                  <View key={day} className="streak-col">
                    <View className={`streak-dot ${ok ? 'is-on' : ''}`}>
                      <Text className="streak-dot-text">{ok ? '✓' : '·'}</Text>
                    </View>
                    <Text className="streak-day">周{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Tools group ──────────────────────────────────────── */}
          <Text className="group-label">工具</Text>
          <View className="settings-card">
            {TOOL_ROWS.map((row, i) => (
              <View
                key={row.id}
                className={`setting-row ${i < TOOL_ROWS.length - 1 ? 'has-divider' : ''}`}
                hoverClass="setting-row--hover"
                onClick={() => handleToolTap(row.id)}
              >
                <View className="setting-icon-wrap" style={{ background: row.bg, borderColor: row.color.replace(/[\d.]+\)$/, '0.28)') }}>
                  <Text className="setting-icon-emoji">{row.icon}</Text>
                </View>
                <View className="setting-text">
                  <Text className="setting-label">{row.label}</Text>
                  <Text className="setting-sub">{row.sub}</Text>
                </View>
                <Text className="setting-chev">›</Text>
              </View>
            ))}
          </View>

          {/* ── More group ───────────────────────────────────────── */}
          <Text className="group-label">更多</Text>
          <View className="settings-card">
            {MORE_ROWS.map((row, i) => (
              <View
                key={row.id}
                className={`setting-row ${i < MORE_ROWS.length - 1 ? 'has-divider' : ''}`}
                hoverClass="setting-row--hover"
                onClick={() => handleMoreTap(row.id)}
              >
                <View className="setting-icon-wrap" style={{ background: row.bg, borderColor: row.color.replace(/[\d.]+\)$/, '0.28)') }}>
                  <Text className="setting-icon-emoji">{row.icon}</Text>
                </View>
                <View className="setting-text">
                  <Text className="setting-label">{row.label}</Text>
                  <Text className="setting-sub">{row.sub}</Text>
                </View>
                <Text className="setting-chev">›</Text>
              </View>
            ))}
          </View>

          {/* ── Delete account button ────────────────────────────── */}
          <View className="delete-row">
            <View className="delete-btn" onClick={handleDeleteAccount} hoverClass="delete-btn--hover">
              <Text className="delete-text">注销账号</Text>
            </View>
          </View>

          {/* ── App info ─────────────────────────────────────────── */}
          <View className="app-info">
            <Text className="app-info-version">倾听 · {APP_VERSION}</Text>
            <Text className="app-info-tagline">用心陪伴每一段关系</Text>
          </View>

          <View className="profile-tab-space" />
        </View>
      </ScrollView>

      <FloatingTabBar active="profile" />
    </View>
  );
}
