/* =========================
       library LIST
    ========================= */

    // Issue #5: Worker側に /api/library が生えたら loadLibrarys() を有効化する
    const cfg = window.ATENEY_CONFIG || {};
    const API_URL = (cfg.API_BASE || "") + "/api/library";
    const container = document.getElementById("library-list");

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

    function createCard(library, index) {
      const card = document.createElement("div");
      card.className = "library-card";
      card.style.setProperty("--card-index", index);

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";

      if (library.avatar_url) {
        const img = document.createElement("img");
        img.alt = library.name || "library";
        img.loading = "lazy";
        img.src = library.avatar_url;

        img.addEventListener("error", () => {
          imgWrap.innerHTML = "";
          const fb = document.createElement("div");
          fb.className = "card-image-fallback";
          setText(fb, (library.name || "?").charAt(0));
          imgWrap.appendChild(fb);
        });

        imgWrap.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "card-image-fallback";
        setText(fb, (library.name || "?").charAt(0));
        imgWrap.appendChild(fb);
      }

      const info = document.createElement("div");
      info.className = "library-info";

      const name = document.createElement("h3");
      setText(name, library.name);
      info.appendChild(name);

      if (library.description) {
        const desc = document.createElement("p");
        setText(desc, library.description);
        info.appendChild(desc);
      }

      card.appendChild(imgWrap);
      card.appendChild(info);
      return card;
    }

    async function loadlibrarys() {
      showSkeletons(4);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const librarys = data.librarys || data.scenes || data || [];

        if (!Array.isArray(librarys) || librarys.length === 0) {
          showState("🌙", "まだパックがありません。たぶんメンテ中です");
          return;
        }

        container.innerHTML = "";
        librarys.forEach((char, i) => {
          container.appendChild(createCard(char, i));
        });

      } catch (err) {
        console.error("Failed to load librarys:", err);
        showState("⚠️", "パックを読み込めませんでした");
      }
    }

    // APIエンドポイントができたら loadLibrarys() を有効化
    showState("📚", "Library — 準備中");
