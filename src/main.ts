/**
 * ateney - メインエントリーポイント
 */

import { fetchMainContent } from './api';
import {
  isLoggedIn,
  getStoredAuth,
  logout,
  loginWithLine,
  loginWithApple,
  initGoogleLogin,
  type AuthUser,
} from './auth';

// ===== 認証状態の管理 =====
const loginScreen = document.getElementById('loginScreen') as HTMLElement | null;
const accountIcon = document.getElementById('accountIcon') as HTMLButtonElement | null;
const settingsName = document.getElementById('settingsName') as HTMLElement | null;
const settingsEmail = document.getElementById('settingsEmail') as HTMLElement | null;
const settingsAvatar = document.getElementById('settingsAvatar') as HTMLElement | null;

let currentUser: AuthUser | null = null;

function updateAuthUI(): void {
  currentUser = getStoredAuth();

  if (currentUser) {
    // ログイン済み
    loginScreen?.classList.add('hidden');
    if (accountIcon) accountIcon.style.display = 'flex';

    // 設定画面にユーザー情報を表示
    if (settingsName) settingsName.textContent = currentUser.name;
    if (settingsEmail) settingsEmail.textContent = currentUser.email ?? '';
    if (settingsAvatar && currentUser.avatar) {
      settingsAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" />`;
    }
  } else {
    // 未ログイン
    loginScreen?.classList.remove('hidden');
    if (accountIcon) accountIcon.style.display = 'none';
  }
}

// ===== ログイン処理 =====
// Google: GISボタンを初期化
initGoogleLogin('googleLoginBtn', (user) => {
  updateAuthUI();
  loadMainContent();
});

// LINE: リダイレクト
document.getElementById('lineLoginBtn')?.addEventListener('click', () => {
  loginWithLine();
});

// Apple: リダイレクト
document.getElementById('appleLoginBtn')?.addEventListener('click', () => {
  loginWithApple();
});

// ログアウト
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  logout();
  currentUser = null;
  updateAuthUI();
  closeSettings();
});

// ===== ハンバーガーメニュー =====
const hamburger = document.getElementById('hamburger') as HTMLButtonElement | null;
const sideMenu = document.getElementById('sideMenu') as HTMLElement | null;
const overlay = document.getElementById('overlay') as HTMLElement | null;

function toggleMenu(): void {
  if (!hamburger || !sideMenu || !overlay) return;
  if (sideMenu.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu(): void {
  if (!hamburger || !sideMenu || !overlay) return;
  sideMenu.classList.add('open');
  overlay.classList.add('show');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  sideMenu.setAttribute('aria-hidden', 'false');
}

function closeMenu(): void {
  if (!hamburger || !sideMenu || !overlay) return;
  sideMenu.classList.remove('open');
  overlay.classList.remove('show');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  sideMenu.setAttribute('aria-hidden', 'true');
}

hamburger?.addEventListener('click', toggleMenu);
overlay?.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMenu();
    closeSettings();
  }
});

// ===== 設定画面 =====
const settings = document.getElementById('settings') as HTMLElement | null;
const settingsBack = document.getElementById('settingsBack') as HTMLButtonElement | null;
const menuSettings = document.getElementById('menuSettings') as HTMLAnchorElement | null;

function openSettings(): void {
  settings?.classList.add('open');
  settings?.setAttribute('aria-hidden', 'false');
  closeMenu();
}

function closeSettings(): void {
  settings?.classList.remove('open');
  settings?.setAttribute('aria-hidden', 'true');
}

accountIcon?.addEventListener('click', openSettings);
settingsBack?.addEventListener('click', closeSettings);
menuSettings?.addEventListener('click', (e: Event) => {
  e.preventDefault();
  openSettings();
});

// ===== メインコンテンツ取得 =====
async function loadMainContent(): Promise<void> {
  const main = document.getElementById('main-content');
  if (!main) return;

  if (!isLoggedIn()) {
    main.innerHTML = '';
    return;
  }

  const data = await fetchMainContent();

  if (!data) {
    main.innerHTML = '<p class="main__loading">コンテンツを取得できませんでした。（APIが起動してないかも）</p>';
    return;
  }

  main.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// ===== 初期化 =====
updateAuthUI();
if (isLoggedIn()) {
  loadMainContent();
}
