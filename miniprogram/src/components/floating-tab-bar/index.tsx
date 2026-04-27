import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import iconHeadphones from '@/assets/icons/headphones.svg';
import iconTree from '@/assets/icons/tree.svg';
import iconChart from '@/assets/icons/chart.svg';
import iconUser from '@/assets/icons/user.svg';
import iconHeadphonesActive from '@/assets/icons/headphones-active.svg';
import iconTreeActive from '@/assets/icons/tree-active.svg';
import iconChartActive from '@/assets/icons/chart-active.svg';
import iconUserActive from '@/assets/icons/user-active.svg';

import './index.less';

export type TabKey = 'listen' | 'treehouse' | 'review' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  pagePath: string;
  icon: string;
  iconActive: string;
}

const TABS: TabItem[] = [
  { key: 'listen',    label: '倾听', pagePath: '/pages/listen/index',    icon: iconHeadphones, iconActive: iconHeadphonesActive },
  { key: 'treehouse', label: '树洞', pagePath: '/pages/treehouse/index', icon: iconTree,       iconActive: iconTreeActive },
  { key: 'review',    label: '复盘', pagePath: '/pages/review/index',    icon: iconChart,      iconActive: iconChartActive },
  { key: 'profile',   label: '我的', pagePath: '/pages/profile/index',   icon: iconUser,       iconActive: iconUserActive },
];

export default function FloatingTabBar({ active }: { active: TabKey }) {
  const handleTap = (tab: TabItem) => {
    if (tab.key === active) return;
    // redirectTo replaces the current tab page, keeping the stack flat between tabs
    Taro.redirectTo({ url: tab.pagePath }).catch(() => {
      Taro.reLaunch({ url: tab.pagePath });
    });
  };

  return (
    <View className="ftb-root">
      <View className="ftb-bar">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <View
              key={tab.key}
              className={`ftb-item ${isActive ? 'is-active' : ''}`}
              onClick={() => handleTap(tab)}
              hoverClass="ftb-item--hover"
              hoverStayTime={120}
            >
              <View className={`ftb-icon-wrap ${isActive ? 'is-active' : ''}`}>
                <Image
                  className="ftb-icon"
                  src={isActive ? tab.iconActive : tab.icon}
                  mode="aspectFit"
                />
              </View>
              <Text className={`ftb-label ${isActive ? 'is-active' : ''}`}>
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
