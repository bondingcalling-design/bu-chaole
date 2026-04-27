import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Mic, Send, Waves } from "lucide-react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "user" | "ai";
type MsgKind = "text" | "voice";
interface Message {
  id: string;
  role: Role;
  kind: MsgKind;
  text?: string;
  duration?: string;
  asrStatus?: "converting" | "done";
  asrText?: string;
}

// ─── Seed conversation ────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "ai",
    kind: "text",
    text: "嗨，我在这里。今天想聊点什么呢？",
  },
  {
    id: "m2",
    role: "user",
    kind: "text",
    text: "他今天回家又是一言不发，我真的很受伤。",
  },
  {
    id: "m3",
    role: "ai",
    kind: "text",
    text: "我能感受到你的委屈。当时具体发生了什么？",
  },
  {
    id: "m4",
    role: "user",
    kind: "voice",
    duration: "0:15",
  },
  {
    id: "m5",
    role: "ai",
    kind: "text",
    text: "我听到了。这件事让你觉得很不公平，对吗？你可以继续跟我说细节。",
  },
];

// ─── AI reply pool ────────────────────────────────────────────────────────────
const AI_REPLIES = [
  "嗯，这种被忽视的感觉真的很难受。他有没有给你任何眼神或肢体上的回应？",
  "你有没有试着主动说话？还是开口之前就已经感到很累了？",
  "他的沉默让你感到的是愤怒，还是更多的是一种失落？",
  "我想帮你把这件事看得更清楚一些。这种情况，是第一次，还是有过很多次了？",
  "你现在的感受更多是愤怒，还是一种深深的疲惫？",
];

// ─── Waveform bars (static decorative) ───────────────────────────────────────
const WAVE_BARS = [3, 7, 12, 9, 14, 6, 11, 8, 14, 5, 10, 7, 13, 6, 9, 4, 11, 8, 5, 3];

// ─── AI Typing Indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 px-5">
      <AIAvatar />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-[5px] px-4 py-3.5 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
          border: "0.5px solid rgba(255,255,255,0.22)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 5, height: 5, background: "rgba(255,255,255,0.55)" }}
            animate={{ y: [0, -4, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut", delay: i * 0.16, type: "tween" }}
            onUpdate={() => {}}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── AI Avatar ───────────────────────────────────────────────────────────────
function AIAvatar() {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: 30,
        height: 30,
        background: "rgba(255,255,255,0.10)",
        border: "0.5px solid rgba(255,255,255,0.20)",
        fontSize: 13,
        alignSelf: "flex-end",
        marginBottom: 2,
      }}
    >
      🤍
    </div>
  );
}

