/* =========================
       DARK MODE
    ========================= */
    const darkmodeButton = document.getElementById("darkmodeButton");
    function applyDarkMode(on) {
      document.body.classList.toggle("dark", on);
      darkmodeButton.classList.toggle("active", on);
    }
    try {
      const saved = localStorage.getItem("ateney-dark");
      if (saved === "1") applyDarkMode(true);
    } catch (e) {}
    darkmodeButton.addEventListener("click", () => {
      const isDark = !document.body.classList.contains("dark");
      applyDarkMode(isDark);
      try { localStorage.setItem("ateney-dark", isDark ? "1" : "0"); } catch (e) {}
    });

    /* =========================
       LOGO WAVE
    ========================= */
    const logo = document.getElementById("logo");
    logo.addEventListener("mouseenter", () => {
      logo.querySelectorAll("span").forEach(s => {
        s.style.animation = "none";
        void s.offsetWidth;
        s.style.animation = "";
      });
    });

    /* =========================
       DEBUG LOGGER（パネル + console両方に出す）
    ========================= */
    const debugEl = document.getElementById("debug");
    function log(msg, type = "") {
      // const div = document.createElement("div");
      // if (type) div.className = type;
      // div.textContent = msg;
      // debugEl.appendChild(div);
      // debugEl.scrollTop = debugEl.scrollHeight;

      const prefix = "[ateney]";
      if (type === "err") console.error(prefix, msg);
      else if (type === "ok") console.log(`%c${prefix} ${msg}`, "color:#06C755");
      else if (type === "info") console.info(prefix, msg);
      else console.log(prefix, msg);
    }

    /* =========================
       CONFIG CHECK
    ========================= */
    const cfg = window.ATENEY_CONFIG || {};
    const hasGoogle = cfg.GOOGLE_CLIENT_ID && cfg.GOOGLE_CLIENT_ID !== "";
    const hasLine   = cfg.LINE_CHANNEL_ID && cfg.LINE_CHANNEL_ID !== "";
    const hasmicrosoft = cfg.MICROSOFT_CLIENT_ID && cfg.MICROSOFT_CLIENT_ID !== "";
    const hasyahoo = cfg.YAHOO_CLIENT_ID && cfg.YAHOO_CLIENT_ID !== "";
    const hasApple  = cfg.APPLE_CLIENT_ID && cfg.APPLE_CLIENT_ID !== "";
    const redirectBase = cfg.REDIRECT_BASE || window.location.origin;

    /* =========================
       未設定プロバイダのボタンは非表示 (Issue #2)
       CLIENT_ID が無いプロバイダのボタンは「押しても反応しない」状態で
       表示されるより隠すほうが正直。
    ========================= */
    const providerButtons = [
      ["google-login", hasGoogle],
      ["line-login", hasLine],
      ["yahoo-login", hasyahoo],
      ["microsoft-login", hasmicrosoft],
      ["apple-login", hasApple],
    ];
    providerButtons.forEach(([id, ok]) => {
      const btn = document.getElementById(id);
      if (btn && !ok) btn.style.display = "none";
    });

    /* =========================
       共通ユーティリティ
    ========================= */
    function generateState() {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
    }

    async function generatePKCE() {
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      const verifier = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");

      const encoder = new TextEncoder();
      const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
      const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

      return { verifier, challenge };
    }

    /* =========================
       GOOGLE OAUTH（Authorization Code + フルリダイレクト方式）
       ---------------------------------------------------------------
       以前はinitTokenClient()のポップアップ方式だったが、拡張機能/
       サードパーティCookie制限でブロックされる環境があったため、
       LINE/Appleと同じフルリダイレクト方式に統一。
       これによりGISのSDK自体が不要になった。
    ========================= */
    document.getElementById("google-login").addEventListener("click", function () {
      if (!hasGoogle) {
        log("あれ？なんか開発者さんがミスしてるっぽい。", "err");
        return;
      }

      this.classList.add("loading");

      const state = generateState();
      sessionStorage.setItem("google-state", state);

      const redirectUri = `${redirectBase}/callback.html`;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: cfg.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        state: state,
        scope: "openid email profile",
        access_type: "online",
        prompt: "select_account",
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    });

    /* =========================
       LINE OAUTH (Authorization Code + PKCE)
    ========================= */
    document.getElementById("line-login").addEventListener("click", async function() {
      if (!hasLine) {
        log("あれ？なんか開発者さんがミスしてるっぽい。", "err");
        return;
      }

      this.classList.add("loading");

      const state = generateState();
      const { verifier, challenge } = await generatePKCE();

      // PKCE verifierをsessionStorageに保存（コールバックで使う）
      sessionStorage.setItem("line-verifier", verifier);
      sessionStorage.setItem("line-state", state);

      const redirectUri = `${redirectBase}/callback.html`;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: cfg.LINE_CHANNEL_ID,
        redirect_uri: redirectUri,
        state: state,
        scope: "profile openid email",
        code_challenge: challenge,
        code_challenge_method: "S256",
      });
      window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params}`;
    });
    /* =========================
       Microsoft oauth
    ==========================*/
    document.getElementById("microsoft-login").addEventListener("click", async function () {
      this.classList.add("loading");
    
      try {
        const state = generateState();
        const { verifier, challenge } = await generatePKCE();
      
        // PKCE verifier / stateをコールバックで使用
        sessionStorage.setItem("microsoft-verifier", verifier);
        sessionStorage.setItem("microsoft-state", state);
      
        const redirectUri = `${redirectBase}/callback.html`;
      
        const params = new URLSearchParams({
          client_id: cfg.MICROSOFT_CLIENT_ID,
          response_type: "code",
          redirect_uri: redirectUri,
          response_mode: "query",
          scope: "openid profile email",
          state: state,
          code_challenge: challenge,
          code_challenge_method: "S256",
        });
      
        window.location.href =
          `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
      
      } catch (err) {
        console.error("Microsoft OAuth error:", err);
        log(`Microsoft: ${err.message}`, "err");
        this.classList.remove("loading");
      }
    });
    document.getElementById("yahoo-login").addEventListener("click", async function () {
      this.classList.add("loading");

      try {
        const state = generateState();
        const { verifier, challenge } = await generatePKCE();
      
        // PKCE verifier / stateをコールバックで使用
        sessionStorage.setItem("yahoo-verifier", verifier);
        sessionStorage.setItem("yahoo-state", state);
      
        const redirectUri = `${redirectBase}/callback.html`;
      
        const params = new URLSearchParams({
          client_id: cfg.YAHOO_CLIENT_ID,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "openid",
          state: state,
          code_challenge: challenge,
          code_challenge_method: "S256",
        });
      
        window.location.href =
          `https://auth.login.yahoo.co.jp/yconnect/v2/authorization?${params}`;
      
      } catch (err) {
        console.error("Yahoo! OAuth error:", err);
        log(`Yahoo!: ${err.message}`, "err");
        this.classList.remove("loading");
      }
    });

    /* =========================
       APPLE OAUTH (Sign in with Apple JS)
    ========================= */
    document.getElementById("apple-login").addEventListener("click", async function() {
      if (!hasApple) {
        log("あれ？なんか開発者さんがミスしてるっぽい。", "err");
        return;
      }

      this.classList.add("loading");

      const state = generateState();
      sessionStorage.setItem("apple-state", state);

      const redirectUri = `${redirectBase}/callback.html`;

      // Issue #2: response_mode: form_post は Apple が POST で code を投げる方式だが、
      // GitHub Pages (静的ホスティング) は POST を 405 で弾くため構造的に動かない。
      // 他プロバイダと同じ query 方式で受ける（query は response_type=code のみ対応）。
      const params = new URLSearchParams({
        client_id: cfg.APPLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "name email",
        response_mode: "query",
        state: state,
      });

      window.location.href = `https://appleid.apple.com/auth/authorize?${params}`;
    });
