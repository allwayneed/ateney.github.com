/* =========================
       library LIST
    ========================= */

    // Issue #5: /api/library に実接続 (2026-10-07)
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

      // 削除ボタン (ライブラリから外す)
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "library-remove";
      rm.title = "ライブラリから削除";
      rm.setAttribute("aria-label", (library.name || "このキャラ") + "をライブラリから削除");
      rm.textContent = "×";
      rm.addEventListener("click", async function (e) {
        e.stopPropagation();
        rm.disabled = true;
        try {
          const res = await fetch(API_URL + "/" + encodeURIComponent(library.id), {
            method: "DELETE",
            headers: AteneyAuth.getAuthHeaders(),
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          card.remove();
          if (!container.querySelector(".library-card")) {
            showState("🌙", EMPTY_MSG);
          }
        } catch (err) {
          console.error(err);
          rm.disabled = false;
          // 削除失敗が分かるように一瞬ボタンを赤く (consoleだけでは気付けない)
          rm.classList.add("rm-failed");
          rm.title = "削除できませんでした。もう一度お試しください";
          setTimeout(function () { rm.classList.remove("rm-failed"); }, 1500);
        }
      });
      card.appendChild(rm);

      // カードクリックでキャラ詳細へ (idが無いデータは遷移しない)
      card.addEventListener("click", function () {
        if (!library.id) return;
        location.href = "/character/" + encodeURIComponent(library.id);
      });
      return card;
    }

    const EMPTY_MSG = 'まだ何もライブラリに入れていません。<a href="/">ホーム</a>でキャラを探そう';

    async function loadLibrary() {
      // 復号待ち (AES-GCM)
      if (window.AteneyAuth && AteneyAuth.ready) {
        try { await AteneyAuth.ready; } catch (e) {}
      }
      const loggedIn = !!(window.AteneyAuth && AteneyAuth.isLoggedIn());
      if (!loggedIn) {
        showState("🔑", 'ライブラリを使うには<a href="/login/" style="color:var(--accent);font-weight:600">ログイン</a>が必要です');
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
        const items = data.library || [];

        if (!Array.isArray(items) || items.length === 0) {
          showState("🌙", EMPTY_MSG);
          return;
        }

        container.innerHTML = "";
        items.forEach((char, i) => {
          container.appendChild(createCard(char, i));
        });

      } catch (err) {
        console.error("Failed to load library:", err);
        showState("⚠️", "ライブラリを読み込めませんでした");
      }
    }

    loadLibrary();
