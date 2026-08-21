/**
 * ateney - メインエントリーポイント v0.3.0
 * - 401エラー時も自動ログアウトしない
 * - 初回ログイン時のオンボーディング（ユーザー名→年齢→FL協力）
 * - aria-hiddenのフォーカス問題修正
 */

import {
  authLogin, getApiToken, setApiToken, clearApiToken,
  getCharacters, getPublicCharacters, getCharacter,
  createCharacter, updateCharacter, deleteCharacter,
  getScenes, createScene, updateScene, deleteScene,
  getRagDocs, createRagDoc, deleteRagDoc, bulkImportRag,
  getChatHistory, saveChat, clearChat,
  getUser, getFlStatus as getFlApiStatus, deleteAccount, updateProfile,
  type Character, type Scene, type RagDocument,
} from './api';
import {
  isLoggedIn, getStoredAuth, clearStoredAuth, logout,
  initGoogleLogin, loginWithLine, loginWithApple,
  type AuthUser,
} from './auth';
import { initFlClient, connectFl, disconnectFl, getFlStatus, type FlStatus } from './fl-client';

const loginScreen = document.getElementById('loginScreen') as HTMLElement | null;
const accountIcon = document.getElementById('accountIcon') as HTMLButtonElement | null;
const settingsName = document.getElementById('settingsName') as HTMLElement | null;
const settingsEmail = document.getElementById('settingsEmail') as HTMLElement | null;
const settingsAvatar = document.getElementById('settingsAvatar') as HTMLElement | null;
const mainContent = document.getElementById('main-content') as HTMLElement | null;

let currentUser: AuthUser | null = null;

function updateAuthUI(): void {
  currentUser = getStoredAuth();
  if (currentUser) {
    loginScreen?.classList.add('hidden');
    if (accountIcon) accountIcon.style.display = 'flex';
    if (settingsName) settingsName.textContent = currentUser.username || currentUser.name;
    if (settingsEmail) settingsEmail.textContent = currentUser.email ?? '';
    if (settingsAvatar && currentUser.avatar) {
      settingsAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    }
    // 初回ユーザーはオンボーディング、それ以外はホーム
    if (currentUser.needs_onboarding) {
      showOnboarding();
    } else {
      navigateTo('home');
    }
  } else {
    loginScreen?.classList.remove('hidden');
    if (accountIcon) accountIcon.style.display = 'none';
  }
}

// ===== オンボーディング（初回ログイン時） =====
function showOnboarding(): void {
  if (!mainContent) return;
  const step = 1;
  mainContent.innerHTML = `
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--active"></div>
          <div class="onboarding__dot"></div>
          <div class="onboarding__dot"></div>
        </div>
        <h2 class="onboarding__title">ateneyへようこそ！</h2>
        <p class="onboarding__desc">まずはユーザー名を決めましょう</p>
          <p class="onboarding__hint">英数字、_、- のみ使用可能（1〜20文字）</p>
        <div class="onboarding__form">
          <label class="onboarding__field">
            <span>ユーザー名（1〜20文字）</span>
            <input type="text" id="onboardUsername" maxlength="20" placeholder="ユーザー名" autofocus />
          </label>
          <div class="onboarding__hint">あなたのユーザーID: #${currentUser?.userId ?? '?'}</div>
          <button class="btn-primary onboarding__next" id="onboardNext1">次へ</button>
        </div>
      </div>
    </div>`;

  document.getElementById('onboardNext1')?.addEventListener('click', () => {
    const username = (document.getElementById('onboardUsername') as HTMLInputElement).value.trim();
    if (!username) { alert('ユーザー名を入力してください'); return; }
    if (username.length > 20) { alert('ユーザー名は20文字以内で入力してください'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) { alert('ユーザー名は英数字、_、- のみ使用できます'); return; }
    onboardingStep2(username);
  });
  // Enter key
  document.getElementById('onboardUsername')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('onboardNext1')?.click();
  });
}

