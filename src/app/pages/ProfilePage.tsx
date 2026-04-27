import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import {
  Headphones, TreePine, BarChart2, User,
  ChevronRight, Crown, Zap, RefreshCw, FileDown, Settings,
  UserX, Bell, Share2, Star, HelpCircle, Edit3, Calendar, Lock, Check, Users,
} from "lucide-react";
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

// ─── VIP Card ─────────────────────────────────────────────────────────────────
function VipCard({ onPress }: { onPress: () => void }) {
  return (
    <motion.div
      onClick={onPress}
      whileTap={{ scale: 0.97 }}
      style={{
        position: "relative",
        width: "100%",
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 22,
        cursor: "pointer",
        background: "linear-gradient(135deg, #2A1F08 0%, #3D2D0A 40%, #2E2208 100%)",
        border: "1px solid rgba(255,210,80,0.38)",
        boxShadow: "0 8px 48px rgba(180,120,0,0.30), 0 2px 8px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,230,120,0.22)",
      }}
    >
      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%", "200%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.63, 1], type: "tween" }}
        onUpdate={() => {}}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg, transparent 35%, rgba(255,230,100,0.12) 50%, transparent 65%)",
        }}
      />
      {/* Gold glow blobs */}
      <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,190,40,0.22) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 10, bottom: -15, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,160,20,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Main row */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
        {/* Crown icon */}
        <div style={{
          width: 50, height: 50, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(255,210,60,0.22) 0%, rgba(200,140,20,0.18) 100%)",
          border: "1px solid rgba(255,215,80,0.42)",
          boxShadow: "0 4px 20px rgba(180,120,0,0.28), inset 0 1px 0 rgba(255,240,150,0.20)",
        }}>
          <Crown size={24} strokeWidth={1.6} color="rgb(255,210,60)" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(255,232,120)", letterSpacing: "-0.2px", margin: 0 }}>
              升级专业版 VIP
            </p>
            <span style={{
              fontSize: 9.5, fontWeight: 700, color: "rgb(30,18,0)",
              background: "rgb(255,210,60)", letterSpacing: "0.02em",
              padding: "1px 5px", borderRadius: 5,
            }}>
              限时
            </span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,200,80,0.58)", lineHeight: 1.5, margin: 0 }}>
            解锁无限AI对话 · 长效情感记忆 · 深度分析报告
          </p>
        </div>

        {/* CTA button */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "7px 14px", borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg, rgba(255,218,60,0.96) 0%, rgba(220,162,20,0.96) 100%)",
          boxShadow: "0 4px 16px rgba(180,120,0,0.38)",
        }}>
          <Zap size={11} strokeWidth={2.5} color="rgb(30,18,0)" />
          <span style={{ fontSize: 12, fontWeight: 800, color: "rgb(30,18,0)", letterSpacing: "0.02em" }}>开通</span>
        </div>
      </div>

      {/* Bottom perks row */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "8px 20px",
        borderTop: "0.5px solid rgba(255,210,80,0.16)",
      }}>
        {["无限对话", "专属记忆", "深度报告", "优先响应"].map((perk) => (
          <div key={perk} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: "rgba(255,205,70,0.58)" }}>✦</span>
            <span style={{ fontSize: 10.5, color: "rgba(255,205,70,0.65)", letterSpacing: "0.02em" }}>{perk}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl" style={{ ...glassInner }}>
      <p style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.5px" }}>{value}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{label}</p>
    </div>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function SettingRow({
  icon: Icon, label, sub, iconColor, iconBg, onClick, isLast = false,
}: {
  icon: any; label: string; sub: string; iconColor: string; iconBg: string;
  onClick?: () => void; isLast?: boolean;
}) {
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.986 }}
        onClick={onClick}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
      >
        <div
          className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
          style={{ background: iconBg, border: `0.5px solid ${iconColor.replace(/[\d.]+\)$/, "0.28)")}` }}
        >
          <Icon size={16} strokeWidth={1.9} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 1 }}>{sub}</p>
        </div>
        <ChevronRight size={14} strokeWidth={2} style={{ color: "rgba(255,255,255,0.22)", flexShrink: 0 }} />
      </motion.button>
      {!isLast && <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />}
    </>
  );
}

