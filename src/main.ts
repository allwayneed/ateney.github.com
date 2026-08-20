/**
 * ateney - メインエントリーポイント v0.2.0
 * Cloudflare Workers API接続済み
 */

import {
  authLogin, getApiToken, clearApiToken,
  getCharacters, getPublicCharacters, getCharacter,
  createCharacter, updateCharacter, deleteCharacter,
  getScenes, createScene, updateScene, deleteScene,
  getRagDocs, createRagDoc, deleteRagDoc, bulkImportRag,
  getChatHistory, saveChat, clearChat,
  getUser, getFlStatus,
  type Character, type Scene, type RagDocument,
} from './api';
import {
  isLoggedIn, getStoredAuth, logout,
  initGoogleLogin, loginWithLine, loginWithApple,
  type AuthUser,
} from './auth';

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
    if (settingsName) settingsName.textContent = currentUser.name;
    if (settingsEmail) settingsEmail.textContent = currentUser.email ?? '';
    if (settingsAvatar && currentUser.avatar) {
      settingsAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
    }
    navigateTo('home');
  } else {
    loginScreen?.classList.remove('hidden');
    if (accountIcon) accountIcon.style.display = 'none';
  }
}

initGoogleLogin('googleLoginBtn', (user) => {
  updateAuthUI();
}, (msg) => { showError(msg); });

document.getElementById('lineLoginBtn')?.addEventListener('click', () => loginWithLine());
document.getElementById('appleLoginBtn')?.addEventListener('click', () => loginWithApple());

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  logout(); currentUser = null; updateAuthUI(); closeSettings();
});

window.addEventListener('ateney:unauthorized', () => {
  logout(); updateAuthUI();
});

// ===== ハンバーガー =====
const hamburger = document.getElementById('hamburger') as HTMLButtonElement | null;
const sideMenu = document.getElementById('sideMenu') as HTMLElement | null;
const overlay = document.getElementById('overlay') as HTMLElement | null;

function toggleMenu(): void { sideMenu?.classList.contains('open') ? closeMenu() : openMenu(); }
function openMenu(): void {
  sideMenu?.classList.add('open'); overlay?.classList.add('show');
  hamburger?.classList.add('open'); hamburger?.setAttribute('aria-expanded', 'true');
}
function closeMenu(): void {
  sideMenu?.classList.remove('open'); overlay?.classList.remove('show');
  hamburger?.classList.remove('open'); hamburger?.setAttribute('aria-expanded', 'false');
}

hamburger?.addEventListener('click', toggleMenu);
overlay?.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeSettings(); } });

// ===== 設定 =====
const settings = document.getElementById('settings') as HTMLElement | null;
const settingsBack = document.getElementById('settingsBack') as HTMLButtonElement | null;

function openSettings(): void { settings?.classList.add('open'); closeMenu(); }
function closeSettings(): void { settings?.classList.remove('open'); }

accountIcon?.addEventListener('click', openSettings);
settingsBack?.addEventListener('click', closeSettings);
document.getElementById('menuSettings')?.addEventListener('click', (e) => { e.preventDefault(); openSettings(); });

// ===== ナビゲーション =====
type Page = 'home' | 'works' | 'characters' | 'scenes' | 'rag' | 'topics' | 'profile';

document.getElementById('menuHome')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('home'); });
document.getElementById('menuWorks')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('works'); });
document.getElementById('menuCharacters')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('characters'); });
document.getElementById('menuScenes')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('scenes'); });
document.getElementById('menuRag')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('rag'); });
document.getElementById('menuTopics')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('topics'); });
document.getElementById('menuProfile')?.addEventListener('click', (e: Event) => { e.preventDefault(); navigateTo('profile'); });

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
  }
}

async function renderHome(): Promise<void> {
  if (!mainContent) return;
  try {
    const [charRes, flRes] = await Promise.all([
      getPublicCharacters().catch(() => ({ characters: [] })),
      getFlStatus().catch(() => ({ fl_server_url: 'offline', fl_token_required: true })),
    ]);
    mainContent.innerHTML = `
      <div class="home">
        <h2 class="home__title">ateneyへようこそ</h2>
        <p class="home__desc">AIキャラクターと会話できるプラットフォーム</p>
        <div class="home__stats">
          <div class="home__stat"><span class="home__stat-num">${charRes.characters.length}</span><span class="home__stat-label">公開キャラクター</span></div>
          <div class="home__stat"><span class="home__stat-num">${flRes.fl_server_url === 'offline' ? '⚠' : '✓'}</span><span class="home__stat-label">FLサーバー</span></div>
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
  } catch (e) { mainContent.innerHTML = `<p class="main__loading">読み込みエラー: ${e}</p>`; }
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
      mainContent.querySelectorAll('.works__tab').forEach(b => b.classList.remove('works__tab--active'));
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
            <p class="profile__name">${user.name}</p>
            <p class="profile__email">${user.email}</p>
            <p class="profile__since">登録日: ${user.created_at?.slice(0, 10) || ''}</p>
          </div>
        </div>
      </div>`;
  } catch (e) { mainContent.innerHTML = `<p class="main__loading">エラー: ${e}</p>`; }
}

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
if (isLoggedIn()) navigateTo('home');
