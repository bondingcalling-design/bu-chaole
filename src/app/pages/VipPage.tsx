import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Crown, Check, Zap, Brain, Infinity, Shield, Star, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.20)",
} as const;

const glassInner = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "0.5px solid rgba(255,255,255,0.14)",
} as const;


// ─── Plan data ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "monthly",
    label: "月度会员",
    price: "¥28",
    unit: "/ 月",
    originalPrice: "¥38",
    badge: null,
    color: "rgba(160,210,255,0.85)",
    glow: "rgba(100,180,255,0.22)",
  },
  {
    id: "yearly",
    label: "年度会员",
    price: "¥168",
    unit: "/ 年",
    originalPrice: "¥456",
    badge: "省63%",
    color: "rgba(255,215,80,0.95)",
    glow: "rgba(200,155,40,0.28)",
  },
  {
    id: "lifetime",
    label: "终身会员",
    price: "¥398",
    unit: "/ 永久",
    originalPrice: "¥698",
    badge: "最超值",
    color: "rgba(200,175,255,0.95)",
    glow: "rgba(160,120,255,0.22)",
  },
];

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain, label: "无限次 AI 深度对话", sub: "不受次数限制，随时倾诉", color: "rgba(200,175,255,0.9)" },
  { icon: Infinity, label: "长效情感记忆", sub: "AI 记住你们的每一段故事", color: "rgba(160,210,255,0.9)" },
  { icon: Star, label: "高级沟通报告", sub: "每次对话生成完整分析报告", color: "rgba(255,215,80,0.9)" },
  { icon: Sparkles, label: "专属情感洞察", sub: "个性化情感模式追踪", color: "rgba(140,235,200,0.9)" },
  { icon: Shield, label: "隐私加密保护", sub: "所有对话端对端加密", color: "rgba(255,180,150,0.9)" },
  { icon: Zap, label: "优先响应速度", sub: "AI 回复速度提升 3×", color: "rgba(255,210,130,0.9)" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VipPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => setPurchasing(false), 1800);
  };

  const plan = PLANS.find(p => p.id === selectedPlan)!;

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
          style={{ filter: "brightness(0.50) saturate(1.10) hue-rotate(8deg)" }}
        />
        {/* Gold warmth overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(60,35,10,0.62) 0%, rgba(30,25,60,0.12) 35%, transparent 55%, rgba(14,20,44,0.22) 72%, rgba(10,14,34,0.78) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 180, background: "linear-gradient(to bottom, rgba(20,12,5,0.70) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 280, background: "linear-gradient(to top, rgba(10,14,32,0.88) 0%, transparent 100%)" }} />

        {/* Gold ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "5%", left: "5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,195,60,0.10) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: "12%", right: "-5%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,255,0.08) 0%, transparent 70%)" }} />
        </div>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative flex items-center shrink-0 w-full" style={{ height: 88, paddingTop: 52, paddingLeft: 16, paddingRight: 16 }}>
          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={() => navigate("/profile")}
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
            返回
          </motion.button>
          {/* 88px WeChat capsule */}
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none", paddingBottom: 140 }}>

          {/* Hero crown area */}
          <div className="flex flex-col items-center px-6 pt-3 pb-6 shrink-0">
            {/* Crown glow */}
            <div className="relative flex items-center justify-center mb-4">
              <div style={{
                position: "absolute",
                width: 120, height: 120,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,205,60,0.24) 0%, transparent 70%)",
                filter: "blur(12px)",
              }} />
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                onUpdate={() => {}}
                className="w-20 h-20 rounded-[28px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255,215,80,0.20) 0%, rgba(200,155,40,0.12) 100%)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  border: "0.5px solid rgba(255,215,100,0.40)",
                  boxShadow: "0 8px 40px rgba(200,155,40,0.28), inset 0 1.5px 0 rgba(255,240,160,0.28)",
                }}
              >
                <Crown size={36} color="rgba(255,215,80,0.97)" strokeWidth={1.6} />
              </motion.div>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,238,145,0.97)", letterSpacing: "-0.3px", textShadow: "0 2px 20px rgba(200,140,20,0.40)", textAlign: "center" }}>
              专业版 VIP
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,215,100,0.52)", marginTop: 6, textAlign: "center", letterSpacing: "0.04em" }}>
              解锁全部情感陪伴能力
            </p>
          </div>

          {/* Plan selector */}
          <div className="px-5 flex flex-col gap-3 mb-6 shrink-0">
            {PLANS.map((p) => {
              const isSelected = p.id === selectedPlan;
              return (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setSelectedPlan(p.id)}
                  className="relative w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-left"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, rgba(255,215,80,0.13) 0%, rgba(200,155,40,0.08) 100%)`
                      : "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: isSelected
                      ? `0.5px solid ${p.color}`
                      : "0.5px solid rgba(255,255,255,0.13)",
                    boxShadow: isSelected
                      ? `0 6px 32px ${p.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`
                      : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isSelected ? p.color : "transparent",
                      border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.28)",
                    }}
                  >
                    {isSelected && <Check size={11} color="#1A1200" strokeWidth={3} />}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? p.color : "rgba(255,255,255,0.80)" }}>
                        {p.label}
                      </span>
                      {p.badge && (
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#1A1200",
                            background: p.color,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span style={{ fontSize: 22, fontWeight: 800, color: isSelected ? p.color : "rgba(255,255,255,0.65)", letterSpacing: "-0.5px" }}>
                        {p.price}
                      </span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.32)" }}>{p.unit}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", textDecoration: "line-through" }}>
                        {p.originalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Shimmer on selected */}
                  {isSelected && (
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                      background: "linear-gradient(110deg, transparent 30%, rgba(255,240,150,0.06) 50%, transparent 70%)",
                    }} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Features */}
          <div className="px-5 mb-6 shrink-0">
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,215,100,0.55)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
              专属权益
            </p>
            <div className="rounded-3xl overflow-hidden" style={{ ...glassMid, boxShadow: "0 8px 40px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
              {FEATURES.map(({ icon: Icon, label, sub, color }, idx, arr) => (
                <div key={label}>
                  <div className="flex items-center gap-3.5 px-5 py-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.08)", border: `0.5px solid ${color.replace("0.9", "0.22")}` }}
                    >
                      <Icon size={16} color={color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 1.5 }}>{sub}</p>
                    </div>
                    <Check size={14} color={color} strokeWidth={2.5} />
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="mx-5" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="px-5 mb-2 shrink-0">
            <div className="flex gap-3">
              {[
                { emoji: "🔒", text: "随时取消" },
                { emoji: "💎", text: "7天退款保障" },
                { emoji: "🤝", text: "微信安全支付" },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl" style={{ ...glassInner }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.42)", textAlign: "center" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sticky CTA ────────────────────────────────────────────── */}
        <div className="absolute bottom-0 w-full shrink-0 px-5 pb-8 pt-6 flex flex-col gap-2.5 z-20 pointer-events-auto"
          style={{
            background: "linear-gradient(to top, rgba(10,14,32,0.98) 0%, rgba(10,14,32,0.85) 60%, transparent 100%)",
          }}
        >
          <motion.button
            onClick={handlePurchase}
            whileTap={{ scale: 0.97 }}
            animate={purchasing ? { scale: [1, 1.02, 0.99, 1] } : {}}
            transition={{ duration: 0.45 }}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl"
            style={{
              background: purchasing
                ? "linear-gradient(135deg, rgba(140,235,190,0.90) 0%, rgba(80,200,140,0.90) 100%)"
                : "linear-gradient(135deg, rgba(255,225,100,0.95) 0%, rgba(220,165,40,0.95) 50%, rgba(190,125,20,0.95) 100%)",
              boxShadow: purchasing
                ? "0 8px 40px rgba(80,200,140,0.40)"
                : "0 8px 40px rgba(200,145,20,0.45), inset 0 1.5px 0 rgba(255,250,200,0.50)",
              transition: "all 0.4s ease",
            }}
          >
            <AnimatePresence mode="wait">
              {purchasing ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "0.02em" }}
                >
                  ✓ 开通成功！欢迎加入 VIP
                </motion.span>
              ) : (
                <motion.span
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 15, fontWeight: 700, color: "#1A0E00", letterSpacing: "0.02em" }}
                >
                  立即开通 · {plan.price}{plan.unit}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", textAlign: "center", letterSpacing: "0.03em" }}>
            开通即同意《服务协议》与《隐私政策》
          </p>
        </div>
      </div>
    </div>
  );
}