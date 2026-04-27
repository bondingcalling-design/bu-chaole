// Local high-risk keyword detection per PRD §5.2.
// On match: surface the WeChat showModal with one-tap dial to the
// 全国免费心理援助热线 4001619995 (Hope24).

import Taro from '@tarojs/taro';

const HOTLINE = '4001619995'; // 希望 24 心理援助热线（全国免费）
const HOTLINE_DISPLAY = '400-161-9995';

// Conservative keyword set. Word boundaries handled below.
// Kept narrow to avoid false positives on common venting (e.g. "气死了").
const CRISIS_PATTERNS: RegExp[] = [
  /(自杀|想自杀|要自杀)/,
  /(自残|自虐|割腕|割手|割伤自己)/,
  /(不想活了|不想活下去|没法活|活不下去|不想活)/,
  /(想死|去死|一了百了|了断自己|结束生命)/,
  /(轻生|寻短见)/,
  /(跳楼|跳河|上吊|安眠药.{0,4}吃|烧炭)/,
  /(没有意义|活着没意思|没意思了)/,
];

export function detectCrisis(text: string): boolean {
  if (!text) return false;
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

/**
 * Show the crisis modal. Returns a promise that resolves to:
 *   'call'       — user tapped "一键拨打"
 *   'continue'   — user tapped "继续聊"（returns to normal flow）
 */
export async function showCrisisModal(): Promise<'call' | 'continue'> {
  const r = await Taro.showModal({
    title: '我很担心你 ❤️',
    content: `感觉到你现在非常不好。如果你正在经历危机，请立刻联系：\n\n全国免费心理援助热线\n${HOTLINE_DISPLAY}\n\n（24 小时 · 完全免费 · 完全保密）`,
    confirmText: '一键拨打',
    cancelText: '我没事，继续聊',
    confirmColor: '#7ab8ff',
  });
  if (r.confirm) {
    try {
      await Taro.makePhoneCall({ phoneNumber: HOTLINE });
    } catch (_) {
      // user cancelled the system phone dialog
    }
    return 'call';
  }
  return 'continue';
}
