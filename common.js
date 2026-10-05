/**
 * common.js — ateney 共通シェル (Issue #9)
 * ヘッダー / オーバーレイ / スライドメニュー / アカウントUI / テーマ切替 /
 * 通知バッジTODOを、全ページ分からここに集約した。
 *
 * 使い方: 各ページの <body> 直後に src="/common.js" の script タグを置く
 * (同期実行で描画前に注入するため、ちらつきが無い)。
 * ページ固有JSは必ずこの後に読み込むこと。
 */
(function () {
  "use strict";

  const SHELL_HTML = `


  <!-- HEADER -->
  <header class="header">
    <h1 class="logo" id="logo">
      <span>a</span><span>t</span><span>e</span><span>n</span><span>e</span><span>y</span>
    </h1>

    <!-- ACCOUNT -->
    <div class="account" id="account">
      <button class="account-btn" id="accountButton" aria-label="アカウント">
        <svg id="accountAvatar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
        </svg>
      </button>

      <a href="/login/" class="login-pill" id="loginPill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span class="login-pill-text">ログイン</span>
      </a>

      <!-- DROPDOWN -->
      <div class="account-menu" id="accountMenu">
        <!-- 動的に生成 -->
      </div>
    </div>

    <div class="header-actions">
      <button class="icon-btn darkmode" id="darkmodeButton" aria-label="ダークモード切替">
        <div class="toggle-track">
          <div class="rays">
            <span style="--i: 0"></span><span style="--i: 1"></span>
            <span style="--i: 2"></span><span style="--i: 3"></span>
            <span style="--i: 4"></span><span style="--i: 5"></span>
            <span style="--i: 6"></span><span style="--i: 7"></span>
          </div>
          <div class="sun-core"></div>
          <div class="moon-cover"></div>
        </div>
      </button>

      <button class="icon-btn menu-button" id="menuButton" aria-label="メニュー">
        <div class="bars"><span></span><span></span><span></span></div>
      </button>
    </div>
  </header>

  <div class="overlay" id="overlay"></div>

  <!-- SLIDE MENU -->
  <nav class="menu" id="menu">
    <a href="/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
      Home
    </a>
    <a href="/characters/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
      Characters
    </a>
    <a href="/scene/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="5.5" r="2.5"/>
        <path d="M2 16c1.2 0 1.2-1.2 2.4-1.2S5.6 16 6.8 16 8 14.8 9.2 14.8 10.4 16 11.6 16s1.2-1.2 2.4-1.2S15.2 16 16.4 16s1.2-1.2 2.4-1.2S20 16 21.2 16"/>
        <path d="M2 21c1.2 0 1.2-1.2 2.4-1.2S5.6 21 6.8 21 8 19.8 9.2 19.8 10.4 21 11.6 21s1.2-1.2 2.4-1.2S15.2 21 16.4 21s1.2-1.2 2.4-1.2S20 21 21.2 21"/>
      </svg>
      Scene
    </a>
    <a href="/rag/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="1"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <path d="M6 12V6"/>
        <path d="M9 12V4.5"/>
        <path d="M12 12V7"/>
        <path d="M15 12V5.5"/>
        <path d="M18 12V8"/>
        <path d="M6 21v-6"/>
        <path d="M9 21v-4.5"/>
        <path d="M12 21v-7"/>
        <rect x="15" y="17" width="5" height="2.5" rx="0.5"/>
      </svg>
      RAG
    </a>
    <a href="/pack/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"/>
        <path d="M3.3 7.3 12 12l8.7-4.7"/>
        <path d="M12 22V12"/>
      </svg>
      Pack
    </a>
    <a href="/create/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/>
        <path d="m18 15 4-4"/>
        <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
      </svg>
      Create
    </a>
    <a href="/library/">
      <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      Library
    </a>
  </nav>

  <!-- MAIN CONTENT -->
`;

  // <body> 直後の同期実行前提: 本文が描画される前にシェルを注入する
  document.body.insertAdjacentHTML("afterbegin", SHELL_HTML);
    /* =========================
       HAMBURGER + OVERLAY
    ========================= */
    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");
    const overlay = document.getElementById("overlay");

    function toggleMenu(force) {
      const open = force !== undefined ? force : !menu.classList.contains("open");
      menuButton.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
    }

    menuButton.addEventListener("click", () => toggleMenu());
    overlay.addEventListener("click", () => toggleMenu(false));

    /* =========================
       AUTH CHECK + ACCOUNT DROPDOWN
    ========================= */
    const accountButton = document.getElementById("accountButton");
    const accountMenu = document.getElementById("accountMenu");

    // --- Auth state ---
    function getAuthUser() {
      try {
        const raw = localStorage.getItem("ateney-user");
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      // Also check for just a token
      if (localStorage.getItem("ateney-token")) {
        return { name: "ユーザー", id: "ログイン中" };
      }
      return null;
    }

    const authUser = getAuthUser();
    const loginPill = document.getElementById("loginPill");

    // --- Hide login pill if logged in ---
    if (authUser) {
      loginPill.style.display = "none";
    }

    // --- Build account menu based on auth state ---
    function buildAccountMenu() {
      if (authUser) {
        // Logged in
        // ユーザー名・IDは信頼できない値のため、innerHTMLではなくtextContentで挿入する（XSS対策）。
        // 静的なメニュー構造のみinnerHTMLで組み立て、動的値は後から個別にセットする。
        accountMenu.innerHTML = `
          <div class="account-menu-header">
            <div class="avatar-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <div class="user-name" id="menuUserName"></div>
              <div class="user-id" id="menuUserId"></div>
            </div>
          </div>
          <!-- Issue #1: 未実装ページ (/profile/ /notifications/ /account-settings/ /help/) への
               リンクは404になるため、ページができるまで出さない。
               logout は中クリック/新規タブで /logout/ の404に落ちないよう button 化。 -->
          <button type="button" class="logout" id="logoutBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            ログアウト
          </button>
        `;

        // 動的値はtextContentで安全に挿入（HTMLとして解釈されない）
        document.getElementById("menuUserName").textContent = authUser.name || "ユーザー";
        document.getElementById("menuUserId").textContent = authUser.id || "";

        // 通知バッジ: 未実装のため常時「3」を表示していた（ダミー値）。
        // 実データ連携までは非表示にする。
        // TODO: 実際の未読通知数をAPIから取得してここに反映する。

        // Logout handler — clear auth and redirect
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("ateney-user");
            localStorage.removeItem("ateney-token");
            window.location.href = "/login/";
          });
        }
      } else {
        // Not logged in — show login button instead of logout
        accountMenu.innerHTML = `
          <div class="account-menu-header">
            <div class="avatar-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <div class="user-name">ゲスト</div>
              <div class="user-id">未ログイン</div>
            </div>
          </div>
          <a href="/login/" class="login-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            ログイン
          </a>
        `;
      }
    }

    buildAccountMenu();

    // --- Dropdown toggle ---
    function toggleAccount(force) {
      const open = force !== undefined ? force : !accountMenu.classList.contains("open");
      accountMenu.classList.toggle("open", open);
    }

    accountButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleAccount();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!accountMenu.contains(e.target) && e.target !== accountButton) {
        toggleAccount(false);
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleAccount(false);
        toggleMenu(false);
      }
    });

    /* =========================
       RIPPLE EFFECT
    ========================= */
    document.querySelectorAll(".icon-btn").forEach(btn => {
      btn.addEventListener("pointerdown", (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.left = (e.clientX - rect.left) + "px";
        ripple.style.top = (e.clientY - rect.top) + "px";
        ripple.style.width = "60px";
        ripple.style.height = "60px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });

    /* =========================
       DARK MODE (circular reveal + persistence)
    ========================= */
    const darkmodeButton = document.getElementById("darkmodeButton");

    function applyDarkMode(on) {
      document.body.classList.toggle("dark", on);
      darkmodeButton.classList.toggle("active", on);
    }

    function toggleDarkMode() {
      const isDark = !document.body.classList.contains("dark");
      const rect = darkmodeButton.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          applyDarkMode(isDark);
        });
        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0% at ${cx}px ${cy}px)`,
                `circle(150% at ${cx}px ${cy}px)`
              ]
            },
            {
              duration: 500,
              easing: "cubic-bezier(0.4, 0, 0.2, 1)",
              pseudoElement: "::view-transition-new(root)"
            }
          );
        });
      } else {
        applyDarkMode(isDark);
      }

      try { localStorage.setItem("ateney-dark", isDark ? "1" : "0"); } catch (e) {}
    }

    try {
      const saved = localStorage.getItem("ateney-dark");
      if (saved === "1") applyDarkMode(true);
    } catch (e) {}

    darkmodeButton.addEventListener("click", toggleDarkMode);

    /* =========================
       LOGO: re-trigger animation
    ========================= */
    const logo = document.getElementById("logo");
    logo.addEventListener("mouseenter", () => {
      logo.querySelectorAll("span").forEach(s => {
        s.style.animation = "none";
        void s.offsetWidth;
        s.style.animation = "";
      });
    });
})();
