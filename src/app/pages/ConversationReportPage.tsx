import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Copy, CheckCheck,
  Brain, Flame, ShieldAlert, Lightbulb,
  Send, X, Share2, Download, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.13)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "0.5px solid rgba(255,255,255,0.26)",
} as const;

const glassInner = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "0.5px solid rgba(255,255,255,0.13)",
} as const;

// ─── Translation tabs ─────────────────────────────────────────────────────────
const TRANS_TABS = ["温柔", "理性", "直白"] as const;
type TransTab = (typeof TRANS_TABS)[number];

const TRANSLATIONS: Record<TransTab, { text: string; tone: string; emoji: string }> = {
  温柔: {
    text: "我今天感觉有点落寞，当你回家沉默的时候，我会不自觉地担心是不是我做了什么。能不能让我知道你还好吗？",
    tone: "温柔共情型",
    emoji: "🌸",
  },
  理性: {
    text: "你今天回家后持续沉默，这影响了我们的沟通效率。如果有什么事情，提前说明会让双方都更舒适，减少误解。",
    tone: "理性陈述型",
    emoji: "🎯",
  },
  直白: {
    text: "你又一声不吭，这让我很难受。我需要你告诉我发生了什么，而不是让我一个人猜。",
    tone: "直白表达型",
    emoji: "⚡️",
  },
};

// ─── Generate user-input translations ────────────────────────────────────────
function generateUserTranslations(input: string): Record<TransTab, { text: string; tone: string; emoji: string }> {
  return {
    温柔: {
      text: `我想轻声跟你说——${input} 我知道你也不容易，但这件事对我来说真的很重要，希望你能听到我的感受。`,
      tone: "温柔共情型",
      emoji: "🌸",
    },
    理性: {
      text: `关于这件事，我想和你理性地聊聊：${input} 坦诚沟通能帮我们找到双方都舒服的方式。`,
      tone: "理性陈述型",
      emoji: "🎯",
    },
    直白: {
      text: `${input} 我希望你直接告诉我你的想法，我也想让你知道我现在的状态。`,
      tone: "直白表达型",
      emoji: "⚡️",
    },
  };
}

// ─── Misunderstandings data ───────────────────────────────────────────────────
const MISUNDERSTANDINGS = [
  {
    you: "你以为Ta不想和你说话",
    reality: "其实Ta在压力下进入了自我关闭模式，和你无关",
    color: "rgba(160,210,255,1)",
    bg: "rgba(160,210,255,0.07)",
    border: "rgba(160,210,255,0.20)",
  },
  {
    you: "Ta以为你在责备和抱怨",
    reality: "其实你只是渴望连接感，需要被看见",
    color: "rgba(255,190,160,1)",
    bg: "rgba(255,160,130,0.07)",
    border: "rgba(255,160,130,0.20)",
  },
  {
    you: "你以为Ta冷漠、不在乎",
    reality: "其实Ta不知道如何在情绪低谷时表达关心",
    color: "rgba(195,170,255,1)",
    bg: "rgba(195,170,255,0.07)",
    border: "rgba(195,170,255,0.20)",
  },
];

// ─── Radar data ───────────────────────────────────────────────────────────────
const RADAR_DATA = [
  { subject: "共情", value: 35, color: "rgba(160,210,255,1)", glow: "rgba(160,210,255,0.5)" },
  { subject: "攻击", value: 72, color: "rgba(255,130,120,1)", glow: "rgba(255,130,120,0.5)" },
  { subject: "防御", value: 60, color: "rgba(255,205,120,1)", glow: "rgba(255,205,120,0.5)" },
  { subject: "逻辑", value: 28, color: "rgba(195,170,255,1)", glow: "rgba(195,170,255,0.5)" },
  { subject: "倾听", value: 18, color: "rgba(120,235,190,1)", glow: "rgba(120,235,190,0.5)" },
];

