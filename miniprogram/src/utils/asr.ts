// AsrManager — wraps wx.RecorderManager. Recording stop fires onStop
// IMMEDIATELY with the local file; transcription is a separate exported
// function the caller invokes when it's ready (typically after navigating
// to the chat page so the user sees the bubble before the network round
// trip completes).

import Taro from '@tarojs/taro';

interface AsrStartOpts {
  duration?: number;
  lang?: string;
}

export interface AsrStopResult {
  tempFilePath: string;
  duration: number; // ms
  result: string;   // empty — transcribe explicitly via transcribeFile()
}

export interface AsrManager {
  start(opts?: AsrStartOpts): void;
  stop(): void;
  onStart: (cb: () => void) => void;
  onRecognize: (cb: (res: { result: string }) => void) => void;
  onStop: (cb: (res: AsrStopResult) => void) => void;
  onError: (cb: (err: any) => void) => void;
}

export function isAsrSupported(): boolean {
  return true;
}

class AsrSession implements AsrManager {
  private recorder = Taro.getRecorderManager();
  private startedAt = 0;
  private cbStart?: () => void;
  private cbRecognize?: (res: { result: string }) => void;
  private cbStop?: (res: AsrStopResult) => void;
  private cbError?: (err: any) => void;
  private cancelled = false;

  constructor() {
    this.recorder.onStart(() => {
      this.startedAt = Date.now();
      this.cancelled = false;
      this.cbStart?.();
    });
    this.recorder.onStop((res: any) => {
      const file = res?.tempFilePath || '';
      const duration = Math.max(1, Date.now() - this.startedAt);
      // Fire onStop synchronously — transcription is the caller's call
      this.cbStop?.({ tempFilePath: file, duration, result: '' });
    });
    this.recorder.onError((err: any) => {
      this.cbError?.(err);
    });
  }

  /** Caller can mark cancellation just before stop() so the asr call is skipped. */
  markCancelled() {
    this.cancelled = true;
  }

  start(opts: AsrStartOpts = {}) {
    this.recorder.start({
      duration: opts.duration ?? 60_000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3',
    });
  }

  stop() {
    try { this.recorder.stop(); } catch (e) { this.cbError?.(e); }
  }

  onStart(cb: () => void) { this.cbStart = cb; }
  onRecognize(cb: (res: { result: string }) => void) { this.cbRecognize = cb; }
  onStop(cb: (res: AsrStopResult) => void) { this.cbStop = cb; }
  onError(cb: (err: any) => void) { this.cbError = cb; }
}

/**
 * Run ASR on a local recorded file. Resolves with the transcript ('' on
 * failure). Toasts errors so the user knows something went wrong.
 *
 * Implementation: read local file as base64 → call `asr` cloud function →
 * forwards to 火山引擎「一句话识别」sync HTTP API. No cloud storage hop, no
 * polling. Target round-trip < 2s for clips up to ~30s.
 */
export async function transcribeFile(localFilePath: string): Promise<string> {
  if (!localFilePath) return '';
  const t0 = Date.now();
  console.log('[ASR] read local file as base64', localFilePath);
  let base64 = '';
  try {
    const fs = Taro.getFileSystemManager();
    base64 = fs.readFileSync(localFilePath, 'base64') as string;
    console.log('[ASR] base64 size =', base64.length, 'chars (~', Math.round(base64.length * 0.75 / 1024), 'KB)');
  } catch (e: any) {
    console.error('[ASR] readFile FAILED:', e?.errMsg || e?.message || e);
    Taro.showToast({ title: 'ASR 读文件失败', icon: 'none', duration: 2000 });
    return '';
  }
  if (!base64) {
    Taro.showToast({ title: 'ASR 读文件为空', icon: 'none', duration: 2000 });
    return '';
  }

  console.log('[ASR] call cloud function asr (sync)');
  let r: any;
  try {
    const res = await Taro.cloud.callFunction({
      name: 'asr',
      data: { audio: base64, format: 'mp3' },
    });
    r = res.result;
    console.log('[ASR] cloud function returned in', Date.now() - t0, 'ms; result =', r);
  } catch (e: any) {
    const msg = e?.errMsg || e?.message || String(e);
    console.error('[ASR] callFunction FAILED:', msg);
    if (msg.includes('FunctionName') || msg.includes('not found')) {
      Taro.showToast({ title: 'asr 云函数未部署', icon: 'none', duration: 2400 });
    } else {
      Taro.showToast({ title: 'ASR 调用失败：' + msg, icon: 'none', duration: 2400 });
    }
    return '';
  }

  if (r?.ok && r.text) {
    console.log('[ASR] success text =', r.text, 'total', Date.now() - t0, 'ms');
    return r.text as string;
  }
  console.warn('[ASR] cloud function returned ok=false', r);
  Taro.showToast({
    title: 'ASR 失败：' + (r?.error || '未知'),
    icon: 'none',
    duration: 2400,
  });
  return '';
}

let cached: AsrSession | null = null;
export function getAsrManager(): AsrManager | null {
  if (!cached) cached = new AsrSession();
  return cached;
}

/** Used by recording pages to flag user-cancellation before invoking stop(). */
export function markAsrCancelled() {
  if (cached) cached.markCancelled();
}
