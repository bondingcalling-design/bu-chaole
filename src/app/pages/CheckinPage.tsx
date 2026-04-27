import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

const glassInner = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "0.5px solid rgba(255,255,255,0.12)",
} as const;

// ─── Calendar data ─────────────────────────────────────────────────────────────
// Nov 2024, started on Friday (5)
const MONTH_LABEL = "2024年11月";
const DAYS_IN_MONTH = 30;
const START_DAY = 4; // 0=Sun, 4=Thu (Nov 1 2024 was Friday in China = col 5)

// Checked-in days
const CHECKED_DAYS = new Set([1,2,3,5,6,7,8,9,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29]);
const TODAY = 29;

// Mood emoji per checked day
const MOODS: Record<number, string> = {
  1:"😊",2:"😔",3:"😤",5:"😌",6:"🥺",7:"😊",8:"😤",9:"😌",
  11:"😊",12:"😔",13:"😤",14:"🥺",15:"😊",18:"😌",19:"😊",
  20:"😔",21:"😤",22:"😌",25:"😊",26:"🥺",27:"😊",28:"😌",29:"😊",
};

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

// ─── Milestones ────────────────────────────────────────────────────────────────
const MILESTONES = [
  { days: 7,  label: "坚持一周",  emoji: "🌱", reward: "+100 经验", done: true },
  { days: 14, label: "两周达人",  emoji: "🌿", reward: "+200 经验", done: true },
  { days: 30, label: "月度坚守",  emoji: "🌳", reward: "+500 经验 + 专属徽章", done: false },
  { days: 60, label: "两月荣耀",  emoji: "🏔️", reward: "+1000 经验 + VIP 7天", done: false },
];