function onboardingStep2(username: string): void {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--active"></div>
          <div class="onboarding__dot"></div>
        </div>
        <h2 class="onboarding__title">生年月日を教えてください</h2>
        <p class="onboarding__desc">年齢確認に使用します（公開されません）</p>
        <div class="onboarding__form">
          <label class="onboarding__field">
            <span>生年月日</span>
            <div class="date-dial">
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="year-up" aria-label="年を増やす">▲</button>
                <input type="number" id="dialYear" class="date-dial__input" value="2000" min="1920" max="2015" readonly />
                <button class="date-dial__btn" data-dial="year-down" aria-label="年を減らす">▼</button>
                <span class="date-dial__label">年</span>
              </div>
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="month-up" aria-label="月を増やす">▲</button>
                <input type="number" id="dialMonth" class="date-dial__input" value="1" min="1" max="12" readonly />
                <button class="date-dial__btn" data-dial="month-down" aria-label="月を減らす">▼</button>
                <span class="date-dial__label">月</span>
              </div>
              <div class="date-dial__group">
                <button class="date-dial__btn" data-dial="day-up" aria-label="日を増やす">▲</button>
                <input type="number" id="dialDay" class="date-dial__input" value="1" min="1" max="31" readonly />
                <button class="date-dial__btn" data-dial="day-down" aria-label="日を減らす">▼</button>
                <span class="date-dial__label">日</span>
              </div>
            </div>
          </label>
          <button class="btn-primary onboarding__next" id="onboardNext2">次へ</button>
        </div>
      </div>
    </div>`;

  // ダイヤル操作
  const dialBtns = document.querySelectorAll('[data-dial]');
  dialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.dial;
      const [unit, dir] = action!.split('-');
      const input = document.getElementById(unit === 'year' ? 'dialYear' : unit === 'month' ? 'dialMonth' : 'dialDay') as HTMLInputElement;
      let val = parseInt(input.value);
      const min = parseInt(input.min);
      const max = parseInt(input.max);
      if (dir === 'up') val = val >= max ? min : val + 1;
      else val = val <= min ? max : val - 1;
      input.value = String(val);
    });
  });

  document.getElementById('onboardNext2')?.addEventListener('click', () => {
    const year = (document.getElementById('dialYear') as HTMLInputElement).value;
    const month = (document.getElementById('dialMonth') as HTMLInputElement).value.padStart(2, '0');
    const day = (document.getElementById('dialDay') as HTMLInputElement).value.padStart(2, '0');
    const birthDate = `${year}-${month}-${day}`;
    if (!birthDate) { alert('生年月日を入力してください'); return; }
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 13) { alert('ateneyは13歳以上が対象です'); return; }
    if (age > 120) { alert('正しい生年月日を入力してください'); return; }
    onboardingStep3(username, birthDate);
  });
}

function onboardingStep3(username: string, birthDate: string): void {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="onboarding" id="onboarding">
      <div class="onboarding__card">
        <div class="onboarding__progress">
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--done"></div>
          <div class="onboarding__dot onboarding__dot--active"></div>
        </div>
        <h2 class="onboarding__title">分散学習に協力しますか？</h2>
        <p class="onboarding__desc">
          ateneyでは、ブラウザを使ってAIモデルの学習を支援する「分散学習」に参加できます。
          参加するとAIの性能向上に貢献できます。いつでも設定から変更できます。
        </p>
        <div class="onboarding__form">
          <div class="onboarding__choices">
            <label class="onboarding__choice">
              <input type="radio" name="flConsent" value="yes" id="flYes" />
              <span class="onboarding__choice-label">協力する</span>
              <span class="onboarding__choice-desc">ブラウザの空きリソースで学習に参加</span>
            </label>
            <label class="onboarding__choice">
              <input type="radio" name="flConsent" value="no" id="flNo" checked />
              <span class="onboarding__choice-label">協力しない</span>
              <span class="onboarding__choice-desc">後でいつでも変更できます</span>
            </label>
          </div>
          <button class="btn-primary onboarding__next" id="onboardFinish">完了</button>
        </div>
      </div>
    </div>`;

  document.getElementById('onboardFinish')?.addEventListener('click', async () => {
    const flConsent = (document.getElementById('flYes') as HTMLInputElement).checked;
    const btn = document.getElementById('onboardFinish') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = '保存中…';
    try {
      const result = await updateProfile({ username, birth_date: birthDate, fl_consent: flConsent });
      // 新トークンが返ってきたら更新（初回オンボーディング時）
      if (result.token) {
        setApiToken(result.token);
      }
      // ローカルの認証情報を更新
      if (currentUser) {
        currentUser.username = username;
        currentUser.needs_onboarding = false;
        currentUser.userId = result.user?.id ?? currentUser.userId;
        currentUser.token = result.token || currentUser.token;
        const stored = getStoredAuth();
        if (stored) {
          stored.username = username;
          stored.needs_onboarding = false;
          stored.userId = result.user?.id ?? stored.userId;
          stored.token = result.token || stored.token;
          stored.fl_consent = flConsent;
          localStorage.setItem('ateney_auth', JSON.stringify(stored));
        }
      }
      if (settingsName) settingsName.textContent = username;
      navigateTo('home');
    } catch (e) {
      alert(`保存に失敗しました: ${e}`);
      btn.disabled = false;
      btn.textContent = '完了';
    }
  });
}

