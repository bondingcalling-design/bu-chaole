import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Phone, Heart } from "lucide-react";
import { useNavigate } from "react-router";

// ─── Breathing phases ─────────────────────────────────────────────────────────
type Phase = "inhale" | "hold" | "exhale" | "pause";

const CYCLE: { phase: Phase; duration: number; label: string; sub: string }[] = [
  { phase: "inhale", duration: 4, label: "吸气", sub: "缓慢深呼吸" },
  { phase: "hold",   duration: 4, label: "屏息", sub: "保持平静" },
  { phase: "exhale", duration: 6, label: "呼气", sub: "慢慢放松" },
  { phase: "pause",  duration: 2, label: "休息", sub: "片刻平静" },
];

// ─── Crisis resources ─────────────────────────────────────────────────────────
const RESOURCES = [
  { icon: "📞", label: "24 小时心理危机热线", value: "400-161-9995", color: "rgba(255,160,140,0.90)" },
  { icon: "💬", label: "北京心理危机研究院", value: "010-82951332", color: "rgba(200,175,255,0.90)" },
  { icon: "🆘", label: "全国心理援助热线", value: "400-800-1500", color: "rgba(160,210,255,0.90)" },
];

// ─── Stars decoration ─────────────────────────────────────────────────────────
const STARS = Array.from({ length: 44 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.6,
  delay: Math.random() * 4,
  duration: Math.random() * 2.5 + 2,
}));


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BreathePage() {
  const navigate = useNavigate();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const currentPhase = CYCLE[phaseIdx];
  const progress = elapsed / currentPhase.duration;

  // Tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 0.05 >= currentPhase.duration) {
          setPhaseIdx((pi) => {
            const next = (pi + 1) % CYCLE.length;
            if (next === 0) setCyclesCompleted((c) => c + 1);
            return next;
          });
          return 0;
        }
        return prev + 0.05;
      });
    }, 50);
    return () => clearInterval(id);
  }, [running, currentPhase.duration]);

  const handleToggle = useCallback(() => {
    setRunning((r) => !r);
    if (!running) {
      setPhaseIdx(0);
      setElapsed(0);
    }
  }, [running]);

  // Breathing scale: inhale → grow, exhale → shrink, hold/pause → stay
  const breatheScale =
    currentPhase.phase === "inhale" ? 1 + 0.28 * progress
    : currentPhase.phase === "exhale" ? 1.28 - 0.28 * progress
    : currentPhase.phase === "hold" ? 1.28
    : 1.0;

  // Ring color by phase
  const phaseColor =
    currentPhase.phase === "inhale" ? "rgba(160,210,255,0.70)"
    : currentPhase.phase === "hold" ? "rgba(200,175,255,0.70)"
    : currentPhase.phase === "exhale" ? "rgba(140,235,200,0.60)"
    : "rgba(200,210,255,0.40)";

  const phaseGlow =
    currentPhase.phase === "inhale" ? "rgba(100,180,255,0.25)"
    : currentPhase.phase === "hold" ? "rgba(170,130,255,0.22)"
    : currentPhase.phase === "exhale" ? "rgba(80,220,170,0.20)"
    : "rgba(160,180,255,0.14)";

  return (
    <div className="flex justify-center items-center w-full min-h-screen" style={{ background: "#050810" }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: "0 48px 120px rgba(0,0,0,0.80), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Background: deep space ─────────────────────────────── */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(160deg, #0A0520 0%, #060418 30%, #0A1428 60%, #040310 100%)"
        }} />

        {/* Nebula blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "8%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,50,160,0.18) 0%, transparent 70%)", filter: "blur(30px)" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "-5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(40,80,180,0.14) 0%, transparent 70%)", filter: "blur(24px)" }} />
          <div style={{ position: "absolute", top: "40%", left: "30%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,80,200,0.10) 0%, transparent 70%)", filter: "blur(20px)" }} />
        </div>

        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
              animate={{ opacity: [0.20, 0.80, 0.20] }}
              transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut", delay: s.delay, type: "tween" }}
              onUpdate={() => {}}
            />
          ))}
        </div>

        {/* Dark bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 300, background: "linear-gradient(to top, rgba(3,5,14,0.96) 0%, transparent 100%)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 180, background: "linear-gradient(to bottom, rgba(5,4,16,0.85) 0%, transparent 100%)" }} />

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative flex items-center shrink-0 w-full" style={{ height: 88, paddingTop: 52, paddingLeft: 16, paddingRight: 16 }}>
          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={() => navigate("/treehouse")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "0.5px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
            }}
          >
            <ChevronLeft size={16} strokeWidth={1.8} color="rgba(255,255,255,0.75)" />
            返回
          </motion.button>
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Scroll area ───────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>

          {/* Title */}
          <div className="flex flex-col items-center px-6 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} color="rgba(255,130,130,0.80)" strokeWidth={2} />
              <span style={{ fontSize: 11, color: "rgba(255,130,130,0.70)", letterSpacing: "0.12em", fontWeight: 500 }}>安全空间</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 200, letterSpacing: "0.16em", color: "rgba(255,255,255,0.92)", textShadow: "0 2px 20px rgba(120,100,255,0.40)", textAlign: "center" }}>
              深呼吸练习
            </h1>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", marginTop: 6, textAlign: "center", lineHeight: 1.65 }}>
              4-4-6-2 节律呼吸 · 激活副交感神经
            </p>
          </div>

          {/* ── Breathing orb ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative flex items-center justify-center" style={{ width: 280, height: 280, marginBottom: 32 }}>
              {/* Outer glow ring */}
              <motion.div
                className="absolute rounded-full"
                animate={{
                  scale: running ? breatheScale * 1.45 : 1.3,
                  opacity: running ? [0.15, 0.30, 0.15] : 0.15,
                }}
                transition={{ duration: 0.15, ease: "linear" }}
                style={{
                  width: 160, height: 160,
                  background: `radial-gradient(circle, ${phaseGlow} 0%, transparent 70%)`,
                  filter: "blur(20px)",
                }}
              />

              {/* Mid ring */}
              <motion.div
                className="absolute rounded-full"
                animate={{ scale: running ? breatheScale * 1.20 : 1.05 }}
                transition={{ duration: 0.15, ease: "linear" }}
                style={{
                  width: 160, height: 160,
                  border: `1px solid ${phaseColor.replace("0.70", "0.18")}`,
                }}
              />

              {/* Main circle */}
              <motion.div
                animate={{ scale: running ? breatheScale : 1 }}
                transition={{ duration: 0.15, ease: "linear" }}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 160, height: 160,
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: `1px solid ${phaseColor}`,
                  boxShadow: `0 0 60px ${phaseGlow}, 0 0 30px ${phaseGlow}, inset 0 1px 0 rgba(255,255,255,0.14)`,
                }}
              >
                {/* Progress arc */}
                <svg
                  width="160" height="160"
                  viewBox="0 0 160 160"
                  className="absolute"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="80" cy="80" r="74"
                    fill="none"
                    stroke={phaseColor}
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 74 * progress} ${2 * Math.PI * 74}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center text */}
                <div className="flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${phaseIdx}-${running}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.3 }}
                      style={{ fontSize: 26, fontWeight: 200, color: "rgba(255,255,255,0.90)", letterSpacing: "0.06em", textShadow: `0 2px 16px ${phaseGlow}` }}
                    >
                      {running ? currentPhase.label : "开始"}
                    </motion.p>
                  </AnimatePresence>
                  {running && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 4, letterSpacing: "0.04em" }}>
                      {currentPhase.sub}
                    </p>
                  )}
                  {!running && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 4, letterSpacing: "0.04em" }}>
                      点击引导
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Phase dots */}
            <div className="flex items-center gap-3 mb-8">
              {CYCLE.map((c, i) => (
                <div key={c.phase} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      scale: running && i === phaseIdx ? [1, 1.4, 1] : 1,
                      opacity: running && i === phaseIdx ? 1 : running ? 0.28 : 0.45,
                    }}
                    transition={running && i === phaseIdx ? { duration: 1, repeat: Infinity, ease: "easeInOut", type: "tween" } : {}}
                    onUpdate={() => {}}
                    className="rounded-full"
                    style={{
                      width: i === phaseIdx && running ? 8 : 6,
                      height: i === phaseIdx && running ? 8 : 6,
                      background: i === phaseIdx && running ? phaseColor : "rgba(255,255,255,0.30)",
                      boxShadow: i === phaseIdx && running ? `0 0 10px ${phaseGlow}` : "none",
                    }}
                  />
                  <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>{c.label}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)" }}>{c.duration}s</span>
                </div>
              ))}
            </div>

            {/* Cycles counter */}
            {cyclesCompleted > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)" }}
              >
                <span style={{ fontSize: 13 }}>✨</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  已完成 {cyclesCompleted} 次呼吸循环
                </span>
              </motion.div>
            )}

            {/* Start / Stop button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleToggle}
              className="flex items-center justify-center px-10 py-3.5 rounded-full mb-2"
              style={{
                background: running
                  ? "rgba(255,120,100,0.15)"
                  : "rgba(160,210,255,0.15)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: running
                  ? "0.5px solid rgba(255,140,120,0.38)"
                  : "0.5px solid rgba(160,210,255,0.38)",
                boxShadow: running
                  ? "0 8px 32px rgba(255,80,60,0.16)"
                  : "0 8px 32px rgba(80,160,255,0.16)",
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: running ? "rgba(255,160,140,0.90)" : "rgba(160,210,255,0.90)",
                letterSpacing: "0.06em",
              }}>
                {running ? "停止练习" : "��始呼吸"}
              </span>
            </motion.button>
          </div>

          {/* Bottom padding */}
          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}