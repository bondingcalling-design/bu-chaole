# 倾听 · WeChat Mini Program

MVP port of the Figma Make React design at `../src/` into a Taro 4 + React WeChat Mini Program.

## Architecture

- **Framework**: Taro 4.1.6 (React 18)
- **Renderer**: WeChat Skyline (enables `backdrop-filter: blur()` for the glass UI)
- **Routing**: native mini-program pages + custom floating tab bar
- **Backend**: WeChat Cloud Development (`env: cloud1-d0guhvwb72adc2e0a`)
- **AI**: 豆包 (火山方舟 ARK) via cloud function `doubao`

## Directory layout

```
miniprogram/
├─ project.config.json          AppID + WeChat devtools settings
├─ project.private.config.json  Cloud env (gitignored)
├─ config/                      Taro build config
├─ cloudfunctions/doubao/       Doubao (ARK) proxy cloud function
├─ src/
│  ├─ app.tsx / app.config.ts   App entry + page list + Skyline flags
│  ├─ custom-tab-bar/           Floating glass tab bar (replaces native bar)
│  ├─ assets/                   bg image, lucide-style SVG icons
│  └─ pages/
│     ├─ listen/      ← tab 1 · home (mic + pulsing rings)
│     ├─ treehouse/   ← tab 2 · placeholder (敬请期待)
│     ├─ review/      ← tab 3 · recent reports landing
│     ├─ profile/     ← tab 4 · user + menu
│     ├─ chat/        · text chat with Doubao AI
│     ├─ loading/     · "generating report" transition
│     ├─ report/      · AI-generated structured report
│     ├─ history/     · full history of past reports
│     └─ settings/    · toggles + clear storage
```

## Quick start

### 1. Install deps
```bash
cd miniprogram
npm install
```

### 2. Build for dev
```bash
npm run dev:weapp
```
This watches `src/` and emits to `dist/`. Keep it running.

### 3. Open in WeChat DevTools
- Project path: this `miniprogram/` directory
- AppID is already wired (see `project.config.json`)
- On first open, cloud env `cloud1-d0guhvwb72adc2e0a` must be initialized (see `src/app.tsx`)

### 4. Deploy the cloud function
In WeChat DevTools:
1. Right-click `cloudfunctions/doubao` → **"上传并部署：云端安装依赖"**
2. Open the cloud console → set env vars on the function:
   - `ARK_API_KEY` = your 火山方舟 API key
   - `ARK_MODEL` = model name, e.g. `doubao-seed-2-0-pro-260215` (or an `ep-...` endpoint ID — both work)

### 5. Compress the background image
`src/assets/bg-dawn.jpg` is ~2.2 MB — too large for the 2 MB main-package cap.
Before first upload, either:
- Compress with tinypng.com (target < 300 KB), or
- Upload to 云存储 and reference by `cloud://...` URL.

## MVP scope

| Page | State |
|---|---|
| listen | ✅ full fidelity (CSS @keyframes for all motion) |
| chat | ✅ text chat wired to Doubao; voice deferred |
| loading → report | ✅ real AI report from Doubao |
| history, profile, settings | ✅ functional |
| treehouse, VIP | ⏸ placeholder (personal account can't process payments) |
| voice recording + ASR | ⏸ next iteration (WeChat RecorderManager) |

## Known caveats

- **Backdrop-filter fidelity**: requires Skyline renderer + WeChat 8.0.40+; older devices fall back to no blur.
- **Personal account**: no 微信支付, no web-view, service category restricted — avoid "心理咨询 / 情感陪伴" wording in app description.
- **Image size**: bg-dawn.jpg must be compressed or moved to cloud storage before upload.
