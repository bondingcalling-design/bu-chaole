import { View, Text, Image, ScrollView, Canvas } from '@tarojs/components';
import Taro, { useDidShow, useReady } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import FloatingTabBar from '@/components/floating-tab-bar';

import './index.less';

interface ReportRecord {
  id: string;
  createdAt: number;
  report: { title: string; summary: string; emotions?: string[] };
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: '一', score: 64 },
  { day: '二', score: 48 },
  { day: '三', score: 80 },
  { day: '四', score: 55 },
  { day: '五', score: 72 },
  { day: '六', score: 91 },
  { day: '日', score: 60 },
];

const HEARTBEAT_DATA = [
  { time: '8:00',  you: 58, partner: 52 },
  { time: '10:00', you: 70, partner: 44 },
  { time: '12:00', you: 62, partner: 66 },
  { time: '14:00', you: 38, partner: 82 },
  { time: '16:00', you: 29, partner: 88 }, // peak
  { time: '18:00', you: 54, partner: 62 },
  { time: '20:00', you: 76, partner: 70 },
];
const PEAK_INDEX = 4;

const RADAR_DATA = [
  { subject: '共情', value: 42, color: 'rgba(160,210,255,0.95)' },
  { subject: '攻击', value: 78, color: 'rgba(255,140,130,0.95)' },
  { subject: '防御', value: 65, color: 'rgba(255,210,130,0.95)' },
  { subject: '逻辑', value: 30, color: 'rgba(200,175,255,0.95)' },
  { subject: '倾听', value: 20, color: 'rgba(140,235,200,0.95)' },
];

const DEPTH_INSIGHTS = [
  {
    icon: '🧠',
    label: '回避型依恋',
    desc: 'Ta 用沉默保护自己的心理边界',
    detail: '回避型依恋者从小习惯独自处理情绪，把"暴露脆弱"等同于风险。当冲突升级，Ta 会本能退回到自己的"安全屋"——这不是在惩罚你，而是在自救。靠近的方式是：先给空间，再轻声靠近。',
    color: 'rgba(200,175,255,0.95)',
  },
  {
    icon: '🛡️',
    label: '防御性沟通',
    desc: '转移话题是 Ta 处理压力的方式',
    detail: '当对话触及让 Ta 不舒服的核心，Ta 会用"换话题 / 反问 / 沉默"挡回来。这不是不爱听，而是大脑在用最省力的方式降温。可以尝试：先共情情绪，再回到议题，把"对错"变成"感受"。',
    color: 'rgba(160,210,255,0.95)',
  },
  {
    icon: '❤️',
    label: '渴望被理解',
    desc: '内心深处极度需要你的接纳',
    detail: '哪怕表面上看起来 Ta 不在乎，内心深处仍然渴望被你看见。一个"我懂你"比十句道理都管用。下次冲突时，先把"我理解你刚才那一刻很难受"说出口，再讲剩下的话。',
    color: 'rgba(255,180,200,0.95)',
  },
];

const HEARTBEAT_CANVAS_ID = 'rv-heartbeat';
const RADAR_CANVAS_ID = 'rv-radar';

const weekMax = Math.max(...WEEKLY_DATA.map((d) => d.score));
const weekAvg = Math.round(WEEKLY_DATA.reduce((s, d) => s + d.score, 0) / WEEKLY_DATA.length);