// ===== Google ログイン =====
initGoogleLogin('googleLoginBtn', (user) => {
  setApiToken(user.token);
  currentUser = user;
  updateAuthUI();
}, (msg: string) => { showError(msg); });

// ===== FED (連合学習) =====
async function renderFed(): Promise<void> {
  if (!mainContent) return;
  const flRes = await getFlApiStatus().catch(() => ({ fl_server_url: 'offline', fl_auth_token: null, fl_token_required: true }));
  const serverUrl = flRes.fl_server_url === 'not-configured' || flRes.fl_server_url === 'offline' ? '' : flRes.fl_server_url;
  const authToken = flRes.fl_auth_token || '';
  const s = getFlStatus();

  // サーバーURL + トークンがあれば自動接続
  if (serverUrl && authToken && !s.connected && !s.connecting) {
    connectFl({ serverUrl, authToken });
  }

  // 条件付きHTMLを先に文字列で組み立て
  const bannedInfo = s.banned
    ? '<div class="fed__detail fed__detail--warn">残り ' + s.banRemaining + '秒</div>'
    : '';

  const lossChart = s.lossHistory.length > 0
    ? '<div class="fed__chart"><div class="fed__card-header">Loss推移</div><div class="fed__loss-chart">' +
      s.lossHistory.map((loss: number, i: number) => {
        const maxLoss = Math.max(...s.lossHistory, 1);
        const heightPct = (loss / maxLoss) * 100;
        return '<div class="fed__loss-bar" style="height:' + heightPct + '%" title="R' + (i+1) + ': ' + loss.toFixed(4) + '"></div>';
      }).join('') +
      '</div></div>'
    : '';

  const logLines = s.log.map((l: string) =>
    '<div class="fed__log-line">' + l + '</div>'
  ).join('');

  const statusDot = s.connected ? 'fed__status-dot--online' : s.connecting ? 'fed__status-dot--connecting' : 'fed__status-dot--offline';
  const statusText = s.connected ? '接続中' : s.connecting ? '接続中...' : '未接続';
  const rankDisplay = s.banned ? 'F (停止中)' : s.rank;
  const lossDisplay = s.lastLoss !== null ? s.lastLoss.toFixed(4) : '-';
  const disconnectDisabled = !s.connected ? 'disabled' : '';

  // サーバーが未設定の場合の表示
  const serverStatus = !serverUrl
    ? '<div class="fed__offline-msg">FLサーバーがオフラインです。サーバーが起動すると自動接続します。</div>'
    : '';

  mainContent.innerHTML = [
    '<div class="fed">',
    '  <h2 class="fed__title">⚡ Federated Learning</h2>',
    '  <p class="fed__subtitle">ブラウザ上でAIアダプタの学習に参加</p>',
    '  <div class="fed__grid">',
    '    <div class="fed__card">',
    '      <div class="fed__card-header">接続状態</div>',
    '      <div class="fed__status-row">',
    '        <span class="fed__status-dot ' + statusDot + '"></span>',
    '        <span>' + statusText + '</span>',
    '      </div>',
    '      <div class="fed__detail">Backend: <strong>' + s.backend + '</strong></div>',
    '      <div class="fed__detail">Client: <strong>' + s.clientId.slice(0, 8) + '</strong></div>',
    '    </div>',
    '    <div class="fed__card">',
    '      <div class="fed__card-header">ランク</div>',
    '      <div class="fed__rank ' + (s.banned ? 'fed__rank--banned' : '') + '">' + rankDisplay + '</div>',
    '      <div class="fed__detail">ロール: <strong>' + s.role + '</strong></div>',
    '      ' + bannedInfo,
    '    </div>',
    '    <div class="fed__card">',
    '      <div class="fed__card-header">学習ラウンド</div>',
    '      <div class="fed__stat-num">' + s.rounds + '</div>',
    '      <div class="fed__detail">最終loss: <strong>' + lossDisplay + '</strong></div>',
    '    </div>',
    '  </div>',
    '  ' + lossChart,
    '  ' + serverStatus,
    '  <div class="fed__controls">',
    '    <button class="btn-secondary" id="flDisconnectBtn" ' + disconnectDisabled + '>切断</button>',
    '  </div>',
    '  <div class="fed__log-wrap">',
    '    <div class="fed__card-header">ログ</div>',
    '    <div class="fed__log" id="flLog">' + logLines + '</div>',
    '  </div>',
    '  <div class="fed__info">',
    '    <p>このページを開いている間、あなたのブラウザがAIモデルの微調整に参加します。</p>',
    '    <p>学習データはサーバーから配信され、重みの更新結果のみが送信されます。</p>',
    '    <p>ブラウザのGPU (WebGPU/WebGL) を使用してローカル学習を行います。</p>',
    '  </div>',
    '</div>'
  ].join('' + '\n');

  document.getElementById('flDisconnectBtn')?.addEventListener('click', () => {
    disconnectFl();
  });

  const logEl = document.getElementById('flLog');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

document.getElementById('lineLoginBtn')?.addEventListener('click', () => loginWithLine());
document.getElementById('appleLoginBtn')?.addEventListener('click', () => loginWithApple());

// ログアウト（手動のみ、401では呼ばれない）
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  logout(); currentUser = null;
  updateAuthUI(); closeSettings();
});

