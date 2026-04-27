import { Headphones, TreePine, BarChart2, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const tabs = [
  { label: "倾听", icon: Headphones, path: "/" },
  { label: "树洞", icon: TreePine, path: "/treehouse" },
  { label: "复盘", icon: BarChart2, path: "/review" },
  { label: "我的", icon: User, path: "/profile" },
];

// ─── Glassmorphic styles ─────────────────────────────────────────────────────
const glassDark = {
  background: "rgba(255,255,255,0.09)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.16)",
} as const;

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="shrink-0 flex justify-center px-4 pb-5 pt-1">
      <div
        className="flex items-center w-full px-3 py-2.5 rounded-[28px]"
        style={{
          ...glassDark,
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
            >
              <div
                className="w-10 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.22)" : "transparent",
                }}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.7}
                  color={
                    active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.38)"
                  }
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 400,
                  color: active
                    ? "rgba(255,255,255,0.92)"
                    : "rgba(255,255,255,0.35)",
                  letterSpacing: "0.3px",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
