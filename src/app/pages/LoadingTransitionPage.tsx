import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Processing steps simulation ─────────────────────────────────────────────
const PROCESSING_STEPS = [
  "提取核心矛盾点...",
  "识别深层动机...",
  "分析情绪波动模式...",
  "构建心理动力图谱...",
  "生成个性化建议...",
];

// ─── Main Loading Transition Page ────────────────────────────────────────────
export default function LoadingTransitionPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Cycle through steps every 1.8s
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % PROCESSING_STEPS.length);
    }, 1800);

    return () => clearInterval(stepInterval);
  }, []);

  // Auto-redirect after 6 seconds (simulate loading complete)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/review/report");
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
        {/* ── Background Image ────────────────────────────────────────── */}
        <img
          src={bgImage}
          alt="snowy forest dawn"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.50) saturate(1.15)" }}
        />

        {/* ── Heavy Frosted Glass Overlay (100px blur) ───────────────── */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(100px)",
            WebkitBackdropFilter: "blur(100px)",
            background: "rgba(20,35,65,0.35)",
          }}
        />

        {/* Additional soft gradient overlays for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(10,20,45,0.20) 0%, rgba(5,12,30,0.60) 100%)",
          }}
        />

        {/* ── Content Layer (Centered) ───────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
          {/* Breathing Halo Circle */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow rings */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween",
              }}
              onUpdate={() => {}}
              className="absolute rounded-full"
              style={{
                width: 180,
                height: 180,
                background: "radial-gradient(circle, rgba(160,200,255,0.25) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.25, 0.50, 0.25],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
                type: "tween",
              }}
              onUpdate={() => {}}
              className="absolute rounded-full"
              style={{
                width: 140,
                height: 140,
                background: "radial-gradient(circle, rgba(180,210,255,0.30) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />

            {/* Core circle with frosted glass */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "tween",
              }}
              onUpdate={() => {}}
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: 96,
                height: 96,
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "0.5px solid rgba(255,255,255,0.20)",
                boxShadow:
                  "0 8px 32px rgba(120,160,255,0.30), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              {/* Inner light dot */}
              <motion.div
                animate={{
                  opacity: [0.50, 1, 0.50],
                  scale: [0.85, 1.15, 0.85],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  type: "tween",
                }}
                onUpdate={() => {}}
                className="rounded-full"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(200,225,255,0.80)",
                  boxShadow: "0 0 24px rgba(160,200,255,0.60), 0 0 48px rgba(140,180,255,0.30)",
                  filter: "blur(2px)",
                }}
              />
            </motion.div>
          </div>

          {/* Main Text */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              letterSpacing: "0.08em",
              lineHeight: 1.65,
              textShadow: "0 2px 16px rgba(100,150,255,0.40)",
            }}
          >
            正在用心理学模型分析你们的对话…
          </motion.h1>

          {/* Processing Steps (Animated transition) */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: 22, width: "100%" }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 0.52, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  fontSize: 13.5,
                  fontWeight: 300,
                  color: "rgba(255,255,255,1)",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  position: "absolute",
                  whiteSpace: "nowrap",
                }}
              >
                {PROCESSING_STEPS[currentStep]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Subtle progress dots */}
          <div className="flex items-center gap-2.5 mt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: i === currentStep ? [0.30, 0.85, 0.30] : 0.18,
                  scale: i === currentStep ? [1, 1.35, 1] : 1,
                }}
                transition={{
                  duration: 1.2,
                  repeat: i === currentStep ? Infinity : 0,
                  ease: "easeInOut",
                }}
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: "rgba(200,220,255,0.70)",
                  boxShadow: i === currentStep ? "0 0 8px rgba(180,210,255,0.60)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}