// ─── Insights data ────────────────────────────────────────────────────────────
const INSIGHTS = [
  {
    icon: Brain,
    emoji: "🧠",
    label: "核心矛盾",
    headline: "安全感 vs 个人空间",
    desc: "你对亲密感的需求 vs Ta 对独处空间的保护，形成了典型的「追—逃」模式。",
    color: "rgba(195,170,255,1)",
    bg: "rgba(195,170,255,0.08)",
    border: "rgba(195,170,255,0.22)",
  },
  {
    icon: ShieldAlert,
    emoji: "🛡️",
    label: "深层动机（你）",
    headline: "渴望被看见与确认",
    desc: "沉默触发了你的「被忽视」恐惧——这不是无理取闹，而是真实的依附需求。",
    color: "rgba(160,210,255,1)",
    bg: "rgba(160,210,255,0.08)",
    border: "rgba(160,210,255,0.22)",
  },
  {
    icon: Flame,
    emoji: "🔥",
    label: "深层动机（Ta）",
    headline: "用沉默处理内部压力",
    desc: "Ta 的沉默是一种自我调节行为，并非拒绝，而是典型的回避型应激反应。",
    color: "rgba(255,160,130,1)",
    bg: "rgba(255,130,100,0.08)",
    border: "rgba(255,130,100,0.22)",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    label: "破局建议",
    headline: "给彼此一个 20 分钟缓冲",
    desc: "回家后先给对方 20 分钟安静解压，再轻声询问「今天辛苦了」。空间才能换来靠近。",
    color: "rgba(255,215,100,1)",
    bg: "rgba(255,215,100,0.08)",
    border: "rgba(255,215,100,0.22)",
  },
];

// ─── Score Summary data ───────────────────────────────────────────────────────
const SCORES = [
  { label: "整体张力", value: 74, color: "rgba(255,140,120,0.9)", barColor: "rgba(255,140,120,0.8)" },
  { label: "沟通效率", value: 32, color: "rgba(160,210,255,0.9)", barColor: "rgba(160,210,255,0.8)" },
  { label: "情绪稳定", value: 48, color: "rgba(255,205,120,0.9)", barColor: "rgba(255,205,120,0.8)" },
  { label: "结局走向", value: 61, color: "rgba(120,235,190,0.9)", barColor: "rgba(120,235,190,0.8)" },
];


// ─── Card shell ───────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ ...glass, boxShadow: "0 10px 48px rgba(60,90,160,0.13), inset 0 1.5px 0 rgba(255,255,255,0.26)" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(180,210,255,0.60)", letterSpacing: "1.1px", textTransform: "uppercase", marginBottom: 4 }}>
      {children}
    </p>
  );
}

// ─── Fake QR Code SVG ────────────────────────────────────────────────────────
function FakeQRCode() {
  const cells = [
    [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1],
  ];
  const S = 6;
  return (
    <svg width={7*S} height={7*S} viewBox={`0 0 ${7*S} ${7*S}`}>
      {cells.map((row, r) =>
        row.map((c, col) =>
          c ? <rect key={`${r}-${col}`} x={col*S} y={r*S} width={S} height={S} rx={0.8} fill="rgba(20,40,90,0.90)" /> : null
        )
      )}
    </svg>
  );
}

