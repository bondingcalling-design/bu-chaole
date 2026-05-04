import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { archiveCurrentOnLaunch } from '@/utils/chatDrafts';
import './app.less';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // Initialize WeChat Cloud Development
    if (Taro.cloud) {
      Taro.cloud.init({
        env: 'cloud1-d0guhvwb72adc2e0a',
        traceUser: true,
      });
    }

    // Audio session: don't coexist with other apps' audio. Recording or
    // playing our voice clip should pause whatever music the user has running.
    try {
      Taro.setInnerAudioOption({
        mixWithOther: false,
        obeyMuteSwitch: false,
      });
    } catch (_) {}

    // Cold start: any unfinished chat from a prior session moves into the
    // drafts list so the user can resume it from history, while the live
    // chat page opens fresh.
    archiveCurrentOnLaunch();
  });

  return children;
}

export default App;