// 401イベントリスナー削除 — 自動ログアウトしない

// ===== ハンバーガー =====
const hamburger = document.getElementById('hamburger') as HTMLButtonElement | null;
const sideMenu = document.getElementById('sideMenu') as HTMLElement | null;
const overlay = document.getElementById('overlay') as HTMLElement | null;

function toggleMenu(): void { sideMenu?.classList.contains('open') ? closeMenu() : openMenu(); }
function openMenu(): void {
  sideMenu?.classList.add('open'); overlay?.classList.add('show');
  hamburger?.classList.add('open'); hamburger?.setAttribute('aria-expanded', 'true');
  sideMenu?.setAttribute('aria-hidden', 'false');
}
function closeMenu(): void {
  // フォーカスを外してからaria-hiddenを設定（アクセシビリティ警告対策）
  (document.activeElement as HTMLElement)?.blur();
  sideMenu?.classList.remove('open'); overlay?.classList.remove('show');
  hamburger?.classList.remove('open'); hamburger?.setAttribute('aria-expanded', 'false');
  sideMenu?.setAttribute('aria-hidden', 'true');
}

hamburger?.addEventListener('click', toggleMenu);
overlay?.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeSettings(); } });

// ===== 設定 =====
const settings = document.getElementById('settings') as HTMLElement | null;
const settingsBack = document.getElementById('settingsBack') as HTMLButtonElement | null;

function openSettings(): void {
  settings?.classList.add('open');
  settings?.setAttribute('aria-hidden', 'false');
  closeMenu();
}
function closeSettings(): void {
  (document.activeElement as HTMLElement)?.blur();
  settings?.classList.remove('open');
  settings?.setAttribute('aria-hidden', 'true');
}

accountIcon?.addEventListener('click', openSettings);
settingsBack?.addEventListener('click', closeSettings);
document.getElementById('menuSettings')?.addEventListener('click', (e) => { e.preventDefault(); openSettings(); });

// ===== ナビゲーション =====
type Page = 'home' | 'works' | 'characters' | 'scenes' | 'rag' | 'topics' | 'profile' | 'fed';

document.getElementById('menuHome')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('home'); });
document.getElementById('menuWorks')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('works'); });
document.getElementById('menuCharacters')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('characters'); });
document.getElementById('menuScenes')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('scenes'); });
document.getElementById('menuRag')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('rag'); });
document.getElementById('menuTopics')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('topics'); });
document.getElementById('menuProfile')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('profile'); });
document.getElementById('menuFed')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('fed'); });

function navigateTo(page: Page): void {
  closeMenu();
  switch (page) {
    case 'home': renderHome(); break;
    case 'works': renderWorks(); break;
    case 'characters': renderCharacters(); break;
    case 'scenes': renderScenes(); break;
    case 'rag': renderRag(); break;
    case 'topics': renderTopics(); break;
    case 'profile': renderProfile(); break;
    case 'fed': renderFed(); break;
  }
}

