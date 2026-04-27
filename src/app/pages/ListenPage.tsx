import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Headphones, TreePine, BarChart2, User } from "lucide-react";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.13)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "0.5px solid rgba(255,255,255,0.28)",
} as const;

const glassMid = {
  background: "rgba(255,255,255,0.09)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

const glassChip = {
  background: "rgba(255,255,255,0.11)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "0.5px solid rgba(255,255,255,0.26)",
} as const;

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
            <button key={label} onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
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

// ─── Emotional Field Rings ─────────────────────────────────────────────────────
function EmotionalField({ active }: { active: boolean }) {
  const baseColor = active ? "rgba(180,220,255,0.45)" : "rgba(200,225,255,0.30)";
  const duration = active ? 2.0 : 3.0;

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          onUpdate={() => {}}
          style={{
            width: 136,
            height: 136,
            border: `1px solid ${baseColor}`,
            top: "50%",
            left: "50%",
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{ scale: [1, 1.65, 2.4], opacity: [0.6, 0.28, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeOut", delay: i * (duration / 3), type: "tween" }}
        />
      ))}
      {/* Outer soft glow halo */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: 200,
        height: 200,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: active
          ? "radial-gradient(circle, rgba(160,210,255,0.16) 0%, transparent 65%)"
          : "radial-gradient(circle, rgba(200,225,255,0.08) 0%, transparent 65%)",
        transition: "background 0.5s ease",
      }} />
    </>
  );
}

