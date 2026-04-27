import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';

import iconBack from '@/assets/icons/chevron-left.svg';
import iconHeart from '@/assets/icons/heart.svg';

import './index.less';

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

const CYCLE: { phase: Phase; duration: number; label: string; sub: string }[] = [
  { phase: 'inhale', duration: 4, label: '吸气', sub: '缓慢深呼吸' },
  { phase: 'hold',   duration: 4, label: '屏息', sub: '保持平静' },
  { phase: 'exhale', duration: 6, label: '呼气', sub: '慢慢放松' },
  { phase: 'pause',  duration: 2, label: '休息', sub: '片刻平静' },
];

// 20 stars (down from 44 in original) — generated once at module scope
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 2.5 + 2,
}));

export default function BreathePage() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Drive phase changes with chained setTimeouts (JS only tracks WHICH phase,
  // CSS @keyframes handle the orb scale animation).
  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const tick = (idx: number) => {
      const dur = CYCLE[idx].duration * 1000;
      timerRef.current = setTimeout(() => {
        const next = (idx + 1) % CYCLE.length;
        if (next === 0) setCycles((c) => c + 1);
        setPhaseIdx(next);
        tick(next);
      }, dur);
    };
    tick(phaseIdx);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    if (running) {
      setRunning(false);
      setPhaseIdx(0);
    } else {
      setPhaseIdx(0);
      setRunning(true);
    }
  };

  const goBack = () =>
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/treehouse/index' }));

  const currentPhase = CYCLE[phaseIdx];

  return (
    <View className="bp-root">
      {/* Deep space background */}
      <View className="bp-bg" />
      <View className="bp-nebula bp-nebula-1" />
      <View className="bp-nebula bp-nebula-2" />
      <View className="bp-nebula bp-nebula-3" />

      {/* Stars */}
      <View className="bp-stars">
        {STARS.map((s) => (
          <View
            key={s.id}
            className="bp-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}rpx`,
              height: `${s.size}rpx`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </View>

      <View className="bp-vignette-top" />
      <View className="bp-vignette-bottom" />

      {/* Header */}
      <View className="bp-header">
        <View className="bp-back" onClick={goBack} hoverClass="bp-back--hover">
          <Image className="bp-back-icon" src={iconBack} mode="aspectFit" />
          <Text className="bp-back-text">返回</Text>
        </View>
      </View>

      {/* Title */}
      <View className="bp-title-wrap">
        <View className="bp-safe-tag">
          <Image className="bp-safe-icon" src={iconHeart} mode="aspectFit" />
          <Text className="bp-safe-text">安全空间</Text>
        </View>
        <Text className="bp-title">深呼吸练习</Text>
        <Text className="bp-subtitle">4-4-6-2 节律呼吸 · 激活副交感神经</Text>
      </View>

      {/* Breathing orb area */}
      <View className="bp-orb-area">
        <View className="bp-orb-stack">
          {/* Outer glow ring */}
          <View className={`bp-glow bp-phase-${currentPhase.phase} ${running ? 'is-running' : ''}`} />
          {/* Mid ring */}
          <View className={`bp-mid bp-phase-${currentPhase.phase} ${running ? 'is-running' : ''}`} />
          {/* Main circle */}
          <View className={`bp-orb bp-phase-${currentPhase.phase} ${running ? 'is-running' : ''}`}>
            <Text className="bp-phase-label">
              {running ? currentPhase.label : '开始'}
            </Text>
            <Text className="bp-phase-sub">
              {running ? currentPhase.sub : '点击引导'}
            </Text>
          </View>
        </View>

        {/* Phase dots */}
        <View className="bp-dots">
          {CYCLE.map((c, i) => (
            <View key={c.phase} className="bp-dot-col">
              <View
                className={`bp-dot bp-phase-${c.phase} ${running && i === phaseIdx ? 'is-active' : ''}`}
              />
              <Text className="bp-dot-label">{c.label}</Text>
              <Text className="bp-dot-dur">{c.duration}s</Text>
            </View>
          ))}
        </View>

        {/* Cycles counter */}
        {cycles > 0 && (
          <View className="bp-cycles">
            <Text className="bp-cycles-emoji">✨</Text>
            <Text className="bp-cycles-text">已完成 {cycles} 次呼吸循环</Text>
          </View>
        )}

        {/* Start/Stop button */}
        <View
          className={`bp-toggle-btn ${running ? 'is-running' : ''}`}
          onClick={handleToggle}
          hoverClass="bp-toggle-btn--hover"
        >
          <Text className={`bp-toggle-label ${running ? 'is-running' : ''}`}>
            {running ? '停止练习' : '开始呼吸'}
          </Text>
        </View>
      </View>
    </View>
  );
}
