import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, ChevronRight, Search, SlidersHorizontal,
  Headphones, TreePine, BarChart2, User, MessageCircle, Mic,
} from "lucide-react";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

const glassInner = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "0.5px solid rgba(255,255,255,0.14)",
} as const;

// ─── Nav ──────────────────────────────────────────────────────────────────────
const TABS_NAV = [
  { label: "倾听", icon: Headphones, path: "/" },
  { label: "树洞", icon: TreePine, path: "/treehouse" },
  { label: "复盘", icon: BarChart2, path: "/review" },
  { label: "我的", icon: User, path: "/profile" },
];

// ─── Sample conversation data ─────────────────────────────────────────────────
interface ConversationItem {
  id: string;
  date: string;
  weekday: string;
  title: string;
  preview: string;
  duration: string;
  mode: "text" | "voice";
  score: number;
  scoreLabel: string;
  scoreColor: string;
  tags: string[];
}

const CONVERSATIONS: ConversationItem[] = [
  {
    id: "c1",
    date: "11月15日",
    weekday: "周五",
    title: "他今天回家又是一言不发",
    preview: "AI 识别出回避型沟通模式，建议给对方5分钟独处空间…",
    duration: "20分钟",
    mode: "text",
    score: 72,
    scoreLabel: "中等张力",
    scoreColor: "rgba(255,210,130,0.90)",
    tags: ["回避型", "沉默", "防御"],
  },
  {
    id: "c2",
    date: "11月12日",
    weekday: "周二",
    title: "我们为钱的事吵了一架",
    preview: "双方情绪峰值出现在18:30，AI 检测到高攻击性语言…",
    duration: "35分钟",
    mode: "voice",
    score: 34,
    scoreLabel: "高度紧张",
    scoreColor: "rgba(255,140,120,0.90)",
    tags: ["财务", "攻击性", "权力"],
  },
  {
    id: "c3",
    date: "11月8日",
    weekday: "周六",
    title: "终于好好聊了一次未来规划",
    preview: "本次对话共情指数达到历史最高值，双方积极倾听…",
    duration: "48分钟",
    mode: "text",
    score: 91,
    scoreLabel: "高度融洽",
    scoreColor: "rgba(140,235,200,0.90)",
    tags: ["未来", "共情", "规划"],
  },
  {
    id: "c4",
    date: "11月5日",
    weekday: "周二",
    title: "关于他妈妈的事情",
    preview: "涉及原生家庭的对话，AI 检测出代际创伤的影响模式…",
    duration: "27分钟",
    mode: "voice",
    score: 55,
    scoreLabel: "轻度紧张",
    scoreColor: "rgba(255,210,130,0.90)",
    tags: ["家庭", "边界", "原生"],
  },
  {
    id: "c5",
    date: "10月30日",
    weekday: "周三",
    title: "他说要去出差两周",
    preview: "分离焦虑指数偏高，AI 提供了5个缓解焦虑的沟通策略…",
    duration: "15分钟",
    mode: "text",
    score: 62,
    scoreLabel: "轻度紧张",
    scoreColor: "rgba(255,210,130,0.90)",
    tags: ["分离", "焦虑", "依恋"],
  },
  {
    id: "c6",
    date: "10月22日",
    weekday: "周一",
    title: "我感觉越来越累了",
    preview: "情感疲惫信号较为明显，AI 建议关注个人情感能量…",
    duration: "42分钟",
    mode: "text",
    score: 28,
    scoreLabel: "高度紧张",
    scoreColor: "rgba(255,140,120,0.90)",
    tags: ["疲惫", "自我", "边界"],
  },
];

// ─── Month groups ─────────────────────────────────────────────────────────────
const MONTH_GROUPS = [
  { month: "2024年11月", ids: ["c1", "c2", "c3", "c4", "c5"] },
  { month: "2024年10月", ids: ["c6"] },
];

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
      <circle
        cx="20" cy="20" r={r} fill="none" stroke={color}
        strokeWidth="2.5"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}


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
          const active = location.pathname === path || (path === "/review" && location.pathname.startsWith("/review"));
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

