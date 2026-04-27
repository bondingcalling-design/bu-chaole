import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronLeft, FileDown, Image as ImageIcon, FileText, Check, Download } from "lucide-react";
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


// ─── Report item ──────────────────────────────────────────────────────────────
interface ReportItem {
  id: string;
  date: string;
  title: string;
  sessions: number;
  avgRapport: number;
}

const MOCK_REPORTS: ReportItem[] = [
  { id: "1", date: "2026-04-15", title: "4月第二周情感报告", sessions: 12, avgRapport: 78 },
  { id: "2", date: "2026-04-08", title: "4月第一周情感报告", sessions: 9, avgRapport: 72 },
  { id: "3", date: "2026-04-01", title: "3月月度情感报告", sessions: 35, avgRapport: 75 },
  { id: "4", date: "2026-03-25", title: "3月第三周情感报告", sessions: 8, avgRapport: 69 },
  { id: "5", date: "2026-03-18", title: "3月第二周情感报告", sessions: 11, avgRapport: 81 },
];

// ─── Export format option ─────────────────────────────────────────────────────
function FormatOption({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: any;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onUpdate={() => {}}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2.5 py-4 rounded-2xl"
      style={{
        background: selected
          ? "rgba(160,210,255,0.16)"
          : "rgba(255,255,255,0.07)",
        border: selected
          ? "0.5px solid rgba(160,210,255,0.40)"
          : "0.5px solid rgba(255,255,255,0.12)",
        boxShadow: selected
          ? "0 4px 20px rgba(100,170,255,0.18), inset 0 1px 0 rgba(180,220,255,0.14)"
          : "none",
        transition: "all 0.25s ease",
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: selected
            ? "rgba(160,210,255,0.18)"
            : "rgba(255,255,255,0.06)",
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.8}
          color={selected ? "rgba(160,210,255,0.95)" : "rgba(255,255,255,0.42)"}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: selected ? 600 : 500,
          color: selected ? "rgba(160,210,255,0.95)" : "rgba(255,255,255,0.58)",
        }}
      >
        {label}
      </span>
      {selected && (
        <motion.div
          onUpdate={() => {}}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "rgba(160,210,255,0.90)" }}
        >
          <Check size={12} strokeWidth={2.5} color="white" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ─── Report card ──────────────────────────────────────────────────────────────
function ReportCard({ report, selected, onToggle }: { report: ReportItem; selected: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onUpdate={() => {}}
      whileTap={{ scale: 0.985 }}
      onClick={onToggle}
      className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl"
      style={{
        background: selected
          ? "rgba(200,175,255,0.12)"
          : "rgba(255,255,255,0.06)",
        border: selected
          ? "0.5px solid rgba(200,175,255,0.38)"
          : "0.5px solid rgba(255,255,255,0.10)",
        boxShadow: selected
          ? "0 4px 20px rgba(180,160,255,0.14), inset 0 1px 0 rgba(220,200,255,0.10)"
          : "none",
        transition: "all 0.25s ease",
      }}
    >
      {/* Checkbox */}
      <div
        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: selected ? "rgba(200,175,255,0.90)" : "transparent",
          border: selected ? "none" : "1.5px solid rgba(255,255,255,0.28)",
        }}
      >
        {selected && <Check size={11} color="white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)", marginBottom: 2 }}>
          {report.title}
        </p>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)" }}>
          {report.date} · {report.sessions} 次对话 · 融洽度 {report.avgRapport}
        </p>
      </div>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <FileText size={16} strokeWidth={1.8} color="rgba(255,255,255,0.48)" />
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExportReportPage() {
  const navigate = useNavigate();
  const [format, setFormat] = useState<"pdf" | "image">("pdf");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set(["1", "2"]));
  const [exporting, setExporting] = useState(false);

  const toggleReport = (id: string) => {
    const newSet = new Set(selectedReports);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedReports(newSet);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      // In a real app, this would trigger a download
    }, 2000);
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
          style={{ filter: "brightness(0.58) saturate(1.08) hue-rotate(6deg)" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(14,20,50,0.68) 0%, rgba(20,34,72,0.10) 32%, transparent 50%, rgba(12,18,44,0.20) 70%, rgba(8,12,32,0.85) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 200, background: "linear-gradient(to bottom, rgba(10,15,36,0.75) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 260, background: "linear-gradient(to top, rgba(8,12,28,0.88) 0%, transparent 100%)" }} />

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "8%", left: "10%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,175,255,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "28%", right: "8%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,210,255,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="relative flex items-center shrink-0 w-full" style={{ height: 88, paddingTop: 52, paddingLeft: 16, paddingRight: 16 }}>
          <motion.button
            onUpdate={() => {}}
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
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Title section ─────────────────────────────────────────── */}
        <div className="shrink-0 px-5 pt-2 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(200,175,255,0.14)",
                border: "0.5px solid rgba(200,175,255,0.32)",
              }}
            >
              <FileDown size={20} strokeWidth={1.8} color="rgba(200,175,255,0.90)" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.3px" }}>
                导出历史报告
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>
                选择报告并导出为 PDF 或图片
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto flex flex-col gap-5 px-4 pb-32" style={{ scrollbarWidth: "none" }}>

          {/* Format selector */}
          <div className="shrink-0">
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2, marginBottom: 10 }}>
              导出格式
            </p>
            <div className="flex gap-3 relative">
              <FormatOption
                icon={FileText}
                label="PDF 文档"
                selected={format === "pdf"}
                onClick={() => setFormat("pdf")}
              />
              <FormatOption
                icon={ImageIcon}
                label="图片格式"
                selected={format === "image"}
                onClick={() => setFormat("image")}
              />
            </div>
          </div>

          {/* Report list */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2 }}>
                选择报告
              </p>
              <button
                onClick={() => {
                  if (selectedReports.size === MOCK_REPORTS.length) {
                    setSelectedReports(new Set());
                  } else {
                    setSelectedReports(new Set(MOCK_REPORTS.map(r => r.id)));
                  }
                }}
                style={{ fontSize: 12, fontWeight: 600, color: "rgba(160,210,255,0.75)" }}
              >
                {selectedReports.size === MOCK_REPORTS.length ? "取消全选" : "全选"}
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {MOCK_REPORTS.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  selected={selectedReports.has(report.id)}
                  onToggle={() => toggleReport(report.id)}
                />
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="shrink-0 px-5 py-3.5 rounded-2xl" style={{ ...glassInner }}>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
              💡 导出的报告将保存到您的相册或文件管理器中，方便分享和查看。
            </p>
          </div>
        </div>

        {/* ── Sticky CTA ────────────────────────────────────────────── */}
        <div className="absolute bottom-0 w-full shrink-0 px-5 pb-8 pt-6 flex flex-col gap-2.5 z-20 pointer-events-auto"
          style={{
            background: "linear-gradient(to top, rgba(8,12,28,0.98) 0%, rgba(8,12,28,0.88) 60%, transparent 100%)",
          }}
        >
          <motion.button
            onUpdate={() => {}}
            onClick={handleExport}
            whileTap={{ scale: 0.97 }}
            disabled={selectedReports.size === 0 || exporting}
            animate={exporting ? { scale: [1, 1.02, 0.99, 1] } : {}}
            transition={{ duration: 0.45 }}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl"
            style={{
              background: exporting
                ? "linear-gradient(135deg, rgba(140,235,190,0.88) 0%, rgba(80,200,140,0.88) 100%)"
                : selectedReports.size === 0
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, rgba(200,175,255,0.88) 0%, rgba(180,160,255,0.92) 100%)",
              border: exporting
                ? "0.5px solid rgba(140,235,190,0.40)"
                : selectedReports.size === 0
                  ? "0.5px solid rgba(255,255,255,0.12)"
                  : "0.5px solid rgba(200,175,255,0.40)",
              boxShadow: exporting
                ? "0 8px 40px rgba(80,200,140,0.35)"
                : selectedReports.size === 0
                  ? "none"
                  : "0 8px 32px rgba(180,160,255,0.35), inset 0 1.5px 0 rgba(220,200,255,0.25)",
              opacity: selectedReports.size === 0 ? 0.5 : 1,
              cursor: selectedReports.size === 0 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <AnimatePresence mode="wait">
              {exporting ? (
                <motion.span
                  onUpdate={() => {}}
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "0.02em" }}
                >
                  ✓ 导出成功！已保存到相册
                </motion.span>
              ) : (
                <motion.div
                  onUpdate={() => {}}
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5"
                >
                  <Download size={18} strokeWidth={2} color="rgba(255,255,255,0.98)" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.98)", letterSpacing: "0.02em" }}>
                    导出 {selectedReports.size} 份报告
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", textAlign: "center", letterSpacing: "0.03em" }}>
            导出格式：{format === "pdf" ? "PDF 文档" : "PNG 图片"}
          </p>
        </div>
      </div>
    </div>
  );
}