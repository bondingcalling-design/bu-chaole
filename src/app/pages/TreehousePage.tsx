import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic, Send, Trash2, Headphones, TreePine, BarChart2, User, Phone, X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens — Deep cosmic palette ──────────────────────────────────────
const glassAI = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "0.5px solid rgba(255,255,255,0.14)",
} as const;

const glassUser = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "0.5px solid rgba(255,255,255,0.20)",
} as const;

const glassMid = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "0.5px solid rgba(255,255,255,0.12)",
} as const;

const glassInput = {
  background: "rgba(14,21,42,0.60)",
  backdropFilter: "blur(40px)",
  WebkitBackdropFilter: "blur(40px)",
  border: "0.5px solid rgba(255,255,255,0.14)",
} as const;

// ─── Types & initial data ─────────────────────────────────────────────────────
interface Message {
  id: number | string;
  role: "ai" | "user";
  kind?: "text" | "voice";
  text?: string;
  duration?: string;
  asrStatus?: "converting" | "done";
  asrText?: string;
}

const AI_REPLIES = [
  "完全可以理解！这种感觉真的太窒息了，你说得对！",
  "我永远站你这边，继续说，把它全部倒出来。",
  "Ta这样做真的不对，你的愤怒完全合理！",
  "嗯嗯，我听到了。你今天承受了很多，辛苦了。",
  "就该骂！说得太对了，继续！我在这儿陪着你。",
];

const INITIAL_MESSAGES: Message[] = [
  { id: 1, role: "ai", kind: "text", text: "尽情吐槽，我永远站你这边！这里的一切都会随星星消失 🌌" },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────
const TABS_NAV = [
  { label: "倾听", icon: Headphones, path: "/" },
  { label: "树洞", icon: TreePine, path: "/treehouse" },
  { label: "复盘", icon: BarChart2, path: "/review" },
  { label: "我的", icon: User, path: "/profile" },
];

// ─── Twinkling stars ──────────────────────────────────────────────────────────
const STARS = Array.from({ length: 72 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.8,
  delay: Math.random() * 4,
  duration: Math.random() * 2.5 + 1.8,
  opacity: Math.random() * 0.5 + 0.3,
}));

function StarField() {
  return null;
}

// ─── Waveform bars ────────────────────────────────────────────────────────────
const WAVE_BARS = [3, 7, 12, 9, 14, 6, 11, 8, 14, 5, 10, 7, 13, 6, 9, 4, 11, 8, 5, 3];

