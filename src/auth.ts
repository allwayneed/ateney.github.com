/**
 * ateney - 認証ロジック
 * Google / LINE / Apple のOAuthログインに対応
 *
 * ビルド時に esbuild の --define で各IDを注入する：
 *   --define:GOOGLE_CLIENT_ID='"xxxx.apps.googleusercontent.com"'
 *   --define:LINE_CHANNEL_ID='"1234567890"'
 *   --define:APPLE_CLIENT_ID='"com.ateney.app"'
 *
 * ローカル開発時は環境変数 $GOOGLE_CLIENT_ID 等から自動注入
 */

// ===== ビルド時注入される変数（esbuild --define で置換） =====
declare const GOOGLE_CLIENT_ID: string;
declare const LINE_CHANNEL_ID: string;
declare const APPLE_CLIENT_ID: string;

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

// ===== base64url デコードヘルパー =====
function decodeBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) {
    b64 += '='.repeat(4 - pad);
  }
  return atob(b64);
}

// ===== Google ログイン =====
export function initGoogleLogin(containerId: string, onSuccess: (user: AuthUser) => void): void {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        const parts = response.credential.split('.');
        if (parts.length < 2) {
          console.error('[ateney] Invalid JWT format');
          return;
        }
        const payload = JSON.parse(decodeBase64Url(parts[1]));
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

    // width は数値（ピクセル）のみ。% は不可なので削除
    (window as any).google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      locale: 'ja',
    });
  };
  document.head.appendChild(script);
}

// ===== LINE ログイン =====
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
export async function handleAuthCallback(): Promise<AuthUser | null> {
  const url = new URL(window.location.href);
  const params = url.searchParams;

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

  switch (user.provider) {
    case 'google':
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
      break;
    case 'line':
      break;
    case 'apple':
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
