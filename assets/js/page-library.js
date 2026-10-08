/* =========================
       library — 道具箱 (Library本実装, 2026-10-08)
       GET /api/library → { items: [...], pagination }
       item: { item_id, item_type, name, avatar_url, description,
               tags, source: 'own'|'added', is_public, pack_only }
    ========================= */

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

    const TYPE_LABEL = { character: "キャラ", scene: "シーン", rag: "RAG", pack: "pack" };
    const TYPE_HREF = {
      character: (id) => "/character/" + encodeURIComponent(id) + "/",
      scene: (id) => "/scene/" + encodeURIComponent(id) + "/",
      rag: (id) => "/rag/" + encodeURIComponent(id) + "/",
      pack: (id) => "/pack/" + encodeURIComponent(id) + "/",
    };

    function createCard(item, index) {
      const id = item.item_id;
      const type = item.item_type || "character";
      const isAdded = item.source === "added";

      const card = document.createElement("div");
      card.className = "library-card";
      card.style.setProperty("--card-index", index);

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";

      if (item.avatar_url) {
        const img = document.createElement("img");
        img.alt = item.name || type;
        img.loading = "lazy";
        img.src = item.avatar_url;
        img.addEventListener("error", () => {
          imgWrap.innerHTML = "";
          const fb = document.createElement("div");
          fb.className = "card-image-fallback";
          setText(fb, (item.name || "?").charAt(0));
          imgWrap.appendChild(fb);
        });
        imgWrap.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "card-image-fallback";
        setText(fb, (item.name || "?").charAt(0));
        imgWrap.appendChild(fb);
      }

      // 種別バッジ
      const typeBadge = document.createElement("span");
      typeBadge.className = "library-type-badge" + (type === "pack" ? " is-pack" : "");
      typeBadge.textContent = TYPE_LABEL[type] || type;
      imgWrap.appendChild(typeBadge);

      const info = document.createElement("div");
      info.className = "library-info";

      const name = document.createElement("h3");
      setText(name, item.name);
      info.appendChild(name);

      if (item.description) {
        const desc = document.createElement("p");
        setText(desc, item.description);
        info.appendChild(desc);
      }

      card.appendChild(imgWrap);
      card.appendChild(info);

      // 削除ボタンは「追加した部品/pack」にだけ付く (自作は常に在庫なので外せない)
      if (isAdded) {
        const rm = document.createElement("button");
        rm.type = "button";
        rm.className = "library-remove";
        rm.title = "道具箱から削除";
        rm.setAttribute("aria-label", (item.name || "この部品") + "を道具箱から削除");
        rm.textContent = "×";
        rm.addEventListener("click", async function (e) {
          e.stopPropagation();
          rm.disabled = true;
          try {
            const res = await fetch(
              API_URL + "/" + encodeURIComponent(type) + "/" + encodeURIComponent(id),
              { method: "DELETE", headers: AteneyAuth.getAuthHeaders() }
            );
            if (res.status === 401) { location.href = "/login/"; return; }
            if (!res.ok) throw new Error("HTTP " + res.status);
            card.remove();
            if (!container.querySelector(".library-card")) {
              showState("🌙", EMPTY_MSG);
            }
          } catch (err) {
            console.error(err);
            rm.disabled = false;
            rm.classList.add("rm-failed");
            rm.title = "削除できませんでした。もう一度お試しください";
            setTimeout(function () { rm.classList.remove("rm-failed"); }, 1500);
          }
        });
        card.appendChild(rm);
      }

      card.addEventListener("click", function () {
        if (!id || !TYPE_HREF[type]) return;
        location.href = TYPE_HREF[type](id);
      });
      return card;
    }

    const EMPTY_MSG = 'まだ道具箱が空っぽ。<a href="/">ホーム</a>で部品を探そう';

    async function loadLibrary() {
      // 復号待ち (AES-GCM)
      if (window.AteneyAuth && AteneyAuth.ready) {
        try { await AteneyAuth.ready; } catch (e) {}
      }
      const loggedIn = !!(window.AteneyAuth && AteneyAuth.isLoggedIn());
      if (!loggedIn) {
        showState("🔑", '道具箱を使うには<a href="/login/" style="color:var(--accent);font-weight:600">ログイン</a>が必要です');
        return;
      }

      showSkeletons(4);

      try {
        const response = await fetch(API_URL, { headers: AteneyAuth.getAuthHeaders() });

        if (response.status === 401) {
          location.href = "/login/";
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const items = data.items || [];

        if (!Array.isArray(items) || items.length === 0) {
          showState("🌙", EMPTY_MSG);
          return;
        }

        container.innerHTML = "";
        items.forEach((item, i) => {
          container.appendChild(createCard(item, i));
        });

      } catch (err) {
        console.error("Failed to load library:", err);
        showState("⚠️", "道具箱を読み込めませんでした");
      }
    }

    loadLibrary();
