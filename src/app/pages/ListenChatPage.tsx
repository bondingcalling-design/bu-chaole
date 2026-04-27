import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Mic, Send, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "user" | "ai";
type MsgKind = "text" | "voice";
interface Message {
  id: string;
  role: Role;
  kind?: MsgKind;
  text?: string;
  duration?: string;
  asrStatus?: "converting" | "done";
  asrText?: string;
  special?: "treehouse-prompt";
}

// ─── Seed conversation ────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "ai", kind: "text", text: "嗨，我在这里，随时倾听你。今天发生了什么？" },
  { id: "2", role: "user", kind: "text", text: "他今天回家又是一言不发！" },
  { id: "3", role: "ai", kind: "text", text: "我能感受到你的委屈。当时具体发生了什么？" },
  { id: "4", role: "user", kind: "text", text: "他进门之后就把包一扔，一句话都不跟我说！" },
  { id: "5", role: "ai", special: "treehouse-prompt", text: "现在感觉你火气很大，需要去树洞尽情发泄一下吗？" },
];

// ─── AI reply pool ────────────────────────────────────────────────────────────
const AI_REPLIES = [
  "听起来那一刻你感到很被忽视。他扔下包之后，你做了什么？",
  "这种沉默让你觉得是在被惩罚，还是更多的是疏离感？",
  "你有没有试着开口？还是开口之前就已经感到很累了？",
  "他一般在什么时候会这样？是工作压力大的时候吗？",
  "我想帮你把今天这件事看得更清楚。你最难受的那一刻是什么时候？",
  "你现在的感受更多是愤怒，还是一种深深的疲惫？",
];

// ─── AI Typing Indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 px-5">
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
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex items-center gap-[5px] px-4 py-3.5 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "0.5px solid rgba(255,255,255,0.18)",
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

// ─── AI Bubble — clear frosted glass, 10% white, 0.5px border ─────────────────
function AIBubble({ text }: { text: string }) {
  return (
    <motion.div
      className="flex items-end gap-2.5 px-5 justify-start"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Avatar */}
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
      {/* Bubble: 10% white fill, clear frosted glass */}
      <div
        className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "0.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.14)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.68,
            fontWeight: 300,
            letterSpacing: "0.1px",
          }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

