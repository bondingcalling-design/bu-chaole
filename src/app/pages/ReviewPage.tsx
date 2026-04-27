import { useState } from "react";
import { ChevronRight, Brain, FileText, Clock, CheckCheck, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { Headphones, TreePine, BarChart2, User } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ReferenceDot,
  ResponsiveContainer,
} from "recharts";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.13)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "0.5px solid rgba(255,255,255,0.26)",
} as const;

const glassMid = {
  background: "rgba(255,255,255,0.09)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

const glassInner = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "0.5px solid rgba(255,255,255,0.15)",
} as const;

// ─── Chart data ───────────────────────────────────────────────────────────────
const WEEKLY_DATA = [
  { day: "周一", score: 64 },
  { day: "周二", score: 48 },
  { day: "周三", score: 80 },
  { day: "周四", score: 55 },
  { day: "周五", score: 72 },
  { day: "周六", score: 91 },
  { day: "周日", score: 60 },
];

const HEARTBEAT_DATA = [
  { time: "8:00", you: 58, partner: 52 },
  { time: "10:00", you: 70, partner: 44 },
  { time: "12:00", you: 62, partner: 66 },
  { time: "14:00", you: 38, partner: 82 },
  { time: "16:00", you: 29, partner: 88 },
  { time: "18:00", you: 54, partner: 62 },
  { time: "20:00", you: 76, partner: 70 },
];

// ─── Radar data ───────────────────────────────────────────────────────────────
const RADAR_DATA = [
  { subject: "共情", value: 42, color: "rgba(160,210,255,0.95)", fill: "rgba(140,190,255,0.18)" },
  { subject: "攻击", value: 78, color: "rgba(255,140,130,0.95)", fill: "rgba(255,130,120,0.18)" },
  { subject: "防御", value: 65, color: "rgba(255,210,130,0.95)", fill: "rgba(255,200,110,0.18)" },
  { subject: "逻辑", value: 30, color: "rgba(200,175,255,0.95)", fill: "rgba(190,165,255,0.18)" },
  { subject: "倾听", value: 20, color: "rgba(140,235,200,0.95)", fill: "rgba(120,220,185,0.18)" },
];

// ─── Translation tabs ─────────────────────────────────────────────────────────
const TRANS_TABS = ["温柔", "理性", "直白"] as const;
type TransTab = (typeof TRANS_TABS)[number];
const TRANSLATIONS: Record<TransTab, string> = {
  温柔: "我很重视我们的约定，迟到让我觉得被忽略，下次能提前说吗？",
  理性: "你这次迟到影响了我们的计划。如果有变动，提前沟通会让双方都更好。",
  直白: "你又迟到了，这让我很失望。我需要你把我们的约定当回事。",
};

// ─── Nav ──────────────────────────────────────────────────────────────────────
const TABS_NAV = [
  { label: "倾听", icon: Headphones, path: "/" },
  { label: "树洞", icon: TreePine, path: "/treehouse" },
  { label: "复盘", icon: BarChart2, path: "/review" },
  { label: "我的", icon: User, path: "/profile" },
];

// ─── Floating Tab Bar ─────────────────────────────────────────────────────────
function FloatingTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="shrink-0 flex justify-center px-4 pb-5 pt-1">
      <div className="flex items-center w-full px-3 py-2.5 rounded-[28px]" style={{
        ...glassMid,
        boxShadow: "0 8px 40px rgba(40,70,140,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}>
        {TABS_NAV.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
              <div className="w-10 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: active ? "rgba(160,210,255,0.18)" : "transparent" }}>
                <Icon size={19} strokeWidth={active ? 2.2 : 1.7}
                  color={active ? "rgba(180,220,255,0.95)" : "rgba(255,255,255,0.32)"} />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? "rgba(180,220,255,0.90)" : "rgba(255,255,255,0.30)", letterSpacing: "0.3px" }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{
      ...glass,
      boxShadow: "0 10px 48px rgba(60,90,160,0.13), inset 0 1.5px 0 rgba(255,255,255,0.26)",
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.65)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </p>
  );
}

