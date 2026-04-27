import { ReactNode } from "react";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex justify-center items-center w-full min-h-screen"
      style={{ background: "#E0DDD8" }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 844,
          background: "#FDFBF7",
          borderRadius: 44,
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-8 shrink-0"
      style={{ height: 52, paddingTop: 14 }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: "#3D3530" }}>
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 2.5C9.8 2.5 11.4 3.2 12.6 4.4L14 3C12.4 1.4 10.3 0.5 8 0.5C5.7 0.5 3.6 1.4 2 3L3.4 4.4C4.6 3.2 6.2 2.5 8 2.5Z"
            fill="#3D3530"
          />
          <path
            d="M8 5.5C9.1 5.5 10.1 5.9 10.8 6.7L12.2 5.3C11.1 4.2 9.6 3.5 8 3.5C6.4 3.5 4.9 4.2 3.8 5.3L5.2 6.7C5.9 5.9 6.9 5.5 8 5.5Z"
            fill="#3D3530"
          />
          <circle cx="8" cy="9.5" r="1.5" fill="#3D3530" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3.5"
            stroke="#3D3530"
          />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="#3D3530" />
          <path d="M23 4v4a2 2 0 000-4z" fill="#3D3530" />
        </svg>
      </div>
    </div>
  );
}