// ─── WeChat Share Modal ───────────────────────────────────────────────────────
function WeChatShareModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(4,8,22,0.70)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col pb-8"
        style={{ borderRadius: "28px 28px 0 0", background: "rgba(14,22,52,0.97)", border: "0.5px solid rgba(255,255,255,0.14)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5 pb-4 pt-1">
          <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "0.05em" }}>分享到微信好友</p>
          <button onClick={onClose} className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.09)", border: "0.5px solid rgba(255,255,255,0.16)" }}>
            <X size={14} color="rgba(255,255,255,0.55)" strokeWidth={2} />
          </button>
        </div>

        {/* Card preview */}
        <div className="mx-5 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.14)" }}>
          <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: "rgba(7,193,96,0.18)", border: "0.5px solid rgba(7,193,96,0.30)", fontSize: 15 }}>💬</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.80)" }}>不吃了 · 情感助手</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)" }}>微信小程序</p>
            </div>
          </div>
          <div className="px-4 py-4 flex gap-3 items-start">
            <div className="flex-1 flex flex-col gap-2">
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 3 }}>AI 帮你说出口 ✨</p>
              {[0.92, 0.78, 0.60].map((w, i) => (
                <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "rgba(255,255,255,0.14)", borderRadius: 4, filter: "blur(2.5px)" }} />
              ))}
              <div style={{ marginTop: 6 }} />
              {[0.85, 0.65].map((w, i) => (
                <div key={i} style={{ height: 9, width: `${w * 100}%`, background: "rgba(255,255,255,0.09)", borderRadius: 4, filter: "blur(2.5px)" }} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="rounded-xl flex items-center justify-center p-2" style={{ background: "rgba(255,255,255,0.94)" }}>
                <FakeQRCode />
              </div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>扫码查看</p>
            </div>
          </div>
        </div>

        <p className="text-center mt-4 mb-5" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em" }}>
          内容已加密，仅好友可见全文
        </p>

        <div className="px-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
            style={{ background: "rgba(7,193,96,0.88)", fontWeight: 700, fontSize: 15, color: "#fff", boxShadow: "0 8px 28px rgba(7,193,96,0.35)", letterSpacing: "0.04em", border: "none" }}
          >
            <Share2 size={16} strokeWidth={2.2} />
            <span>发送给好友</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Poster Share Modal ───────────────────────────────────────────────────────
function PosterShareModal({ onClose }: { onClose: () => void }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(4,8,22,0.75)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col pb-8"
        style={{ borderRadius: "32px 32px 0 0", background: "rgba(14,22,52,0.97)", border: "0.5px solid rgba(255,255,255,0.14)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-3">
          <div style={{ width: 38, height: 4.5, borderRadius: 2.5, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5 pb-5 pt-1">
          <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.90)", letterSpacing: "0.05em" }}>分享海报</p>
          <button onClick={onClose} className="flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.14)" }}>
            <X size={15} color="rgba(255,255,255,0.52)" strokeWidth={2} />
          </button>
        </div>

        {/* Poster preview */}
        <div className="mx-5 mb-5 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(140,180,255,0.25) 0%, rgba(195,170,255,0.20) 60%, rgba(255,190,160,0.18) 100%)", border: "0.5px solid rgba(255,255,255,0.20)", aspectRatio: "0.7" }}>
          <div className="h-full flex flex-col items-center justify-center px-6 py-8">
            {/* Logo/Icon */}
            <div className="rounded-3xl flex items-center justify-center mb-6" style={{ width: 64, height: 64, background: "rgba(255,255,255,0.16)", border: "0.5px solid rgba(255,255,255,0.30)", fontSize: 32 }}>
              💬
            </div>

            {/* Main score */}
            <p style={{ fontSize: 48, fontWeight: 800, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", textShadow: "0 2px 16px rgba(80,140,220,0.40)" }}>
              85%
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.68)", marginTop: 8, letterSpacing: "0.06em" }}>本次沟通健康度</p>

            {/* Badge */}
            <div className="mt-8 px-5 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.24)" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>我获得了「温柔安抚者」称号</p>
            </div>

            {/* QR Code */}
            <div className="mt-auto pt-12 flex flex-col items-center gap-2">
              <div className="rounded-2xl flex items-center justify-center p-3" style={{ background: "rgba(255,255,255,0.95)" }}>
                <FakeQRCode />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.48)", letterSpacing: "0.06em" }}>扫码体验「不吃了」</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
            style={{
              background: saved ? "rgba(100,215,160,0.88)" : "linear-gradient(135deg, rgba(160,200,255,0.85) 0%, rgba(180,160,255,0.80) 100%)",
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              boxShadow: saved ? "0 8px 32px rgba(80,200,140,0.40)" : "0 8px 32px rgba(100,150,255,0.40)",
              letterSpacing: "0.04em",
              border: "none",
              transition: "all 0.3s ease",
            }}
          >
            {saved ? <CheckCheck size={17} strokeWidth={2.5} /> : <Download size={17} strokeWidth={2} />}
            <span>{saved ? "已保存到相册 ✨" : "保存到相册"}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Recommendations Card ──────────────────────────────────────────────────────
function RecommendationsCard() {
  const courses = [
    {
      cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400",
      title: "非暴力沟通：4 步化解冲突",
      desc: "学会用温和的方式表达需求，建立双向理解的桥梁。",
    },
    {
      cover: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400",
      title: "如何给对方「情绪空间」",
      desc: "既不逼迫也不冷漠，找到关系中的舒适距离感。",
    },
  ];

  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
        <div>
          <SectionLabel>为你推荐</SectionLabel>
          <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.90)" }}>📚 相关话题与技巧</p>
        </div>

        <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.10 }}
              className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{ width: 220, background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.14)" }}
            >
              <img src={course.cover} alt={course.title} className="w-full object-cover" style={{ height: 110 }} />
              <div className="px-4 py-3.5">
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.5, marginBottom: 6 }}>{course.title}</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.48)", lineHeight: 1.6 }}>{course.desc}</p>
              </div>
              <div className="px-4 pb-3.5 flex items-center justify-between">
                <span style={{ fontSize: 11, color: "rgba(180,210,255,0.70)", fontWeight: 600 }}>了解更多</span>
                <ChevronRight size={14} color="rgba(180,210,255,0.60)" strokeWidth={2} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── 1. Session Summary Banner ────────────────────────────────────────────────
function SummaryBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="rounded-3xl px-5 pt-5 pb-5 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(200,220,255,0.10) 100%)",
        backdropFilter: "blur(36px)",
        WebkitBackdropFilter: "blur(36px)",
        border: "0.5px solid rgba(255,255,255,0.28)",
        boxShadow: "0 12px 56px rgba(60,90,180,0.16), inset 0 1.5px 0 rgba(255,255,255,0.30)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>本次对话概览</SectionLabel>
          <p style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.95)", letterSpacing: "0.05em" }}>他今天回家又是一言不发</p>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", marginTop: 3, letterSpacing: "0.04em" }}>11月15日 · 20 分钟对话 · 12 条消息</p>
        </div>
        <div className="rounded-2xl flex flex-col items-center justify-center shrink-0" style={{ width: 58, height: 58, background: "rgba(255,130,100,0.14)", border: "0.5px solid rgba(255,130,100,0.30)", marginTop: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,155,130,1)", lineHeight: 1 }}>74</span>
          <span style={{ fontSize: 9.5, color: "rgba(255,155,130,0.65)", letterSpacing: "0.5px", marginTop: 2 }}>张力指数</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {SCORES.map(({ label, value, color, barColor }, idx) => (
          <div key={label} className="flex items-center gap-3">
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", width: 52, flexShrink: 0 }}>{label}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.09)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.0, ease: "easeOut", delay: 0.18 + idx * 0.10 }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color, width: 24, textAlign: "right", flexShrink: 0 }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["委屈 😢", "冷暴力 🧊", "疲惫 💤", "渴望连接 🤝"].map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full" style={{ fontSize: 11, color: "rgba(255,255,255,0.68)", background: "rgba(255,255,255,0.09)", border: "0.5px solid rgba(255,255,255,0.16)", letterSpacing: "0.04em" }}>
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── 2. Translation + Misunderstanding Card ───────────────────────────────────
function TranslationCard({ onShowShare }: { onShowShare: () => void }) {
  const [copied, setCopied] = useState(false);
  // User custom input
  const [userInput, setUserInput] = useState("");
  const [userActive, setUserActive] = useState<TransTab>("温柔");
  const [userTranslated, setUserTranslated] = useState(false);
  const [userTranslating, setUserTranslating] = useState(false);
  const [userTranslations, setUserTranslations] = useState<Record<TransTab, { text: string; tone: string; emoji: string }> | null>(null);
  const [showWxBtn, setShowWxBtn] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleCopy = (t: string) => {
    navigator.clipboard?.writeText(t).catch(() => {});
    setCopied(true);
    setShowWxBtn(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleUserTranslate = () => {
    if (!userInput.trim()) return;
    setUserTranslating(true);
    setTimeout(() => {
      setUserTranslations(generateUserTranslations(userInput.trim()));
      setUserTranslating(false);
      setUserTranslated(true);
    }, 1400);
  };

  const fireFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2000);
  };

  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
        {/* Header */}
        <div>
          <SectionLabel>你们可能存在的误解</SectionLabel>
          <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.90)" }}>AI 识别到的认知偏差</p>
        </div>

        {/* Misunderstanding items */}
        <div className="flex flex-col gap-2.5">
          {MISUNDERSTANDINGS.map(({ you, reality, color, bg, border }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.10 }}
              className="rounded-2xl px-4 py-3.5 flex flex-col gap-1.5"
              style={{ background: bg, border: `0.5px solid ${border}` }}
            >
              <div className="flex items-start gap-2">
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1, flexShrink: 0, letterSpacing: "0.05em" }}>误解</span>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, fontWeight: 300 }}>{you}</p>
              </div>
              <div className="flex items-center gap-2 pl-8">
                <div style={{ height: 0.5, flex: 1, background: `linear-gradient(to right, ${border}, transparent)` }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>↓ 真相</span>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ fontSize: 11, color, marginTop: 1, flexShrink: 0, letterSpacing: "0.05em", fontWeight: 600 }}>实际</span>
                <p style={{ fontSize: 13.5, color, lineHeight: 1.6, fontWeight: 500 }}>{reality}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── User custom input section ────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Section divider */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.09)" }} />
            <span style={{ fontSize: 11, color: "rgba(200,220,255,0.50)", letterSpacing: "0.08em", fontWeight: 500 }}>高情商翻译</span>
            <div style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.09)" }} />
          </div>

          {/* Textarea */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(200,175,255,0.06)", border: "0.5px solid rgba(200,175,255,0.22)" }}>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value.slice(0, 200))}
              placeholder="输入你想对Ta说的话，AI 帮你换一种方式表达..."
              rows={3}
              className="placeholder:text-white/25"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "14px 16px 10px",
                fontSize: 14.5,
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.65,
                fontWeight: 300,
                letterSpacing: "0.05px",
                scrollbarWidth: "none",
              }}
            />
            {userInput.length > 0 && (
              <div className="flex justify-end px-4 pb-2.5">
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)" }}>{userInput.length}/200</span>
              </div>
            )}
          </div>

          {/* 完善话术 button */}
          <motion.button
            whileTap={userInput.trim() ? { scale: 0.97 } : {}}
            onClick={handleUserTranslate}
            disabled={!userInput.trim() || userTranslating}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
            style={{
              background: userInput.trim() && !userTranslating
                ? "linear-gradient(135deg, rgba(200,175,255,0.28) 0%, rgba(160,200,255,0.20) 100%)"
                : "rgba(255,255,255,0.06)",
              border: `0.5px solid ${userInput.trim() ? "rgba(200,175,255,0.38)" : "rgba(255,255,255,0.10)"}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: userInput.trim() ? "0 6px 28px rgba(180,150,255,0.16)" : "none",
              cursor: userInput.trim() && !userTranslating ? "pointer" : "default",
              transition: "all 0.3s ease",
            }}
          >
            {userTranslating ? (
              <>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{ width: 5, height: 5, background: "rgba(200,175,255,0.70)" }}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16, ease: "easeInOut", type: "tween" }}
                    onUpdate={() => {}}
                  />
                ))}
                <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(200,175,255,0.75)", letterSpacing: "0.06em" }}>完善中...</span>
              </>
            ) : (
              <>
                <Send size={15} color={userInput.trim() ? "rgba(210,190,255,0.95)" : "rgba(255,255,255,0.22)"} strokeWidth={1.8} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: userInput.trim() ? "rgba(210,190,255,0.95)" : "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>
                  完善话术
                </span>
              </>
            )}
          </motion.button>

          {/* User translated result */}
          <AnimatePresence>
            {userTranslated && userTranslations && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                {/* User tabs */}
                <div className="flex p-1 rounded-2xl" style={{ background: "rgba(200,175,255,0.07)", border: "0.5px solid rgba(200,175,255,0.16)" }}>
                  {TRANS_TABS.map((tab) => {
                    const isA = tab === userActive;
                    return (
                      <motion.button
                        key={tab}
                        onClick={() => setUserActive(tab)}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1"
                        style={{
                          fontSize: 12.5, fontWeight: isA ? 700 : 400,
                          color: isA ? "#1A2840" : "rgba(255,255,255,0.44)",
                          background: isA ? "rgba(220,205,255,0.96)" : "transparent",
                          boxShadow: isA ? "0 2px 14px rgba(160,120,255,0.22)" : "none",
                        }}
                      >
                        <span>{userTranslations[tab].emoji}</span>
                        <span>{tab}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={userActive}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.24 }}
                    className="rounded-2xl px-4 py-4 flex flex-col gap-2"
                    style={{ background: "rgba(200,175,255,0.08)", border: "0.5px solid rgba(200,175,255,0.20)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ fontSize: 13 }}>{userTranslations[userActive].emoji}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(200,175,255,0.72)", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                        {userTranslations[userActive].tone}
                      </span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: "1.82", color: "rgba(255,255,255,0.90)", fontWeight: 300, letterSpacing: "0.16px" }}>
                      {userTranslations[userActive].text}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { handleCopy(userTranslations[userActive].text); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                  style={{ background: copied ? "rgba(100,215,160,0.92)" : "rgba(255,255,255,0.96)", color: copied ? "#fff" : "#1A2840", fontWeight: 700, fontSize: 14.5, boxShadow: copied ? "0 6px 28px rgba(80,200,140,0.40)" : "0 6px 28px rgba(60,90,160,0.18)", border: "none", letterSpacing: "0.04em", transition: "background 0.3s ease, box-shadow 0.3s ease" }}
                >
                  {copied ? <CheckCheck size={16} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2.2} />}
                  <span>{copied ? "已复制！可直接发给Ta 💬" : "一键复制"}</span>
                </motion.button>

                {/* WeChat share button */}
                <AnimatePresence>
                  {showWxBtn && (
                    <motion.button
                      key="wx-share"
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.24 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onShowShare}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl"
                      style={{
                        background: "rgba(7,193,96,0.11)",
                        border: "0.5px solid rgba(7,193,96,0.28)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(60,210,130,0.95)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span>📤</span>
                      <span>发送给微信好友</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Feedback buttons */}
                <div className="flex gap-2 w-full mt-1">
                  {[
                    { emoji: "👍", label: "有帮助", msg: "感谢反馈 🌸" },
                    { emoji: "👎", label: "不太准", msg: "感谢提示，持续优化中" },
                    { emoji: "🔄", label: "重新生成", msg: "正在重新生成..." },
                  ].map(({ emoji, label, msg }) => (
                    <motion.button
                      key={label}
                      whileTap={{ scale: 0.91 }}
                      onClick={() => fireFeedback(msg)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "0.5px solid rgba(255,255,255,0.14)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.52)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                      <span>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              key="fb-toast"
              initial={{ opacity: 0, y: -6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              className="px-4 py-2 rounded-full"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(24,40,90,0.90)",
                border: "0.5px solid rgba(180,210,255,0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                fontSize: 12.5,
                color: "rgba(200,225,255,0.90)",
                boxShadow: "0 6px 24px rgba(60,100,200,0.25)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                zIndex: 100,
              }}
            >
              {feedbackToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ─── 3. Radar Chart Card ──────────────────────────────────────────────────────
function GlowRadarSVG() {
  const SIZE = 238;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const radius = 82;
  const labelOffset = 24;
  const levels = 4;
  const n = RADAR_DATA.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });
  const polyPts = (r: number) => Array.from({ length: n }, (_, i) => { const { x, y } = pt(i, r); return `${x},${y}`; }).join(" ");
  const dataPoints = RADAR_DATA.map((d, i) => pt(i, (d.value / 100) * radius));
  const dataPoly = dataPoints.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        {RADAR_DATA.map((d, i) => (
          <radialGradient key={`glow-${i}`} id={`glow${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={d.glow} stopOpacity="0.9" />
            <stop offset="100%" stopColor={d.glow} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points={polyPts(radius)} fill="rgba(255,255,255,0.02)" />
      {Array.from({ length: levels }, (_, lvl) => (
        <polygon key={`ring-${lvl}`} points={polyPts((radius / levels) * (lvl + 1))} fill="none" stroke="rgba(255,255,255,0.11)" strokeWidth={0.8} />
      ))}
      {RADAR_DATA.map((_, i) => {
        const { x, y } = pt(i, radius);
        return <line key={`spoke-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth={0.8} />;
      })}
      <polygon points={dataPoly} fill="rgba(180,215,255,0.07)" stroke="rgba(200,230,255,0.25)" strokeWidth={8} strokeLinejoin="round" filter="url(#soft-glow)" style={{ opacity: 0.6 }} />
      <polygon points={dataPoly} fill="rgba(180,215,255,0.10)" stroke="rgba(220,240,255,0.80)" strokeWidth={1.8} strokeLinejoin="round" filter="url(#blur-glow)" />
      {dataPoints.map(({ x, y }, i) => (
        <g key={`dot-${i}`} filter="url(#blur-glow)">
          <circle cx={x} cy={y} r={12} fill={`url(#glow${i})`} style={{ opacity: 0.6 }} />
          <circle cx={x} cy={y} r={6} fill="none" stroke={RADAR_DATA[i].color} strokeWidth={1} strokeOpacity={0.35} />
          <circle cx={x} cy={y} r={4} fill={RADAR_DATA[i].color} />
          <circle cx={x} cy={y} r={1.8} fill="rgba(255,255,255,0.95)" />
        </g>
      ))}
      {RADAR_DATA.map((d, i) => {
        const { x, y } = pt(i, radius + labelOffset);
        return <text key={`lbl-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={d.color} fontSize={12.5} fontWeight={700} filter="url(#blur-glow)">{d.subject}</text>;
      })}
    </svg>
  );
}

function RadarCard() {
  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col">
        <SectionLabel>本次沟通雷达图</SectionLabel>
        <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.90)", marginBottom: 4 }}>五维情感能力分析</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginBottom: 20, lineHeight: 1.6 }}>基于本次对话语义模型生成</p>
        <div className="flex justify-center" style={{ paddingBottom: 8 }}>
          <GlowRadarSVG />
        </div>
        <div className="grid grid-cols-5 gap-2 mt-4">
          {RADAR_DATA.map(({ subject, value, color }) => (
            <div key={subject} className="flex flex-col items-center gap-1.5">
              <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.09)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                />
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{subject}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 px-4 py-3 rounded-2xl flex items-start gap-2.5" style={{ background: "rgba(255,130,100,0.08)", border: "0.5px solid rgba(255,130,100,0.22)" }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <p style={{ fontSize: 12, color: "rgba(255,175,155,0.90)", lineHeight: 1.7 }}>
            <span style={{ fontWeight: 600 }}>攻击指数偏高（72）</span>——情绪化表达比例较大，建议在平静状态下再次沟通。
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── 4. AI Insight Card ───────────────────────────────────────────────────────
function InsightCard() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const toggleExpanded = (idx: number) => {
    const newSet = new Set(expanded);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpanded(newSet);
  };

  const fireFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2000);
  };

  return (
    <Card>
      <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(195,170,255,0.14)", border: "0.5px solid rgba(195,170,255,0.28)" }}>
            <Brain size={16} color="rgba(195,170,255,0.95)" strokeWidth={1.8} />
          </div>
          <div>
            <SectionLabel>AI 深度解读</SectionLabel>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.90)" }}>核心矛盾与深层动机</p>
          </div>
        </div>

        <div className="rounded-2xl px-4 py-4" style={{ ...glassInner }}>
          <p style={{ fontSize: 13.5, lineHeight: "1.90", color: "rgba(255,255,255,0.78)", fontWeight: 300, letterSpacing: "0.1px" }}>
            本次对话呈现出典型的
            <span style={{ fontWeight: 600, color: "rgba(195,170,255,1)" }}>「追—逃」互动模式</span>
            ：你的主动靠近触发了 Ta 的防御性退缩，而 Ta 的沉默又放大了你的不安全感，形成恶性循环。这并非双方的本意，而是各���
            <span style={{ fontWeight: 600, color: "rgba(160,210,255,1)" }}>依恋模式</span>
            在压力下的自动反应。
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {INSIGHTS.map(({ icon: Icon, emoji, label, headline, desc, color, bg, border }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
            >
              <div onClick={() => toggleExpanded(idx)} className="w-full text-left cursor-pointer">
                <div className="rounded-2xl px-4 py-3" style={{ background: bg, border: `0.5px solid ${border}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1">
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
                      <div className="flex-1">
                        <p style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.36)", letterSpacing: "0.8px", textTransform: "uppercase" }}>{label}</p>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color, marginTop: 1 }}>{headline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 破局建议(idx=3)显示重新生成图标 */}
                      {idx === 3 && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            fireFeedback("正在重新生成建议...");
                          }}
                          whileTap={{ scale: 0.90, rotate: 180 }}
                          className="flex items-center justify-center rounded-full"
                          style={{ width: 24, height: 24, background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.16)" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 6a4 4 0 11-1.172-2.828M10 2v4h-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.button>
                      )}
                      <motion.div animate={{ rotate: expanded.has(idx) ? 180 : 0 }} transition={{ duration: 0.22 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 5l4 4 4-4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded.has(idx) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.26 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, marginTop: 10, paddingLeft: 30 }}>{desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback buttons */}
        <div className="flex gap-2 w-full">
          {[
            { emoji: "👍", label: "有帮助", msg: "感谢反馈 🌸" },
            { emoji: "👎", label: "不太准", msg: "感谢提示，持续优化中" },
            { emoji: "🔄", label: "重新生成", msg: "正在重新生成..." },
          ].map(({ emoji, label, msg }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.91 }}
              onClick={() => fireFeedback(msg)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "0.5px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                fontSize: 12.5,
                color: "rgba(255,255,255,0.52)",
                letterSpacing: "0.03em",
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              <span>{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="rounded-full" style={{ width: 5, height: 5, background: "rgba(160,210,255,0.55)" }} />
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>以上分析由 AI 生成，仅供参考，无法替代专业心理咨询。</p>
        </div>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              key="insight-fb-toast"
              initial={{ opacity: 0, y: -6, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              className="px-4 py-2 rounded-full"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(24,40,90,0.90)",
                border: "0.5px solid rgba(180,210,255,0.25)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                fontSize: 12.5,
                color: "rgba(200,225,255,0.90)",
                boxShadow: "0 6px 24px rgba(60,100,200,0.25)",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                zIndex: 100,
              }}
            >
              {feedbackToast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConversationReportPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showWxModal, setShowWxModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  return (
    <div className="flex justify-center items-center w-full min-h-screen" style={{ background: "#0E1520" }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{ width: 390, height: 844, borderRadius: 44, boxShadow: "0 48px 120px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.09)" }}
      >
        {/* Background */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.60) saturate(1.06) hue-rotate(4deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(16,28,58,0.70) 0%, rgba(24,40,80,0.10) 30%, transparent 55%, rgba(14,22,46,0.22) 72%, rgba(10,16,36,0.82) 100%)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 200, background: "linear-gradient(to bottom, rgba(12,18,40,0.80) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 260, background: "linear-gradient(to top, rgba(8,13,28,0.92) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "6%", left: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,200,255,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "-8%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(195,170,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center shrink-0 w-full" style={{ height: 88, paddingTop: 52, paddingLeft: 16, paddingRight: 16 }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate("/review")}
            className="flex items-center gap-1 rounded-full pr-3 pl-2 py-1.5 relative"
            style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.20)", zIndex: 10, cursor: "pointer" }}
          >
            <ChevronLeft size={17} color="rgba(255,255,255,0.80)" strokeWidth={2} />
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.70)", letterSpacing: "0.04em" }}>返回</span>
          </motion.button>
          <div className="absolute left-0 right-0 flex items-center justify-center pointer-events-none" style={{ paddingRight: 88, paddingLeft: 88 }}>
            <div className="flex flex-col items-center">
              <h1 style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)", letterSpacing: "0.08em", textShadow: "0 2px 16px rgba(60,100,200,0.35)" }}>复盘报告</h1>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", marginTop: 1, letterSpacing: "0.06em" }}>11月15日</p>
            </div>
          </div>
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* Divider */}
        <div className="shrink-0" style={{ height: 0.5, background: "linear-gradient(to right, transparent, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0.14) 75%, transparent)", margin: "0 20px 8px" }} />

        {/* Scrollable content */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex flex-col gap-4 px-4 pt-1 pb-8">
            <SummaryBanner />
            <TranslationCard onShowShare={() => setShowWxModal(true)} />
            <RadarCard />
            <InsightCard />
            <RecommendationsCard />

            {/* Generate Poster Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPosterModal(true)}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(180,215,255,0.24) 0%, rgba(200,170,255,0.20) 100%)",
                border: "0.5px solid rgba(200,220,255,0.32)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "0 8px 32px rgba(120,170,255,0.20), inset 0 1.5px 0 rgba(255,255,255,0.22)",
              }}
            >
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: "rgba(220,235,255,0.95)", letterSpacing: "0.06em" }}>生成分享海报</span>
            </motion.button>
          </div>
        </div>

        {/* WeChat share modal — rendered at phone frame level */}
        <AnimatePresence>
          {showWxModal && <WeChatShareModal onClose={() => setShowWxModal(false)} />}
        </AnimatePresence>

        {/* Poster share modal */}
        <AnimatePresence>
          {showPosterModal && <PosterShareModal onClose={() => setShowPosterModal(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