// ─── Mood streak dots ─────────────────────────────────────────────────────────
const STREAK = [true, true, true, false, true, true, true]; // last 7 days

// ─── Relationship Status Card ─────────────────────────────────────────────────
function RelationshipStatusCard() {
  return (
    <div
      className="rounded-[22px] px-5 py-4 shrink-0"
      style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(160,210,255,0.14)",
              border: "0.5px solid rgba(160,210,255,0.30)",
            }}
          >
            <Users size={20} strokeWidth={1.8} color="rgba(160,210,255,0.90)" />
          </div>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 2 }}>单人模式已激活</p>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.36)", lineHeight: 1.4 }}>伴侣绑定功能即将上线，敬请期待</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.90 }}
          disabled
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            opacity: 0.5,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.40)" }}>邀请伴侣</span>
        </motion.button>
      </div>
    </div>
  );
}

// ─── Unified Membership Card ──────────────────────────────────────────────────
function UnifiedMembershipCard({ isPro, onUpgrade }: { isPro: boolean; onUpgrade: () => void }) {
  return (
    <div
      className="rounded-[22px] relative overflow-hidden shrink-0"
      style={{
        background: isPro
          ? "linear-gradient(135deg, rgba(140,235,200,0.18) 0%, rgba(160,200,255,0.14) 100%)"
          : "linear-gradient(135deg, rgba(50,40,80,0.60) 0%, rgba(40,50,90,0.50) 100%)",
        border: isPro ? "0.5px solid rgba(140,235,200,0.28)" : "0.5px solid rgba(180,160,255,0.32)",
        boxShadow: isPro
          ? "0 8px 32px rgba(100,200,150,0.18), inset 0 1.5px 0 rgba(160,240,200,0.22)"
          : "0 8px 40px rgba(120,100,200,0.20), inset 0 1.5px 0 rgba(200,180,255,0.18)",
      }}
    >
      {/* Shimmer for non-pro */}
      {!isPro && (
        <motion.div
          animate={{ x: ["-100%", "200%", "200%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.6, 1], type: "tween" }}
          onUpdate={() => {}}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(100deg, transparent 30%, rgba(200,180,255,0.12) 50%, transparent 70%)",
          }}
        />
      )}

      {/* Header row */}
      <div className="relative px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1.5">
          {isPro ? (
            <>
              <Crown size={16} strokeWidth={2} color="rgba(140,235,200,0.90)" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(140,235,200,0.98)", letterSpacing: "0.02em" }}>专业版会员</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(10,30,20,0.95)", background: "rgba(140,235,200,0.90)", padding: "1px 5px", borderRadius: 5, letterSpacing: "0.03em" }}>已开通</span>
            </>
          ) : (
            <>
              <Crown size={16} strokeWidth={2} color="rgba(180,200,255,0.75)" />
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(200,220,255,0.95)", letterSpacing: "0.02em" }}>免费版用户</p>
            </>
          )}
        </div>
        <p style={{ fontSize: 11.5, color: isPro ? "rgba(140,235,200,0.68)" : "rgba(200,220,255,0.62)", lineHeight: 1.5 }}>
          {isPro ? "无限次数 · 长效记忆 · 雷达图分析" : "基础功能 · 每日限额 5 次对话"}
        </p>
      </div>

      {/* Feature comparison */}
      <div className="relative px-5 pb-4">
        <div className="flex flex-col gap-2">
          {isPro ? (
            ["✓ 无限AI对话", "✓ 长效情感记忆", "✓ 深度雷达图分析", "✓ 优先智能响应", "✓ 专属成长报告", "✓ 数据云端备份"].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check size={12} strokeWidth={2.5} color="rgba(140,235,200,0.90)" />
                <span style={{ fontSize: 12, color: "rgba(140,235,200,0.92)", fontWeight: 500 }}>{feature}</span>
              </div>
            ))
          ) : (
            <>
              <div className="mb-1">
                <p style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(200,220,255,0.50)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6 }}>当前可用</p>
                {["基础AI对话", "每日5次限额", "标准复盘报告"].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 mb-1.5">
                    <Check size={11} strokeWidth={2.5} color="rgba(200,220,255,0.65)" />
                    <span style={{ fontSize: 11.5, color: "rgba(200,220,255,0.75)" }}>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5">
                <p style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,200,120,0.65)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6 }}>升级后解锁</p>
                {["无限次对话", "长效情感记忆", "深度雷达图分析", "优先智能响应"].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 mb-1.5">
                    <Lock size={10} strokeWidth={2.5} color="rgba(255,200,120,0.55)" />
                    <span style={{ fontSize: 11.5, color: "rgba(255,200,120,0.68)" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA button for non-pro */}
      {!isPro && (
        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,215,80,0.92) 0%, rgba(220,165,40,0.92) 100%)",
              boxShadow: "0 6px 32px rgba(200,145,20,0.42), inset 0 1.5px 0 rgba(255,240,150,0.35)",
            }}
          >
            <Zap size={18} strokeWidth={2.5} color="rgba(30,18,0,0.98)" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "rgba(30,18,0,0.98)", letterSpacing: "0.04em" }}>立即升级专业版</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ─── Login Placeholder ────────────────────────────────────────────────────────
