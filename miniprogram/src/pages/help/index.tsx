import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';

import bgImage from '@/assets/bg-dawn.jpg';
import iconBack from '@/assets/icons/chevron-left.svg';
import iconChevronDown from '@/assets/icons/chevron-down.svg';
import iconBookOpen from '@/assets/icons/book-open.svg';
import iconMessageCircle from '@/assets/icons/message-circle.svg';
import iconMail from '@/assets/icons/mail.svg';

import './index.less';

interface FaqItem { q: string; a: string; }
interface FaqGroup { group: string; emoji: string; chipClass: string; items: FaqItem[]; }

const FAQ_GROUPS: FaqGroup[] = [
  {
    group: '关于 AI 倾听',
    emoji: '🤍',
    chipClass: 'chip-blue',
    items: [
      { q: 'AI 会记住我们的对话内容吗？', a: '免费版中，AI 的记忆仅限当次对话会话。升级 VIP 后，AI 将构建你专属的长效情感记忆库，记住每次对话的情感脉络与重要时刻。' },
      { q: '倾听模式和树洞模式有什么区别？', a: '「倾听」会认真分析你的沟通情况，给出建议并生成复盘报告。「树洞」是完全站在你这边的情感支持空间，消息阅后即焚，适合情绪宣泄。' },
      { q: '声音输入有时识别不准怎么办？', a: '在安静环境效果最佳。也可以切换到「文字倾诉」模式，两种方式都能触发 AI 分析和复盘。' },
    ],
  },
  {
    group: '隐私与安全',
    emoji: '🔒',
    chipClass: 'chip-purple',
    items: [
      { q: '我的对话内容安全吗？', a: '所有对话数据传输和存储均使用 AES-256 加密。树洞模式的内容永远不会持久化存储，会话结束立即销毁。' },
      { q: '会把我的数据用于训练 AI 吗？', a: '绝对不会。未经你明确授权，你的任何对话数据都不会用于 AI 模型训练。' },
    ],
  },
  {
    group: '复盘与报告',
    emoji: '📊',
    chipClass: 'chip-green',
    items: [
      { q: '复盘报告是怎么生成的？', a: 'AI 会基于你的整段对话，从情绪、洞察、建议三个维度做温柔客观的梳理，每次报告独立生成。' },
      { q: '复盘报告可以保存吗？', a: '报告会自动保存到「历史复盘」中，你可以随时回看。当前免费版可保存最近 100 份。' },
    ],
  },
  {
    group: '账号与订阅',
    emoji: '👑',
    chipClass: 'chip-gold',
    items: [
      { q: 'VIP 什么时候上线？', a: '当前版本为 MVP，VIP 功能正在打磨中。升级后将解锁长期记忆、雷达分析、报告导出等能力。' },
      { q: '我的数据会一直保留吗？', a: '所有数据存储在你的微信本地缓存中，卸载小程序或清缓存会一并清除。重要内容请提前保存。' },
    ],
  },
];

function AccordionItem({ item, chipClass }: { item: FaqItem; chipClass: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View className={`acc-item ${open ? 'is-open' : ''}`}>
      <View className="acc-head" onClick={() => setOpen(!open)} hoverClass="acc-head--hover">
        <View className={`acc-q-mark ${chipClass}`} />
        <Text className="acc-q">{item.q}</Text>
        <View className={`acc-chev ${open ? 'is-open' : ''}`}>
          <Image className="acc-chev-icon" src={iconChevronDown} mode="aspectFit" />
        </View>
      </View>
      {open && (
        <View className="acc-body">
          <Text className="acc-a">{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpPage() {
  const goBack = () =>
    Taro.navigateBack().catch(() => Taro.switchTab({ url: '/pages/profile/index' }));

  const onContactTap = (id: string) => {
    if (id === 'mail') {
      Taro.setClipboardData({ data: 'support@listen.app', success: () => Taro.showToast({ title: '邮箱已复制', icon: 'none' }) });
    } else {
      Taro.showToast({ title: '在线客服即将上线', icon: 'none' });
    }
  };

  return (
    <View className="help-root">
      <Image className="help-bg" src={bgImage} mode="aspectFill" />
      <View className="help-frost" />

      <View className="help-header">
        <View className="help-back" onClick={goBack} hoverClass="help-back--hover">
          <Image className="help-back-icon" src={iconBack} mode="aspectFit" />
          <Text className="help-back-text">返回</Text>
        </View>
        <Text className="help-title">帮助中心</Text>
        <View className="help-spacer" />
      </View>

      <ScrollView className="help-scroll" scrollY showScrollbar={false}>
        <View className="help-body">
          {/* Hero */}
          <View className="help-hero">
            <View className="hero-icon-wrap">
              <Image className="hero-icon" src={iconBookOpen} mode="aspectFit" />
            </View>
            <Text className="hero-title">遇到问题了吗？</Text>
            <Text className="hero-sub">在这里找到常见问题的答案，{'\n'}或直接联系我们的支持团队</Text>
          </View>

          {/* FAQ Groups */}
          {FAQ_GROUPS.map(({ group, emoji, chipClass, items }) => (
            <View key={group} className="faq-group">
              <View className="faq-group-head">
                <View className={`faq-group-chip ${chipClass}`}>
                  <Text className="faq-group-emoji">{emoji}</Text>
                </View>
                <Text className={`faq-group-name ${chipClass}`}>{group}</Text>
              </View>
              <View className="faq-group-body">
                {items.map((item, i) => (
                  <View key={item.q}>
                    <AccordionItem item={item} chipClass={chipClass} />
                    {i < items.length - 1 && <View className="faq-divider" />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Contact section */}
          <View className="contact-section">
            <Text className="contact-title">联系我们</Text>
            <View className="contact-list">
              <View
                className="contact-item"
                hoverClass="contact-item--hover"
                onClick={() => onContactTap('chat')}
              >
                <View className="contact-icon-wrap chip-blue">
                  <Image className="contact-icon" src={iconMessageCircle} mode="aspectFit" />
                </View>
                <View className="contact-text">
                  <Text className="contact-label">在线客服</Text>
                  <Text className="contact-sub">即将上线 · 敬请期待</Text>
                </View>
                <Text className="contact-arrow">›</Text>
              </View>
              <View
                className="contact-item"
                hoverClass="contact-item--hover"
                onClick={() => onContactTap('mail')}
              >
                <View className="contact-icon-wrap chip-purple">
                  <Image className="contact-icon" src={iconMail} mode="aspectFit" />
                </View>
                <View className="contact-text">
                  <Text className="contact-label">邮件支持</Text>
                  <Text className="contact-sub">support@listen.app · 点击复制</Text>
                </View>
                <Text className="contact-arrow">›</Text>
              </View>
            </View>
          </View>

          {/* Version */}
          <Text className="help-version">倾听 · v0.1 · MVP build</Text>
        </View>
      </ScrollView>
    </View>
  );
}
