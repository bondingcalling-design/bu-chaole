import Taro from '@tarojs/taro';

export type Role = 'user' | 'ai';
export type Kind = 'text' | 'voice';

export interface DraftMessage {
  id: string;
  role: Role;
  kind?: Kind;
  text: string;
  voicePath?: string;
  duration?: string;
  asrPending?: boolean;
}

export interface ChatDraft {
  id: string;
  title: string;
  messages: DraftMessage[];
  createdAt: number;
  updatedAt: number;
}

const DRAFTS_KEY = 'chat-drafts';
const CURRENT_KEY = 'chat-current';
const RESUME_KEY = 'chat-resume-draft';

const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_DRAFTS = 50;

function makeTitle(messages: DraftMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  const raw = (firstUser?.text || '').trim();
  if (!raw) return '未命名对话';
  return raw.length > 30 ? raw.slice(0, 30) + '…' : raw;
}

function hasUserContent(messages: DraftMessage[] | undefined): boolean {
  return Array.isArray(messages) && messages.some((m) => m && m.role === 'user');
}

export function loadDrafts(): ChatDraft[] {
  try {
    const raw = Taro.getStorageSync(DRAFTS_KEY);
    if (!Array.isArray(raw)) return [];
    const cutoff = Date.now() - TTL_MS;
    const fresh = raw.filter(
      (d: any) => d && typeof d.id === 'string' && Array.isArray(d.messages) && (d.updatedAt || 0) > cutoff,
    );
    if (fresh.length !== raw.length) {
      try { Taro.setStorageSync(DRAFTS_KEY, fresh); } catch (_) {}
    }
    return fresh;
  } catch (_) {
    return [];
  }
}

export function archiveDraft(messages: DraftMessage[], id?: string): ChatDraft | null {
  if (!hasUserContent(messages)) return null;
  const now = Date.now();
  const draftId = id || `d-${now}`;
  const drafts = loadDrafts();
  const existing = drafts.find((d) => d.id === draftId);
  const filtered = drafts.filter((d) => d.id !== draftId);
  const draft: ChatDraft = {
    id: draftId,
    title: makeTitle(messages),
    messages,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const next = [draft, ...filtered].slice(0, MAX_DRAFTS);
  try { Taro.setStorageSync(DRAFTS_KEY, next); } catch (_) {}
  return draft;
}

export function deleteDraft(id: string) {
  const next = loadDrafts().filter((d) => d.id !== id);
  try { Taro.setStorageSync(DRAFTS_KEY, next); } catch (_) {}
}

export interface CurrentChat {
  id: string;
  messages: DraftMessage[];
  updatedAt: number;
}

export function getCurrent(): CurrentChat | null {
  try {
    const cur = Taro.getStorageSync(CURRENT_KEY);
    if (cur && typeof cur === 'object' && Array.isArray(cur.messages)) {
      return {
        id: typeof cur.id === 'string' ? cur.id : `c-${Date.now()}`,
        messages: cur.messages,
        updatedAt: cur.updatedAt || Date.now(),
      };
    }
  } catch (_) {}
  return null;
}

export function saveCurrent(messages: DraftMessage[], id?: string) {
  if (!hasUserContent(messages)) return;
  const cur = getCurrent();
  const finalId = id || cur?.id || `c-${Date.now()}`;
  try {
    Taro.setStorageSync(CURRENT_KEY, {
      id: finalId,
      messages,
      updatedAt: Date.now(),
    });
  } catch (_) {}
}

export function clearCurrent() {
  try { Taro.removeStorageSync(CURRENT_KEY); } catch (_) {}
}

export interface ResumeHandoff {
  id: string;
  messages: DraftMessage[];
}

export function setResume(handoff: ResumeHandoff) {
  try { Taro.setStorageSync(RESUME_KEY, handoff); } catch (_) {}
}

export function takeResume(): ResumeHandoff | null {
  try {
    const r = Taro.getStorageSync(RESUME_KEY);
    if (r && typeof r === 'object' && Array.isArray(r.messages) && typeof r.id === 'string') {
      try { Taro.removeStorageSync(RESUME_KEY); } catch (_) {}
      return { id: r.id, messages: r.messages };
    }
  } catch (_) {}
  return null;
}

/**
 * Cold-start hook: move any in-flight chat into the drafts list, then clear
 * the live conversation so the chat page opens fresh. The user can find the
 * archived chat under history → drafts tab.
 */
export function archiveCurrentOnLaunch() {
  const cur = getCurrent();
  if (cur && hasUserContent(cur.messages)) {
    archiveDraft(cur.messages, cur.id);
  }
  clearCurrent();
}
