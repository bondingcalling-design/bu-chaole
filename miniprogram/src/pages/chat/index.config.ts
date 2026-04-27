export default definePageConfig({
  navigationStyle: 'custom',
  navigationBarTextStyle: 'white',
  backgroundColor: '#0A0F1C',
  renderer: 'skyline',
  componentFramework: 'glass-easel',
  // disableScroll removed — we need page scroll so the textarea can adjust
  // its position when the keyboard pops up.
});
