import { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, Bell, Lock, Fingerprint, Globe, Moon,
  Volume2, MessageSquare, Palette, RefreshCw, Trash2, AlertTriangle, UserX,
  User, Phone, Shield, Smartphone, Edit3,
} from "lucide-react";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";
import { useNavigate } from "react-router";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!on)}
      className="relative shrink-0"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? "rgba(160,210,255,0.85)" : "rgba(255,255,255,0.18)",
        border: on ? "0.5px solid rgba(160,220,255,0.60)" : "0.5px solid rgba(255,255,255,0.22)",
        transition: "background 0.26s ease, border 0.26s ease",
      }}
      whileTap={{ scale: 0.94 }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="absolute top-1"
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: on ? "white" : "rgba(255,255,255,0.70)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}
      />
    </motion.button>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.65)", letterSpacing: "1px", textTransform: "uppercase", paddingLeft: 2, marginBottom: 8, marginTop: 4 }}>
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();

  const [toggles, setToggles] = useState({
    pushNotify: true,
    dailyReminder: true,
    soundFeedback: false,
    hapticFeedback: true,
    biometric: true,
    darkMode: true,
    autoSync: true,
    readReceipt: false,
    aiVoice: true,
    calendarSync: false,
  });

  const setToggle = (key: keyof typeof toggles) => (v: boolean) =>
    setToggles((prev) => ({ ...prev, [key]: v }));

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [nickname, setNickname] = useState("不吃了用户");
  const [nicknameInput, setNicknameInput] = useState("");

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
          style={{ filter: "brightness(0.58) saturate(1.05) hue-rotate(6deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(16,28,58,0.62) 0%, rgba(24,40,80,0.10) 30%, transparent 55%, rgba(14,22,46,0.22) 72%, rgba(10,16,36,0.76) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 170, background: "linear-gradient(to bottom, rgba(12,18,40,0.70) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 220, background: "linear-gradient(to top, rgba(10,14,34,0.78) 0%, transparent 100%)" }} />

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

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingRight: 88 + 16 }}>
            <h1 style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.92)", letterSpacing: "0.06em", textShadow: "0 2px 16px rgba(60,100,200,0.35)" }}>
              设置
            </h1>
          </div>

          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto px-4 flex flex-col gap-1 pb-8 pt-1" style={{ scrollbarWidth: "none" }}>

          {/* ── Account Settings ──────────────────────────────────── */}
          <SectionLabel>账号设置</SectionLabel>

          {/* Avatar + nickname row */}
          <div className="rounded-2xl overflow-hidden mb-1 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {/* Avatar */}
            <motion.button whileTap={{ scale: 0.985 }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(160,210,255,0.12)", border: "0.5px solid rgba(160,210,255,0.24)" }}>
                <User size={15} color="rgba(160,210,255,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>头像</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>点击更换头像</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center mr-1" style={{ background: "rgba(160,210,255,0.15)", border: "0.5px solid rgba(160,210,255,0.24)", fontSize: 20 }}>
                🙂
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>

            <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

            {/* Nickname */}
            <motion.button whileTap={{ scale: 0.985 }} onClick={() => { setNicknameInput(nickname); setShowNicknameEdit(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(200,175,255,0.12)", border: "0.5px solid rgba(200,175,255,0.24)" }}>
                <Edit3 size={14} color="rgba(200,175,255,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>昵称</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>修改显示名称</p>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", marginRight: 6, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nickname}</span>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>

            <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

            {/* WeChat ID */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(140,235,200,0.12)", border: "0.5px solid rgba(140,235,200,0.24)" }}>
                <MessageSquare size={14} color="rgba(140,235,200,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>微信号</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>设置后不可更改</p>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>budchile_001</span>
            </div>
          </div>

          {/* Phone & security */}
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {/* Bound phone */}
            <motion.button whileTap={{ scale: 0.985 }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,210,130,0.12)", border: "0.5px solid rgba(255,210,130,0.24)" }}>
                <Phone size={14} color="rgba(255,210,130,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>绑定手机号</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>用于账号安全与找回</p>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginRight: 6 }}>138****8888</span>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>

            <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

            {/* Account security */}
            <motion.button whileTap={{ scale: 0.985 }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(160,210,255,0.12)", border: "0.5px solid rgba(160,210,255,0.24)" }}>
                <Shield size={14} color="rgba(160,210,255,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>账号安全</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>登录密码、二次验证</p>
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>

            <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

            {/* Device management */}
            <motion.button whileTap={{ scale: 0.985 }} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,180,130,0.12)", border: "0.5px solid rgba(255,180,130,0.24)" }}>
                <Smartphone size={14} color="rgba(255,180,130,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>登录设备管理</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>查看并移除已登录设备</p>
              </div>
              <div className="flex items-center gap-1.5 mr-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(140,235,180,0.90)" }} />
                <span style={{ fontSize: 11.5, color: "rgba(140,235,180,0.80)" }}>1 台设备</span>
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>
          </div>

          {/* ── Notifications ─────────────────────────────────────── */}
          <SectionLabel>通知</SectionLabel>
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {[
              { icon: Bell, label: "推送通知", sub: "接收 AI 陪伴提醒", key: "pushNotify", iconColor: "rgba(160,210,255,0.9)", iconBg: "rgba(160,210,255,0.12)" },
              { icon: Moon, label: "每日情感签到", sub: "每天 21:00 情感检查提醒", key: "dailyReminder", iconColor: "rgba(200,175,255,0.9)", iconBg: "rgba(200,175,255,0.12)" },
              { icon: Volume2, label: "声音反馈", sub: "交互音效", key: "soundFeedback", iconColor: "rgba(140,235,200,0.9)", iconBg: "rgba(140,235,200,0.12)" },
              { icon: Volume2, label: "触觉反馈", sub: "震动提示", key: "hapticFeedback", iconColor: "rgba(255,180,130,0.9)", iconBg: "rgba(255,180,130,0.12)" },
              { icon: MessageSquare, label: "已读回执", sub: "显示消息已读状态", key: "readReceipt", iconColor: "rgba(255,210,130,0.9)", iconBg: "rgba(255,210,130,0.12)" },
            ].map(({ icon: Icon, label, sub, key, iconColor, iconBg }, idx, arr) => (
              <div key={key}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg, border: `0.5px solid ${iconColor.replace("0.9", "0.24")}` }}>
                    <Icon size={15} color={iconColor} strokeWidth={1.9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>{sub}</p>
                  </div>
                  <Toggle on={toggles[key as keyof typeof toggles]} onChange={setToggle(key as keyof typeof toggles)} />
                </div>
                {idx < arr.length - 1 && <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />}
              </div>
            ))}
          </div>

          {/* ── Privacy & Security ────────────────────────────────── */}
          <SectionLabel>隐私与安全</SectionLabel>
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {[
              { icon: Fingerprint, label: "生物识别解锁", sub: "Face ID / 指纹", key: "biometric", isToggle: true, iconColor: "rgba(160,210,255,0.9)", iconBg: "rgba(160,210,255,0.12)" },
              { icon: Lock, label: "对话加密存储", sub: "本地 AES-256 加密", key: "encrypt", isToggle: false, iconColor: "rgba(200,175,255,0.9)", iconBg: "rgba(200,175,255,0.12)" },
              { icon: Globe, label: "语言与地区", sub: "简体中文（中国大陆）", key: "lang", isToggle: false, iconColor: "rgba(255,210,130,0.9)", iconBg: "rgba(255,210,130,0.12)" },
            ].map(({ icon: Icon, label, sub, key, isToggle, iconColor, iconBg }, idx, arr) => (
              <div key={key}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg, border: `0.5px solid ${iconColor.replace("0.9", "0.24")}` }}>
                    <Icon size={15} color={iconColor} strokeWidth={1.9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>{sub}</p>
                  </div>
                  {isToggle
                    ? <Toggle on={toggles[key as keyof typeof toggles] ?? false} onChange={setToggle(key as keyof typeof toggles)} />
                    : <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
                  }
                </div>
                {idx < arr.length - 1 && <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />}
              </div>
            ))}
          </div>

          {/* ── Experience ───────────────────────────────────────── */}
          <SectionLabel>体验</SectionLabel>
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {[
              { icon: Moon, label: "深色模式", sub: "跟随系统 / 始终开启", key: "darkMode", isToggle: true, iconColor: "rgba(200,175,255,0.9)", iconBg: "rgba(200,175,255,0.12)" },
              { icon: Volume2, label: "AI 语音回应", sub: "文字转语音朗读回复", key: "aiVoice", isToggle: true, iconColor: "rgba(140,235,200,0.9)", iconBg: "rgba(140,235,200,0.12)" },
              { icon: Palette, label: "主题风格", sub: "雪林黎明（当前）", key: "theme", isToggle: false, iconColor: "rgba(255,210,130,0.9)", iconBg: "rgba(255,210,130,0.12)" },
              { icon: RefreshCw, label: "自动同步", sub: "数据实时云端备份", key: "autoSync", isToggle: true, iconColor: "rgba(160,210,255,0.9)", iconBg: "rgba(160,210,255,0.12)" },
            ].map(({ icon: Icon, label, sub, key, isToggle, iconColor, iconBg }, idx, arr) => (
              <div key={key}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg, border: `0.5px solid ${iconColor.replace("0.9", "0.24")}` }}>
                    <Icon size={15} color={iconColor} strokeWidth={1.9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
                    <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>{sub}</p>
                  </div>
                  {isToggle
                    ? <Toggle on={toggles[key as keyof typeof toggles] ?? false} onChange={setToggle(key as keyof typeof toggles)} />
                    : <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
                  }
                </div>
                {idx < arr.length - 1 && <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />}
              </div>
            ))}
          </div>

          {/* ── Data & Storage ───────────────────────────────────── */}
          <SectionLabel>数据与存储</SectionLabel>
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            {/* Storage usage bar */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.80)" }}>本地缓存</p>
                <p style={{ fontSize: 12, color: "rgba(160,210,255,0.80)" }}>12.4 MB / 500 MB</p>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.10)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "2.5%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 2, background: "rgba(160,210,255,0.70)" }}
                />
              </div>
            </div>

            <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />

            {/* Clear cache */}
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,180,100,0.12)", border: "0.5px solid rgba(255,180,100,0.24)" }}>
                <Trash2 size={15} color="rgba(255,180,100,0.90)" strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>清除缓存</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>清除临时文件，不影响对话记录</p>
              </div>
              <ChevronRight size={14} color="rgba(255,255,255,0.22)" strokeWidth={2} />
            </motion.button>
          </div>

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <SectionLabel>危险操作</SectionLabel>
          <div className="rounded-2xl overflow-hidden mb-3 shrink-0" style={{
            background: "rgba(255,70,60,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "0.5px solid rgba(255,90,80,0.22)",
            boxShadow: "0 4px 24px rgba(200,50,40,0.10), inset 0 1px 0 rgba(255,110,100,0.12)",
          }}>
            <motion.button
              whileTap={{ scale: 0.986 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,70,60,0.14)", border: "0.5px solid rgba(255,90,80,0.28)" }}>
                <UserX size={15} strokeWidth={1.9} color="rgba(255,110,100,0.92)" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,110,100,0.90)" }}>注销账号并粉碎数据</p>
                <p style={{ fontSize: 10.5, color: "rgba(255,100,90,0.42)", marginTop: 1 }}>此操作不可逆，数据将永久删除</p>
              </div>
              <ChevronRight size={14} strokeWidth={2} color="rgba(255,100,90,0.28)" />
            </motion.button>
          </div>

          {/* Version info */}
          <div className="flex flex-col items-center gap-1 py-3">
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.20)" }}>不吃了 · v1.2.0</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)" }}>Build 2024.11.15</p>
          </div>
        </div>

        {/* ── Clear cache confirm toast ─────────────────────────── */}
        {showClearConfirm && (
          <div className="absolute inset-0 flex items-end justify-center pb-24 pointer-events-none z-50" style={{ paddingLeft: 24, paddingRight: 24 }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="pointer-events-auto w-full rounded-3xl px-5 py-5"
              style={{
                background: "rgba(14,22,50,0.92)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "0.5px solid rgba(255,255,255,0.16)",
                boxShadow: "0 20px 80px rgba(0,0,0,0.60)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={18} color="rgba(255,180,100,0.90)" strokeWidth={1.8} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>确认清除缓存？</p>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", lineHeight: 1.65, marginBottom: 18 }}>
                这将清除 12.4 MB 的临时文件，不会影响你的对话记录和分析报告。
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.09)", border: "0.5px solid rgba(255,255,255,0.16)", fontSize: 14, color: "rgba(255,255,255,0.70)" }}
                >
                  取消
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl"
                  style={{ background: "rgba(255,180,100,0.85)", fontSize: 14, fontWeight: 600, color: "white" }}
                >
                  清除
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Nickname edit sheet ───────────────────────────────── */}
        {showNicknameEdit && (
          <div className="absolute inset-0 flex items-end justify-center pointer-events-auto z-50"
            style={{ background: "rgba(10,16,36,0.60)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onClick={() => setShowNicknameEdit(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-t-3xl px-5 pt-5 pb-8"
              style={{
                background: "rgba(14,22,50,0.96)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "0.5px solid rgba(255,255,255,0.14)",
                boxShadow: "0 -16px 60px rgba(0,0,0,0.50)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>修改昵称</p>
                <button onClick={() => setShowNicknameEdit(false)} style={{ fontSize: 13, color: "rgba(255,255,255,0.40)" }}>取消</button>
              </div>
              <input
                autoFocus
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                placeholder="请输入新昵称"
                className="w-full outline-none px-4 py-3.5 rounded-2xl mb-4"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 15,
                  caretColor: "rgba(160,210,255,0.90)",
                }}
              />
              <div className="flex justify-end mb-4">
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>{nicknameInput.length}/20</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (nicknameInput.trim()) { setNickname(nicknameInput.trim()); } setShowNicknameEdit(false); }}
                className="w-full py-3.5 rounded-2xl"
                style={{
                  background: nicknameInput.trim() ? "rgba(160,210,255,0.88)" : "rgba(255,255,255,0.12)",
                  color: nicknameInput.trim() ? "#0E1520" : "rgba(255,255,255,0.30)",
                  fontWeight: 700, fontSize: 15,
                  transition: "all 0.22s ease",
                }}
              >
                保存
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}