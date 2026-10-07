/* =========================
       pack LIST
    ========================= */

    const cfg = window.ATENEY_CONFIG || {};
    const API_URL = (cfg.API_BASE || "") + "/api/pack";
    const container = document.getElementById("pack-list");

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

    function createCard(pack, index) {
      const card = document.createElement("div");
      card.className = "pack-card";
      card.style.setProperty("--card-index", index);

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";

      if (pack.avatar_url) {
        const img = document.createElement("img");
        img.alt = pack.name || "pack";
        img.loading = "lazy";
        img.src = pack.avatar_url;

        img.addEventListener("error", () => {
          imgWrap.innerHTML = "";
          const fb = document.createElement("div");
          fb.className = "card-image-fallback";
          setText(fb, (pack.name || "?").charAt(0));
          imgWrap.appendChild(fb);
        });

        imgWrap.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "card-image-fallback";
        setText(fb, (pack.name || "?").charAt(0));
        imgWrap.appendChild(fb);
      }

      const info = document.createElement("div");
      info.className = "pack-info";

      const name = document.createElement("h3");
      setText(name, pack.name);
      info.appendChild(name);

      if (pack.description) {
        const desc = document.createElement("p");
        setText(desc, pack.description);
        info.appendChild(desc);
      }

      card.appendChild(imgWrap);
      card.appendChild(info);
      return card;
    }

    async function loadpacks() {
      showSkeletons(4);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const packs = data.packs || data.scenes || data || [];

        if (!Array.isArray(packs) || packs.length === 0) {
          showState("🌙", "まだパックがありません。たぶんメンテ中です");
          return;
        }

        container.innerHTML = "";
        packs.forEach((char, i) => {
          container.appendChild(createCard(char, i));
        });

      } catch (err) {
        console.error("Failed to load packs:", err);
        showState("⚠️", "パックを読み込めませんでした");
      }
    }

    loadpacks();