async function renderHome(): Promise<void> {
  if (!mainContent) return;
  // FL statusは公開エンドポイントから取得、他はcatch
  const flRes = await getFlApiStatus().catch(() => ({ fl_server_url: 'offline', fl_token_required: true }));
  const charRes = await getPublicCharacters().catch(() => ({ characters: [] }));
  const userId = currentUser?.userId ?? '?';
  const username = currentUser?.username || currentUser?.name || 'ユーザー';
  mainContent.innerHTML = `
    <div class="home">
      <div class="home__welcome">
        <h2 class="home__title">こんにちは、${username}さん</h2>
        <div class="home__userid">ID: #${userId}</div>
      </div>
      <div class="home__stats">
        <div class="home__stat"><span class="home__stat-num">${charRes.characters.length}</span><span class="home__stat-label">公開キャラクター</span></div>
        <div class="home__stat"><span class="home__stat-num">${flRes.fl_server_url === 'offline' || flRes.fl_server_url === 'not-configured' ? '⚠' : '✓'}</span><span class="home__stat-label">FLサーバー</span></div>
      </div>
      <div class="home__chars">
        ${charRes.characters.slice(0, 6).map((c: Character) => `
          <div class="char-card" data-id="${c.id}">
            ${c.avatar_url ? `<img src="${c.avatar_url}" alt="${c.name}" class="char-card__avatar" />` : '<div class="char-card__avatar char-card__avatar--placeholder"></div>'}
            <p class="char-card__name">${c.name}</p>
            ${c.description ? `<p class="char-card__desc">${c.description.slice(0, 60)}</p>` : ''}
          </div>
        `).join('') || '<p class="home__empty">まだキャラクターがありません</p>'}
      </div>
    </div>`;
  mainContent.querySelectorAll('.char-card').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id;
      if (id) navigateToCharDetail(Number(id));
    });
  });
}

