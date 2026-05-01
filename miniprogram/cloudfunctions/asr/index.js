// ASR proxy — 火山引擎「一句话识别」同步 HTTP 接口（短语音 < 60s）.
//
// Required cloud-function env vars (set in cloud console after deploy):
//   VOLC_ASR_APPID    — 火山引擎语音技术「应用 AppID」
//   VOLC_ASR_TOKEN    — Access Token
//   VOLC_ASR_CLUSTER  — Cluster ID（一句话识别用 "volcengine_input_common"，
//                                  录音文件识别才是 "volc_auc_common"）
//
// Caller invokes: cloud.callFunction({ name: 'asr', data: { audio, format } })
//   audio:  base64 string of the mp3/wav bytes
//   format: 'mp3' | 'wav' | 'pcm' | 'ogg'   (default 'mp3')
// Returns: { ok: true, text: '...', ms } or { ok: false, error: '...' }

const cloud = require('wx-server-sdk');
const https = require('https');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const HOST = 'openspeech.bytedance.com';
const ASR_PATH = '/api/v1/asr';

function postJson(host, path, headers, payload, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload));
    const req = https.request(
      {
        host,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          let parsed = null;
          try { parsed = JSON.parse(body); } catch (_) {}
          resolve({ status: res.statusCode || 0, body, json: parsed });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('http timeout')));
    req.write(data);
    req.end();
  });
}

exports.main = async (event) => {
  const APPID = process.env.VOLC_ASR_APPID;
  const TOKEN = process.env.VOLC_ASR_TOKEN;
  const CLUSTER = process.env.VOLC_ASR_CLUSTER || 'volcengine_input_common';

  if (!APPID || !TOKEN) {
    return { ok: false, error: 'cloud function env vars VOLC_ASR_APPID / VOLC_ASR_TOKEN not set' };
  }

  const { audio, format } = event || {};
  if (!audio || typeof audio !== 'string') {
    return { ok: false, error: 'audio (base64 string) required' };
  }

  const reqid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const body = {
    app: { appid: APPID, token: TOKEN, cluster: CLUSTER },
    user: { uid: 'listen-mp' },
    audio: {
      format: format || 'mp3',
      rate: 16000,
      channel: 1,
      bits: 16,
      data: audio,
    },
    request: {
      reqid,
      sequence: -1,
      show_language: false,
      show_utterances: false,
    },
  };

  const t0 = Date.now();
  let resp;
  try {
    resp = await postJson(HOST, ASR_PATH, {
      Authorization: `Bearer; ${TOKEN}`,
    }, body, 10000);
  } catch (e) {
    return { ok: false, error: 'http error: ' + (e?.message || e) };
  }
  const ms = Date.now() - t0;
  console.log('[asr-sync]', {
    ms,
    status: resp.status,
    code: resp.json?.code ?? resp.json?.resp?.code,
    message: resp.json?.message ?? resp.json?.resp?.message,
  });

  if (resp.status < 200 || resp.status >= 300) {
    return { ok: false, error: `http ${resp.status}`, detail: resp.json || resp.body, ms };
  }

  const j = resp.json || {};
  // 一句话识别 sync 返回顶层 code/message/result；做防御性兼容
  const code = j.code ?? j.resp?.code;
  const message = j.message ?? j.resp?.message;
  if (code !== 1000) {
    return { ok: false, error: `asr code ${code}: ${message || ''}`, detail: j, ms };
  }
  const text =
    (Array.isArray(j.result) && j.result.map((r) => r.text || '').join('')) ||
    j.text ||
    j.resp?.text ||
    '';
  return { ok: true, text, ms };
};
