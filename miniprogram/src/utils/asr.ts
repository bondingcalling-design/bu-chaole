// AsrManager — wraps wx.RecorderManager + uploads audio to cloud storage +
// calls the `asr` cloud function for 火山引擎 一句话识别.
//
// If the cloud function fails (env vars missing, ASR service down, etc.) we
// still return a usable result: tempFilePath + duration with empty text.
// The caller can show the voice bubble without an auto-AI reply in that case.

import Taro from '@tarojs/taro';

interface AsrStartOpts {
  duration?: number;
  lang?: string;
}

export interface AsrStopResult {
  tempFilePath: string;
  duration: number; // ms
  result: string;   // ASR transcript ('' if failed)
}

export interface AsrManager {
  start(opts?: AsrStartOpts): void;
  stop(): void;
  onStart: (cb: () => void) => void;
  onRecognize: (cb: (res: { result: string }) => void) => void;
  onStop: (cb: (res: AsrStopResult) => void) => void;
  onError: (cb: (err: any) => void) => void;
}

// Always supported because we use the built-in recorder + cloud function.
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
    this.recorder.onStop(async (res: any) => {
      const file = res?.tempFilePath || '';
      const duration = Math.max(1, Date.now() - this.startedAt);
      if (!file) {
        this.cbStop?.({ tempFilePath: '', duration, result: '' });
        return;
      }
      // Skip ASR call if user already cancelled (caller should mark before stop)
      if (this.cancelled) {
        this.cbStop?.({ tempFilePath: file, duration, result: '' });
        return;
      }
      const text = await transcribe(file);
      this.cbStop?.({ tempFilePath: file, duration, result: text });
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

async function transcribe(localFilePath: string): Promise<string> {
  console.log('[ASR] step 1: upload local file', localFilePath);
  let fileID = '';
  try {
    const cloudPath = `asr/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
    const up = await Taro.cloud.uploadFile({ cloudPath, filePath: localFilePath });
    fileID = up.fileID;
    console.log('[ASR] step 1 OK fileID =', fileID);
    if (!fileID) {
      Taro.showToast({ title: 'ASR 上传失败：无 fileID', icon: 'none', duration: 2400 });
      return '';
    }
  } catch (e: any) {
    console.error('[ASR] step 1 FAILED uploadFile:', e?.errMsg || e?.message || e);
    Taro.showToast({ title: 'ASR 上传失败：' + (e?.errMsg || e?.message || '未知'), icon: 'none', duration: 2400 });
    return '';
  }

  console.log('[ASR] step 2: call cloud function asr');
  let r: any;
  try {
    const res = await Taro.cloud.callFunction({ name: 'asr', data: { fileID } });
    r = res.result;
    console.log('[ASR] step 2 OK result =', r);
  } catch (e: any) {
    const msg = e?.errMsg || e?.message || String(e);
    console.error('[ASR] step 2 FAILED callFunction:', msg);
    if (msg.includes('FunctionName') || msg.includes('not found')) {
      Taro.showToast({ title: 'asr 云函数未部署', icon: 'none', duration: 2400 });
    } else {
      Taro.showToast({ title: 'ASR 调用失败：' + msg, icon: 'none', duration: 2400 });
    }
    Taro.cloud.deleteFile({ fileList: [fileID] }).catch(() => {});
    return '';
  }

  Taro.cloud.deleteFile({ fileList: [fileID] }).catch(() => {});

  if (r?.ok && r.text) {
    console.log('[ASR] success text =', r.text);
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
  // Reuse session — it's just wrapping the singleton wx recorder
  if (!cached) cached = new AsrSession();
  return cached;
}

/** Used by recording pages to flag user-cancellation before invoking stop(). */
export function markAsrCancelled() {
  if (cached) cached.markCancelled();
}