// ─── User Voice Bubble ────────────────────────────────────────────────────────
function VoiceBubble({ duration, played, asrStatus, asrText }: { duration: string; played: boolean; asrStatus?: "converting" | "done"; asrText?: string }) {
  return (
    <motion.div
      className="flex flex-col items-end px-5 gap-1.5"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-br-sm"
        style={{
          background: played
            ? "rgba(140,190,160,0.78)"
            : "rgba(255,255,255,0.88)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: played
            ? "0.5px solid rgba(160,210,180,0.60)"
            : "0.5px solid rgba(255,255,255,0.72)",
          boxShadow: "0 6px 28px rgba(40,70,130,0.16), inset 0 1px 0 rgba(255,255,255,0.90)",
          minWidth: 148,
        }}
      >
        {/* Play/Pause icon area */}
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: 32,
            height: 32,
            background: played ? "rgba(255,255,255,0.28)" : "rgba(30,55,110,0.14)",
            border: played
              ? "0.5px solid rgba(255,255,255,0.40)"
              : "0.5px solid rgba(30,55,110,0.18)",
          }}
        >
          {/* Play triangle */}
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none">
            <path
              d="M2 1.5L9.5 6L2 10.5V1.5Z"
              fill={played ? "rgba(255,255,255,0.92)" : "rgba(30,50,100,0.75)"}
            />
          </svg>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-[2.5px]" style={{ height: 22 }}>
          {WAVE_BARS.map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0.4 }}
              animate={
                played
                  ? { scaleY: [0.4, 1, 0.6, 0.9, 0.5, 1, 0.7], opacity: [0.5, 1, 0.7, 1, 0.6, 1, 0.8] }
                  : { scaleY: 1 }
              }
              transition={
                played
                  ? { duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.04, type: "tween" }
                  : { duration: 0.4, delay: i * 0.018, ease: "easeOut" }
              }
              onUpdate={() => {}}
              className="rounded-full"
              style={{
                width: 2.5,
                height: h,
                background: played
                  ? "rgba(255,255,255,0.85)"
                  : `rgba(30,55,110,${0.35 + (h / 14) * 0.45})`,
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        {/* Duration */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: played ? "rgba(255,255,255,0.85)" : "rgba(30,50,100,0.65)",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          {duration}
        </span>
      </div>

      {/* ASR Text Box */}
      <AnimatePresence>
        {asrStatus && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            className="flex items-center px-4 py-2.5 rounded-2xl rounded-tr-sm rounded-br-sm"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid rgba(255,255,255,0.22)",
              maxWidth: "75%",
            }}
          >
            {asrStatus === "converting" ? (
              <span className="flex items-center gap-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, type: "tween" }} onUpdate={() => {}}>转</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3, type: "tween" }} onUpdate={() => {}}>文</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, type: "tween" }} onUpdate={() => {}}>字</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.9, type: "tween" }} onUpdate={() => {}}>中</motion.span>
              </span>
            ) : (
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                {asrText}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── AI Text Bubble — 50px blur, 0.5px border ─────────────────────────────────
function AIBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-end gap-2.5 px-5"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <AIAvatar />
      <div
        className="max-w-[72%] px-4 py-3.5 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(50px)",
          WebkitBackdropFilter: "blur(50px)",
          border: "0.5px solid rgba(255,255,255,0.28)",
          boxShadow:
            "0 6px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.90)",
            lineHeight: 1.72,
            fontWeight: 300,
            letterSpacing: "0.10px",
          }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

// ─── User Text Bubble ─────────────────────────────────────────────────────────
function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex justify-end px-5"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-sm"
        style={{
          background: "rgba(255,255,255,0.90)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "0.5px solid rgba(255,255,255,0.70)",
          boxShadow:
            "0 6px 28px rgba(60,90,160,0.14), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "rgba(26,42,82,0.90)",
            lineHeight: 1.65,
            fontWeight: 400,
            letterSpacing: "0.08px",
          }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Time Label ───────────────────────────────────────────────────────────────
function TimeLabel({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span
        className="px-3 py-1 rounded-full"
        style={{
          fontSize: 10.5,
          color: "rgba(255,255,255,0.30)",
          background: "rgba(255,255,255,0.07)",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Mic Recording Ripple (decorative when holding mic) ───────────────────────
function RecordingIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {[1, 1.6, 2.2].map((scale, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: 36, height: 36, background: "rgba(255,100,100,0.12)", border: "1px solid rgba(255,100,100,0.20)" }}
            animate={{ scale: [1, scale, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.55, ease: "easeOut", type: "tween" }}
            onUpdate={() => {}}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListenVoicePage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [bridgePressing, setBridgePressing] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > 500) return;
    setInputText(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 116) + "px";
    }
  };

  const sendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", kind: "text", text: trimmed },
    ]);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          kind: "text",
          text: AI_REPLIES[replyIdx % AI_REPLIES.length],
        },
      ]);
      setReplyIdx((i) => i + 1);
      setIsTyping(false);
    }, 1500 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBridge = () => {
    setBridgePressing(true);
    setTimeout(() => {
      setBridgePressing(false);
      navigate("/review/report");
    }, 520);
  };

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

    const voiceId = `v-${Date.now()}`;
    const userVoiceMsg: Message = { id: voiceId, role: "user", kind: "voice", duration: formatTime, asrStatus: "converting" };
    setMessages((prev) => [...prev, userVoiceMsg]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === voiceId ? { ...m, asrStatus: "done", asrText: "这是你刚才语音的内容..." } : m
        )
      );
    }, 1500);

    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          kind: "text",
          text: AI_REPLIES[replyIdx % AI_REPLIES.length],
        },
      ]);
      setReplyIdx((i) => i + 1);
      setIsTyping(false);
    }, 3200);
  };

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

  return (
    <div
      className="flex justify-center items-center w-full min-h-screen"
      style={{ background: "#080D1A" }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow:
            "0 48px 120px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >
        {/* ── Background ─────────────────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.55) saturate(1.08) hue-rotate(4deg)" }}
        />
        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,15,40,0.74) 0%, rgba(18,32,68,0.06) 24%, transparent 48%, rgba(8,14,36,0.14) 68%, rgba(4,8,20,0.88) 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 200,
            background: "linear-gradient(to bottom, rgba(6,11,28,0.82) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 320,
            background: "linear-gradient(to top, rgba(4,7,18,0.94) 0%, transparent 100%)",
          }}
        />
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "8%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,190,255,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* ── Recording overlay (full screen frost) ──────────────────── */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
              style={{
                background: "rgba(4,8,22,0.55)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              {isCancelling ? (
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 90,
                    height: 90,
                    background: "rgba(220,60,60,0.88)",
                    boxShadow: "0 0 60px rgba(255,60,60,0.65)",
                    transform: "scale(1.15)",
                    transition: "transform 0.2s ease, background 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 40 }}>🗑️</span>
                </div>
              ) : (
                <>
                  {/* Ripple rings */}
                  {[1, 1.7, 2.4].map((scale, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 80,
                        height: 80,
                        border: "1.5px solid rgba(255,90,90,0.30)",
                        top: "50%",
                        left: "50%",
                        marginTop: -40,
                        marginLeft: -40,
                      }}
                      animate={{ scale: [1, scale, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.6, ease: "easeOut", type: "tween" }}
                      onUpdate={() => {}}
                    />
                  ))}
                  {/* Mic core */}
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: 72,
                      height: 72,
                      background: "rgba(240,80,80,0.88)",
                      boxShadow: "0 0 40px rgba(255,60,60,0.45)",
                    }}
                  >
                    <Mic size={28} color="white" strokeWidth={1.6} />
                  </div>
                </>
              )}
              <p
                style={{
                  marginTop: 24,
                  fontSize: 15,
                  fontWeight: 500,
                  color: isCancelling ? "rgba(255,100,100,0.95)" : "rgba(255,255,255,0.85)",
                  letterSpacing: "0.1em",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: isCancelling ? "rgba(200,40,40,0.25)" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {isCancelling ? "松开手指，取消发送" : "松开发送 · 上滑取消"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center shrink-0"
          style={{ height: 48, paddingLeft: 16, paddingRight: 16 }}
        >
          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.86 }}
            onClick={() => navigate("/")}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 34,
              height: 34,
              background: "rgba(255,255,255,0.09)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "0.5px solid rgba(255,255,255,0.17)",
            }}
          >
            <ChevronLeft size={19} color="rgba(255,255,255,0.80)" strokeWidth={1.8} />
          </motion.button>

          {/* Center title — clear of 88px capsule */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingRight: 88 + 16 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.38, 1, 0.38], scale: [0.78, 1.22, 0.78] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                onUpdate={() => {}}
                className="rounded-full"
                style={{ width: 6, height: 6, background: "rgba(160,218,255,0.92)" }}
              />
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 300,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.93)",
                  textShadow: "0 1px 18px rgba(80,130,220,0.50)",
                }}
              >
                倾听中...
              </h1>
            </div>
          </div>

          {/* WeChat capsule reserve */}
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* Hairline divider */}
        <div
          className="shrink-0 mx-5"
          style={{
            height: 0.5,
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.13) 20%, rgba(255,255,255,0.13) 80%, transparent)",
            marginBottom: 6,
          }}
        />

        {/* ── Chat Area ──────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", paddingTop: 8, paddingBottom: 8 }}
        >
          <div className="flex flex-col gap-3.5">
            <TimeLabel label="今天 · 刚刚" />

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.role === "user" && msg.kind === "voice") {
                  return (
                    <div key={msg.id} onClick={() => setPlayingVoiceId((id) => (id === msg.id ? null : msg.id))}>
                      <VoiceBubble 
                        duration={msg.duration!} 
                        played={playingVoiceId === msg.id}
                        asrStatus={msg.asrStatus}
                        asrText={msg.asrText} 
                      />
                    </div>
                  );
                }
                if (msg.role === "user") {
                  return <UserBubble key={msg.id} text={msg.text!} />;
                }
                return <AIBubble key={msg.id} text={msg.text!} />;
              })}
            </AnimatePresence>

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.22 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Sticky Bottom Area ─────────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col items-center"
          style={{
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 10,
            paddingBottom: 28,
            gap: 10,
          }}
        >
          {/* ══ THE BRIDGE BUTTON — dark frosted glass, pure white text ══ */}
          <motion.button
            onClick={handleBridge}
            whileTap={{ scale: 0.97 }}
            animate={bridgePressing ? { scale: [1, 1.02, 0.98, 1], opacity: [1, 0.88, 1] } : {}}
            transition={{ duration: 0.42 }}
            className="flex items-center justify-center gap-2.5"
            style={{
              width: "90%",
              height: 52,
              borderRadius: 26,
              /* Deep slate frosted glass */
              background: "rgba(28,44,90,0.72)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "0.5px solid rgba(120,160,255,0.28)",
              boxShadow:
                "0 10px 40px rgba(20,40,120,0.45), 0 2px 8px rgba(0,0,0,0.28), inset 0 1px 0 rgba(180,210,255,0.18)",
              cursor: "pointer",
            }}
          >
            {/* Sparkle-like icon */}
            <Waves size={16} color="rgba(255,255,255,0.75)" strokeWidth={1.6} />
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: "rgba(255,255,255,1)",           /* ← PURE WHITE */
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                textShadow: "0 1px 12px rgba(120,170,255,0.50)",
              }}
            >
              结束倾诉，生成复盘报告
            </span>
          </motion.button>

          {/* ══ Input Bar ══ */}
          <div
            className="w-full flex items-end gap-2.5 px-3.5 py-2.5 rounded-[26px]"
            style={{
              background: "rgba(255,255,255,0.11)",
              backdropFilter: "blur(36px)",
              WebkitBackdropFilter: "blur(36px)",
              border: "0.5px solid rgba(255,255,255,0.22)",
              boxShadow:
                "0 8px 36px rgba(8,16,50,0.30), inset 0 1px 0 rgba(255,255,255,0.16)",
              minHeight: 52,
            }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="输入你的感受..."
              rows={1}
              className="placeholder:text-white/30"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14.5,
                color: "rgba(255,255,255,0.90)",
                lineHeight: "1.60",
                fontWeight: 300,
                letterSpacing: "0.06px",
                scrollbarWidth: "none",
                minHeight: 32,
                maxHeight: 116,
                overflowY: "auto",
                alignSelf: "flex-end",
              }}
            />

            {/* Send ↔ Mic */}
            <AnimatePresence mode="wait">
              {inputText.trim().length > 0 ? (
                <motion.button
                  key="send"
                  initial={{ opacity: 0, scale: 0.65, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.65, rotate: 12 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={sendMessage}
                  whileTap={{ scale: 0.84 }}
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(160,215,255,0.20)",
                    border: "0.5px solid rgba(180,228,255,0.36)",
                    alignSelf: "flex-end",
                  }}
                >
                  <Send size={15} color="rgba(200,238,255,0.92)" strokeWidth={1.8} />
                </motion.button>
              ) : (
                <motion.button
                  key="mic"
                  initial={{ opacity: 0, scale: 0.65 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.65 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  whileTap={{ scale: 0.84 }}
                  onMouseDown={handleMicTouchStart}
                  onTouchStart={handleMicTouchStart}
                  className="flex items-center justify-center rounded-full shrink-0 relative group"
                  style={{
                    width: 36,
                    height: 36,
                    background: isRecording
                      ? "rgba(220,70,70,0.85)"
                      : "rgba(255,255,255,0.10)",
                    border: isRecording
                      ? "0.5px solid rgba(255,100,100,0.40)"
                      : "0.5px solid rgba(255,255,255,0.18)",
                    alignSelf: "flex-end",
                    transition: "background 0.2s ease, border 0.2s ease",
                    boxShadow: isRecording ? "0 0 18px rgba(220,70,70,0.40)" : "none",
                  }}
                >
                  <Mic
                    size={16}
                    color={isRecording ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)"}
                    strokeWidth={1.6}
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Char counter */}
          <AnimatePresence>
            {inputText.length > 400 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  fontSize: 10.5,
                  color:
                    inputText.length > 480
                      ? "rgba(255,120,120,0.80)"
                      : "rgba(255,255,255,0.30)",
                  alignSelf: "flex-end",
                  marginTop: -4,
                }}
              >
                {inputText.length} / 500
              </motion.p>
            )}
          </AnimatePresence>

          {/* ── Voice hint (shown when mic is visible) ── */}
          <AnimatePresence>
            {inputText.trim().length === 0 && !isRecording && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.28)",
                  letterSpacing: "0.08em",
                  textAlign: "center",
                  marginTop: -4,
                }}
              >
                长按麦克风录音 · 上滑取消发送
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}