function parseRgb(s: string) {
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 200, g: 200, b: 255 };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const [latest, setLatest] = useState<ReportRecord | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [depthExpanded, setDepthExpanded] = useState<Set<number>>(new Set());

  useDidShow(() => {
    try {
      const history = Taro.getStorageSync('report-history');
      const arr = Array.isArray(history) ? history : [];
      setHistoryCount(arr.length);
      setLatest(arr[0] || null);
    } catch (_) {
      setLatest(null);
    }
    // Re-draw on every show. Skyline + ScrollView occasionally has the canvas
    // node not yet sized when useReady fires (cards below the fold), and the
    // page is also re-entered via tab-switch — useReady only fires once but
    // the canvas may need redrawing if it lost its pixels. Defer slightly to
    // let layout settle.
    setTimeout(() => {
      drawHeartbeat();
      drawRadar();
    }, 120);
  });

  useReady(() => {
    drawHeartbeat();
    drawRadar();
  });

  const toggleDepth = (i: number) => {
    setDepthExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const drawHeartbeat = () => {
    Taro.createSelectorQuery()
      .select(`#${HEARTBEAT_CANVAS_ID}`)
      .fields({ node: true, size: true } as any)
      .exec((res) => {
        const node = res?.[0]?.node;
        if (!node) return;
        const ctx = node.getContext('2d');
        const dpr = (Taro.getSystemInfoSync && Taro.getSystemInfoSync().pixelRatio) || 2;
        const w = res[0].width;
        const h = res[0].height;
        node.width = w * dpr;
        node.height = h * dpr;
        ctx.scale(dpr, dpr);

        const padL = 8;
        const padR = 8;
        const padT = 18;
        const padB = 22;
        const innerW = w - padL - padR;
        const innerH = h - padT - padB;

        // grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
          const y = padT + (innerH / 3) * i;
          ctx.beginPath();
          ctx.moveTo(padL, y);
          ctx.lineTo(padL + innerW, y);
          ctx.stroke();
        }

        const xAt = (i: number) => padL + (innerW / (HEARTBEAT_DATA.length - 1)) * i;
        const yAt = (v: number) => padT + innerH - (v / 100) * innerH;

        const drawLine = (key: 'you' | 'partner', stroke: string, dotR: number) => {
          ctx.beginPath();
          HEARTBEAT_DATA.forEach((d, i) => {
            const x = xAt(i);
            const y = yAt(d[key]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.stroke();
          // dots
          HEARTBEAT_DATA.forEach((d, i) => {
            const x = xAt(i);
            const y = yAt(d[key]);
            ctx.beginPath();
            ctx.arc(x, y, dotR, 0, Math.PI * 2);
            ctx.fillStyle = stroke;
            ctx.fill();
          });
        };

        drawLine('you', 'rgba(160,210,255,0.85)', 2.5);
        drawLine('partner', 'rgba(200,175,255,0.85)', 3);

        // peak marker (fire dot)
        const px = xAt(PEAK_INDEX);
        const py = yAt(HEARTBEAT_DATA[PEAK_INDEX].partner);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,140,110,0.95)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,180,160,0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', px, py - 14);

        // x-axis labels
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        HEARTBEAT_DATA.forEach((d, i) => {
          ctx.fillText(d.time, xAt(i), padT + innerH + 6);
        });
      });
  };

  const drawRadar = () => {
    Taro.createSelectorQuery()
      .select(`#${RADAR_CANVAS_ID}`)
      .fields({ node: true, size: true } as any)
      .exec((res) => {
        const node = res?.[0]?.node;
        if (!node) return;
        const ctx = node.getContext('2d');
        const dpr = (Taro.getSystemInfoSync && Taro.getSystemInfoSync().pixelRatio) || 2;
        const w = res[0].width;
        const h = res[0].height;
        node.width = w * dpr;
        node.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2 - 26;
        const n = RADAR_DATA.length;
        const levels = 4;

        const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
        const pt = (i: number, r: number) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

        const drawPoly = (points: { x: number; y: number }[], stroke: string, lineWidth: number, fill?: string) => {
          ctx.beginPath();
          points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
          if (fill) { ctx.fillStyle = fill; ctx.fill(); }
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        };

        for (let lvl = 1; lvl <= levels; lvl++) {
          const r = (radius / levels) * lvl;
          drawPoly(Array.from({ length: n }, (_, i) => pt(i, r)), 'rgba(255,255,255,0.10)', 1);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const { x, y } = pt(i, radius);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        const dataPts = RADAR_DATA.map((d, i) => pt(i, (d.value / 100) * radius));
        drawPoly(dataPts, 'rgba(220,240,255,0.80)', 2, 'rgba(180,215,255,0.12)');

        dataPts.forEach((p, i) => {
          const c = parseRgb(RADAR_DATA[i].color);
          ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.18)`; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = RADAR_DATA[i].color; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
        });

        ctx.font = 'bold 12px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        RADAR_DATA.forEach((d, i) => {
          const { x, y } = pt(i, radius + 18);
          ctx.fillStyle = d.color;
          ctx.fillText(d.subject, x, y);
        });
      });
  };

  const openLatest = () => {
    if (!latest) {
      Taro.redirectTo({ url: '/pages/listen/index' });
      return;
    }
    Taro.setStorageSync('latest-report', latest);
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  const goHistory = () => Taro.navigateTo({ url: '/pages/history/index' });
  const goNew = () => Taro.redirectTo({ url: '/pages/listen/index' });

  const dateLabel = useMemo(() => {
    if (!latest) return '';
    const d = new Date(latest.createdAt);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }, [latest]);

  return (
    <View className="rv-root">
      <Image className="rv-bg" src={bgImage} mode="aspectFill" />
      <View className="rv-vignette" />
      <View className="rv-blob rv-blob-1" />
      <View className="rv-blob rv-blob-2" />

      <View className="rv-header">
        <Text className="rv-title">沟通复盘</Text>
      </View>

      <ScrollView className="rv-scroll" scrollY showScrollbar={false}>
        <View className="rv-body">
          {/* Quick entry: latest report or "start new" */}
          {latest ? (
            <View className="rv-latest" onClick={openLatest} hoverClass="rv-latest--hover">
              <View className="rv-latest-icon"><Text className="rv-latest-icon-emoji">📄</Text></View>
              <View className="rv-latest-text">
                <Text className="rv-latest-title">{latest.report?.title || '心绪回顾'}</Text>
                <Text className="rv-latest-sub">{dateLabel} · 查看完整复盘报告</Text>
              </View>
              <View className="rv-latest-cta">
                <Text className="rv-latest-cta-text">查看 ›</Text>
              </View>
            </View>
          ) : (
            <View className="rv-start-card" onClick={goNew} hoverClass="rv-start-card--hover">
              <View className="rv-start-icon-wrap"><Text className="rv-start-icon">＋</Text></View>
              <View className="rv-start-text">
                <Text className="rv-start-title">开始新的倾诉</Text>
                <Text className="rv-start-sub">对完话再来看心绪地图</Text>
              </View>
            </View>
          )}

          {/* History entry */}
          <View className="rv-history-row" onClick={goHistory} hoverClass="rv-history-row--hover">
            <View className="rv-history-icon"><Text className="rv-history-icon-emoji">🕒</Text></View>
            <View className="rv-history-text">
              <Text className="rv-history-title">查看全部对话历史</Text>
              <Text className="rv-history-sub">共 {historyCount} 次记录</Text>
            </View>
            <Text className="rv-chev">›</Text>
          </View>

          {/* Weekly trend bar chart (CSS-only) */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">每周情感趋势</Text>
              <Text className="section-title">沟通融洽度 · 本周</Text>

              <View className="bar-chart">
                {WEEKLY_DATA.map((d) => {
                  const isTop = d.score === weekMax;
                  return (
                    <View key={d.day} className="bar-col">
                      <View className="bar-track">
                        <View
                          className={`bar-fill ${isTop ? 'is-top' : ''}`}
                          style={{ height: `${d.score}%` }}
                        />
                      </View>
                      <Text className="bar-label">{d.day}</Text>
                    </View>
                  );
                })}
              </View>

              <View className="bar-summary-row">
                <View className="bar-summary-item">
                  <Text className="bar-summary-key">平均</Text>
                  <Text className="bar-summary-val" style={{ color: 'rgba(180,210,255,0.95)' }}>{weekAvg}</Text>
                </View>
                <View className="bar-summary-item">
                  <Text className="bar-summary-key">最高</Text>
                  <Text className="bar-summary-val" style={{ color: 'rgba(140,235,200,0.95)' }}>{weekMax}</Text>
                </View>
                <View className="bar-summary-item">
                  <Text className="bar-summary-key">趋势</Text>
                  <Text className="bar-summary-val" style={{ color: 'rgba(160,235,190,0.95)' }}>↗ 好转</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Heartbeat line chart (Canvas) */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">情绪心跳图</Text>
              <Text className="section-title">今日情绪波动</Text>

              <View className="hb-legend">
                <View className="hb-legend-item">
                  <View className="hb-legend-bar" style={{ background: 'rgba(160,210,255,0.95)' }} />
                  <Text className="hb-legend-text">你</Text>
                </View>
                <View className="hb-legend-item">
                  <View className="hb-legend-bar" style={{ background: 'rgba(200,175,255,0.95)' }} />
                  <Text className="hb-legend-text">对方</Text>
                </View>
                <View className="hb-legend-item">
                  <Text className="hb-legend-fire">🔥</Text>
                  <Text className="hb-legend-text">冲突峰值</Text>
                </View>
              </View>

              <View className="hb-canvas-wrap">
                <Canvas type="2d" id={HEARTBEAT_CANVAS_ID} canvasId={HEARTBEAT_CANVAS_ID} className="hb-canvas" />
              </View>

              <View className="hb-conflict">
                <Text className="hb-conflict-emoji">🔥</Text>
                <Text className="hb-conflict-text">16:00 情绪张力达到峰值 — AI 建议暂停 10 分钟</Text>
              </View>
            </View>
          </View>

          {/* Depth insight */}
          <View className="card">
            <View className="card-pad">
              <View className="depth-head">
                <View className="depth-head-icon"><Text className="depth-head-emoji">🧠</Text></View>
                <View>
                  <Text className="section-label">深度心理分析</Text>
                  <Text className="section-title">潜意识动机解码</Text>
                </View>
              </View>

              <View className="depth-main">
                <Text className="depth-main-text">
                  根据对话模式分析，Ta 展现出典型的<Text className="depth-em depth-em-purple">回避型依恋</Text>特征。当冲突升级时，Ta 的本能反应是退缩与沉默——这并非不在意，而是一种<Text className="depth-em depth-em-blue">自我保护机制</Text>。
                </Text>
              </View>

              <View className="depth-list">
                {DEPTH_INSIGHTS.map((it, i) => {
                  const open = depthExpanded.has(i);
                  return (
                    <View
                      key={it.label}
                      className={`depth-item ${open ? 'is-open' : ''}`}
                      onClick={() => toggleDepth(i)}
                    >
                      <View className="depth-item-row">
                        <Text className="depth-item-icon">{it.icon}</Text>
                        <View className="depth-item-text">
                          <Text className="depth-item-label" style={{ color: it.color }}>{it.label}</Text>
                          <Text className="depth-item-desc">{it.desc}</Text>
                        </View>
                        <Text className={`depth-item-chev ${open ? 'is-open' : ''}`}>⌄</Text>
                      </View>
                      {open && (
                        <View className="depth-item-detail">
                          <Text className="depth-item-detail-text">{it.detail}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Radar chart */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">沟通风格雷达</Text>
              <Text className="section-title">五维情感能力分析</Text>

              <View className="radar-wrap">
                <Canvas type="2d" id={RADAR_CANVAS_ID} canvasId={RADAR_CANVAS_ID} className="radar-canvas" />
              </View>

              <View className="radar-mini-row">
                {RADAR_DATA.map((d) => (
                  <View key={d.subject} className="radar-mini">
                    <View className="radar-mini-track">
                      <View
                        className="radar-mini-fill"
                        style={{ width: `${d.value}%`, background: d.color, boxShadow: `0 0 8rpx ${d.color}` }}
                      />
                    </View>
                    <Text className="radar-mini-subject">{d.subject}</Text>
                    <Text className="radar-mini-value" style={{ color: d.color }}>{d.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="rv-tab-space" />
        </View>
      </ScrollView>

      <FloatingTabBar active="review" />
    </View>
  );
}
