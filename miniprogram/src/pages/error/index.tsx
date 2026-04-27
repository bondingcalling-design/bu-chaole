import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';

import bgImage from '@/assets/bg-dawn.jpg';
import iconRefresh from '@/assets/icons/refresh.svg';

import './index.less';

export default function ErrorPage() {
  const router = useRouter();
  const code = (router.params.code as string) || '503';
  const msg = (router.params.msg as string) || '服务暂时不可用';

  const handleRetry = () => {
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/listen/index' }));
  };

  return (
    <View className="err-root">
      <Image className="err-bg" src={bgImage} mode="aspectFill" />
      <View className="err-vignette" />
      <View className="err-blob err-blob-1" />
      <View className="err-blob err-blob-2" />

      <View className="err-content">
        <View className="err-illustration">
          <Text className="err-emoji">💤</Text>
        </View>

        <Text className="err-title">服务器太累去谈恋爱啦</Text>
        <Text className="err-desc">请稍后再来找我哦~{'\n'}给它一点休息时间吧 ❤️</Text>

        <View className="err-retry-btn" onClick={handleRetry} hoverClass="err-retry-btn--hover">
          <Image className="err-retry-icon" src={iconRefresh} mode="aspectFit" />
          <Text className="err-retry-label">重试</Text>
        </View>

        <View className="err-tip">
          <Text className="err-tip-text">💡 如果问题持续，可以稍后再试{'\n'}或联系客服寻求帮助</Text>
        </View>
      </View>

      <View className="err-footer">
        <Text className="err-code">错误代码: {code} · {msg}</Text>
      </View>
    </View>
  );
}
