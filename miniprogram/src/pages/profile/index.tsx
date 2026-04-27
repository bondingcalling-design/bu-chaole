import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import FloatingTabBar from '@/components/floating-tab-bar';

import './index.less';

interface MenuItem {
  id: string;
  label: string;
  hint?: string;
  onTap: () => void;
}

export default function ProfilePage() {
  const [reportCount, setReportCount] = useState(0);

  useDidShow(() => {
    try {
      const history = Taro.getStorageSync('report-history');
      setReportCount(Array.isArray(history) ? history.length : 0);
    } catch (_) {}
  });

  const toast = (title: string) =>
    Taro.showToast({ title, icon: 'none', duration: 1400 });

  const menu: MenuItem[] = [
    { id: 'checkin', label: '每日打卡', onTap: () => Taro.navigateTo({ url: '/pages/checkin/index' }) },
    { id: 'breathe', label: '深呼吸练习', onTap: () => Taro.navigateTo({ url: '/pages/breathe/index' }) },
    { id: 'history', label: '历史复盘', hint: `${reportCount} 条`, onTap: () => Taro.navigateTo({ url: '/pages/history/index' }) },
    { id: 'settings', label: '设置', onTap: () => Taro.navigateTo({ url: '/pages/settings/index' }) },
    { id: 'help', label: '帮助与反馈', onTap: () => Taro.navigateTo({ url: '/pages/help/index' }) },
    { id: 'about', label: '关于倾听', onTap: () => toast('V0.1 · MVP') },
  ];

  return (
    <View className="profile-root">
      <Image className="profile-bg" src={bgImage} mode="aspectFill" />
      <View className="profile-vignette" />

      <View className="profile-header">
        <Text className="profile-title">我 的</Text>
      </View>

      <ScrollView className="profile-scroll" scrollY showScrollbar={false}>
        <View className="profile-body">
          {/* User card */}
          <View className="user-card">
            <View className="user-avatar">
              <Text className="user-avatar-emoji">🤍</Text>
            </View>
            <View className="user-info">
              <Text className="user-name">微信用户</Text>
              <Text className="user-sub">愿你被温柔倾听</Text>
            </View>
          </View>

          {/* VIP card */}
          <View
            className="vip-card"
            onClick={() => Taro.navigateTo({ url: '/pages/vip/index' })}
            hoverClass="vip-card--hover"
          >
            <View className="vip-left">
              <Text className="vip-crown">👑</Text>
              <View className="vip-text-wrap">
                <Text className="vip-title">开通 VIP</Text>
                <Text className="vip-sub">（个人号暂未开放支付）</Text>
              </View>
            </View>
            <Text className="vip-arrow">›</Text>
          </View>

          {/* Menu */}
          <View className="menu-card">
            {menu.map((item, idx) => (
              <View
                key={item.id}
                className={`menu-row ${idx < menu.length - 1 ? 'has-divider' : ''}`}
                hoverClass="menu-row--hover"
                onClick={item.onTap}
              >
                <Text className="menu-label">{item.label}</Text>
                <View className="menu-right">
                  {item.hint && <Text className="menu-hint">{item.hint}</Text>}
                  <Text className="menu-arrow">›</Text>
                </View>
              </View>
            ))}
          </View>

          <View className="profile-tab-space" />
        </View>
      </ScrollView>

      <FloatingTabBar active="profile" />
    </View>
  );
}