async function renderWorks(): Promise<void> {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="works">
      <h2 class="works__title">作品</h2>
      <div class="works__tabs">
        <button class="works__tab works__tab--active" data-tab="characters">キャラクター</button>
        <button class="works__tab" data-tab="scenes">プレース</button>
        <button class="works__tab" data-tab="rag">RAG</button>
      </div>
      <div id="worksContent"></div>
    </div>`;
  mainContent.querySelectorAll('.works__tab').forEach(btn => {
    btn.addEventListener('click', () => {
      mainContent!.querySelectorAll('.works__tab').forEach(b => b.classList.remove('works__tab--active'));
      btn.classList.add('works__tab--active');
      const tab = (btn as HTMLElement).dataset.tab;
      if (tab === 'characters') renderCharacters();
      else if (tab === 'scenes') renderScenes();
      else if (tab === 'rag') renderRag();
    });
  });
  renderCharacters();
}

async function renderCharacters(): Promise<void> {
  const container = document.getElementById('worksContent') || mainContent;
  if (!container) return;
  container.innerHTML = '<p class="main__loading">読み込み中…</p>';
  try {
    const { characters } = await getCharacters();
    container.innerHTML = `
      <div class="char-list">
        <button class="btn-new" id="btnNewChar">+ 新規キャラクター</button>
        ${characters.map((c: Character) => `
          <div class="char-item" data-id="${c.id}">
            ${c.avatar_url ? `<img src="${c.avatar_url}" class="char-item__avatar" />` : '<div class="char-item__avatar char-item__avatar--placeholder"></div>'}
            <div class="char-item__info">
              <p class="char-item__name">${c.name}</p>
              <p class="char-item__desc">${c.description?.slice(0, 80) || ''}</p>
              <div class="char-item__tags">${c.tags || ''}</div>
            </div>
            <div class="char-item__actions">
              <button class="btn-icon" data-action="edit" data-id="${c.id}">✏</button>
              <button class="btn-icon btn-icon--danger" data-action="delete" data-id="${c.id}">🗑</button>
            </div>
          </div>
        `).join('') || '<p class="main__empty">キャラクターがありません。「+ 新規キャラクター」から作成できます</p>'}
      </div>`;
    document.getElementById('btnNewChar')?.addEventListener('click', () => showCharEditor());
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const el = btn as HTMLElement;
        const id = Number(el.dataset.id);
        if (el.dataset.action === 'edit') navigateToCharDetail(id);
        else if (el.dataset.action === 'delete') {
          if (confirm('削除しますか？')) { await deleteCharacter(id); renderCharacters(); }
        }
      });
    });
  } catch (e) { container.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

function showCharEditor(char?: Character): void {
  if (!mainContent) return;
  const isEdit = !!char;
  mainContent.innerHTML = `
    <div class="editor">
      <h2 class="editor__title">${isEdit ? 'キャラクター編集' : '新規キャラクター'}</h2>
      <div class="editor__form">
        <label class="editor__field"><span>名前</span><input type="text" id="charName" value="${char?.name || ''}" /></label>
        <label class="editor__field"><span>アバターURL</span><input type="text" id="charAvatar" value="${char?.avatar_url || ''}" /></label>
        <label class="editor__field"><span>説明</span><textarea id="charDesc" rows="3">${char?.description || ''}</textarea></label>
        <label class="editor__field"><span>性格</span><textarea id="charPersonality" rows="4">${char?.personality || ''}</textarea></label>
        <label class="editor__field"><span>システムプロンプト</span><textarea id="charSystemPrompt" rows="5">${char?.system_prompt || ''}</textarea></label>
        <label class="editor__field"><span>挨拶</span><textarea id="charGreeting" rows="3">${char?.greeting || ''}</textarea></label>
        <label class="editor__field"><span>タグ (カンマ区切り)</span><input type="text" id="charTags" value="${char?.tags || ''}" /></label>
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="charPublic" ${char?.is_public ? 'checked' : ''} />
          <span>公開する</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="charCancel">キャンセル</button>
          <button class="btn-primary" id="charSave">保存</button>
        </div>
      </div>
    </div>`;
  document.getElementById('charCancel')?.addEventListener('click', () => renderCharacters());
  document.getElementById('charSave')?.addEventListener('click', async () => {
    const data: Partial<Character> = {
      name: (document.getElementById('charName') as HTMLInputElement).value,
      avatar_url: (document.getElementById('charAvatar') as HTMLInputElement).value || null,
      description: (document.getElementById('charDesc') as HTMLTextAreaElement).value || null,
      personality: (document.getElementById('charPersonality') as HTMLTextAreaElement).value || null,
      system_prompt: (document.getElementById('charSystemPrompt') as HTMLTextAreaElement).value || null,
      greeting: (document.getElementById('charGreeting') as HTMLTextAreaElement).value || null,
      tags: (document.getElementById('charTags') as HTMLInputElement).value || null,
      is_public: (document.getElementById('charPublic') as HTMLInputElement).checked ? 1 as any : 0,
    };
    try {
      if (char?.id) await updateCharacter(char.id, data);
      else await createCharacter(data);
      renderCharacters();
    } catch (e) { showError(`保存エラー: ${e}`); }
  });
}

async function navigateToCharDetail(id: number): Promise<void> {
  try {
    const { character } = await getCharacter(id);
    showCharEditor(character);
  } catch (e) { showError(`取得エラー: ${e}`); }
}

async function renderScenes(): Promise<void> {
  const container = document.getElementById('worksContent') || mainContent;
  if (!container) return;
  container.innerHTML = '<p class="main__loading">読み込み中…</p>';
  try {
    const { scenes } = await getScenes();
    container.innerHTML = `
      <div class="scene-list">
        <button class="btn-new" id="btnNewScene">+ 新規シーン</button>
        ${scenes.map((s: Scene) => `
          <div class="scene-item" data-id="${s.id}">
            <div class="scene-item__info">
              <p class="scene-item__name">${s.name}</p>
              <p class="scene-item__setting">${s.setting?.slice(0, 80) || ''}</p>
              ${s.mood ? `<span class="scene-item__mood">${s.mood}</span>` : ''}
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-scene" data-id="${s.id}">🗑</button>
          </div>
        `).join('') || '<p class="main__empty">シーンがありません</p>'}
      </div>`;
    document.getElementById('btnNewScene')?.addEventListener('click', () => showSceneEditor());
    container.querySelectorAll('[data-action="delete-scene"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number((btn as HTMLElement).dataset.id);
        if (confirm('削除しますか？')) { await deleteScene(id); renderScenes(); }
      });
    });
  } catch (e) { container.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

function showSceneEditor(): void {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="editor">
      <h2 class="editor__title">新規シーン</h2>
      <div class="editor__form">
        <label class="editor__field"><span>名前</span><input type="text" id="sceneName" /></label>
        <label class="editor__field"><span>設定 (Setting)</span><textarea id="sceneSetting" rows="3"></textarea></label>
        <label class="editor__field"><span>コンテキスト</span><textarea id="sceneContext" rows="5"></textarea></label>
        <label class="editor__field"><span>ムード</span><input type="text" id="sceneMood" /></label>
        <label class="editor__field editor__field--row">
          <input type="checkbox" id="scenePublic" />
          <span>公開する</span>
        </label>
        <div class="editor__actions">
          <button class="btn-secondary" id="sceneCancel">キャンセル</button>
          <button class="btn-primary" id="sceneSave">保存</button>
        </div>
      </div>
    </div>`;
  document.getElementById('sceneCancel')?.addEventListener('click', () => renderScenes());
  document.getElementById('sceneSave')?.addEventListener('click', async () => {
    try {
      await createScene({
        name: (document.getElementById('sceneName') as HTMLInputElement).value,
        setting: (document.getElementById('sceneSetting') as HTMLTextAreaElement).value,
        context: (document.getElementById('sceneContext') as HTMLTextAreaElement).value,
        mood: (document.getElementById('sceneMood') as HTMLInputElement).value,
        is_public: (document.getElementById('scenePublic') as HTMLInputElement).checked ? 1 as any : 0,
      });
      renderScenes();
    } catch (e) { showError(`保存エラー: ${e}`); }
  });
}

