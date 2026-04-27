import { useNavigate } from "react-router";
import { RefreshCw } from "lucide-react";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.20)",
} as const;


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApiErrorPage() {
  const navigate = useNavigate();

  const handleRetry = () => {
    // In a real app, this would retry the API call
    // For now, just navigate back
    navigate(-1);
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
          style={{ filter: "brightness(0.55) saturate(1.08) hue-rotate(6deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(14,20,50,0.68) 0%, rgba(20,34,72,0.10) 35%, transparent 50%, rgba(12,18,44,0.22) 70%, rgba(8,12,32,0.85) 100%)"
        }} />

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "20%", left: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,160,200,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "25%", right: "5%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,180,255,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* ── Content ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.16)",
                fontSize: 64,
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  y: [0, -5, 0, -3, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                onUpdate={() => {}}
              >
                💤
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              marginBottom: 12,
              textAlign: "center",
              letterSpacing: "-0.3px"
            }}
          >
            服务器太累去谈恋爱啦
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.52)",
              lineHeight: 1.7,
              textAlign: "center",
              marginBottom: 40,
              maxWidth: 280,
            }}
          >
            请稍后再来找我哦~<br />
            给它一点休息时间吧 ❤️
          </motion.p>

          {/* Retry button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRetry}
            className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(200,175,255,0.88) 0%, rgba(180,160,255,0.92) 100%)",
              border: "0.5px solid rgba(200,175,255,0.40)",
              boxShadow: "0 8px 32px rgba(180,160,255,0.35), inset 0 1.5px 0 rgba(220,200,255,0.25)",
            }}
          >
            <RefreshCw size={18} strokeWidth={2} color="rgba(255,255,255,0.98)" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.98)", letterSpacing: "0.04em" }}>
              重试
            </span>
          </motion.button>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 px-6 py-3.5 rounded-2xl"
            style={{
              ...glassMid,
              boxShadow: "0 4px 24px rgba(60,90,160,0.08), inset 0 1px 0 rgba(255,255,255,0.12)"
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", lineHeight: 1.6 }}>
              💡 如果问题持续，可以稍后再试<br />
              或联系客服寻求帮助
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="shrink-0 pb-8 px-8">
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center" }}>
            错误代码: 503 · 服务暂时不可用
          </p>
        </div>
      </div>
    </div>
  );
}