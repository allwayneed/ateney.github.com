/* =========================
       CHARACTER LIST
    ========================= */

    const cfg = window.ATENEY_CONFIG || {};
    const API_URL = (cfg.API_BASE || "") + "/api/character";
    const container = document.getElementById("character-list");

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

    function createCard(character, index) {
      const card = document.createElement("a");
      card.className = "character-card";
      card.href = "/character/" + character.id + "/";
      card.style.setProperty("--card-index", index);

      const imgWrap = document.createElement("div");
      imgWrap.className = "card-image";

      if (character.avatar_url) {
        const img = document.createElement("img");
        img.alt = character.name || "character";
        img.loading = "lazy";
        img.src = character.avatar_url;

        img.addEventListener("error", () => {
          imgWrap.innerHTML = "";
          const fb = document.createElement("div");
          fb.className = "card-image-fallback";
          setText(fb, (character.name || "?").charAt(0));
          imgWrap.appendChild(fb);
        });

        imgWrap.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "card-image-fallback";
        setText(fb, (character.name || "?").charAt(0));
        imgWrap.appendChild(fb);
      }

      const info = document.createElement("div");
      info.className = "character-info";

      const name = document.createElement("h3");
      setText(name, character.name);
      info.appendChild(name);

      if (character.description) {
        const desc = document.createElement("p");
        setText(desc, character.description);
        info.appendChild(desc);
      }

      card.appendChild(imgWrap);
      card.appendChild(info);
      return card;
    }

    async function loadCharacters() {
      showSkeletons(4);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const characters = data.characters || data.scenes || data || [];

        if (!Array.isArray(characters) || characters.length === 0) {
          showState("🌙", "まだキャラクターがいません。たぶんメンテ中です");
          return;
        }

        container.innerHTML = "";
        characters.forEach((char, i) => {
          container.appendChild(createCard(char, i));
        });

      } catch (err) {
        console.error("Failed to load characters:", err);
        showState("⚠️", "キャラクターを読み込めませんでした");
      }
    }

    loadCharacters();
