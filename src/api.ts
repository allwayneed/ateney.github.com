/**
 * ateney - API クライアント v0.3.0
 * Cloudflare Workers (ateney-api) に接続
 * 401エラー時は自動ログアウトしない（エラーを握りつぶす）
 */

const API_BASE = 'https://ateney-api.ateney-ai.workers.dev/api';

// ===== トークン管理 =====
const TOKEN_KEY = 'ateney_jwt';

export function getApiToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setApiToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearApiToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ===== 型定義 =====
export interface Character {
  id: number;
  name: string;
  avatar_url: string | null;
  description: string | null;
  personality?: string;
  system_prompt?: string;
  greeting?: string;
  tags?: string | null;
  metadata?: string | null;
  is_public: number;
  created_at?: string;
  updated_at?: string;
}

export interface Scene {
  id: number;
  name: string;
  character_id?: number;
  setting?: string;
  context?: string;
  mood?: string;
  metadata?: string | null;
  is_public: number;
  created_at?: string;
}

export interface RagDocument {
  id: number;
  title: string;
  source?: string;
  content?: string;
  chunk_index?: number;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  role: string;
  content: string;
  adapter_value?: number | null;
  created_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
  username: string | null;
  age: number | null;
  fl_consent: number;
  created_at?: string;
  needs_onboarding?: boolean;
}

// ===== 共通fetchヘルパー =====
// 401エラーでも自動ログアウトしない。エラーをthrowせずにnullを返す
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getApiToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    console.warn(`[ateney] API ${res.status}: ${path}`);
    throw new Error(`API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// 401を想定したfetch（401ならnullを返す、ログアウトしない）
async function apiFetchSafe<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    return null;
  }
}

// ===== 認証 =====
export async function authLogin(googleIdToken: string): Promise<{
  token: string;
  user: UserProfile;
}> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id_token: googleIdToken }),
  });
}

// ===== ユーザー =====
export async function getUser(): Promise<{ user: any }> {
  return apiFetch('/user');
}

// ===== プロフィール更新（オンボーディング） =====
export async function updateProfile(data: {
  username?: string;
  age?: number;
  fl_consent?: boolean;
}): Promise<{ ok: boolean }> {
  return apiFetch('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ===== チャット履歴 =====
export async function getChatHistory(limit = 50, offset = 0): Promise<{ messages: ChatMessage[] } | null> {
  return apiFetchSafe(`/chat/history?limit=${limit}&offset=${offset}`);
}
export async function saveChat(role: string, content: string, adapterValue?: number): Promise<{ ok: boolean } | null> {
  return apiFetchSafe('/chat/save', {
    method: 'POST',
    body: JSON.stringify({ role, content, adapter_value: adapterValue }),
  });
}
export async function clearChat(): Promise<{ ok: boolean } | null> {
  return apiFetchSafe('/chat/clear', { method: 'DELETE' });
}

// ===== キャラクター =====
export async function getCharacters(): Promise<{ characters: Character[] }> {
  return apiFetch('/characters');
}
export async function getPublicCharacters(): Promise<{ characters: Character[] }> {
  return apiFetch('/characters/public');
}
export async function getCharacter(id: number): Promise<{ character: Character }> {
  return apiFetch(`/characters/${id}`);
}
export async function createCharacter(data: Partial<Character>): Promise<{ ok: boolean; id: number }> {
  return apiFetch('/characters', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateCharacter(id: number, data: Partial<Character>): Promise<{ ok: boolean }> {
  return apiFetch(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteCharacter(id: number): Promise<{ ok: boolean }> {
  return apiFetch(`/characters/${id}`, { method: 'DELETE' });
}

// ===== シーン =====
export async function getScenes(characterId?: number): Promise<{ scenes: Scene[] }> {
  const q = characterId ? `?character_id=${characterId}` : '';
  return apiFetch(`/scenes${q}`);
}
export async function createScene(data: Partial<Scene>): Promise<{ ok: boolean; id: number }> {
  return apiFetch('/scenes', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateScene(id: number, data: Partial<Scene>): Promise<{ ok: boolean }> {
  return apiFetch(`/scenes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteScene(id: number): Promise<{ ok: boolean }> {
  return apiFetch(`/scenes/${id}`, { method: 'DELETE' });
}

// ===== RAG =====
export async function getRagDocs(characterId?: number): Promise<{ documents: RagDocument[] }> {
  const q = characterId ? `?character_id=${characterId}` : '';
  return apiFetch(`/rag${q}`);
}
export async function createRagDoc(data: Partial<RagDocument> & { content: string }): Promise<{ ok: boolean; id: number }> {
  return apiFetch('/rag', { method: 'POST', body: JSON.stringify(data) });
}
export async function bulkImportRag(docs: any[]): Promise<{ ok: boolean; imported: number }> {
  return apiFetch('/rag/bulk', { method: 'POST', body: JSON.stringify({ documents: docs }) });
}
export async function deleteRagDoc(id: number): Promise<{ ok: boolean }> {
  return apiFetch(`/rag/${id}`, { method: 'DELETE' });
}

// ===== FLサーバー状態（公開エンドポイント、認証不要） =====
export async function getFlStatus(): Promise<{ fl_server_url: string; fl_token_required: boolean }> {
  // 公開エンドポイントなので直接fetch（認証ヘッダー不要）
  const res = await fetch(`${API_BASE}/fl/status`);
  if (!res.ok) return { fl_server_url: 'offline', fl_token_required: true };
  return res.json();
}
