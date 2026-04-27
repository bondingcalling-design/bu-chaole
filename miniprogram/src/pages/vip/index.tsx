import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';

import './index.less';

interface Plan {
  id: string;
  label: string;
  price: string;
  unit: string;
  originalPrice: string;
  badge: string | null;
  color: string;
  glow: string;
}

const PLANS: Plan[] = [
  { id: 'monthly',  label: '月度会员', price: '¥28',  unit: '/ 月',    originalPrice: '¥38',  badge: null,        color: 'rgba(160,210,255,0.95)', glow: 'rgba(100,180,255,0.22)' },
  { id: 'yearly',   label: '年度会员', price: '¥168', unit: '/ 年',    originalPrice: '¥456', badge: '省 63%',     color: 'rgba(255,215,80,0.95)',  glow: 'rgba(200,155,40,0.28)' },
  { id: 'lifetime', label: '终身会员', price: '¥398', unit: '/ 永久',  originalPrice: '¥698', badge: '最超值',     color: 'rgba(200,175,255,0.95)', glow: 'rgba(160,120,255,0.22)' },
];

interface Feature {
  emoji: string;
  label: string;
  sub: string;
  color: string;
}

const FEATURES: Feature[] = [
  { emoji: '🧠', label: '无限次 AI 深度对话', sub: '不受次数限制，随时倾诉',         color: 'rgba(200,175,255,0.95)' },
  { emoji: '♾️', label: '长效情感记忆',       sub: 'AI 记住你们的每一段故事',       color: 'rgba(160,210,255,0.95)' },
  { emoji: '⭐', label: '高级沟通报告',       sub: '每次对话生成完整分析报告',       color: 'rgba(255,215,80,0.95)' },
  { emoji: '✨', label: '专属情感洞察',       sub: '个性化情感模式追踪',             color: 'rgba(140,235,200,0.95)' },
  { emoji: '🛡️', label: '隐私加密保护',       sub: '所有对话端对端加密',             color: 'rgba(255,180,150,0.95)' },
  { emoji: '⚡', label: '优先响应速度',       sub: 'AI 回复速度提升 3×',             color: 'rgba(255,210,130,0.95)' },
];

export default function VipPage() {
  const [selected, setSelected] = useState<string>('yearly');

  const goBack = () =>
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/profile/index' }));

  const handlePurchase = () => {
    Taro.showModal({
      title: '个人号暂不开放支付',
      content: 'VIP 功能正在打磨中，开放后会第一时间通知你 ❤️',
      confirmText: '我知道了',
      showCancel: false,
    });
  };

  const plan = PLANS.find((p) => p.id === selected) || PLANS[1];

  return (
    <View className="vip-root">
      <Image className="vip-bg" src={bgImage} mode="aspectFill" />
      <View className="vip-gold-overlay" />
      <View className="vip-vignette-top" />
      <View className="vip-vignette-bottom" />
      <View className="vip-blob vip-blob-gold" />
      <View className="vip-blob vip-blob-purple" />

      {/* Header */}
      <View className="vip-header">
        <View className="vip-back" onClick={goBack} hoverClass="vip-back--hover">
          <Image className="vip-back-icon" src={iconBack} mode="aspectFit" />
          <Text className="vip-back-text">返回</Text>
        </View>
      </View>

      <ScrollView className="vip-scroll" scrollY showScrollbar={false}>
        <View className="vip-body">
          {/* Hero */}
          <View className="vip-hero">
            <View className="hero-glow" />
            <View className="hero-crown">
              <Text className="hero-crown-emoji">👑</Text>
            </View>
            <Text className="hero-title">专业版 VIP</Text>
            <Text className="hero-sub">解锁全部情感陪伴能力</Text>
          </View>

          {/* Plan selector */}
          <View className="plan-list">
            {PLANS.map((p) => {
              const isSel = p.id === selected;
              return (
                <View
                  key={p.id}
                  className={`plan-item ${isSel ? 'is-selected' : ''}`}
                  hoverClass="plan-item--hover"
                  onClick={() => setSelected(p.id)}
                  style={isSel ? { borderColor: p.color, boxShadow: `0 12rpx 64rpx ${p.glow}, inset 0 2rpx 0 rgba(255,255,255,0.12)` } : {}}
                >
                  <View
                    className="plan-radio"
                    style={isSel ? { background: p.color } : {}}
                  >
                    {isSel && <Text className="plan-check">✓</Text>}
                  </View>

                  <View className="plan-text">
                    <View className="plan-row">
                      <Text className="plan-label" style={isSel ? { color: p.color } : {}}>{p.label}</Text>
                      {p.badge && (
                        <View className="plan-badge" style={{ background: p.color }}>
                          <Text className="plan-badge-text">{p.badge}</Text>
                        </View>
                      )}
                    </View>
                    <View className="plan-price-row">
                      <Text className="plan-price" style={isSel ? { color: p.color } : {}}>{p.price}</Text>
                      <Text className="plan-unit">{p.unit}</Text>
                      <Text className="plan-original">{p.originalPrice}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Features */}
          <View className="features-section">
            <Text className="features-title">专属权益</Text>
            <View className="features-card">
              {FEATURES.map((f, i) => (
                <View key={f.label}>
                  <View className="feature-row">
                    <View
                      className="feature-icon-wrap"
                      style={{ borderColor: f.color.replace('0.95', '0.28') }}
                    >
                      <Text className="feature-emoji">{f.emoji}</Text>
                    </View>
                    <View className="feature-text">
                      <Text className="feature-label">{f.label}</Text>
                      <Text className="feature-sub">{f.sub}</Text>
                    </View>
                    <Text className="feature-check" style={{ color: f.color }}>✓</Text>
                  </View>
                  {i < FEATURES.length - 1 && <View className="feature-divider" />}
                </View>
              ))}
            </View>
          </View>

          {/* Trust badges */}
          <View className="trust-row">
            {[
              { emoji: '🔒', text: '随时取消' },
              { emoji: '💎', text: '7 天退款' },
              { emoji: '🤝', text: '微信安全支付' },
            ].map((t) => (
              <View key={t.text} className="trust-item">
                <Text className="trust-emoji">{t.emoji}</Text>
                <Text className="trust-text">{t.text}</Text>
              </View>
            ))}
          </View>

          {/* Notice for personal account */}
          <View className="vip-notice">
            <Text className="vip-notice-emoji">💡</Text>
            <Text className="vip-notice-text">
              倾听目前为个人号小程序，暂未开放微信支付。
              {'\n'}全部 VIP 权益将在企业认证后开放，敬请期待。
            </Text>
          </View>

          <View className="vip-cta-space" />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="vip-cta-bar">
        <View className="vip-cta-btn" onClick={handlePurchase} hoverClass="vip-cta-btn--hover">
          <Text className="vip-cta-text">立即开通 · {plan.price}{plan.unit}</Text>
        </View>
        <Text className="vip-cta-policy">开通即同意《服务协议》与《隐私政策》</Text>
      </View>
    </View>
  );
}
