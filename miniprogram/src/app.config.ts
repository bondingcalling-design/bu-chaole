export default defineAppConfig({
  pages: [
    'pages/listen/index',
    'pages/treehouse/index',
    'pages/review/index',
    'pages/profile/index',
    'pages/chat/index',
    'pages/loading/index',
    'pages/report/index',
    'pages/history/index',
    'pages/settings/index',
    'pages/help/index',
    'pages/error/index',
    'pages/breathe/index',
    'pages/checkin/index',
    'pages/vip/index',
    'pages/translate/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0E1520',
    navigationBarTitleText: '倾听',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
    backgroundColor: '#0E1520',
  },
  // tabBar intentionally omitted: we render an in-page FloatingTabBar inside the
  // 4 tab pages instead. WeChat's custom tabBar mechanism does not play well with
  // Skyline + Taro template components in 4.1.6.
  renderer: 'skyline',
  rendererOptions: {
    skyline: {
      defaultDisplayBlock: true,
      disableABTest: true,
      sdkVersionBegin: '3.0.0',
      sdkVersionEnd: '15.255.255',
    },
  },
  lazyCodeLoading: 'requiredComponents',
  componentFramework: 'glass-easel',
  permission: {
    'scope.record': {
      desc: '需要录音权限来记录你的倾诉',
    },
  },
  // ASR 走云函数路径（cloudfunctions/asr/），后端调火山引擎一句话识别。
  // 不再需要任何小程序插件。
});
