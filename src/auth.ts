/**
 * ateney - 認証ロジック
 * Google / LINE / Apple のOAuthログインに対応
 *
 * 各プロバイダーのIDを下記に設定してください：
 * - Google: Google Cloud Console で OAuth 2.0 クライアントID を作成
 * - LINE: LINE Developers でチャネルID を作成（LINE Login）
 * - Apple: Apple Developer で Services ID を作成（Sign in with Apple）
 */

// ===== 設定（ここを書き換えてね） =====
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const LINE_CHANNEL_ID = 'YOUR_LINE_CHANNEL_ID';
const APPLE_CLIENT_ID = 'YOUR_APPLE_CLIENT_ID';

const REDIRECT_URI = `${window.location.origin}/auth/callback`;

// ===== 認証状態の型 =====
export interface AuthUser {
  provider: 'google' | 'line' | 'apple';
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  token: string;
}

// ===== ストレージ =====
const STORAGE_KEY = 'ateney_auth';

export function getStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== ログイン判定 =====
export function isLoggedIn(): boolean {
  return getStoredAuth() !== null;
}

// ===== Google ログイン =====
/**
 * Google Identity Services (GIS) を使ったログイン
 * GISスクリプトを動的に読み込み、ボタンをレンダリングする
 */
export function initGoogleLogin(containerId: string, onSuccess: (user: AuthUser) => void): void {
  // GISスクリプトをロード
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Googleボタンをレンダード
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        // JWTをデコード
        const payload = JSON.parse(
          atob(response.credential.split('.')[1])
        );
        const user: AuthUser = {
          provider: 'google',
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          token: response.credential,
        };
        setStoredAuth(user);
        onSuccess(user);
      },
    });

    (window as any).google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'continue_with',
      locale: 'ja',
    });
  };
  document.head.appendChild(script);
}

// ===== LINE ログイン =====
/**
 * LINE Login（リダイレクト方式）
 * LINEの認可エンドポイントへリダイレクトする
 */
export function loginWithLine(): void {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CHANNEL_ID,
    redirect_uri: REDIRECT_URI,
    state: generateState(),
    scope: 'profile openid email',
  });

  window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

// ===== Apple ログイン =====
/**
 * Sign in with Apple（リダイレクト方式）
 * Appleの認可エンドポイントへリダイレクトする
 */
export function loginWithApple(): void {
  const params = new URLSearchParams({
    response_type: 'code id_token',
    client_id: APPLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state: generateState(),
    scope: 'name email',
    response_mode: 'form_post',
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

// ===== コールバック処理 =====
/**
 * /auth/callback でリダイレクト後に呼ばれる
 * プロバイダーからのコールバックを処理する
 */
export async function handleAuthCallback(): Promise<AuthUser | null> {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // 認可コードがある場合はバックエンドで交換が必要
  // ここではフロントエンドでの処理のみ
  const code = params.get('code');
  const state = params.get('state');

  if (!code) return null;

  // バックエンドAPIでコードをトークンに交換する
  // const response = await fetch('/api/auth/callback', { ... })
  // これはAPI側ができてから実装

  return null;
}

// ===== ログアウト =====
export function logout(): void {
  const user = getStoredAuth();
  if (!user) return;

  // プロバイダーごとのログアウト処理
  switch (user.provider) {
    case 'google':
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
      break;
    case 'line':
      // LINEはトークンをRevokeするAPIを叩く必要がある（バックエンド側）
      break;
    case 'apple':
      // Appleは revoke エンドポイントにリクエスト
      break;
  }

  clearStoredAuth();
}

// ===== ヘルパー =====
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
