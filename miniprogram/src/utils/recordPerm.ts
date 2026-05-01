// Mic permission gate. Centralised because BOTH the listen page and the
// chat page need to ask before kicking the recorder, and the first-time
// flow is fiddly:
//   - WeChat returns authSetting['scope.record'] === undefined the very
//     first time. recorder.start() will then race with the system permission
//     dialog and fire 'auth deny' before the user even sees the prompt
//     (this is the "录音出错" bug users hit on first launch).
//   - Calling Taro.authorize first makes the prompt explicit and we await
//     the user's choice before touching the recorder.

import Taro from '@tarojs/taro';

export async function ensureRecordPermission(): Promise<boolean> {
  let status: boolean | undefined;
  try {
    const setting = await Taro.getSetting();
    status = setting.authSetting['scope.record'];
  } catch (_) {
    // getSetting itself can fail in dev tools edge cases — fall through and
    // try authorize directly.
  }

  if (status === true) return true;

  if (status === false) {
    const ok = await Taro.showModal({
      title: '需要麦克风权限',
      content: '请在「设置」里允许小程序使用麦克风',
      confirmText: '去开启',
    });
    if (ok.confirm) {
      try { await Taro.openSetting(); } catch (_) {}
    }
    return false;
  }

  // undefined → first time. Pop the system prompt explicitly and wait.
  try {
    await Taro.authorize({ scope: 'scope.record' });
    return true;
  } catch (_) {
    return false;
  }
}
