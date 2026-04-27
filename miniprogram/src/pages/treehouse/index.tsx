import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import bgImage from '@/assets/bg-dawn.jpg';
import FloatingTabBar from '@/components/floating-tab-bar';

import './index.less';

export default function TreehousePage() {
  return (
    <View className="th-root">
      <Image className="th-bg" src={bgImage} mode="aspectFill" />
      <View className="th-vignette" />

      <View className="th-header">
        <Text className="th-title">树 洞</Text>
      </View>

      <View className="th-content">
        <Text className="th-emoji">🌳</Text>
        <Text className="th-line1">找一棵树倾诉</Text>
        <Text className="th-line2">把说不出口的话扔进去</Text>
        <View className="th-pill">
          <Text className="th-pill-text">树洞建造中</Text>
        </View>

        <Text className="th-meanwhile">在那之前，不如先 ——</Text>
        <View className="th-actions">
          <View
            className="th-action"
            hoverClass="th-action--hover"
            onClick={() => Taro.navigateTo({ url: '/pages/breathe/index' })}
          >
            <Text className="th-action-emoji">🌬️</Text>
            <Text className="th-action-label">深呼吸练习</Text>
          </View>
          <View
            className="th-action"
            hoverClass="th-action--hover"
            onClick={() => Taro.navigateTo({ url: '/pages/checkin/index' })}
          >
            <Text className="th-action-emoji">🔥</Text>
            <Text className="th-action-label">每日打卡</Text>
          </View>
        </View>
      </View>

      <FloatingTabBar active="treehouse" />
    </View>
  );
}