// ─── 1. Weekly Trend Bar Chart ───────────────────────────────────────────────
function WeeklyTrendCard() {
  const CustomBar = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const isTop = value === Math.max(...WEEKLY_DATA.map(d => d.score));
    return (
      <g key={`custom-bar-${index}`}>
        <rect
          x={x} y={y} width={width} height={height}
          rx={5} ry={5}
          fill={isTop ? "rgba(180,220,255,0.82)" : "rgba(160,205,255,0.48)"}
        />
        {isTop && (
          <rect x={x} y={y} width={width} height={4} rx={2}
            fill="rgba(220,240,255,0.95)" />
        )}
      </g>
    );
  };

  return (
    <Card>
      <div className="px-5 pt-5 pb-5">
        <SectionLabel>每周情感趋势</SectionLabel>
        <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)", marginBottom: 16 }}>
          沟通融洽度 · 本周
        </p>
        <div style={{ height: 130, width: "100%" }}>
          <BarChart width={350} height={130} data={WEEKLY_DATA} barCategoryGap="28%" margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10.5 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10 }}
              axisLine={false} tickLine={false} tickCount={3}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,35,70,0.88)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                borderRadius: 12,
                color: "rgba(255,255,255,0.88)",
                fontSize: 12,
                backdropFilter: "blur(20px)",
              }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(v: number) => [`${v} 分`, "融洽度"]}
            />
            <Bar key="bar-score" dataKey="score" shape={CustomBar} />
          </BarChart>
        </div>
        {/* Summary row */}
        <div className="flex gap-3 mt-4">
          {[
            { label: "平均", value: "67", color: "rgba(180,210,255,0.9)" },
            { label: "最高", value: "91", color: "rgba(140,235,200,0.9)" },
            { label: "趋势", value: "↗ 好转", color: "rgba(160,235,190,0.85)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl px-3 py-2.5" style={{ ...glassInner }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color, marginTop: 2 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── 2. Emotion Heartbeat Chart ───────────────────────────────────────────────
function HeartbeatCard() {
  // Custom dot: show 🔥 at conflict peak (index 4, highest partner value)
  const FireDot = (props: any) => {
    const { cx, cy, index, key } = props;
    if (index === 4) {
      return (
        <g key={key || `fire-${index}`}>
          <text x={cx} y={cy - 16} textAnchor="middle" fontSize={14}>🔥</text>
          <circle cx={cx} cy={cy} r={5} fill="rgba(255,140,110,0.95)" stroke="rgba(255,180,160,0.6)" strokeWidth={1.5} />
        </g>
      );
    }
    return <circle key={key || `dot-${index}`} cx={cx} cy={cy} r={3} fill="rgba(200,175,255,0.85)" />;
  };

  const YouDot = (props: any) => {
    const { cx, cy, index, key } = props;
    return <circle key={key || `you-${index}`} cx={cx} cy={cy} r={2.5} fill="rgba(160,210,255,0.85)" />;
  };

  return (
    <Card>
      <div className="px-5 pt-5 pb-5">
        <SectionLabel>情绪心跳图</SectionLabel>
        <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>
          今日情绪波动
        </p>
        {/* Legend */}
        <div className="flex gap-4 mb-4">
          {[
            { color: "rgba(160,210,255,0.9)", label: "你" },
            { color: "rgba(200,175,255,0.9)", label: "对方" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded-full" style={{ background: color }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>冲突峰值</span>
          </div>
        </div>
        <div style={{ height: 140, width: "100%" }}>
          <LineChart width={350} height={140} data={HEARTBEAT_DATA} margin={{ top: 16, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} tickCount={3} />
            <Tooltip
              contentStyle={{
                background: "rgba(20,35,70,0.88)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                borderRadius: 12,
                color: "rgba(255,255,255,0.88)",
                fontSize: 12,
                backdropFilter: "blur(20px)",
              }}
              cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
            />
            <Line
              key="line-you"
              name="you"
              type="monotone" dataKey="you"
              stroke="rgba(160,210,255,0.82)" strokeWidth={2}
              dot={YouDot} activeDot={{ r: 5, fill: "rgba(180,225,255,0.9)" }}
            />
            <Line
              key="line-partner"
              name="partner"
              type="monotone" dataKey="partner"
              stroke="rgba(200,175,255,0.82)" strokeWidth={2}
              dot={FireDot} activeDot={{ r: 5, fill: "rgba(210,190,255,0.9)" }}
            />
          </LineChart>
        </div>
        {/* Conflict annotation */}
        <div className="mt-3 px-3 py-2.5 rounded-2xl flex items-center gap-2" style={{
          background: "rgba(255,100,80,0.08)",
          border: "0.5px solid rgba(255,120,100,0.22)",
        }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <p style={{ fontSize: 12, color: "rgba(255,160,140,0.88)", fontWeight: 400 }}>
            16:00 情绪张力达到峰值 — AI 建议暂停10分钟
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── 3. AI Translation Card ───────────────────────────────────────────────────
function TranslationCard() {
  const [active, setActive] = useState<TransTab>("温柔");
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard?.writeText(TRANSLATIONS[active]).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
        <SectionLabel>高情商翻译</SectionLabel>

        {/* Segmented pills */}
        <div className="flex p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.14)" }}>
          {TRANS_TABS.map((tab) => {
            const isActive = tab === active;
            return (
              <motion.button
                key={tab}
                onClick={() => setActive(tab)}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-2 rounded-xl transition-all"
                style={{
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#1A2840" : "rgba(255,255,255,0.50)",
                  background: isActive ? "rgba(255,255,255,0.96)" : "transparent",
                  boxShadow: isActive ? "0 2px 14px rgba(60,100,180,0.18)" : "none",
                }}
              >
                {tab}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            onUpdate={() => {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="px-4 py-4 rounded-2xl"
            style={{ ...glassInner }}
          >
            <p style={{ fontSize: 16, lineHeight: "1.9", color: "rgba(255,255,255,0.92)", fontWeight: 300, letterSpacing: "0.2px" }}>
              {TRANSLATIONS[active]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl"
            style={{
              background: copied ? "rgba(100,210,160,0.9)" : "rgba(255,255,255,0.96)",
              color: copied ? "#fff" : "#1A2840",
              fontWeight: 700, fontSize: 14,
              boxShadow: copied ? "0 6px 28px rgba(80,200,140,0.4)" : "0 6px 28px rgba(60,90,160,0.18)",
            }}
          >
            {copied ? <CheckCheck size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2.2} />}
            <span>{copied ? "已复制！" : "一键复制发给Ta"}</span>
          </motion.button>
          {[
            { key: "up", emoji: "👍", isActive: liked === "up", tap: () => setLiked(liked === "up" ? null : "up") },
            { key: "down", emoji: "👎", isActive: liked === "down", tap: () => setLiked(liked === "down" ? null : "down") },
            { key: "refresh", emoji: "🔄", isActive: false, tap: () => {} },
          ].map(({ key, emoji, isActive, tap }) => (
            <motion.button
              key={key} onClick={tap}
              whileTap={{ scale: 0.8, rotate: key === "refresh" ? 180 : 0 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: isActive ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.09)",
                border: `0.5px solid ${isActive ? "rgba(255,255,255,0.40)" : "rgba(255,255,255,0.16)"}`,
                fontSize: 17,
              }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── 4. Depth Insight Card ────────────────────────────────────────────────────
function DepthInsightCard() {
  const insights = [
    { icon: "🧠", label: "回避型依恋", desc: "Ta用沉默保护自己的心理边界", color: "rgba(200,175,255,0.9)" },
    { icon: "🛡️", label: "防御性沟通", desc: "转移话题是 Ta 处理压力的方式", color: "rgba(160,210,255,0.9)" },
    { icon: "❤️", label: "渴望被理解", desc: "内心深处极度需要你的接纳", color: "rgba(255,180,200,0.9)" },
  ];

  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,175,255,0.14)", border: "0.5px solid rgba(200,175,255,0.25)" }}>
            <Brain size={16} color="rgba(200,175,255,0.9)" strokeWidth={1.8} />
          </div>
          <div>
            <SectionLabel>深度心理分析</SectionLabel>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>
              潜意识动机解码
            </p>
          </div>
        </div>

        {/* Main text block */}
        <div className="px-4 py-4 rounded-2xl" style={{ ...glassInner }}>
          <p style={{ fontSize: 14, lineHeight: "1.85", color: "rgba(255,255,255,0.80)", fontWeight: 300 }}>
            根据对话模式分析，Ta 展现出典型的
            <span style={{ fontWeight: 600, color: "rgba(200,175,255,1)" }}>回避型依恋</span>
            特征。当冲突升级时，Ta 的本能反应是退缩与沉默——这并非不在意，而是一种
            <span style={{ fontWeight: 600, color: "rgba(160,210,255,1)" }}>自我保护机制</span>。
          </p>
        </div>

        {/* Insight chips */}
        {insights.map(({ icon, label, desc, color }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ ...glassInner }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color }}>{label}</p>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.40)", marginTop: 1.5 }}>{desc}</p>
            </div>
            <ChevronRight size={13} color="rgba(255,255,255,0.20)" strokeWidth={2} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── 5. Radar Chart Card ──────────────────────────────────────────────────────
function RadarSVG() {
  const SIZE = 230;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = 76;
  const labelOffset = 22;
  const levels = 4;
  const n = RADAR_DATA.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });
  const polyPts = (r: number) =>
    Array.from({ length: n }, (_, i) => { const { x, y } = pt(i, r); return `${x},${y}`; }).join(" ");

  const dataPoints = RADAR_DATA.map((d, i) => pt(i, (d.value / 100) * radius));
  const dataPoly = dataPoints.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible", display: "block" }}>
      <circle cx={cx} cy={cy} r={radius * 0.55} fill="rgba(180,210,255,0.04)" />
      {Array.from({ length: levels }, (_, lvl) => (
        <polygon key={`ring-${lvl}`} points={polyPts((radius / levels) * (lvl + 1))}
          fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
      ))}
      {RADAR_DATA.map((_, i) => {
        const { x, y } = pt(i, radius);
        return <line key={`spoke-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />;
      })}
      <polygon points={dataPoly} fill="rgba(180,215,255,0.12)" stroke="rgba(200,230,255,0.70)" strokeWidth={1.8} strokeLinejoin="round" />
      {dataPoints.map(({ x, y }, i) => (
        <g key={`dot-${i}`}>
          <circle cx={x} cy={y} r={7} fill={RADAR_DATA[i].fill} />
          <circle cx={x} cy={y} r={3.5} fill={RADAR_DATA[i].color} />
          <circle cx={x} cy={y} r={5.5} fill="none" stroke={RADAR_DATA[i].color} strokeWidth={0.8} strokeOpacity={0.4} />
        </g>
      ))}
      {RADAR_DATA.map((d, i) => {
        const { x, y } = pt(i, radius + labelOffset);
        return (
          <text key={`lbl-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fill={d.color} fontSize={12} fontWeight={700}>{d.subject}</text>
        );
      })}
    </svg>
  );
}

function RadarCard({ isPro = true }: { isPro?: boolean }) {
  return (
    <Card>
      <div className="px-5 pt-5 pb-6 flex flex-col">
        <SectionLabel>沟通风格雷达 {!isPro && <span style={{ fontSize: 14, marginLeft: 6 }}>🔒</span>}</SectionLabel>
        <p style={{ fontSize: 15, fontWeight: 500, color: isPro ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.48)", marginBottom: 16 }}>
          {isPro ? "五维情感能力分析" : "专业版功能"}
        </p>
        <div className="flex justify-center" style={{ padding: "12px 20px 8px" }}>
          <RadarSVG />
        </div>
        {/* Legend bars */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          {RADAR_DATA.map(({ subject, value, color }) => (
            <div key={subject} className="flex flex-col items-center gap-1.5">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.10)" }}>
                <motion.div
                  onUpdate={() => {}}
                  initial={{ width: 0 }} animate={{ width: `${value}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
                  className="h-full rounded-full" style={{ background: color }}
                />
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.36)" }}>{subject}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center w-full min-h-screen" style={{ background: "#0E1520" }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: "0 48px 120px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.09)",
        }}
      >
        {/* ── Snowy forest dawn bg ────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.66) saturate(1.07) hue-rotate(5deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(16,28,58,0.58) 0%, rgba(24,40,80,0.10) 30%, transparent 55%, rgba(14,22,46,0.20) 72%, rgba(10,16,36,0.74) 100%)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 150, background: "linear-gradient(to bottom, rgba(12,18,40,0.66) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 220, background: "linear-gradient(to top, rgba(10,16,36,0.75) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "8%", left: "15%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,200,255,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "25%", right: "-5%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,220,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between px-5 shrink-0 w-full" style={{ height: 88, paddingTop: 52 }}>
          <h1 style={{ fontSize: 24, fontWeight: 200, letterSpacing: "0.10em", color: "rgba(255,255,255,0.95)", textShadow: "0 2px 24px rgba(60,100,200,0.35)" }}>
            沟通复盘
          </h1>
          <div style={{ width: 88, height: 32 }} />
        </div>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto px-4 flex flex-col gap-4" style={{ scrollbarWidth: "none", paddingBottom: 92 }}>

          {/* Quick-entry to single conversation report - MOVED TO TOP */}
          <div
            className="rounded-3xl px-5 py-4 flex items-center gap-3"
            style={{
              ...glass,
              boxShadow: "0 10px 48px rgba(60,90,160,0.13), inset 0 1.5px 0 rgba(255,255,255,0.26)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(195,170,255,0.14)", border: "0.5px solid rgba(195,170,255,0.28)" }}>
              <FileText size={17} color="rgba(195,170,255,0.90)" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>他今天回家又是一言不发</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginTop: 2 }}>11月15日 · 20 分钟 · 查看完整复盘报告</p>
            </div>
            <button
              onClick={() => navigate("/review/report")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(195,170,255,0.14)", border: "0.5px solid rgba(195,170,255,0.28)", fontSize: 12, color: "rgba(195,170,255,0.90)", fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap" }}
            >
              查看报告
              <ChevronRight size={12} strokeWidth={2} color="rgba(195,170,255,0.70)" />
            </button>
          </div>

          {/* History entry */}
          <button
            onClick={() => navigate("/review/history")}
            className="rounded-3xl px-5 py-3.5 flex items-center gap-3 w-full text-left"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "0.5px solid rgba(255,255,255,0.13)",
              boxShadow: "0 6px 32px rgba(60,90,160,0.09), inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(160,210,255,0.12)", border: "0.5px solid rgba(160,210,255,0.24)" }}>
              <Clock size={16} color="rgba(160,210,255,0.88)" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.80)" }}>查看全部对话历史</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 1.5 }}>共 23 次记录 · 最近：11月15日</p>
            </div>
            <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
          </button>

          <WeeklyTrendCard />
          <HeartbeatCard />
          <DepthInsightCard />
          <RadarCard />
        </div>

        {/* ── Floating tab bar ─────────────────────────────────────── */}
        <FloatingTabBar />
      </div>
    </div>
  );
}