function LoginPlaceholder({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "0.5px solid rgba(255,255,255,0.16)",
          fontSize: 48,
        }}
      >
        👋
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 8 }}>
        欢迎来到不吃了
      </h2>

      <p
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,0.48)",
          lineHeight: 1.65,
          textAlign: "center",
          marginBottom: 32,
          maxWidth: 260,
        }}
      >
        登录后体验AI情感陪伴<br />让每次沟通都更懂你
      </p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onLogin}
        className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl"
        style={{
          background: "rgba(7,193,96,0.88)",
          border: "0.5px solid rgba(7,193,96,0.40)",
          boxShadow: "0 8px 32px rgba(7,193,96,0.35), inset 0 1.5px 0 rgba(100,230,150,0.25)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 3a1 1 0 0 0-.823.432l-.155.234C6.274 4.983 5.583 6.747 5.16 8H3a1 1 0 0 0 0 2h1.875c-.079.641-.116 1.311-.116 2s.037 1.359.116 2H3a1 1 0 1 0 0 2h2.16c.423 1.253 1.114 3.017 2.862 4.334l.155.234A1 1 0 0 0 9 21h6a1 1 0 0 0 .823-.432l.155-.234c1.748-1.317 2.439-3.081 2.862-4.334H21a1 1 0 1 0 0-2h-1.875c.079-.641.116-1.311.116-2s-.037-1.359-.116-2H21a1 1 0 1 0 0-2h-2.16c-.423-1.253-1.114-3.017-2.862-4.334l-.155-.234A1 1 0 0 0 15 3H9Z"
            fill="rgba(255,255,255,0.95)"
          />
        </svg>
        <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.98)", letterSpacing: "0.04em" }}>
          微信一键登录
        </span>
      </motion.button>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 20, textAlign: "center" }}>
        登录即代表同意《用户协议》和《隐私政策》
      </p>
    </div>
  );
}