// ─── Filter chips ─────────────────────────────────────────────────────────────
const FILTERS = ["全部", "高融洽", "轻度紧张", "高张力"] as const;
type Filter = (typeof FILTERS)[number];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("全部");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = CONVERSATIONS.filter((c) => {
    const matchSearch = !search || c.title.includes(search) || c.tags.some(t => t.includes(search));
    const matchFilter =
      activeFilter === "全部" ? true
      : activeFilter === "高融洽" ? c.score >= 80
      : activeFilter === "高张力" ? c.score < 40
      : c.score >= 40 && c.score < 80;
    return matchSearch && matchFilter;
  });

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
        {/* ── Background ────────────────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.62) saturate(1.06) hue-rotate(5deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(16,28,58,0.60) 0%, rgba(24,40,80,0.10) 30%, transparent 55%, rgba(14,22,46,0.20) 72%, rgba(10,16,36,0.76) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 180, background: "linear-gradient(to bottom, rgba(12,18,40,0.70) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 240, background: "linear-gradient(to top, rgba(10,16,36,0.78) 0%, transparent 100%)" }} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative flex items-center shrink-0 w-full" style={{ height: 88, paddingTop: 52, paddingLeft: 16, paddingRight: 16 }}>
          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={() => navigate("/review")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.09)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "0.5px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.80)",
              fontSize: 13,
            }}
          >
            <ChevronLeft size={16} strokeWidth={1.8} color="rgba(255,255,255,0.80)" />
            复盘
          </motion.button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingRight: 88 + 16 }}>
            <h1 style={{ fontSize: 17, fontWeight: 400, color: "rgba(255,255,255,0.92)", letterSpacing: "0.14em", textShadow: "0 2px 16px rgba(60,100,200,0.35)" }}>
              对话历史
            </h1>
          </div>
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Search + Filter bar ───────────────────────────────────── */}
        <div className="px-4 mb-2 flex gap-2">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl" style={{ ...glassMid }}>
            <Search size={14} color="rgba(255,255,255,0.38)" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索对话..."
              className="flex-1 bg-transparent border-none outline-none"
              style={{ fontSize: 13.5, color: "rgba(255,255,255,0.80)", caretColor: "rgba(160,210,255,0.90)" }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{
              width: 44, height: 44,
              background: showFilter ? "rgba(160,210,255,0.18)" : glassMid.background,
              backdropFilter: glassMid.backdropFilter,
              WebkitBackdropFilter: glassMid.WebkitBackdropFilter,
              border: showFilter ? "0.5px solid rgba(160,210,255,0.40)" : glassMid.border,
            }}
          >
            <SlidersHorizontal size={16} color={showFilter ? "rgba(160,210,255,0.90)" : "rgba(255,255,255,0.50)"} strokeWidth={1.8} />
          </motion.button>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 mb-2 flex gap-2 overflow-hidden"
            >
              {FILTERS.map((f) => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveFilter(f)}
                  className="px-3.5 py-1.5 rounded-full"
                  style={{
                    background: activeFilter === f ? "rgba(160,210,255,0.20)" : "rgba(255,255,255,0.07)",
                    border: activeFilter === f ? "0.5px solid rgba(160,210,255,0.50)" : "0.5px solid rgba(255,255,255,0.13)",
                    fontSize: 12,
                    color: activeFilter === f ? "rgba(160,210,255,0.95)" : "rgba(255,255,255,0.50)",
                    fontWeight: activeFilter === f ? 600 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Conversation list ─────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto px-4 flex flex-col gap-1 pb-4" style={{ scrollbarWidth: "none" }}>

          {MONTH_GROUPS.map(({ month, ids }) => {
            const items = filtered.filter(c => ids.includes(c.id));
            if (items.length === 0) return null;
            return (
              <div key={month} className="flex flex-col gap-2">
                {/* Month label */}
                <div className="flex items-center gap-3 py-1 mt-1">
                  <div className="flex-1" style={{ height: "0.5px", background: "rgba(255,255,255,0.09)" }} />
                  <span style={{ fontSize: 11, color: "rgba(180,210,255,0.55)", fontWeight: 500, letterSpacing: "0.06em" }}>{month}</span>
                  <div className="flex-1" style={{ height: "0.5px", background: "rgba(255,255,255,0.09)" }} />
                </div>

                {items.map((c, idx) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: idx * 0.06 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => navigate("/review/report")}
                    className="w-full text-left rounded-3xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.09)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "0.5px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 6px 32px rgba(60,90,160,0.10), inset 0 1px 0 rgba(255,255,255,0.14)",
                    }}
                  >
                    <div className="flex items-start gap-3.5 px-4 py-4">
                      {/* Date block */}
                      <div className="flex flex-col items-center shrink-0" style={{ minWidth: 36 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>
                          {c.date.replace("月", "/").replace("日", "").split("/")[1]}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", marginTop: 1 }}>{c.weekday}</span>
                      </div>

                      {/* Divider */}
                      <div style={{ width: "0.5px", background: "rgba(255,255,255,0.10)", alignSelf: "stretch", flexShrink: 0 }} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Mode icon */}
                          <div className="w-4 h-4 flex items-center justify-center">
                            {c.mode === "voice"
                              ? <Mic size={12} color="rgba(200,175,255,0.70)" strokeWidth={1.8} />
                              : <MessageCircle size={12} color="rgba(160,210,255,0.70)" strokeWidth={1.8} />
                            }
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }} className="truncate">
                            {c.title}
                          </p>
                        </div>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.60 }} className="line-clamp-2">
                          {c.preview}
                        </p>
                        {/* Tags + duration */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          {c.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.44)" }}>
                              {tag}
                            </span>
                          ))}
                          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)" }}>· {c.duration}</span>
                        </div>
                      </div>

                      {/* Score ring + arrow */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <ScoreRing score={c.score} color={c.scoreColor} />
                        <span style={{ fontSize: 9.5, color: c.scoreColor, textAlign: "center", lineHeight: 1.3 }}>
                          {c.scoreLabel}
                        </span>
                      </div>
                    </div>

                    {/* Bottom stripe */}
                    <div className="flex items-center justify-between px-4 py-2.5 mx-0"
                      style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>{c.date} · 查看完整报告</span>
                      <ChevronRight size={12} color="rgba(255,255,255,0.22)" strokeWidth={2} />
                    </div>
                  </motion.button>
                ))}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span style={{ fontSize: 32 }}>🔍</span>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)" }}>没有找到相关对话</p>
            </div>
          )}

          {/* Stats summary */}
          {filtered.length > 0 && (
            <div className="mt-3 rounded-3xl px-5 py-4" style={{ ...glassInner }}>
              <p style={{ fontSize: 11, color: "rgba(180,210,255,0.55)", letterSpacing: "0.8px", marginBottom: 12, fontWeight: 600, textTransform: "uppercase" }}>
                历史统计
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "总对话", value: "23次", color: "rgba(160,210,255,0.90)" },
                  { label: "平均融洽度", value: "61分", color: "rgba(200,175,255,0.90)" },
                  { label: "本月对话", value: "5次", color: "rgba(140,235,200,0.90)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <p style={{ fontSize: 18, fontWeight: 700, color }}>{value}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", textAlign: "center" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 6 }} />
        </div>

        {/* ── Floating Tab Bar ──────────────────────────────────────── */}
        <FloatingTabBar />
      </div>
    </div>
  );
}