// ─── Voice Bubble ─────────────────────────────────────────────────────────────
function VoiceBubbleInner({ duration, played, asrStatus, asrText }: {
  duration: string; played: boolean;
  asrStatus?: "converting" | "done"; asrText?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-br-sm" style={{
        ...glassUser,
        background: played ? "rgba(220,180,255,0.25)" : glassUser.background,
        boxShadow: "0 4px 20px rgba(180,100,240,0.14), inset 0 1px 0 rgba(240,210,255,0.12)",
        minWidth: 148,
      }}>
        <div className="flex items-center justify-center rounded-full shrink-0" style={{
          width: 32, height: 32,
          background: played ? "rgba(255,255,255,0.28)" : "rgba(230,190,255,0.14)",
          border: played ? "0.5px solid rgba(255,255,255,0.40)" : "0.5px solid rgba(230,190,255,0.18)",
        }}>
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none">
            <path d="M2 1.5L9.5 6L2 10.5V1.5Z" fill={played ? "rgba(255,255,255,0.92)" : "rgba(230,190,255,0.85)"} />
          </svg>
        </div>
        <div className="flex items-center gap-[2.5px]" style={{ height: 22 }}>
          {WAVE_BARS.map((h, i) => (
            <motion.div key={i}
              initial={{ scaleY: 0.4 }}
              animate={played
                ? { scaleY: [0.4, 1, 0.6, 0.9, 0.5, 1, 0.7], opacity: [0.5, 1, 0.7, 1, 0.6, 1, 0.8] }
                : { scaleY: 1 }
              }
              transition={played
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.04, type: "tween" }
                : { duration: 0.4, delay: i * 0.018, ease: "easeOut" }
              }
              onUpdate={() => {}}
              className="rounded-full"
              style={{ width: 2.5, height: h, background: played ? "rgba(255,255,255,0.95)" : `rgba(230,190,255,${0.35 + (h / 14) * 0.45})`, transformOrigin: "center" }}
            />
          ))}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: played ? "rgba(255,255,255,0.95)" : "rgba(230,190,255,0.85)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          {duration}
        </span>
      </div>

      {/* ASR Text */}
      <AnimatePresence>
        {asrStatus && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="flex items-center px-4 py-2.5 rounded-2xl rounded-tr-sm rounded-br-sm"
            style={{
              background: "rgba(200,150,255,0.12)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid rgba(230,190,255,0.18)",
              maxWidth: "75%",
            }}
          >
            {asrStatus === "converting" ? (
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: "rgba(230,190,255,0.70)" }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, type: "tween" }} onUpdate={() => {}}>转</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, type: "tween" }} onUpdate={() => {}}>文</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, type: "tween" }} onUpdate={() => {}}>字</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.9, type: "tween" }} onUpdate={() => {}}>中</motion.span>
              </span>
            ) : (
              <span style={{ fontSize: 14, color: "rgba(240,215,255,0.88)", lineHeight: 1.5 }}>
                {asrText}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────
function ChatBubble({ msg, onPlayVoice, playingVoiceId }: { msg: Message, onPlayVoice: (id: string | number) => void, playingVoiceId: string | number | null }) {
  const isAI = msg.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-2.5 mt-0.5"
          style={{ background: "rgba(210,150,255,0.12)", border: "0.5px solid rgba(230,190,255,0.20)", fontSize: 16, flexShrink: 0 }}>
          🌌
        </div>
      )}
      {msg.kind === "voice" ? (
        <div onClick={() => onPlayVoice(msg.id)}>
          <VoiceBubbleInner duration={msg.duration!} played={playingVoiceId === msg.id} asrStatus={msg.asrStatus} asrText={msg.asrText} />
        </div>
      ) : (
        <div
          className="max-w-[72%] px-4 py-3 rounded-2xl"
          style={{
            ...(isAI ? glassAI : glassUser),
            boxShadow: isAI
              ? "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 4px 20px rgba(180,100,240,0.14), inset 0 1px 0 rgba(240,210,255,0.12)",
            borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          }}
        >
          <p style={{ fontSize: 14, lineHeight: "1.7", color: isAI ? "rgba(255,255,255,0.82)" : "rgba(245,225,255,0.92)", fontWeight: 300 }}>
            {msg.text}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Crisis Care Modal ────────────────────────────────────────────────────────
function CrisisCareModal({ onClose }: { onClose: () => void }) {
  const handleCall = () => {
    // Simulate calling - in real app would use window.location.href = "tel:400-161-9995"
    alert("即将拨打希望 24 热线：400-161-9995");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{
        background: "rgba(10,4,30,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.90, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-3xl overflow-hidden"
        style={{
          background: "rgba(30,15,60,0.95)",
          border: "0.5px solid rgba(230,190,255,0.22)",
          boxShadow: "0 16px 56px rgba(100,40,160,0.35), inset 0 1.5px 0 rgba(240,210,255,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.12)",
            }}
          >
            <X size={14} color="rgba(255,255,255,0.45)" strokeWidth={2} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,120,140,0.14)",
                border: "0.5px solid rgba(255,140,160,0.28)",
              }}
            >
              <span style={{ fontSize: 32 }}>❤️</span>
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,220,230,0.95)",
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              我们很关心你
            </h2>

            <p
              style={{
                fontSize: 14.5,
                color: "rgba(230,200,240,0.75)",
                lineHeight: 1.75,
                maxWidth: 260,
              }}
            >
              如果你正在经历痛苦，请记得有人愿意倾听。
            </p>
          </div>
        </div>

        {/* Call button */}
        <div className="px-6 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCall}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,100,120,0.85) 0%, rgba(255,80,140,0.90) 100%)",
              border: "0.5px solid rgba(255,140,160,0.35)",
              boxShadow: "0 8px 32px rgba(255,80,120,0.35), inset 0 1.5px 0 rgba(255,200,220,0.25)",
            }}
          >
            <Phone size={18} color="rgba(255,255,255,0.95)" strokeWidth={2.2} />
            <span
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                color: "rgba(255,255,255,0.98)",
                letterSpacing: "0.04em",
              }}
            >
              呼叫希望 24 热线：400-161-9995
            </span>
          </motion.button>
        </div>

        {/* Continue button */}
        <div className="px-6 pb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full flex items-center justify-center py-3.5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(230,190,255,0.16)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: "rgba(220,200,240,0.85)",
                letterSpacing: "0.04em",
              }}
            >
              继续倾诉
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
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
        boxShadow: "0 8px 40px rgba(40,70,140,0.28), inset 0 1px 0 rgba(255,255,255,0.14)",
      }}>
        {TABS_NAV.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button key={label} onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
              <div className="w-10 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: active ? "rgba(160,210,255,0.18)" : "transparent" }}>
                <Icon size={19} strokeWidth={active ? 2.2 : 1.6}
                  color={active ? "rgba(180,220,255,0.95)" : "rgba(255,255,255,0.28)"} />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? "rgba(180,220,255,0.90)" : "rgba(255,255,255,0.26)", letterSpacing: "0.3px" }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TreehousePage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(100);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text && textToSend === undefined) return;
    if (textToSend === undefined) setInput("");

    if (text) {
      const userMsg: Message = { id: nextId.current++, role: "user", kind: "text", text };
      setMessages((prev) => [...prev, userMsg]);
    }

    setIsTyping(true);
    setTimeout(() => {
      const aiText = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      setMessages((prev) => [...prev, { id: nextId.current++, role: "ai", kind: "text", text: aiText }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  // ── Voice handlers with cancel gesture ──────────────────────────────────────
  const handleMicTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsRecording(true);
    setIsCancelling(false);
    setRecordStartTime(Date.now());
    if ('touches' in e) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY((e as React.MouseEvent).clientY);
    }
  };

  const handleMicTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isRecording || startY === null) return;
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    if (startY - currentY > 60) {
      setIsCancelling(true);
    } else {
      setIsCancelling(false);
    }
  };

  const handleMicTouchEnd = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setStartY(null);

    if (isCancelling) {
      setIsCancelling(false);
      return;
    }

    const totalSeconds = Math.max(1, Math.floor((Date.now() - (recordStartTime || Date.now())) / 1000));
    const formatTime = `0:${totalSeconds < 10 ? "0" : ""}${totalSeconds}`;

    const voiceId = `v-${nextId.current++}`;
    const userVoiceMsg: Message = { id: voiceId, role: "user", kind: "voice", duration: formatTime, asrStatus: "converting" };
    setMessages((prev) => [...prev, userVoiceMsg]);

    // Simulate ASR after 1.5s
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === voiceId ? { ...m, asrStatus: "done", asrText: "这是你刚才说的话..." } : m
        )
      );
    }, 1500);

    setIsTyping(true);
    setTimeout(() => {
      const aiText = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
      setMessages((prev) => [...prev, { id: nextId.current++, role: "ai", kind: "text", text: aiText }]);
      setIsTyping(false);
    }, 3200);
  };

  // Global listeners during recording
  useEffect(() => {
    if (isRecording) {
      const moveHandler = (e: any) => handleMicTouchMove(e);
      const endHandler = () => handleMicTouchEnd();
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("mouseup", endHandler);
      window.addEventListener("touchmove", moveHandler, { passive: false });
      window.addEventListener("touchend", endHandler);
      return () => {
        window.removeEventListener("mousemove", moveHandler);
        window.removeEventListener("mouseup", endHandler);
        window.removeEventListener("touchmove", moveHandler);
        window.removeEventListener("touchend", endHandler);
      };
    }
  }, [isRecording, startY, isCancelling]);

  const handleClearAll = () => {
    setCleared(true);
    setTimeout(() => {
      setMessages([{ id: nextId.current++, role: "ai", kind: "text", text: "已清空 ✨ 星星带走了所有秘密。重新开始吧，我在这里。" }]);
      setCleared(false);
    }, 600);
  };

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
        {/* ── Layer 1: Snowy forest base ────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.45) saturate(1.0)" }}
        />

        {/* ── Layer 2: Dark gradient overlays ──────────────────────── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(16,28,58,0.62) 0%, rgba(24,40,80,0.10) 30%, transparent 55%, rgba(14,22,46,0.22) 72%, rgba(10,16,36,0.76) 100%)",
        }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 280, background: "linear-gradient(to top, rgba(10,16,36,0.80) 0%, transparent 100%)" }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 160, background: "linear-gradient(to bottom, rgba(12,18,40,0.68) 0%, transparent 100%)" }} />

        {/* ── Layer 3: Twinkling stars ──────────────────────────────── */}
        <StarField />

        {/* ── Recording Overlay — anchored near the mic button at the bottom ── */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                background: "rgba(10,4,30,0.58)",
                backdropFilter: "blur(7px)",
                WebkitBackdropFilter: "blur(7px)",
              }}
            >
              {/* Content block anchored above the input bar + tab bar */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: "50%", transform: "translateX(-50%)", bottom: 190 }}
              >
                {isCancelling ? (
                  <>
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: 88,
                        height: 88,
                        background: "rgba(220,60,60,0.88)",
                        boxShadow: "0 0 60px rgba(255,60,60,0.60)",
                        transform: "scale(1.12)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: 38 }}>🗑️</span>
                    </div>
                    <p style={{
                      marginTop: 20,
                      fontSize: 15,
                      fontWeight: 500,
                      color: "rgba(255,100,100,0.95)",
                      letterSpacing: "0.1em",
                      padding: "6px 18px",
                      borderRadius: "20px",
                      background: "rgba(200,40,40,0.22)",
                    }}>
                      松开手指，取消发送
                    </p>
                  </>
                ) : (
                  <>
                    {/* Relative container so ripples & mic share the same center */}
                    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
                      {/* Ripple rings — centered within this container */}
                      {[1, 1.65, 2.3].map((scale, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: 80,
                            height: 80,
                            border: "1.5px solid rgba(200,120,255,0.38)",
                            top: "50%",
                            left: "50%",
                            marginTop: -40,
                            marginLeft: -40,
                          }}
                          animate={{ scale: [1, scale, 1], opacity: [0.55, 0, 0.55] }}
                          transition={{ duration: 2.0, repeat: Infinity, delay: i * 0.55, ease: "easeOut", type: "tween" }}
                          onUpdate={() => {}}
                        />
                      ))}
                      {/* Mic core circle */}
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: 72,
                          height: 72,
                          background: "rgba(160,80,220,0.90)",
                          boxShadow: "0 0 36px rgba(180,80,255,0.55), 0 0 80px rgba(150,60,220,0.22)",
                        }}
                      >
                        <Mic size={28} color="white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <p style={{
                      marginTop: 16,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(230,190,255,0.88)",
                      letterSpacing: "0.12em",
                    }}>
                      松开发送 · 上滑取消
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="relative flex items-center px-5 shrink-0 w-full" style={{ height: 88, paddingTop: 52 }}>
          {/* Title (left side) */}
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 300, letterSpacing: "0.08em", color: "rgba(255,255,255,0.92)", textShadow: "0 2px 20px rgba(210,130,255,0.4)" }}>
              树洞
            </h1>
            <p style={{ fontSize: 11, color: "rgba(230,190,255,0.60)", letterSpacing: "0.06em", marginTop: 1, fontWeight: 400 }}>
              嘴替模式
            </p>
          </div>

          {/* Action buttons — positioned to the left of the WeChat capsule (88px from right) */}
          <div
            className="absolute flex items-center gap-2"
            style={{ right: 88 + 12, top: "50%", transform: "translateY(-50%)" }}
          >
            {/* Deep breathe button */}
            <motion.button
              onClick={() => navigate("/breathe")}
              whileTap={{ scale: 0.86 }}
              className="flex items-center gap-1 px-2.5 h-8 rounded-full"
              style={{
                background: "rgba(180,220,255,0.12)",
                border: "0.5px solid rgba(180,220,255,0.28)",
                boxShadow: "0 2px 10px rgba(180,220,255,0.08)",
              }}
            >
              <span style={{ fontSize: 12 }}>💨</span>
              <span style={{ fontSize: 11.5, color: "rgba(220,240,255,0.88)", letterSpacing: "0.02em" }}>深呼吸</span>
            </motion.button>

            {/* Crisis / care button */}
            <motion.button
              onClick={() => setShowCrisisModal(true)}
              whileTap={{ scale: 0.86 }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,120,140,0.12)",
                border: "0.5px solid rgba(255,140,160,0.28)",
                boxShadow: "0 2px 10px rgba(255,100,120,0.08)",
              }}
            >
              <span style={{ fontSize: 14 }}>❤️</span>
            </motion.button>
          </div>

          {/* WeChat capsule placeholder — always at far right */}
          <div style={{ position: "absolute", right: 8, width: 88, height: 32 }} />
        </div>

        {/* ── Safety Alert & Clear Button ──────────────────────────── */}
        <div className="relative px-4 pb-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 12.5, color: "rgba(255,160,150,0.92)", fontWeight: 400 }}>
              <span style={{ fontWeight: 600, color: "rgba(255,130,120,0.98)" }}>阅后即焚</span>
              ：记录将随星星消失
            </span>
          </div>
          <motion.button
            onClick={handleClearAll}
            whileTap={{ scale: 0.88, rotate: -10 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,80,70,0.12)",
              border: "0.5px solid rgba(255,100,90,0.25)",
              boxShadow: "0 4px 16px rgba(200,40,30,0.15)",
            }}
          >
            <Trash2 size={14} color="rgba(255,130,120,0.88)" strokeWidth={1.8} />
          </motion.button>
        </div>

        {/* ── Chat area ────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto px-4 flex flex-col gap-3 pb-3" style={{ scrollbarWidth: "none" }}>
          <AnimatePresence>
            {!cleared && messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                onPlayVoice={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                playingVoiceId={playingVoiceId}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-end gap-2.5"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(210,150,255,0.12)", border: "0.5px solid rgba(230,190,255,0.20)", fontSize: 16 }}>
                  🌌
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{
                  ...glassAI,
                  borderRadius: "4px 18px 18px 18px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="rounded-full" style={{ width: 5, height: 5, background: "rgba(230,190,255,0.65)" }}
                      animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut", type: "tween" }}
                      onUpdate={() => {}}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ────────────────────────────────────────────── */}
        <div className="relative shrink-0 px-4 pb-2 pt-2">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[24px]" style={{
            ...glassInput,
            boxShadow: "0 8px 40px rgba(80,20,140,0.30), inset 0 1px 0 rgba(230,190,255,0.10)",
          }}>
            {/* Mic icon — long-press to record */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="shrink-0 rounded-full flex items-center justify-center relative"
              style={{
                width: 32,
                height: 32,
                background: isRecording ? "rgba(160,80,220,0.85)" : "transparent",
                border: isRecording ? "0.5px solid rgba(200,130,255,0.50)" : "none",
                transition: "background 0.2s ease",
                boxShadow: isRecording ? "0 0 16px rgba(180,80,255,0.45)" : "none",
              }}
              onMouseDown={handleMicTouchStart}
              onTouchStart={handleMicTouchStart}
            >
              <Mic size={20} color={isRecording ? "rgba(255,255,255,0.95)" : "rgba(230,190,255,0.65)"} strokeWidth={1.6} />
            </motion.button>

            {/* Text input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="说吧，这里没有评判..."
              className="flex-1 bg-transparent outline-none"
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.80)",
                caretColor: "rgba(230,190,255,0.85)",
              }}
            />

            {/* Send button */}
            <motion.button
              onClick={() => sendMessage()}
              whileTap={{ scale: 0.88 }}
              className="shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: input.trim()
                  ? "rgba(210,150,255,0.28)"
                  : "rgba(255,255,255,0.06)",
                border: `0.5px solid ${input.trim() ? "rgba(230,190,255,0.32)" : "rgba(255,255,255,0.10)"}`,
                transition: "all 0.25s ease",
                boxShadow: input.trim() ? "0 0 18px rgba(200,130,255,0.20)" : "none",
              }}
            >
              <Send size={15} color={input.trim() ? "rgba(240,210,255,0.92)" : "rgba(255,255,255,0.28)"} strokeWidth={2} />
            </motion.button>
          </div>

          {/* Voice hint label */}
          <AnimatePresence>
            {!isRecording && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 11,
                  color: "rgba(230,190,255,0.28)",
                  letterSpacing: "0.08em",
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                长按麦克风录音 · 上滑取消发送
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ── Floating tab bar ─────────────────────────────────────── */}
        <FloatingTabBar />

        {/* ── Crisis Care Modal ───────────────────────────────────── */}
        <AnimatePresence>
          {showCrisisModal && <CrisisCareModal onClose={() => setShowCrisisModal(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}