// ─── Delete Account Confirmation Modal ────────────────────────────────────────
function DeleteAccountModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 100,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "calc(100% - 64px)",
              maxWidth: 320,
              borderRadius: 24,
              background: "rgba(30,25,50,0.95)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "0.5px solid rgba(255,100,100,0.32)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,150,150,0.12)",
              zIndex: 101,
              padding: "28px 24px 24px",
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,100,100,0.12)",
                  border: "0.5px solid rgba(255,100,100,0.28)",
                }}
              >
                <UserX size={28} strokeWidth={1.8} color="rgba(255,120,120,0.90)" />
              </div>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.95)", textAlign: "center", marginBottom: 12 }}>
              确认注销账号？
            </h3>

            {/* Description */}
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.52)", lineHeight: 1.7, textAlign: "center", marginBottom: 28 }}>
              注销后所有云端数据将被永久删除，此操作不可逆。确认注销吗？
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 py-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.16)",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.80)" }}>取消</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl"
                style={{
                  background: "rgba(255,80,80,0.88)",
                  border: "0.5px solid rgba(255,80,80,0.40)",
                  boxShadow: "0 4px 20px rgba(255,80,80,0.28)",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.98)" }}>确认注销</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    navigate("/");
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
        {/* ── Background ────────────────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.60) saturate(1.08) hue-rotate(6deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(14,20,50,0.64) 0%, rgba(20,34,72,0.08) 28%, transparent 50%, rgba(12,18,44,0.18) 70%, rgba(8,12,32,0.80) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 200, background: "linear-gradient(to bottom, rgba(10,15,36,0.72) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 260, background: "linear-gradient(to top, rgba(8,12,28,0.84) 0%, transparent 100%)" }} />
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "4%", left: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,200,255,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "22%", right: "-6%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,210,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* ── All page content in one z-indexed wrapper ──────────── */}
        <div className="relative flex flex-col" style={{ flex: 1, minHeight: 0, zIndex: 1 }}>

          {/* ── Hero: Avatar + identity ─────────────────────────── */}
          <div className="shrink-0 px-5 pb-4 flex items-end gap-4 w-full" style={{ minHeight: 88, paddingTop: 52 }}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <div style={{
                padding: 2.5, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(200,220,255,0.55) 0%, rgba(140,190,255,0.30) 100%)",
              }}>
                <div
                  className="w-[62px] h-[62px] rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    fontSize: 30,
                  }}
                >
                  🐱
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(160,210,255,0.90)",
                  border: "1.5px solid rgba(255,255,255,0.80)",
                  boxShadow: "0 2px 8px rgba(60,120,200,0.35)",
                }}
              >
                <Edit3 size={10} strokeWidth={2.5} style={{ color: "#0A1A38" }} />
              </motion.button>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-1.5">
                <p style={{ fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.97)", letterSpacing: "-0.3px", textShadow: "0 1px 14px rgba(40,80,180,0.40)" }}>
                  一只小猫咪
                </p>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(160,210,255,0.16)", border: "0.5px solid rgba(160,210,255,0.35)" }}
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <polygon points="5,0.5 6.2,3.8 9.8,3.8 6.9,5.9 8,9.2 5,7.1 2,9.2 3.1,5.9 0.2,3.8 3.8,3.8" fill="rgba(180,220,255,0.95)" />
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(180,220,255,0.95)" }}>Lv.2</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", letterSpacing: "0.02em" }}>沟通新手</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>·</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>加入 32 天</span>
              </div>
            </div>

            {/* 88px WeChat capsule */}
            <div style={{ width: 88, height: 32, flexShrink: 0 }} />
          </div>

          {/* ── Scrollable body ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 pt-1 pb-4" style={{ scrollbarWidth: "none" }}>

            {/* Stats row */}
            <div className="flex gap-2.5 shrink-0">
              <StatPill value="23" label="对话次数" color="rgba(160,210,255,0.92)" />
              <StatPill value="61" label="平均融洽" color="rgba(200,175,255,0.92)" />
              <StatPill value="7" label="连续打卡" color="rgba(140,235,200,0.92)" />
            </div>

            {/* Relationship Status Card */}
            <RelationshipStatusCard />

            {/* Unified Membership Card */}
            <UnifiedMembershipCard isPro={isPro} onUpgrade={() => navigate("/profile/vip")} />

            {/* Check-in card */}
            <div
              className="rounded-[22px] px-5 py-4 shrink-0"
            style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>每日情感签到</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 1.5 }}>连续打卡 7 天 · 下次奖励 +50 经验</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.90 }}
                onClick={() => setCheckedIn(true)}
                disabled={checkedIn}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
                style={{
                  background: checkedIn
                    ? "rgba(140,235,200,0.15)"
                    : "rgba(160,210,255,0.18)",
                  border: checkedIn
                    ? "0.5px solid rgba(140,235,200,0.40)"
                    : "0.5px solid rgba(160,210,255,0.40)",
                  boxShadow: checkedIn ? "none" : "0 4px 16px rgba(80,160,255,0.18)",
                }}
              >
                <Calendar size={13} strokeWidth={2} style={{ color: checkedIn ? "rgba(140,235,200,0.90)" : "rgba(160,210,255,0.90)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: checkedIn ? "rgba(140,235,200,0.90)" : "rgba(160,210,255,0.90)" }}>
                  {checkedIn ? "已签到" : "签到"}
                </span>
              </motion.button>
            </div>
            {/* Streak dots */}
            <div className="flex items-center justify-between">
              {["一", "二", "三", "四", "五", "六", "日"].map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={false}
                    animate={STREAK[i] || (i === 4 && checkedIn) ? { scale: [0.85, 1.1, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: (STREAK[i] || (i === 4 && checkedIn))
                        ? "rgba(140,235,200,0.22)"
                        : "rgba(255,255,255,0.07)",
                      border: (STREAK[i] || (i === 4 && checkedIn))
                        ? "1px solid rgba(140,235,200,0.45)"
                        : "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {(STREAK[i] || (i === 4 && checkedIn))
                      ? <span style={{ fontSize: 13 }}>✓</span>
                      : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>·</span>}
                  </motion.div>
                  <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)" }}>周{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Settings group ────────────────────────────────────── */}
          <div className="flex flex-col gap-3 shrink-0">
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2 }}>
              工具
            </p>
            <div className="rounded-[18px] overflow-hidden" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
              <SettingRow icon={RefreshCw} label="云端数据同步" sub="上次同步：3分钟前" iconColor="rgba(160,210,255,0.90)" iconBg="rgba(160,210,255,0.12)" />
              <SettingRow icon={FileDown} label="导出历史报告" sub="PDF / 图片格式" iconColor="rgba(200,175,255,0.90)" iconBg="rgba(200,175,255,0.12)" onClick={() => navigate("/profile/export")} />
              <SettingRow icon={Calendar} label="每日打卡记录" sub="查看完整签到日历" iconColor="rgba(140,235,200,0.90)" iconBg="rgba(140,235,200,0.12)" onClick={() => navigate("/checkin")} isLast />
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2 }}>
              更多
            </p>
            <div className="rounded-[18px] overflow-hidden" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
              <SettingRow icon={Settings} label="设置" sub="账号、隐私与通知管理" iconColor="rgba(160,210,255,0.90)" iconBg="rgba(160,210,255,0.12)" onClick={() => navigate("/profile/settings")} />
              <SettingRow icon={Share2} label="分享给好友" sub="邀请好友一起使用" iconColor="rgba(200,175,255,0.90)" iconBg="rgba(200,175,255,0.12)" />
              <SettingRow icon={Star} label="给我们评分" sub="您的支持是我们的动力" iconColor="rgba(255,215,80,0.90)" iconBg="rgba(255,215,80,0.12)" />
              <SettingRow icon={HelpCircle} label="帮助中心" sub="常见问题解答" iconColor="rgba(140,235,200,0.90)" iconBg="rgba(140,235,200,0.12)" onClick={() => navigate("/help")} isLast />
            </div>
          </div>

          {/* Delete account button */}
          <div className="flex justify-center py-4 shrink-0">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDeleteModal(true)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,100,100,0.75)",
                padding: "8px 16px",
              }}
            >
              注销账号
            </motion.button>
          </div>

          {/* App info */}
          <div className="flex flex-col items-center gap-1 py-2 shrink-0">
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>不吃了 · v1.2.0</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)" }}>用心陪伴每一段关系</p>
          </div>
          </div>{/* end scrollable body */}

          {/* ── Floating Tab Bar ────────────────────────────────── */}
          <FloatingTabBar />

        </div>{/* end content z-index wrapper */}

        {/* ── Delete Account Modal ──────────────────────────────── */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      </div>
    </div>
  );
}