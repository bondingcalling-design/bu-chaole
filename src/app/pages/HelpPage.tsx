import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronDown, MessageCircle, Mail, BookOpen } from "lucide-react";
import { useNavigate } from "react-router";
import bgImage from "../../imports/ed0330d2ly1hkqu05y5dkj21dq2bcnph-1.jpg";

// ─── Glass tokens ─────────────────────────────────────────────────────────────
const glassMid = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.18)",
} as const;

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_GROUPS = [
  {
    group: "关于 AI 倾听",
    icon: "🤍",
    color: "rgba(160,210,255,0.90)",
    bg: "rgba(160,210,255,0.12)",
    items: [
      {
        q: "AI 会记住我们的对话内容吗？",
        a: "免费版中，AI 的记忆仅限当次对话会话。升级 VIP 后，AI 将构建你专属的长效情感记忆库，记住每次对话的情感脉络、关系模式与重要时刻。",
      },
      {
        q: "倾听模式和树洞模式有什么区别？",
        a: "「倾听」模式会认真分析你与伴侣的沟通情况，给出理性建议，并生成复盘报告。「树洞」模式则是完全站在你这边的情感支持空间，消息阅后即焚，适合情绪宣泄。",
      },
      {
        q: "声音输入有时识别不准怎么办？",
        a: "在安静的环境中效果最佳。你也可以切换到「文字倾诉」模式进行输入，两种方式均可触发 AI 分析和复盘报告生成。",
      },
    ],
  },
  {
    group: "隐私与安全",
    icon: "🔒",
    color: "rgba(200,175,255,0.90)",
    bg: "rgba(200,175,255,0.12)",
    items: [
      {
        q: "我的对话内容安全吗？",
        a: "所有对话数据在传输和存储时均使用 AES-256 加密。树洞模式的内容永远不会被持久化存储，消息在会话结束后立即销毁，连我们自己也无法访问。",
      },
      {
        q: "不吵了会把我的数据用于训练 AI 吗？",
        a: "绝对不会。未经你明确授权，你的任何对话数据都不会用于 AI 模型训练。你的隐私权是我们最高的优先级。",
      },
    ],
  },
  {
    group: "复盘与报告",
    icon: "📊",
    color: "rgba(140,235,200,0.90)",
    bg: "rgba(140,235,200,0.12)",
    items: [
      {
        q: "五轴雷达图是怎么计算的？",
        a: "AI 会分析你的对话语言模式，从「共情」「攻击性」「防御」「逻辑清晰度」「倾听质量」五个维度进行量化评估。数据基于当次对话，随对话积累会越来越准确。",
      },
      {
        q: "高情商翻译是如何生成的？",
        a: "AI 先识别你原始表达中的核心诉求和情绪，再根据「温柔」「理性」「直白」三种沟通风格，重新组织语言，帮助你更有效地表达自己的感受而不造成对方防御。",
      },
      {
        q: "复盘报告可以保存和导出吗？",
        a: "VIP 用户可以将报告导出为 PDF 或图片，分享给信任的人，或作为私人成长记录保存。免费用户可查看最近 3 份报告。",
      },
    ],
  },
  {
    group: "账号与订阅",
    icon: "👑",
    color: "rgba(255,215,80,0.90)",
    bg: "rgba(255,215,80,0.12)",
    items: [
      {
        q: "VIP 可以随时取消吗？",
        a: "月度和年度套餐均可随时在微信「我的」→「服务」→「续费管理」中取消，取消后当前订阅周期内仍可使用 VIP 功能。",
      },
      {
        q: "有退款政策吗？",
        a: "自订阅之日起 7 天内如未大量使用，可申请全额退款。请通过下方「联系我们」提交退款申请，我们会在 1 个工作日内处理。",
      },
    ],
  },
];


// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ q, a, color }: { q: string; a: string; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.86)", lineHeight: 1.5 }}>{q}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="shrink-0 mt-0.5"
        >
          <ChevronDown size={15} strokeWidth={2} style={{ color: "rgba(255,255,255,0.30)" }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mx-4 mb-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.10)" }}
            >
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.75, fontWeight: 300 }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const navigate = useNavigate();
  const [contactTapped, setContactTapped] = useState<string | null>(null);

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
          background: "linear-gradient(180deg, rgba(14,22,52,0.65) 0%, rgba(20,36,72,0.08) 28%, transparent 50%, rgba(10,16,42,0.20) 70%, rgba(8,12,30,0.80) 100%)"
        }} />
        <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: 170, background: "linear-gradient(to bottom, rgba(10,14,36,0.72) 0%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 200, background: "linear-gradient(to top, rgba(8,12,28,0.80) 0%, transparent 100%)" }} />

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
              帮助中心
            </h1>
          </div>
          <div style={{ position: "absolute", right: 16, width: 88, height: 32 }} />
        </div>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <div className="relative flex-1 overflow-y-auto flex flex-col gap-4 px-4 pt-1 pb-8" style={{ scrollbarWidth: "none" }}>

          {/* Hero */}
          <div
            className="flex flex-col items-center py-6 px-4 rounded-[22px] text-center"
            style={{ ...glassMid, boxShadow: "0 8px 40px rgba(60,90,160,0.12), inset 0 1px 0 rgba(255,255,255,0.20)" }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(160,210,255,0.14)", border: "0.5px solid rgba(160,210,255,0.28)" }}>
              <BookOpen size={26} strokeWidth={1.5} style={{ color: "rgba(160,210,255,0.90)" }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.90)", marginBottom: 6 }}>遇到问题了吗？</p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)", lineHeight: 1.70 }}>
              在这里找到常见问题的答案，<br />或直接联系我们的支持团队
            </p>
          </div>

          {/* FAQ accordion groups */}
          {FAQ_GROUPS.map(({ group, icon, color, bg, items }) => (
            <div key={group}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: bg, border: `0.5px solid ${color.replace("0.90", "0.24")}` }}
                >
                  <span style={{ fontSize: 13 }}>{icon}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: color.replace("0.90", "0.65"), letterSpacing: "0.8px", textTransform: "uppercase" }}>{group}</p>
              </div>

              <div className="rounded-[18px] overflow-hidden" style={{ ...glassMid, boxShadow: "0 6px 32px rgba(60,90,160,0.10), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
                {items.map((item, idx) => (
                  <div key={item.q}>
                    <AccordionItem q={item.q} a={item.a} color={color} />
                    {idx < items.length - 1 && (
                      <div className="mx-4" style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(180,210,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", paddingLeft: 2, marginBottom: 10 }}>
              联系我们
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                {
                  icon: MessageCircle,
                  label: "在线客服",
                  sub: "工作日 9:00–21:00 · 平均响应 < 5分钟",
                  color: "rgba(160,210,255,0.90)",
                  bg: "rgba(160,210,255,0.12)",
                  id: "chat",
                },
                {
                  icon: Mail,
                  label: "邮件支持",
                  sub: "support@buchaoie.app · 1 个工作日内回复",
                  color: "rgba(200,175,255,0.90)",
                  bg: "rgba(200,175,255,0.12)",
                  id: "mail",
                },
              ].map(({ icon: Icon, label, sub, color, bg, id }) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setContactTapped(id)}
                  className="w-full flex items-center gap-3.5 px-4 py-4 rounded-[18px] text-left"
                  style={{
                    background: contactTapped === id ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: contactTapped === id ? `0.5px solid ${color.replace("0.90", "0.40")}` : "0.5px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 4px 24px rgba(60,90,160,0.08), inset 0 1px 0 rgba(255,255,255,0.12)",
                    transition: "all 0.22s ease",
                  }}
                >
                  <div className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0" style={{ background: bg, border: `0.5px solid ${color.replace("0.90", "0.24")}` }}>
                    <Icon size={18} strokeWidth={1.8} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>{label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 1.5 }}>{sub}</p>
                  </div>
                  <ChevronLeft size={14} strokeWidth={2} style={{ color: "rgba(255,255,255,0.20)", flexShrink: 0, transform: "rotate(180deg)" }} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Version */}
          <div className="flex flex-col items-center gap-1 pt-2">
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.16)" }}>不吵了 · v1.2.0 · Build 2024.11.15</p>
          </div>
        </div>
      </div>
    </div>
  );
}