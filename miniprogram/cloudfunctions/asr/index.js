// ASR proxy — 火山引擎 录音文件识别 (极速版).
//
// Required cloud-function env vars (set in cloud console after deploy):
//   VOLC_ASR_APPID    — 火山引擎语音技术「应用 AppID」
//   VOLC_ASR_TOKEN    — Access Token
//   VOLC_ASR_CLUSTER  — Cluster ID (默认 "volc_auc_common")
//
// Caller invokes: cloud.callFunction({ name: 'asr', data: { fileID } })
// Returns: { ok: true, text: '...' } or { ok: false, error: '...' }

const cloud = require('wx-server-sdk');
const https = require('https');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const HOST = 'openspeech.bytedance.com';
const SUBMIT_PATH = '/api/v1/auc/submit';
const QUERY_PATH = '/api/v1/auc/query';
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 45000; // remember to bump SCF function timeout to >=60s in cloud console

function postJson(host, path, headers, payload, timeoutMs = 12000) {
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
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`http timeout`)));
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

exports.main = async (event) => {
  const APPID = process.env.VOLC_ASR_APPID;
  const TOKEN = process.env.VOLC_ASR_TOKEN;
  const CLUSTER = process.env.VOLC_ASR_CLUSTER || 'volc_auc_common';

  if (!APPID || !TOKEN) {
    return { ok: false, error: 'cloud function env vars VOLC_ASR_APPID / VOLC_ASR_TOKEN not set' };
  }

  const { fileID } = event || {};
  if (!fileID || typeof fileID !== 'string') {
    return { ok: false, error: 'fileID required' };
  }

  // 1. Resolve cloud:// fileID to an HTTPS URL
  let httpsUrl;
  try {
    const r = await cloud.getTempFileURL({ fileList: [fileID] });
    httpsUrl = r.fileList?.[0]?.tempFileURL;
    if (!httpsUrl) return { ok: false, error: 'getTempFileURL returned no url', detail: r };
  } catch (e) {
    return { ok: false, error: 'getTempFileURL failed: ' + (e?.message || e) };
  }

  const reqid = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const submitBody = {
    app: { appid: APPID, token: TOKEN, cluster: CLUSTER },
    user: { uid: 'listen-mp' },
    audio: { format: 'mp3', url: httpsUrl },
    additions: { use_itn: 'True', with_speaker_info: 'False' },
    request: { reqid, sequence: -1 },
  };

  // 2. Submit ASR task
  let submit;
  try {
    submit = await postJson(HOST, SUBMIT_PATH, {
      Authorization: `Bearer; ${TOKEN}`,
    }, submitBody);
  } catch (e) {
    return { ok: false, error: 'submit failed: ' + (e?.message || e) };
  }
  if (submit.status < 200 || submit.status >= 300) {
    return { ok: false, error: `submit ${submit.status}`, detail: submit.json || submit.body };
  }
  const submitJson = submit.json || {};
  if (submitJson.resp?.code && submitJson.resp.code !== 1000) {
    return { ok: false, error: `submit code ${submitJson.resp.code}`, detail: submitJson };
  }
  const taskId = submitJson.resp?.id || submitJson.id;
  if (!taskId) return { ok: false, error: 'no task id returned', detail: submitJson };

  // 3. Poll for result.
  //   Volcengine ASR codes (relevant subset):
  //     1000 = success
  //     1xxx = queued / processing (1001 = queued, 1002/1003 = running, ...)
  //     2xxx = informational (2000 = "Start processing", task pre-flight)
  //     >= 4000 = hard error
  const queryBody = {
    appid: APPID,
    token: TOKEN,
    cluster: CLUSTER,
    id: taskId,
  };
  const start = Date.now();
  let lastCode = null;
  let lastMsg = null;
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);
    let q;
    try {
      q = await postJson(HOST, QUERY_PATH, { Authorization: `Bearer; ${TOKEN}` }, queryBody);
    } catch (e) {
      continue; // network blip, retry next tick
    }
    const j = q.json || {};
    const code = j.resp?.code;
    lastCode = code;
    lastMsg = j.resp?.message;
    console.log('[asr poll]', { code, message: lastMsg });

    if (code === 1000) {
      const text = j.resp?.text
        || (Array.isArray(j.resp?.utterances) && j.resp.utterances.map((u) => u.text || '').join(''))
        || '';
      // Surface the additions field so we can see what Volcengine measured
      console.log('[asr success]', {
        text,
        additions: j.resp?.additions,
        utterancesCount: (j.resp?.utterances || []).length,
      });
      return { ok: true, text, taskId, additions: j.resp?.additions };
    }
    // Treat 1xxx + 2xxx as "still working"; anything 4xxx+ is a hard error.
    if (typeof code === 'number' && code >= 4000) {
      return { ok: false, error: `asr code ${code}: ${lastMsg || ''}`, detail: j };
    }
  }

  return {
    ok: false,
    error: `asr poll timeout (lastCode=${lastCode} lastMsg=${lastMsg})`,
  };
};
