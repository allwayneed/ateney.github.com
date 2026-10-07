/* =========================
       rag LIST
    ========================= */

    const cfg = window.ATENEY_CONFIG || {};
    const API_URL = (cfg.API_BASE || "") + "/api/rag";
    const container = document.getElementById("rag-list");

    function showSkeletons(count = 4) {
      container.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const skel = document.createElement("div");
        skel.className = "skeleton-card";
        skel.innerHTML = `
          <div class="skel-img"></div>
          <div class="skel-body">
            <div class="skel-line"></div>
            <div class="skel-line short"></div>
          </div>
        `;
        container.appendChild(skel);
      }
    }

    function showState(emoji, message) {
      container.innerHTML = `
        <div class="state-msg">
          <span class="state-emoji">${emoji}</span>
          ${message}
        </div>
      `;
    }

    function setText(el, text) {
      el.textContent = text || "";
    }

    function createCard(rag, index) {
      const card = document.createElement("div");
      card.className = "rag-card";
      card.style.setProperty("--card-index", index);

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";

      if (rag.avatar_url) {
        const img = document.createElement("img");
        img.alt = rag.name || "rag";
        img.loading = "lazy";
        img.src = rag.avatar_url;

        img.addEventListener("error", () => {
          imgWrap.innerHTML = "";
          const fb = document.createElement("div");
          fb.className = "card-image-fallback";
          setText(fb, (rag.name || "?").charAt(0));
          imgWrap.appendChild(fb);
        });

        imgWrap.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "card-image-fallback";
        setText(fb, (rag.name || "?").charAt(0));
        imgWrap.appendChild(fb);
      }

      const info = document.createElement("div");
      info.className = "rag-info";

      const name = document.createElement("h3");
      setText(name, rag.name);
      info.appendChild(name);

      if (rag.description) {
        const desc = document.createElement("p");
        setText(desc, rag.description);
        info.appendChild(desc);
      }

      card.appendChild(imgWrap);
      card.appendChild(info);
      return card;
    }

    async function loadrags() {
      showSkeletons(4);

      // /api/rag は認証必須 (character/scene/packと違い非公開)。
      // auth.js の復号が終わってから、ヘッダー付きで取る。
      if (window.AteneyAuth && AteneyAuth.ready) {
        try { await AteneyAuth.ready; } catch (e) {}
      }

      try {
        const headers = window.AteneyAuth ? AteneyAuth.getAuthHeaders() : {};
        const response = await fetch(API_URL, { headers });

        if (response.status === 401) {
          // 未ログイン / 期限切れ → ログインへ誘導 (トークンが古ければ掃除しておく)
          if (window.AteneyAuth && !AteneyAuth.isLoggedIn()) {
            showState("🔐", 'RAGを見るには<a href="/login/" style="color:var(--accent);font-weight:600">ログイン</a>が必要です');
          } else {
            if (window.AteneyAuth) AteneyAuth.logout();
            showState("🔒", "ログインの期限が切れました。<a href='/login/' style='color:var(--accent);font-weight:600'>再ログイン</a>してください");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rags = data.rags || data.scenes || data || [];

        if (!Array.isArray(rags) || rags.length === 0) {
          showState("🌙", "まだRAGがありません。たぶんメンテ中です");
          return;
        }

        container.innerHTML = "";
        rags.forEach((char, i) => {
          container.appendChild(createCard(char, i));
        });

      } catch (err) {
        console.error("Failed to load rags:", err);
        showState("⚠️", "RAGを読み込めませんでした");
      }
    }

    loadrags();
