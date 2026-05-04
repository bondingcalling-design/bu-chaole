import { View, Text, Image, ScrollView, Canvas, Textarea } from '@tarojs/components';
import Taro, { useLoad, useReady } from '@tarojs/taro';
import { useMemo, useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import { DraftMessage, setResume } from '@/utils/chatDrafts';

import './index.less';

// ─── Types ────────────────────────────────────────────────────────────────────
type TransTab = '温柔' | '客观' | '直白';

// Lean schema returned by the upgraded Doubao prompt.
interface RawReport {
  title?: string;
  summary?: string;
  emotionTags?: string[];
  scores?: { tension?: number; efficiency?: number; stability?: number; outlook?: number };
  radar?: { empathy?: number; aggression?: number; defense?: number; logic?: number; listening?: number };
  misunderstandings?: { you: string; reality: string }[];
  translations?: { tender?: string; rational?: string; direct?: string };
  insights?: {
    core_conflict?: { headline: string; desc: string };
    your_motive?: { headline: string; desc: string };
    their_motive?: { headline: string; desc: string };
    advice?: { headline: string; desc: string };
  };
  // Legacy fields kept for backwards-compat with old saved reports
  emotions?: string[];
  insightsLegacy?: string[];
  suggestions?: string[];
}

interface ReportRecord {
  id: string;
  createdAt: number;
  report: RawReport;
  // Optional: present on reports generated after the "fork from report" feature
  // landed. Older records may lack it — gracefully disable continue-chat in
  // that case rather than blowing up.
  conversation?: DraftMessage[];
}

// ─── Mock data (used as fallback when backend hasn't returned rich fields) ───
const MOCK_SCORES = [
  { label: '整体张力', value: 74, color: 'rgba(255,140,120,0.95)' },
  { label: '沟通效率', value: 32, color: 'rgba(160,210,255,0.95)' },
  { label: '情绪稳定', value: 48, color: 'rgba(255,205,120,0.95)' },
  { label: '结局走向', value: 61, color: 'rgba(120,235,190,0.95)' },
];

const MOCK_EMOTION_TAGS = ['委屈 😢', '冷暴力 🧊', '疲惫 💤', '渴望连接 🤝'];

const MOCK_MISUNDERSTANDINGS = [
  {
    you: '你以为 Ta 不想和你说话',
    reality: '其实 Ta 在压力下进入了自我关闭模式，和你无关',
    color: 'rgba(160,210,255,1)',
    bg: 'rgba(160,210,255,0.07)',
    border: 'rgba(160,210,255,0.20)',
  },
  {
    you: 'Ta 以为你在责备和抱怨',
    reality: '其实你只是渴望连接感，需要被看见',
    color: 'rgba(255,190,160,1)',
    bg: 'rgba(255,160,130,0.07)',
    border: 'rgba(255,160,130,0.20)',
  },
  {
    you: '你以为 Ta 冷漠、不在乎',
    reality: '其实 Ta 不知道如何在情绪低谷时表达关心',
    color: 'rgba(195,170,255,1)',
    bg: 'rgba(195,170,255,0.07)',
    border: 'rgba(195,170,255,0.20)',
  },
];

const MOCK_TRANSLATIONS: Record<TransTab, { text: string; tone: string; emoji: string }> = {
  温柔: {
    text: '我今天感觉有点落寞，当你回家沉默的时候，我会不自觉地担心是不是我做了什么。能不能让我知道你还好吗？',
    tone: '温柔共情型',
    emoji: '🌸',
  },
  客观: {
    text: '你今天回家后持续沉默，这影响了我们的沟通效率。如果有什么事情，提前说明会让双方都更舒适，减少误解。',
    tone: '客观陈述型',
    emoji: '🎯',
  },
  直白: {
    text: '你又一声不吭，这让我很难受。我需要你告诉我发生了什么，而不是让我一个人猜。',
    tone: '直白表达型',
    emoji: '⚡️',
  },
};

const MOCK_RADAR = [
  { subject: '共情', value: 35, color: 'rgba(160,210,255,1)' },
  { subject: '攻击', value: 72, color: 'rgba(255,130,120,1)' },
  { subject: '防御', value: 60, color: 'rgba(255,205,120,1)' },
  { subject: '逻辑', value: 28, color: 'rgba(195,170,255,1)' },
  { subject: '倾听', value: 18, color: 'rgba(120,235,190,1)' },
];

const MOCK_INSIGHTS = [
  {
    emoji: '🧠',
    label: '核心矛盾',
    headline: '安全感 vs 个人空间',
    desc: '你对亲密感的需求 vs Ta 对独处空间的保护，形成了典型的「追—逃」模式。',
    color: 'rgba(195,170,255,1)',
    bg: 'rgba(195,170,255,0.08)',
    border: 'rgba(195,170,255,0.22)',
  },
  {
    emoji: '🛡️',
    label: '深层动机（你）',
    headline: '渴望被看见与确认',
    desc: '沉默触发了你的「被忽视」恐惧——这不是无理取闹，而是真实的依附需求。',
    color: 'rgba(160,210,255,1)',
    bg: 'rgba(160,210,255,0.08)',
    border: 'rgba(160,210,255,0.22)',
  },
  {
    emoji: '🔥',
    label: '深层动机（Ta）',
    headline: '用沉默处理内部压力',
    desc: 'Ta 的沉默是一种自我调节行为，并非拒绝，而是典型的回避型应激反应。',
    color: 'rgba(255,160,130,1)',
    bg: 'rgba(255,130,100,0.08)',
    border: 'rgba(255,130,100,0.22)',
  },
  {
    emoji: '💡',
    label: '破局建议',
    headline: '给彼此一个 20 分钟缓冲',
    desc: '回家后先给对方 20 分钟安静解压，再轻声询问「今天辛苦了」。空间才能换来靠近。',
    color: 'rgba(255,215,100,1)',
    bg: 'rgba(255,215,100,0.08)',
    border: 'rgba(255,215,100,0.22)',
  },
];

const POSTER_CANVAS_ID = 'rp-poster-canvas';
const TRANS_TABS: TransTab[] = ['温柔', '客观', '直白'];
const TRANS_STYLE: Record<TransTab, { tone: string; emoji: string; key: 'tender' | 'rational' | 'direct' }> = {
  温柔: { tone: '温柔共情型', emoji: '🌸', key: 'tender' },
  客观: { tone: '客观陈述型', emoji: '🎯', key: 'rational' },
  直白: { tone: '直白表达型', emoji: '⚡️', key: 'direct' },
};
const CANVAS_ID = 'radar-canvas';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function parseRgb(s: string) {
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : { r: 200, g: 200, b: 255 };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [record, setRecord] = useState<ReportRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [activeTrans, setActiveTrans] = useState<TransTab>('温柔');
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  // User-input AI translate
  const [transInput, setTransInput] = useState('');
  const [translating, setTranslating] = useState(false);
  const [aiTrans, setAiTrans] = useState<Record<TransTab, string> | null>(null);
  const [activeAiTrans, setActiveAiTrans] = useState<TransTab>('温柔');

  useLoad(() => {
    try {
      const r = Taro.getStorageSync('latest-report') as ReportRecord | '';
      if (r && typeof r === 'object' && r.report) setRecord(r);
      else setMissing(true);
    } catch (_) {
      setMissing(true);
    }
  });

  // Merge AI's lean JSON with display-time styling. Each slot has a color/
  // emoji defined client-side so prompt output stays small.
  const view = useMemo(() => {
    const r = record?.report || {};
    const mu = r.misunderstandings;
    const radar = r.radar;
    const sc = r.scores;
    const tr = r.translations;
    const ins = r.insights;

    const STYLE_MU = [
      { color: 'rgba(160,210,255,1)',  bg: 'rgba(160,210,255,0.07)', border: 'rgba(160,210,255,0.20)' },
      { color: 'rgba(255,190,160,1)',  bg: 'rgba(255,160,130,0.07)', border: 'rgba(255,160,130,0.20)' },
      { color: 'rgba(195,170,255,1)',  bg: 'rgba(195,170,255,0.07)', border: 'rgba(195,170,255,0.20)' },
    ];

    const STYLE_INS = {
      core_conflict: { emoji: '🧠', label: '核心矛盾',     color: 'rgba(195,170,255,1)', bg: 'rgba(195,170,255,0.08)', border: 'rgba(195,170,255,0.22)' },
      your_motive:   { emoji: '🛡️', label: '深层动机（你）', color: 'rgba(160,210,255,1)', bg: 'rgba(160,210,255,0.08)', border: 'rgba(160,210,255,0.22)' },
      their_motive:  { emoji: '🔥', label: '深层动机（Ta）', color: 'rgba(255,160,130,1)', bg: 'rgba(255,130,100,0.08)', border: 'rgba(255,130,100,0.22)' },
      advice:        { emoji: '💡', label: '破局建议',     color: 'rgba(255,215,100,1)', bg: 'rgba(255,215,100,0.08)', border: 'rgba(255,215,100,0.22)' },
    };

    const STYLE_TRANS = TRANS_STYLE;

    return {
      title: r.title || '今日心绪',
      summary: r.summary || '我们刚聊了一会儿，先用这份简单回顾作为底稿吧。',

      scores: sc
        ? [
            { label: '整体张力', value: sc.tension     ?? 0, color: 'rgba(255,140,120,0.95)' },
            { label: '沟通效率', value: sc.efficiency  ?? 0, color: 'rgba(160,210,255,0.95)' },
            { label: '情绪稳定', value: sc.stability   ?? 0, color: 'rgba(255,205,120,0.95)' },
            { label: '结局走向', value: sc.outlook     ?? 0, color: 'rgba(120,235,190,0.95)' },
          ]
        : MOCK_SCORES,

      emotionTags:
        (r.emotionTags && r.emotionTags.length > 0 && r.emotionTags) ||
        (r.emotions && r.emotions.length > 0 && r.emotions) ||
        MOCK_EMOTION_TAGS,

      misunderstandings:
        mu && mu.length > 0
          ? mu.slice(0, 3).map((m, i) => ({
              you: m.you,
              reality: m.reality,
              ...STYLE_MU[i] || STYLE_MU[0],
            }))
          : MOCK_MISUNDERSTANDINGS,

      translations: tr
        ? {
            温柔: { text: tr.tender   || MOCK_TRANSLATIONS['温柔'].text, tone: STYLE_TRANS['温柔'].tone, emoji: STYLE_TRANS['温柔'].emoji },
            客观: { text: tr.rational || MOCK_TRANSLATIONS['客观'].text, tone: STYLE_TRANS['客观'].tone, emoji: STYLE_TRANS['客观'].emoji },
            直白: { text: tr.direct   || MOCK_TRANSLATIONS['直白'].text, tone: STYLE_TRANS['直白'].tone, emoji: STYLE_TRANS['直白'].emoji },
          }
        : MOCK_TRANSLATIONS,

      radar: radar
        ? [
            { subject: '共情', value: radar.empathy    ?? 0, color: 'rgba(160,210,255,1)' },
            { subject: '攻击', value: radar.aggression ?? 0, color: 'rgba(255,130,120,1)' },
            { subject: '防御', value: radar.defense    ?? 0, color: 'rgba(255,205,120,1)' },
            { subject: '逻辑', value: radar.logic      ?? 0, color: 'rgba(195,170,255,1)' },
            { subject: '倾听', value: radar.listening  ?? 0, color: 'rgba(120,235,190,1)' },
          ]
        : MOCK_RADAR,

      insightCards: ins
        ? (['core_conflict', 'your_motive', 'their_motive', 'advice'] as const).map((k) => {
            const data = ins[k];
            const style = STYLE_INS[k];
            return {
              emoji: style.emoji,
              label: style.label,
              headline: data?.headline || MOCK_INSIGHTS.find((m) => m.label === style.label)?.headline || '',
              desc: data?.desc || MOCK_INSIGHTS.find((m) => m.label === style.label)?.desc || '',
              color: style.color,
              bg: style.bg,
              border: style.border,
            };
          })
        : MOCK_INSIGHTS,
    };
  }, [record]);

  // Compute radar warning from real data instead of hardcoding "攻击偏高".
  // - 攻击 / 防御 high (>=55) is bad; 共情 / 倾听 / 逻辑 low (<=35) is bad.
  // - Pick the most extreme issue. If everything's healthy, give a positive nudge.
  const radarHighlight = useMemo(() => {
    const get = (s: string) => view.radar.find((d) => d.subject === s)?.value ?? 0;
    const aggression = get('攻击');
    const defense = get('防御');
    const empathy = get('共情');
    const listening = get('倾听');
    const logic = get('逻辑');

    type Issue = { subject: string; value: number; type: 'high' | 'low'; severity: number };
    const issues: Issue[] = [];
    if (aggression >= 55) issues.push({ subject: '攻击', value: aggression, type: 'high', severity: aggression });
    if (defense   >= 55) issues.push({ subject: '防御', value: defense,    type: 'high', severity: defense });
    if (empathy   <= 35) issues.push({ subject: '共情', value: empathy,    type: 'low',  severity: 100 - empathy });
    if (listening <= 35) issues.push({ subject: '倾听', value: listening,  type: 'low',  severity: 100 - listening });
    if (logic     <= 35) issues.push({ subject: '逻辑', value: logic,      type: 'low',  severity: 100 - logic });

    if (issues.length === 0) {
      return {
        emoji: '✅',
        text: '本次沟通整体平衡，五维表现都在健康区间，继续保持。',
        tone: 'good' as const,
      };
    }
    issues.sort((a, b) => b.severity - a.severity);
    const top = issues[0];

    const adviceHigh: Record<string, string> = {
      攻击: '情绪化表达比例较大，建议在平静状态下再次沟通。',
      防御: '反驳和自我保护偏多，可以试着先承认对方有道理的部分。',
    };
    const adviceLow: Record<string, string> = {
      共情: '可以先回应对方的感受，再表达自己的观点。',
      倾听: '试着放慢节奏，让对方说完再回应。',
      逻辑: '把诉求拆成一两个具体的点，会让对方更容易听懂。',
    };
    return {
      emoji: top.type === 'high' ? '⚠️' : '💡',
      text:
        top.type === 'high'
          ? `${top.subject}指数偏高（${top.value}）——${adviceHigh[top.subject]}`
          : `${top.subject}指数偏低（${top.value}）——${adviceLow[top.subject]}`,
      tone: top.type,
    };
  }, [view.radar]);

  const runTranslate = async () => {
    const text = transInput.trim();
    if (!text) {
      Taro.showToast({ title: '先写两句吧', icon: 'none' });
      return;
    }
    if (translating) return;
    setTranslating(true);
    try {
      const res = await Taro.cloud.callFunction({
        name: 'doubao',
        data: { mode: 'translate', messages: [{ role: 'user', content: text }] },
      });
      const r: any = res.result;
      if (r?.ok && r.translations) {
        setAiTrans({
          温柔: r.translations.tender   || '',
          客观: r.translations.rational || '',
          直白: r.translations.direct   || '',
        });
        setActiveAiTrans('温柔');
        Taro.showToast({ title: '翻译完成', icon: 'success' });
      } else if (r?.blocked) {
        Taro.showToast({ title: '内容未通过安全检测', icon: 'none' });
      } else {
        console.warn('translate fn error', r);
        Taro.showToast({ title: '翻译失败，再试一次', icon: 'none' });
      }
    } catch (e) {
      console.error('translate call failed', e);
      Taro.showToast({ title: '网络异常', icon: 'none' });
    } finally {
      setTranslating(false);
    }
  };

  // Draw the radar after canvas is ready and data is merged
  useReady(() => {
    drawRadar(view.radar);
  });

  const drawRadar = (radar: typeof MOCK_RADAR) => {
    Taro.createSelectorQuery()
      .select(`#${CANVAS_ID}`)
      .fields({ node: true, size: true } as any)
      .exec((res) => {
        const canvasNode = res?.[0]?.node;
        if (!canvasNode) return;
        const ctx = canvasNode.getContext('2d');
        const dpr = (Taro.getSystemInfoSync && Taro.getSystemInfoSync().pixelRatio) || 2;
        const width = res[0].width;
        const height = res[0].height;
        canvasNode.width = width * dpr;
        canvasNode.height = height * dpr;
        ctx.scale(dpr, dpr);

        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2 - 28;
        const n = radar.length;
        const levels = 4;

        const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
        const pt = (i: number, r: number) => ({
          x: cx + r * Math.cos(angle(i)),
          y: cy + r * Math.sin(angle(i)),
        });

        const drawPolygon = (points: { x: number; y: number }[], stroke: string, lineWidth: number, fill?: string) => {
          ctx.beginPath();
          points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.strokeStyle = stroke;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        };

        // background ring polygons
        for (let lvl = 1; lvl <= levels; lvl++) {
          const r = (radius / levels) * lvl;
          const points = Array.from({ length: n }, (_, i) => pt(i, r));
          drawPolygon(points, 'rgba(255,255,255,0.10)', 1);
        }

        // spokes
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const { x, y } = pt(i, radius);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // data polygon
        const dataPoints = radar.map((d, i) => pt(i, (d.value / 100) * radius));
        drawPolygon(dataPoints, 'rgba(220,240,255,0.80)', 2, 'rgba(180,215,255,0.10)');

        // dots
        dataPoints.forEach((p, i) => {
          const c = parseRgb(radar[i].color);
          // outer glow circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.18)`;
          ctx.fill();
          // colored dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = radar[i].color;
          ctx.fill();
          // white center
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fill();
        });

        // labels
        ctx.font = 'bold 12px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        radar.forEach((d, i) => {
          const { x, y } = pt(i, radius + 18);
          ctx.fillStyle = d.color;
          ctx.fillText(d.subject, x, y);
        });
      });
  };

  const goBack = () => {
    Taro.navigateBack().catch(() => Taro.reLaunch({ url: '/pages/review/index' }));
  };

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const copyTranslation = (text: string) => {
    Taro.setClipboardData({ data: text, success: () => Taro.showToast({ title: '已复制', icon: 'success' }) });
  };

  // Fork the conversation that produced this report into a brand-new chat
  // session. The original report record stays in history untouched; if the
  // user clicks "结束倾诉" again later, that produces a fresh report.
  const continueConversation = () => {
    const conv = record?.conversation;
    if (!Array.isArray(conv) || conv.length === 0) {
      Taro.showToast({ title: '原对话已不可用', icon: 'none' });
      return;
    }
    setResume({ id: `c-fork-${Date.now()}`, messages: conv });
    Taro.navigateTo({ url: '/pages/chat/index' }).catch(() => {
      Taro.reLaunch({ url: '/pages/chat/index' });
    });
  };

  // P0-8: render a shareable card to canvas → save to album. The user can
  // then forward the image to 对方 / 朋友圈 directly. We use the currently
  // selected translation tab as the headline content.
  const [posterBusy, setPosterBusy] = useState(false);
  const sharePoster = () => {
    if (posterBusy) return;
    setPosterBusy(true);
    Taro.showLoading({ title: '生成海报中…', mask: true });

    Taro.createSelectorQuery()
      .select(`#${POSTER_CANVAS_ID}`)
      .fields({ node: true, size: true } as any)
      .exec(async (res) => {
        try {
          const node = res?.[0]?.node;
          if (!node) throw new Error('canvas node missing');
          const ctx = node.getContext('2d');
          const dpr = (Taro.getSystemInfoSync && Taro.getSystemInfoSync().pixelRatio) || 2;
          const W = 600;
          const H = 880;
          node.width = W * dpr;
          node.height = H * dpr;
          ctx.scale(dpr, dpr);

          // background gradient
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, '#1A2350');
          grad.addColorStop(0.55, '#0E1830');
          grad.addColorStop(1, '#080F22');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // soft glow blob
          const blob = ctx.createRadialGradient(W * 0.85, H * 0.18, 10, W * 0.85, H * 0.18, 240);
          blob.addColorStop(0, 'rgba(180, 215, 255, 0.18)');
          blob.addColorStop(1, 'rgba(180, 215, 255, 0)');
          ctx.fillStyle = blob;
          ctx.fillRect(0, 0, W, H);

          // small label
          ctx.font = '500 18px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(180, 220, 255, 0.55)';
          ctx.textAlign = 'left';
          ctx.fillText('· 倾听 · 高情商翻译 ·', 48, 80);

          // tone row (emoji + tone label)
          ctx.font = '600 26px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.fillText(`${t.emoji}  ${t.tone}`, 48, 132);

          // headline: the translation text — wrap by character (CJK-safe)
          const headline = t.text || '';
          ctx.font = '600 34px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.textBaseline = 'alphabetic';
          const maxWidth = W - 96;
          const lineHeight = 56;
          let line = '';
          let y = 200;
          for (let i = 0; i < headline.length; i++) {
            const test = line + headline[i];
            if (ctx.measureText(test).width > maxWidth && line.length > 0) {
              ctx.fillText(line, 48, y);
              line = headline[i];
              y += lineHeight;
              if (y > H - 280) { line = line + '…'; break; }
            } else {
              line = test;
            }
          }
          if (line) ctx.fillText(line, 48, y);

          // divider
          ctx.strokeStyle = 'rgba(200, 220, 255, 0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(48, H - 220);
          ctx.lineTo(W - 48, H - 220);
          ctx.stroke();

          // summary preview (small, gray)
          ctx.font = '300 22px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(220, 230, 255, 0.55)';
          const summary = view.summary || '';
          let sline = '';
          let sy = H - 178;
          for (let i = 0; i < summary.length; i++) {
            const test = sline + summary[i];
            if (ctx.measureText(test).width > maxWidth && sline.length > 0) {
              ctx.fillText(sline, 48, sy);
              sline = summary[i];
              sy += 36;
              if (sy > H - 110) { sline = sline + '…'; break; }
            } else {
              sline = test;
            }
          }
          if (sline) ctx.fillText(sline, 48, sy);

          // footer
          ctx.font = '600 22px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(180, 220, 255, 0.78)';
          ctx.textAlign = 'left';
          ctx.fillText('🌸 倾听 · 沟通秘书', 48, H - 56);

          ctx.font = '400 18px -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
          ctx.textAlign = 'right';
          ctx.fillText(record ? formatDate(record.createdAt) : '', W - 48, H - 56);

          // export
          const file = await new Promise<string>((resolve, reject) => {
            (Taro as any).canvasToTempFilePath({
              canvas: node,
              x: 0,
              y: 0,
              width: W,
              height: H,
              destWidth: W * dpr,
              destHeight: H * dpr,
              success: (r: any) => resolve(r.tempFilePath),
              fail: (e: any) => reject(e),
            });
          });

          // save → album with permission flow
          try {
            await Taro.saveImageToPhotosAlbum({ filePath: file });
            Taro.hideLoading();
            Taro.showToast({ title: '海报已保存到相册', icon: 'success', duration: 1800 });
          } catch (e: any) {
            Taro.hideLoading();
            const msg = e?.errMsg || '';
            if (msg.includes('auth deny') || msg.includes('cancel')) {
              const r = await Taro.showModal({
                title: '需要相册权限',
                content: '保存海报需要你授权写入相册',
                confirmText: '去开启',
              });
              if (r.confirm) Taro.openSetting();
            } else {
              Taro.showToast({ title: '保存失败，可截图分享', icon: 'none', duration: 1800 });
            }
          }
        } catch (e) {
          console.error('poster gen failed', e);
          Taro.hideLoading();
          Taro.showToast({ title: '生成失败，可截图分享', icon: 'none' });
        } finally {
          setPosterBusy(false);
        }
      });
  };

  const fbToast = (msg: string) => Taro.showToast({ title: msg, icon: 'none' });

  if (missing) {
    return (
      <View className="rp-root">
        <Image className="rp-bg" src={bgImage} mode="aspectFill" />
        <View className="rp-frost" />
        <View className="rp-header">
          <View className="rp-back" onClick={goBack} hoverClass="rp-back--hover">
            <Image className="rp-back-icon" src={iconBack} mode="aspectFit" />
            <Text className="rp-back-text">返回</Text>
          </View>
          <View className="rp-title-wrap">
            <Text className="rp-nav-title">复盘报告</Text>
          </View>
          <View className="rp-header-spacer" />
        </View>
        <View className="rp-missing">
          <Text className="rp-missing-text">还没有复盘报告，先去和小听聊聊吧。</Text>
        </View>
      </View>
    );
  }

  const t = view.translations[activeTrans];

  return (
    <View className="rp-root">
      <Image className="rp-bg" src={bgImage} mode="aspectFill" />
      <View className="rp-vignette-main" />
      <View className="rp-vignette-top" />
      <View className="rp-vignette-bottom" />
      <View className="rp-blob rp-blob-1" />
      <View className="rp-blob rp-blob-2" />

      {/* Header */}
      <View className="rp-header">
        <View className="rp-back" onClick={goBack} hoverClass="rp-back--hover">
          <Image className="rp-back-icon" src={iconBack} mode="aspectFit" />
          <Text className="rp-back-text">返回</Text>
        </View>
        <View className="rp-title-wrap">
          <Text className="rp-nav-title">复盘报告</Text>
          <Text className="rp-nav-date">{record ? formatDate(record.createdAt) : ''}</Text>
        </View>
        <View className="rp-header-spacer" />
      </View>

      <View className="rp-divider" />

      <ScrollView className="rp-scroll" scrollY showScrollbar={false}>
        <View className="rp-body">
          {/* ── Summary banner ────────────────────────────── */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">本次倾诉概览</Text>
              <Text className="section-title">{view.title}</Text>
              <Text className="section-sub">{view.summary}</Text>

              <View className="score-list">
                {view.scores.map((s) => (
                  <View key={s.label} className="score-row">
                    <Text className="score-label">{s.label}</Text>
                    <View className="score-track">
                      <View
                        className="score-fill"
                        style={{ width: `${s.value}%`, background: s.color }}
                      />
                    </View>
                    <Text className="score-num" style={{ color: s.color }}>{s.value}</Text>
                  </View>
                ))}
              </View>

              <View className="chip-row">
                {view.emotionTags.map((tag) => (
                  <View key={tag} className="chip"><Text className="chip-text">{tag}</Text></View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Misunderstandings ─────────────────────────── */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">你们可能存在的误解</Text>
              <Text className="section-title">AI 识别到的认知偏差</Text>

              <View className="mu-list">
                {view.misunderstandings.map((m, i) => (
                  <View
                    key={i}
                    className="mu-item"
                    style={{ background: m.bg, borderColor: m.border }}
                  >
                    <View className="mu-row">
                      <Text className="mu-tag">误解</Text>
                      <Text className="mu-you">{m.you}</Text>
                    </View>
                    <View className="mu-arrow">
                      <View className="mu-line" style={{ background: m.border }} />
                      <Text className="mu-arrow-text">↓ 真相</Text>
                    </View>
                    <View className="mu-row">
                      <Text className="mu-tag mu-tag-real" style={{ color: m.color }}>实际</Text>
                      <Text className="mu-real" style={{ color: m.color }}>{m.reality}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Translation tabs ──────────────────────────── */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">高情商翻译</Text>
              <Text className="section-title">让 AI 帮你换种说法</Text>

              <View className="trans-tabs">
                {TRANS_TABS.map((tab) => {
                  const isA = tab === activeTrans;
                  return (
                    <View
                      key={tab}
                      className={`trans-tab ${isA ? 'is-active' : ''}`}
                      onClick={() => setActiveTrans(tab)}
                      hoverClass="trans-tab--hover"
                    >
                      <Text className={`trans-tab-emoji ${isA ? 'is-active' : ''}`}>
                        {view.translations[tab].emoji}
                      </Text>
                      <Text className={`trans-tab-label ${isA ? 'is-active' : ''}`}>{tab}</Text>
                    </View>
                  );
                })}
              </View>

              <View className="trans-card">
                <View className="trans-tone-row">
                  <Text className="trans-tone-emoji">{t.emoji}</Text>
                  <Text className="trans-tone-label">{t.tone}</Text>
                </View>
                <Text className="trans-text">{t.text}</Text>
              </View>

              <View className="trans-copy-btn" onClick={() => copyTranslation(t.text)} hoverClass="trans-copy-btn--hover">
                <Text className="trans-copy-text">一键复制</Text>
              </View>

              <View className="fb-row">
                {[
                  { emoji: '👍', label: '有帮助', msg: '感谢反馈 🌸' },
                  { emoji: '👎', label: '不太准', msg: '已记录' },
                  { emoji: '🔄', label: '换一句', msg: '重新生成中…' },
                ].map((f) => (
                  <View key={f.label} className="fb-btn" onClick={() => fbToast(f.msg)} hoverClass="fb-btn--hover">
                    <Text className="fb-emoji">{f.emoji}</Text>
                    <Text className="fb-label">{f.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ── User-input AI translate ───────────────────── */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">翻译你想说的话</Text>
              <Text className="section-title">AI 帮你换种说法</Text>
              <Text className="section-sub">把气话、抱怨、讲不出口的话写下来，AI 给你三种说法。</Text>

              <View className="ti-input-wrap">
                <Textarea
                  className="ti-input"
                  value={transInput}
                  onInput={(e) => setTransInput(e.detail.value)}
                  placeholder="例如：你又一声不吭，我已经第三次了…"
                  maxlength={300}
                  showConfirmBar={false}
                  adjustPosition
                />
                <Text className="ti-counter">{transInput.length}/300</Text>
              </View>

              <View
                className={`ti-btn ${translating ? 'is-disabled' : ''}`}
                onClick={runTranslate}
                hoverClass={translating ? '' : 'ti-btn--hover'}
              >
                <Text className="ti-btn-text">
                  {translating ? '翻译中…' : '✨ 用 AI 帮我说'}
                </Text>
              </View>

              {aiTrans && (
                <View className="ti-result">
                  <View className="trans-tabs">
                    {TRANS_TABS.map((tab) => {
                      const isA = tab === activeAiTrans;
                      return (
                        <View
                          key={tab}
                          className={`trans-tab ${isA ? 'is-active' : ''}`}
                          onClick={() => setActiveAiTrans(tab)}
                          hoverClass="trans-tab--hover"
                        >
                          <Text className={`trans-tab-emoji ${isA ? 'is-active' : ''}`}>
                            {TRANS_STYLE[tab].emoji}
                          </Text>
                          <Text className={`trans-tab-label ${isA ? 'is-active' : ''}`}>{tab}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View className="trans-card">
                    <View className="trans-tone-row">
                      <Text className="trans-tone-emoji">{TRANS_STYLE[activeAiTrans].emoji}</Text>
                      <Text className="trans-tone-label">{TRANS_STYLE[activeAiTrans].tone}</Text>
                    </View>
                    <Text className="trans-text">{aiTrans[activeAiTrans] || '（AI 没给出这一档，点上方按钮再试一次）'}</Text>
                  </View>

                  <View
                    className="trans-copy-btn"
                    onClick={() => copyTranslation(aiTrans[activeAiTrans])}
                    hoverClass="trans-copy-btn--hover"
                  >
                    <Text className="trans-copy-text">一键复制</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ── Radar chart ───────────────────────────────── */}
          <View className="card">
            <View className="card-pad">
              <Text className="section-label">本次沟通雷达图</Text>
              <Text className="section-title">五维情感能力分析</Text>
              <Text className="section-sub">基于本次对话语义模型生成</Text>

              <View className="radar-wrap">
                <Canvas
                  type="2d"
                  id={CANVAS_ID}
                  canvasId={CANVAS_ID}
                  className="radar-canvas"
                />
              </View>

              <View className="radar-mini-row">
                {view.radar.map((d) => (
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

              <View className={`radar-warn radar-warn-${radarHighlight.tone}`}>
                <Text className="radar-warn-emoji">{radarHighlight.emoji}</Text>
                <Text className="radar-warn-text">{radarHighlight.text}</Text>
              </View>
            </View>
          </View>

          {/* ── AI Insights ───────────────────────────────── */}
          <View className="card">
            <View className="card-pad">
              <View className="insight-head">
                <View className="insight-head-icon"><Text className="insight-head-icon-emoji">🧠</Text></View>
                <View className="insight-head-text">
                  <Text className="section-label">AI 深度解读</Text>
                  <Text className="section-title">核心矛盾与深层动机</Text>
                </View>
              </View>

              <View className="insight-list">
                {view.insightCards.map((ins, i) => {
                  const open = expanded.has(i);
                  return (
                    <View
                      key={ins.label}
                      className="insight-item"
                      style={{ background: ins.bg, borderColor: ins.border }}
                      onClick={() => toggleExpanded(i)}
                    >
                      <View className="insight-row">
                        <Text className="insight-emoji">{ins.emoji}</Text>
                        <View className="insight-text">
                          <Text className="insight-label">{ins.label}</Text>
                          <Text className="insight-headline" style={{ color: ins.color }}>{ins.headline}</Text>
                        </View>
                        <Text className={`insight-chev ${open ? 'is-open' : ''}`}>⌄</Text>
                      </View>
                      {open && (
                        <View className="insight-desc-wrap">
                          <Text className="insight-desc">{ins.desc}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View className="ai-disclaimer">
                <View className="ai-dot" />
                <Text className="ai-disclaimer-text">以上分析由 AI 生成，仅供参考，不替代专业心理咨询。</Text>
              </View>
            </View>
          </View>

          {/* Continue chatting — fork the original conversation into a
              fresh chat. The current report stays in history untouched. */}
          {Array.isArray(record?.conversation) && record!.conversation!.length > 0 && (
            <View
              className="continue-btn"
              onClick={continueConversation}
              hoverClass="continue-btn--hover"
            >
              <Text className="continue-btn-emoji">💬</Text>
              <Text className="continue-btn-text">继续这段对话</Text>
            </View>
          )}

          {/* ── Generate poster ───────────────────────────── */}
          <View
            className={`poster-btn ${posterBusy ? 'is-busy' : ''}`}
            onClick={sharePoster}
            hoverClass={posterBusy ? '' : 'poster-btn--hover'}
          >
            <Text className="poster-btn-emoji">✨</Text>
            <Text className="poster-btn-text">{posterBusy ? '生成中…' : '生成分享海报'}</Text>
          </View>

          <View className="rp-foot-space" />
        </View>
      </ScrollView>

      {/* Off-screen canvas for poster rendering. Positioned outside the
       * viewport so it doesn't interfere with layout but can still be drawn
       * onto and exported via canvasToTempFilePath. */}
      <View className="poster-canvas-wrap">
        <Canvas
          type="2d"
          id={POSTER_CANVAS_ID}
          canvasId={POSTER_CANVAS_ID}
          className="poster-canvas"
        />
      </View>
    </View>
  );
}