// ─── Waveform bars (shown when recording) ────────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px]" style={{ height: 28 }}>
      {[0.5, 0.8, 1.0, 0.7, 0.9, 0.6, 1.0, 0.8, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          onUpdate={() => {}}
          style={{
            width: 3,
            background: "rgba(255,255,255,0.85)",
            originY: "center",
          }}
          animate={{ scaleY: [h * 0.4, h, h * 0.5, h * 0.9] }}
          transition={{ duration: 0.7 + i * 0.08, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: i * 0.06, type: "tween" }}
          initial={{ scaleY: h * 0.4, height: 28 }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ListenPage() {
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimeRef = useRef(0);
  const navigate = useNavigate();

  // Handle recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next >= 60) {
            // Auto-stop at 60 seconds
            setIsListening(false);
            const dur = "1:00";
            setTimeout(() => navigate("/listen-chat", { state: { voiceMessage: true, duration: dur } }), 200);
          }
          return Math.min(next, 60);
        });
      }, 1000);
    } else {
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const handleStopRecording = () => {
    const time = recordingTimeRef.current;
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    const duration = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    setIsListening(false);
    // Navigate to chat page with voice message and duration
    setTimeout(() => {
      navigate("/listen-chat", { state: { voiceMessage: true, duration } });
    }, 200);
  };

  const handleMicClick = () => {
    if (isListening) {
      // Second click - stop recording
      handleStopRecording();
    } else {
      // First click - start recording
      setIsListening(true);
    }
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen" style={{ background: "#0E1520" }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: "0 48px 120px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.09)",
        }}
      >
        {/* ── Background: Snowy forest dawn ───────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.65) saturate(1.05) hue-rotate(5deg)" }}
        />
        {/* Layered atmospheric vignettes */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(16,28,58,0.60) 0%, rgba(24,40,80,0.08) 32%, transparent 55%, rgba(14,22,46,0.20) 72%, rgba(10,16,36,0.75) 100%)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 160, background: "linear-gradient(to bottom, rgba(12,18,40,0.68) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 240, background: "linear-gradient(to top, rgba(10,16,36,0.78) 0%, transparent 100%)" }} />
        {/* Ambient icy glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "12%", left: "12%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,200,255,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "28%", right: "-5%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,220,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* ── Header: center title + 88px capsule space ────────────── */}
        <div className="relative flex items-center justify-center shrink-0 w-full" style={{ height: 88, paddingTop: 52 }}>
          {/* 88px WeChat capsule on the right */}
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
          <h1 style={{
            fontSize: 22,
            fontWeight: 200,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 2px 24px rgba(60,100,200,0.35)",
          }}>
            倾 听
          </h1>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="relative flex-1 flex flex-col px-5">

          {/* Daily inspiration card */}
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-2.5"
            style={{
              ...glass,
              boxShadow: "0 6px 28px rgba(60,90,160,0.14), inset 0 1px 0 rgba(255,255,255,0.22)",
            }}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>✨</span>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.78)", lineHeight: "1.6", fontWeight: 300, letterSpacing: "0.15px" }}>
              今日爱情灵感：记得对微小的付出说声谢谢
            </p>
          </div>

          {/* Center: chips + emotional field + mic + text */}
          <div className="flex-1 flex flex-col items-center justify-center gap-0">

            {/* Emotional field + Mic button */}
            <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
              {/* Pulsing rings */}
              <EmotionalField active={isListening} />

              {/* Inner soft glow ring */}
              <div className="absolute rounded-full" style={{
                width: 156,
                height: 156,
                background: isListening
                  ? "radial-gradient(circle, rgba(160,215,255,0.18) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(220,235,255,0.10) 0%, transparent 70%)",
                transition: "background 0.4s ease",
              }} />

              {/* Mic button */}
              <motion.button
                onClick={handleMicClick}
                whileTap={{ scale: 0.93 }}
                animate={isListening ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={isListening ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", type: "tween" } : {}}
                onUpdate={() => {}}
                className="relative flex flex-col items-center justify-center rounded-full"
                style={{
                  width: 136,
                  height: 136,
                  background: isListening
                    ? "rgba(160,215,255,0.22)"
                    : "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: isListening
                    ? "1px solid rgba(180,225,255,0.50)"
                    : "0.5px solid rgba(255,255,255,0.32)",
                  boxShadow: isListening
                    ? "0 0 40px rgba(140,200,255,0.30), 0 12px 48px rgba(0,0,0,0.25), inset 0 1.5px 0 rgba(255,255,255,0.30)"
                    : "0 12px 48px rgba(0,0,0,0.28), 0 0 24px rgba(200,220,255,0.10), inset 0 1.5px 0 rgba(255,255,255,0.22)",
                  gap: 6,
                }}
              >
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div key="listening" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-2">
                      <WaveformBars />
                      <MicOff size={18} color="rgba(200,235,255,0.85)" strokeWidth={1.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.2 }}>
                      <Mic size={38} color="rgba(255,255,255,0.88)" strokeWidth={1.3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Text below mic */}
            <div className="flex flex-col items-center mt-7 gap-1.5">
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div key="listening-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                    <motion.div
                      className="rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity, type: "tween" }}
                      onUpdate={() => {}}
                      style={{ width: 7, height: 7, background: "rgba(255,100,100,0.90)" }}
                    />
                    <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(180,225,255,0.92)", letterSpacing: "0.04em" }}>
                      正在录音 {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p key="idle-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.72)", letterSpacing: "0.04em" }}>
                    点击开始录音
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.p key="hint-recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 11.5, color: "rgba(180,225,255,0.55)", letterSpacing: "0.06em", fontWeight: 300 }}>
                    再次点击 · 停止录音
                  </motion.p>
                ) : (
                  <motion.p key="hint-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.36)", letterSpacing: "0.06em", fontWeight: 300 }}>
                    AI 实时解读情感磁场
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Navigate to text chat */}
              <motion.button
                onClick={() => navigate("/listen-chat")}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "0.5px solid rgba(255,255,255,0.22)",
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.05em",
                }}
              >
                <MessageCircle size={13} strokeWidth={1.6} color="rgba(255,255,255,0.55)" />
                文字倾诉
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Floating Tab Bar ─────────────────────────────────────── */}
        <FloatingTabBar />
      </div>
    </div>
  );
}