// ─── User Bubble — soft solid white glass, dark text ─────────────────────────
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
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "0.5px solid rgba(255,255,255,0.70)",
          boxShadow: "0 6px 28px rgba(60,90,160,0.16), inset 0 1px 0 rgba(255,255,255,1)",
        }}
      >
        <p
          style={{
            fontSize: 15,
            color: "rgba(30,45,80,0.90)",
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

// ─── Waveform bars (static decorative) ───────────────────────────────────────
const WAVE_BARS = [3, 7, 12, 9, 14, 6, 11, 8, 14, 5, 10, 7, 13, 6, 9, 4, 11, 8, 5, 3];

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

// ─── Treehouse Prompt Bubble ──────────────────────────────────────────────────
function TreehousePromptBubble({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      className="flex items-end gap-2.5 px-5"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Avatar */}
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: 30, height: 30, background: "rgba(255,255,255,0.10)", border: "0.5px solid rgba(255,255,255,0.20)", fontSize: 13, alignSelf: "flex-end", marginBottom: 2 }}
      >🤍</div>

      {/* Bubble with inline highlighted "树洞" */}
      <div
        className="max-w-[78%] px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "0.5px solid rgba(255,255,255,0.22)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.14)",
        }}
      >
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", lineHeight: 1.68, fontWeight: 300, letterSpacing: "0.1px" }}>
          现在感觉你火气很大，需要去{" "}
          <button
            onClick={onNavigate}
            style={{
              display: "inline",
              color: "rgba(100,210,255,1)",
              fontWeight: 700,
              background: "rgba(100,210,255,0.14)",
              borderRadius: 8,
              padding: "1px 7px",
              border: "0.5px solid rgba(100,210,255,0.35)",
              cursor: "pointer",
              fontSize: 15,
              boxShadow: "0 0 10px rgba(100,200,255,0.22)",
            }}
          >
            树洞
          </button>
          {" "}尽情发泄一下吗？
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
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.32)",
          letterSpacing: "0.08em",
          padding: "2px 12px",
          borderRadius: 20,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListenChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Detect if navigated from ListenPage with a voice message
  const fromVoice = !!(location.state as any)?.voiceMessage;
  const fromVoiceDuration: string = (location.state as any)?.duration ?? "0:05";

  const [messages, setMessages] = useState<Message[]>(fromVoice ? [] : INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const [bridgePulsing, setBridgePulsing] = useState(false);
  
  // Voice recording states
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceInjectedRef = useRef(false);

  // If arrived from ListenPage with a voice recording, inject voice bubble immediately
  useEffect(() => {
    if (!fromVoice || voiceInjectedRef.current) return;
    voiceInjectedRef.current = true;

    const voiceId = `v-entry-${Date.now()}`;
    const voiceMsg: Message = {
      id: voiceId,
      role: "user",
      kind: "voice",
      duration: fromVoiceDuration,
      asrStatus: "converting",
    };
    // Add voice bubble right away
    setMessages([voiceMsg]);

    // Simulate ASR conversion
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === voiceId
            ? { ...m, asrStatus: "done", asrText: "我想跟你聊聊我最近的感受..." }
            : m
        )
      );
    }, 1800);

    // AI responds after a beat
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `a-entry-${Date.now()}`,
          role: "ai",
          kind: "text",
          text: "嗨，我在这里，随时倾听你。今天发生了什么？",
        },
      ]);
      setIsTyping(false);
    }, 3400);
  }, []);

  // Auto-scroll to bottom on new content
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

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    const delay = 1400 + Math.random() * 600;
    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: AI_REPLIES[replyIdx % AI_REPLIES.length],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setReplyIdx((i) => i + 1);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Compute progress: 30% base + 15% per user message, capped at 92%
  const userMsgCount = messages.filter(m => m.role === "user").length;
  const progressPct = Math.min(92, 30 + userMsgCount * 15);

  const handleBridgeClick = () => {
    setBridgePulsing(true);
    setTimeout(() => {
      setBridgePulsing(false);
      navigate("/review/loading");
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

    // Simulate ASR completion after 1.5s
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === voiceId ? { ...m, asrStatus: "done", asrText: "这是你刚才说的话的识别内容..." } : m
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
      style={{ background: "#0A0F1C" }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          boxShadow: "0 48px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* ── Background ─────────────────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.58) saturate(1.10) hue-rotate(4deg)" }}
        />

        {/* Atmospheric overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,18,44,0.72) 0%, rgba(20,35,72,0.08) 26%, transparent 50%, rgba(10,18,44,0.14) 68%, rgba(6,10,24,0.84) 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{ height: 190, background: "linear-gradient(to bottom, rgba(8,14,34,0.80) 0%, transparent 100%)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 300, background: "linear-gradient(to top, rgba(5,10,22,0.92) 0%, transparent 100%)" }}
        />

        {/* ── Nav Row: back button + WeChat capsule ───────────────────── */}
        <div
          className="relative flex items-center shrink-0"
          style={{ height: 44, paddingLeft: 16, paddingRight: 16 }}
        >
          {/* Back button */}
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
              border: "0.5px solid rgba(255,255,255,0.18)",
            }}
          >
            <ChevronLeft size={19} color="rgba(255,255,255,0.80)" strokeWidth={1.8} />
          </motion.button>

          {/* WeChat capsule placeholder */}
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Progress Bar Header ─────────────────────────────────────── */}
        <div
          className="shrink-0 mx-4 mb-2 px-4 py-3.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "0.5px solid rgba(255,255,255,0.13)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          {/* Top row: label + percentage */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              {/* Breathing dot */}
              <motion.div
                animate={{ opacity: [0.35, 1, 0.35], scale: [0.75, 1.25, 0.75] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                onUpdate={() => {}}
                className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: "rgba(160,218,255,0.95)" }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: "0.06em",
                }}
              >
                倾诉完整度
              </span>
            </div>
            <motion.span
              key={progressPct}
              initial={{ opacity: 0.4, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "rgba(160,218,255,1)",
                letterSpacing: "0.04em",
                textShadow: "0 0 12px rgba(120,190,255,0.55)",
              }}
            >
              {progressPct}%
            </motion.span>
          </div>

          {/* Progress track */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 6, background: "rgba(255,255,255,0.12)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              onUpdate={() => {}}
              style={{
                background:
                  "linear-gradient(to right, rgba(80,170,255,0.85), rgba(180,230,255,1))",
                boxShadow:
                  "0 0 10px rgba(120,190,255,0.65), 0 0 4px rgba(255,255,255,0.40)",
                position: "relative",
              }}
            >
              {/* Glowing tip */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "white",
                  boxShadow: "0 0 8px rgba(160,220,255,1), 0 0 16px rgba(120,190,255,0.70)",
                }}
              />
            </motion.div>
          </div>

          {/* Hint text */}
          <p
            style={{
              fontSize: 10.5,
              color: "rgba(255,255,255,0.34)",
              letterSpacing: "0.05em",
              marginTop: 8,
            }}
          >
            再多说一点，我能分析得更准
          </p>
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", paddingTop: 8, paddingBottom: 10 }}
        >
          <div className="flex flex-col gap-3.5">
            <TimeLabel label="今天 · 刚刚" />

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                if (msg.special === "treehouse-prompt") {
                  return <TreehousePromptBubble key={msg.id} onNavigate={() => navigate("/treehouse")} />;
                }
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

            {/* Typing indicator */}
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

        {/* ── Persistent Bottom Area ─────────────────────────────────── */}
        <div
          className="shrink-0 flex flex-col items-center"
          style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 10, paddingBottom: 26, gap: 10 }}
        >
          {/* ── THE BRIDGE BUTTON ── */}
          {/* Glassmorphism pill with white text */}
          <motion.button
            onClick={handleBridgeClick}
            whileTap={{ scale: 0.97 }}
            animate={
              bridgePulsing
                ? { scale: [1, 1.03, 0.98, 1], opacity: [1, 0.85, 1] }
                : {}
            }
            transition={{ duration: 0.45 }}
            className="flex items-center justify-center gap-2.5"
            style={{
              width: "90%",
              height: 52,
              borderRadius: 26,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "0.5px solid rgba(255,255,255,0.30)",
              cursor: "pointer",
              boxShadow:
                "0 10px 40px rgba(60,100,200,0.20), 0 3px 10px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <FileText size={16} color="rgba(255,255,255,0.85)" strokeWidth={1.9} />
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                textShadow: "0 1px 8px rgba(80,130,220,0.35)",
              }}
            >
              结束倾诉，帮我生成复盘报告
            </span>
          </motion.button>

          {/* ── Input Bar ── */}
          <div
            className="w-full flex items-end gap-2.5 px-3.5 py-2.5 rounded-[26px]"
            style={{
              background: "rgba(255,255,255,0.13)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "0.5px solid rgba(255,255,255,0.26)",
              boxShadow: "0 8px 36px rgba(10,20,60,0.24), inset 0 1px 0 rgba(255,255,255,0.20)",
              minHeight: 52,
            }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="输入你的感受...（最大500字）"
              rows={1}
              className="placeholder:text-white/28"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14.5,
                color: "rgba(255,255,255,0.92)",
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

            {/* Mic ↔ Send */}
            <AnimatePresence mode="wait">
              {inputText.trim().length > 0 ? (
                <motion.button
                  key="send"
                  initial={{ opacity: 0, scale: 0.65, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.65, rotate: 12 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={sendMessage}
                  whileTap={{ scale: 0.85 }}
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    background: "rgba(160,215,255,0.22)",
                    border: "0.5px solid rgba(180,228,255,0.38)",
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
                  whileTap={{ scale: 0.85 }}
                  onMouseDown={handleMicTouchStart}
                  onTouchStart={handleMicTouchStart}
                  className="flex items-center justify-center rounded-full shrink-0 relative group"
                  style={{
                    width: 36,
                    height: 36,
                    background: isRecording ? "rgba(220,70,70,0.85)" : "rgba(255,255,255,0.10)",
                    border: isRecording ? "0.5px solid rgba(255,100,100,0.40)" : "0.5px solid rgba(255,255,255,0.20)",
                    alignSelf: "flex-end",
                    transition: "background 0.2s ease, border 0.2s ease",
                    boxShadow: isRecording ? "0 0 18px rgba(220,70,70,0.40)" : "none",
                  }}
                >
                  <Mic size={16} color={isRecording ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.68)"} strokeWidth={1.6} />
                  
                  {/* Tooltip for long press */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-[44px] whitespace-nowrap px-2 py-1 rounded text-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
                  >
                    按住录音
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Char counter (appears near limit) */}
          <AnimatePresence>
            {inputText.length > 400 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  fontSize: 10.5,
                  color: inputText.length > 480 ? "rgba(255,130,130,0.80)" : "rgba(255,255,255,0.32)",
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
                  color: "rgba(255,255,255,0.30)",
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
                background: "rgba(4,8,22,0.52)",
                backdropFilter: "blur(7px)",
                WebkitBackdropFilter: "blur(7px)",
              }}
            >
              {/* Content block anchored above the input bar */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: "50%", transform: "translateX(-50%)", bottom: 170 }}
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
                        transition: "transform 0.2s ease",
                        transform: "scale(1.12)",
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
                    {/* Relative container so ripples & mic are co-located */}
                    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
                      {/* Ripple rings — centered within this container */}
                      {[1, 1.65, 2.3].map((scale, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: 80,
                            height: 80,
                            border: "1.5px solid rgba(180,220,255,0.35)",
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
                          background: "rgba(140,200,255,0.88)",
                          boxShadow: "0 0 36px rgba(140,200,255,0.50), 0 0 80px rgba(100,170,255,0.22)",
                        }}
                      >
                        <Mic size={28} color="white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <p style={{
                      marginTop: 16,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(200,235,255,0.88)",
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
      </div>
    </div>
  );
}