// ─── Mood mood legend ──────────────────────────────────────────────────────────
const MOOD_MAP = [
  { emoji: "😊", label: "愉快" },
  { emoji: "😌", label: "平静" },
  { emoji: "😔", label: "低落" },
  { emoji: "🥺", label: "委屈" },
  { emoji: "😤", label: "烦躁" },
];


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckinPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [checkedToday, setCheckedToday] = useState(false);

  const checkedCount = CHECKED_DAYS.size + (checkedToday ? 1 : 0);
  const streakCount = 7; // Current streak

  // Build calendar grid
  const totalCells = Math.ceil((START_DAY + DAYS_IN_MONTH) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - START_DAY + 1;
    cells.push(day >= 1 && day <= DAYS_IN_MONTH ? day : null);
  }

  const handleDayPress = (day: number) => {
    setSelected(selected === day ? null : day);
  };

  const handleCheckin = () => {
    setShowMoodPicker(true);
  };

  const handleMoodSelect = (_mood: string) => {
    setCheckedToday(true);
    setShowMoodPicker(false);
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
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.58) saturate(1.05) hue-rotate(5deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(14,22,52,0.65) 0%, rgba(20,36,72,0.08) 28%, transparent 50%, rgba(10,16,42,0.18) 70%, rgba(8,12,30,0.82) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 170, background: "linear-gradient(to bottom, rgba(10,14,36,0.72) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 200, background: "linear-gradient(to top, rgba(8,12,28,0.82) 0%, transparent 100%)" }} />

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
            }}
          >
            <ChevronLeft size={16} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.80)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.80)" }}>返回</span>
          </motion.button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingRight: 88 + 16 }}>
            <h1 style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.92)", letterSpacing: "0.06em", textShadow: "0 2px 16px rgba(60,100,200,0.35)" }}>
              打卡日历
            </h1>
          </div>
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Scrollable ────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto flex flex-col gap-4 px-4 pt-1 pb-8" style={{ scrollbarWidth: "none" }}>

          {/* ── Streak & stats ────────────────────────────────────── */}
          <div className="flex gap-2.5">
            {/* Streak */}
            <div
              className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,120,60,0.14) 0%, rgba(255,80,30,0.08) 100%)",
                border: "0.5px solid rgba(255,120,60,0.30)",
                boxShadow: "0 4px 24px rgba(200,60,20,0.14), inset 0 1px 0 rgba(255,140,80,0.14)",
              }}
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.10, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", type: "tween" }}
                  onUpdate={() => {}}
                >
                  <Flame size={28} strokeWidth={1.5} style={{ color: "rgba(255,160,60,0.95)" }} />
                </motion.div>
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,160,60,0.97)", letterSpacing: "-0.5px", lineHeight: 1 }}>
                  {streakCount}
                </p>
                <p style={{ fontSize: 10.5, color: "rgba(255,140,60,0.55)", marginTop: 2 }}>连续打卡天</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2" style={{ flex: 1 }}>
              <div className="flex gap-2 flex-1">
                <div className="flex-1 flex flex-col items-center justify-center py-2 rounded-[14px]" style={{ ...glassInner }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(140,235,200,0.92)", lineHeight: 1 }}>{checkedCount}</p>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>本月打卡</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center py-2 rounded-[14px]" style={{ ...glassInner }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "rgba(160,210,255,0.92)", lineHeight: 1 }}>84%</p>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>完成率</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Calendar ──────────────────────────────────────────── */}
          <div
            className="rounded-[22px] overflow-hidden"
            style={{ ...glassMid, boxShadow: "0 8px 40px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.20)" }}
          >
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <motion.button whileTap={{ scale: 0.85 }}>
                <ChevronLeft size={18} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.38)" }} />
              </motion.button>
              <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{MONTH_LABEL}</p>
              <motion.button whileTap={{ scale: 0.85 }}>
                <ChevronRight size={18} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.38)" }} />
              </motion.button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-4 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="flex items-center justify-center py-1">
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", fontWeight: 500 }}>周{d}</span>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 px-4 pb-4 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const isChecked = CHECKED_DAYS.has(day) || (day === TODAY && checkedToday);
                const isToday = day === TODAY;
                const isSelected = selected === day;
                const mood = MOODS[day] ?? (day === TODAY && checkedToday ? "😊" : null);

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleDayPress(day)}
                    className="flex flex-col items-center justify-center py-1 rounded-xl"
                    style={{
                      minHeight: 44,
                      background: isSelected
                        ? "rgba(160,210,255,0.22)"
                        : isToday
                          ? "rgba(160,210,255,0.10)"
                          : "transparent",
                      border: isSelected
                        ? "0.5px solid rgba(160,210,255,0.50)"
                        : isToday
                          ? "0.5px solid rgba(160,210,255,0.25)"
                          : "0.5px solid transparent",
                    }}
                  >
                    {mood ? (
                      <>
                        <span style={{ fontSize: 16, lineHeight: 1 }}>{mood}</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>{day}</span>
                      </>
                    ) : (
                      <span style={{
                        fontSize: 13,
                        fontWeight: isToday ? 700 : 400,
                        color: isToday
                          ? "rgba(160,210,255,0.92)"
                          : day > TODAY
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(255,255,255,0.45)",
                      }}>
                        {day}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Mood legend */}
            <div
              className="flex items-center justify-around px-5 py-3"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}
            >
              {MOOD_MAP.map(({ emoji, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <span style={{ fontSize: 13 }}>{emoji}</span>
                  <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.30)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Today check-in CTA ────────────────────────────────── */}
          {!checkedToday ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckin}
              className="w-full py-4 rounded-[18px] flex items-center justify-center gap-2.5"
              style={{
                background: "linear-gradient(135deg, rgba(140,235,200,0.22) 0%, rgba(100,210,170,0.16) 100%)",
                border: "0.5px solid rgba(140,235,200,0.40)",
                boxShadow: "0 8px 32px rgba(80,200,150,0.18), inset 0 1px 0 rgba(200,255,235,0.18)",
              }}
            >
              <span style={{ fontSize: 18 }}>✨</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(140,235,200,0.95)", letterSpacing: "0.02em" }}>
                打卡今日心情
              </span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full py-4 rounded-[18px] flex items-center justify-center gap-2.5"
              style={{
                background: "rgba(140,235,200,0.10)",
                border: "0.5px solid rgba(140,235,200,0.25)",
              }}
            >
              <span style={{ fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 14, color: "rgba(140,235,200,0.70)", letterSpacing: "0.02em" }}>
                今日已打卡，明天见 🌙
              </span>
            </motion.div>
          )}

          {/* ── Milestones ────────────────────────────────────────── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2, marginBottom: 10 }}>
              成就里程碑
            </p>
            <div className="flex flex-col gap-2.5">
              {MILESTONES.map(({ days, label, emoji, reward, done }) => (
                <div
                  key={days}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-[18px]"
                  style={{
                    background: done ? "rgba(140,235,200,0.09)" : "rgba(255,255,255,0.06)",
                    border: done ? "0.5px solid rgba(140,235,200,0.28)" : "0.5px solid rgba(255,255,255,0.10)",
                    opacity: done ? 1 : 0.72,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
                    style={{
                      background: done ? "rgba(140,235,200,0.16)" : "rgba(255,255,255,0.07)",
                      border: done ? "0.5px solid rgba(140,235,200,0.30)" : "0.5px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: done ? "rgba(140,235,200,0.92)" : "rgba(255,255,255,0.60)" }}>{label}</p>
                      <span style={{ fontSize: 10, color: done ? "rgba(140,235,200,0.55)" : "rgba(255,255,255,0.24)" }}>连续 {days} 天</span>
                    </div>
                    <p style={{ fontSize: 11, color: done ? "rgba(140,235,200,0.50)" : "rgba(255,255,255,0.28)" }}>{reward}</p>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: done ? "rgba(140,235,200,0.20)" : "rgba(255,255,255,0.07)",
                      border: done ? "0.5px solid rgba(140,235,200,0.40)" : "0.5px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {done
                      ? <span style={{ fontSize: 12 }}>✓</span>
                      : <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>○</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mood picker modal ─────────────────────────────────────── */}
        <AnimatePresence>
          {showMoodPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-end z-50"
              style={{ background: "rgba(4,8,22,0.60)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              onClick={() => setShowMoodPicker(false)}
            >
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-5 pb-10 pt-6"
                style={{
                  background: "rgba(14,22,50,0.96)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  borderTop: "0.5px solid rgba(255,255,255,0.14)",
                  borderRadius: "30px 30px 0 0",
                }}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.18)" }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.90)", textAlign: "center", marginBottom: 6 }}>
                  今天的心情是？
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)", textAlign: "center", marginBottom: 22 }}>
                  记录真实感受，帮助 AI 了解你的情绪变化
                </p>
                <div className="flex justify-around">
                  {MOOD_MAP.map(({ emoji, label }) => (
                    <motion.button
                      key={label}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleMoodSelect(emoji)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.14)" }}
                      >
                        <span style={{ fontSize: 28 }}>{emoji}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}