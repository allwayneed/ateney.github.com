/**
 * ateney - 認証ロジック v0.3.0
 * Google OAuth → Workers API でJWT取得
 * 初回ログイン時は needs_onboarding フラグを保存
 */

declare const GOOGLE_CLIENT_ID: string;
declare const LINE_CHANNEL_ID: string;
declare const APPLE_CLIENT_ID: string;

export interface AuthUser {
  provider: 'google' | 'line' | 'apple';
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  token: string;
  needs_onboarding?: boolean;
  username?: string | null;
  userId?: number;
  fl_consent?: boolean;
}

const STORAGE_KEY = 'ateney_auth';

export function getStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch { return null; }
}

export function setStoredAuth(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  return getStoredAuth() !== null;
}

function decodeBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  return atob(b64);
}

/**
 * Google ログイン — GISボタン初期化
 * コールバックでGoogle IDトークンを取得 → Workers APIに送信 → JWT取得
 * needs_onboarding=true の場合、呼び出し側でオンボーディングダイアログを表示
 */
export function initGoogleLogin(
  containerId: string,
  onSuccess: (user: AuthUser) => void,
  onError?: (msg: string) => void
): void {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          const parts = response.credential.split('.');
          if (parts.length < 2) { onError?.('Invalid JWT'); return; }
          const payload = JSON.parse(decodeBase64Url(parts[1]));

          const { authLogin, setApiToken } = await import('./api');
          const result = await authLogin(response.credential);
          setApiToken(result.token);

          const user: AuthUser = {
            provider: 'google',
            id: payload.sub,
            name: result.user.username || result.user.name || payload.name,
            email: result.user.email || payload.email,
            avatar: result.user.avatar_url || payload.picture,
            token: result.token,
            needs_onboarding: result.user.needs_onboarding,
            username: result.user.username,
            userId: result.user.id,
            fl_consent: !!result.user.fl_consent,
          };
          setStoredAuth(user);
          onSuccess(user);
        } catch (e: any) {
          console.error('[ateney] Login failed:', e);
          onError?.(e.message || 'ログインに失敗しました');
        }
      },
    });

    (window as any).google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      locale: 'ja',
    });
  };
  document.head.appendChild(script);
}

export function loginWithLine(): void {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CHANNEL_ID,
    redirect_uri: `${window.location.origin}/auth/callback`,
    state: generateState(),
    scope: 'profile openid email',
  });
  window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

export function loginWithApple(): void {
  const params = new URLSearchParams({
    response_type: 'code id_token',
    client_id: APPLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback`,
    state: generateState(),
    scope: 'name email',
    response_mode: 'form_post',
  });
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

export function logout(): void {
  const user = getStoredAuth();
  if (user?.provider === 'google') {
    (window as any).google?.accounts?.id?.disableAutoSelect?.();
  }
  clearStoredAuth();
  import('./api').then(({ clearApiToken }) => clearApiToken());
}

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}