async function renderRag(): Promise<void> {
  const container = document.getElementById('worksContent') || mainContent;
  if (!container) return;
  container.innerHTML = '<p class="main__loading">読み込み中…</p>';
  try {
    const { documents } = await getRagDocs();
    container.innerHTML = `
      <div class="rag-list">
        <button class="btn-new" id="btnNewRag">+ 新規ドキュメント</button>
        <button class="btn-new btn-new--secondary" id="btnBulkRag">一括インポート (JSON)</button>
        ${documents.map((d: RagDocument) => `
          <div class="rag-item" data-id="${d.id}">
            <div class="rag-item__info">
              <p class="rag-item__title">${d.title}</p>
              <p class="rag-item__source">${d.source || ''}</p>
            </div>
            <button class="btn-icon btn-icon--danger" data-action="delete-rag" data-id="${d.id}">🗑</button>
          </div>
        `).join('') || '<p class="main__empty">RAGドキュメントがありません</p>'}
      </div>`;
    document.getElementById('btnNewRag')?.addEventListener('click', () => showRagEditor());
    document.getElementById('btnBulkRag')?.addEventListener('click', () => showBulkRagImport());
    container.querySelectorAll('[data-action="delete-rag"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number((btn as HTMLElement).dataset.id);
        if (confirm('削除しますか？')) { await deleteRagDoc(id); renderRag(); }
      });
    });
  } catch (e) { container.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

function showRagEditor(): void {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="editor">
      <h2 class="editor__title">新規RAGドキュメント</h2>
      <div class="editor__form">
        <label class="editor__field"><span>タイトル</span><input type="text" id="ragTitle" /></label>
        <label class="editor__field"><span>ソース</span><input type="text" id="ragSource" /></label>
        <label class="editor__field"><span>内容</span><textarea id="ragContent" rows="10"></textarea></label>
        <div class="editor__actions">
          <button class="btn-secondary" id="ragCancel">キャンセル</button>
          <button class="btn-primary" id="ragSave">保存</button>
        </div>
      </div>
    </div>`;
  document.getElementById('ragCancel')?.addEventListener('click', () => renderRag());
  document.getElementById('ragSave')?.addEventListener('click', async () => {
    try {
      await createRagDoc({
        title: (document.getElementById('ragTitle') as HTMLInputElement).value,
        source: (document.getElementById('ragSource') as HTMLInputElement).value,
        content: (document.getElementById('ragContent') as HTMLTextAreaElement).value,
      });
      renderRag();
    } catch (e) { showError(`保存エラー: ${e}`); }
  });
}

function showBulkRagImport(): void {
  if (!mainContent) return;
  mainContent.innerHTML = `
    <div class="editor">
      <h2 class="editor__title">RAG一括インポート</h2>
      <p class="editor__hint">JSON配列を貼り付けてください。最大500件/回</p>
      <div class="editor__form">
        <label class="editor__field"><span>JSON</span><textarea id="bulkRagJson" rows="15" placeholder='[{"title":"例","content":"内容","source":"出典"}]'></textarea></label>
        <div class="editor__actions">
          <button class="btn-secondary" id="bulkRagCancel">キャンセル</button>
          <button class="btn-primary" id="bulkRagImport">インポート</button>
        </div>
      </div>
    </div>`;
  document.getElementById('bulkRagCancel')?.addEventListener('click', () => renderRag());
  document.getElementById('bulkRagImport')?.addEventListener('click', async () => {
    try {
      const json = (document.getElementById('bulkRagJson') as HTMLTextAreaElement).value;
      const docs = JSON.parse(json);
      const result = await bulkImportRag(docs);
      alert(`${result.imported}件インポート完了`);
      renderRag();
    } catch (e) { showError(`インポートエラー: ${e}`); }
  });
}

async function renderTopics(): Promise<void> {
  if (!mainContent) return;
  mainContent.innerHTML = '<p class="main__loading">読み込み中…</p>';
  try {
    const { characters } = await getPublicCharacters();
    mainContent.innerHTML = `
      <div class="topics">
        <h2 class="topics__title">トピック</h2>
        <p class="topics__desc">人気のキャラクター</p>
        <div class="topics__grid">
          ${characters.map((c: Character, i: number) => `
            <div class="topic-card" data-id="${c.id}">
              <div class="topic-card__rank">#${i + 1}</div>
              ${c.avatar_url ? `<img src="${c.avatar_url}" class="topic-card__avatar" />` : '<div class="topic-card__avatar topic-card__avatar--placeholder"></div>'}
              <p class="topic-card__name">${c.name}</p>
              <p class="topic-card__desc">${c.description?.slice(0, 50) || ''}</p>
            </div>
          `).join('') || '<p class="main__empty">まだトピックがありません</p>'}
        </div>
      </div>`;
    mainContent.querySelectorAll('.topic-card').forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.id;
        if (id) navigateToCharDetail(Number(id));
      });
    });
  } catch (e) { mainContent.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

async function renderProfile(): Promise<void> {
  if (!mainContent) return;
  mainContent.innerHTML = '<p class="main__loading">読み込み中…</p>';
  try {
    const { user } = await getUser();
    mainContent.innerHTML = `
      <div class="profile">
        <h2 class="profile__title">プロフィール</h2>
        <div class="profile__card">
          ${user.avatar_url ? `<img src="${user.avatar_url}" class="profile__avatar" />` : '<div class="profile__avatar profile__avatar--placeholder"></div>'}
          <div class="profile__info">
            <p class="profile__name">${user.username || user.name}</p>
            <p class="profile__email">${user.email}</p>
            <p class="profile__userid">ID: #${user.id}</p>
            ${user.birth_date ? `<p class="profile__since">生年月日: ${user.birth_date}</p>` : ''}
            ${user.fl_consent ? '<p class="profile__fl">分散学習: 協力中</p>' : '<p class="profile__fl">分散学習: 未協力</p>'}
            <p class="profile__since">登録日: ${user.created_at?.slice(0, 10) || ''}</p>
          </div>
          <div class="profile__actions">
            <button class="btn-secondary" id="signoutBtn">ログアウト</button>
          </div>
          <div class="profile__danger">
            <button class="btn-danger" id="deleteAccountBtn">アカウントを削除</button>
          </div>
        </div>
      </div>`;
  } catch (e) { mainContent.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

document.getElementById('signoutBtn')?.addEventListener('click', () => {
  clearStoredAuth();
  currentUser = null;
  updateAuthUI();
});

document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
  if (!confirm('本当にアカウントを削除しますか？\n\n・チャット履歴\n・キャラクター\n・シーン\n・RAGドキュメント\n・ユーザーアカウント\n\nこれらは全て完全に削除され、復元できません。')) return;
  if (!confirm('最終確認：本当に削除しますか？')) return;
  try {
    await deleteAccount();
    clearStoredAuth();
    clearApiToken();
    currentUser = null;
    alert('アカウントが削除されました。');
    updateAuthUI();
  } catch (e) {
    alert('削除に失敗しました: ' + e);
  }
});

function showError(msg: string): void {
  if (mainContent) {
    const errDiv = document.createElement('div');
    errDiv.className = 'error-banner';
    errDiv.textContent = msg;
    mainContent.prepend(errDiv);
    setTimeout(() => errDiv.remove(), 5000);
  }
}



updateAuthUI();

// FLクライアント初期化
initFlClient();

// ===== 全ページ共通: FL自動接続 =====
// fl_consentがtrueなら、どのページを開いてもFLサーバーに自動接続する
let flAutoConnectTried = false;
async function tryAutoConnectFl(): Promise<void> {
  if (flAutoConnectTried) return;
  const s = getFlStatus();
  if (s.connected || s.connecting) return;

  const flRes = await getFlApiStatus().catch(() => null);
  if (!flRes || !flRes.fl_server_url || flRes.fl_server_url === 'not-configured' || flRes.fl_server_url === 'offline') return;
  if (!flRes.fl_auth_token) return;

  flAutoConnectTried = true;
  connectFl({ serverUrl: flRes.fl_server_url, authToken: flRes.fl_auth_token });
}

// ログイン済みでfl_consent=trueなら自動接続（5秒ごとにリトライ、サーバー起動前でもOK）
if (isLoggedIn()) {
  navigateTo('home');
  const user = getStoredAuth();
  if (user?.fl_consent) {
    tryAutoConnectFl();
    // サーバーがまだ起動してない場合に備えてリトライ
    setInterval(() => {
      const s = getFlStatus();
      if (!s.connected && !s.connecting) {
        flAutoConnectTried = false;
        tryAutoConnectFl();
      }
    }, 15000);
  }
}
