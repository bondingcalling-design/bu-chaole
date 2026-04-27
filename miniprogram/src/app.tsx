import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import Taro from '@tarojs/taro';
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
  });

  return children;
}

export default App;
