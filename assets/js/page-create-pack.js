/* =========================
       pack 作成/編集 (Library本実装, 2026-10-08)
       POST /api/pack, PUT/DELETE /api/pack/:id, GET /api/me/pack/:id
       同梱物は自分の部品のみ (API側で検証。他人の部品は404)
    ========================= */
    var cfg = window.ATENEY_CONFIG || {};
    var apiBase = (cfg && cfg.API_BASE) || "";
    var form = document.getElementById("editorForm");
    var statusEl = document.getElementById("status");
    var id = new URLSearchParams(location.search).get("id");
    var MAX_RAG = 20;

    function setStatus(msg, isError) {
      statusEl.textContent = msg || "";
      statusEl.className = "status" + (isError ? " error" : "");
    }

    function authFetch(path, opts) {
      opts = opts || {};
      opts.headers = Object.assign(
        { "Content-Type": "application/json" },
        AteneyAuth.getAuthHeaders(),
        opts.headers || {}
      );
      return fetch(apiBase + path, opts);
    }

    /* ---- 自分の部品一覧を取得してセレクト/チェックリストに流す ---- */
    function fillCharacters(characters) {
      var sel = document.getElementById("pk-char-select");
      // me/character は自作全件を返す (pack_only部品も含む → 同梱選択肢になる)
      characters.forEach(function(c) {
        var opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name || "Untitled";
        sel.appendChild(opt);
      });
      return sel;
    }
    function fillScenes(scenes) {
      var sel = document.getElementById("pk-scene-select");
      scenes.forEach(function(s) {
        var opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name || "Untitled";
        sel.appendChild(opt);
      });
      return sel;
    }
    function fillRags(rags) {
      var wrap = document.getElementById("pk-rag-list");
      wrap.innerHTML = "";
      if (!rags.length) {
        wrap.innerHTML = '<p class="hint">RAGをまだ作っていないなら、ここは空のままでOK</p>';
        return;
      }
      rags.forEach(function(r) {
        var label = document.createElement("label");
        label.className = "check-row pk-rag-pick";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = r.id;
        var span = document.createElement("span");
        span.textContent = r.title || "Untitled";
        label.appendChild(cb);
        label.appendChild(span);
        wrap.appendChild(label);
      });
    }

    function loadParts() {
      setStatus("部品一覧を取得中...");
      return Promise.all([
        authFetch("/api/me/character?limit=100").then(function(r) { return r.ok ? r.json() : { characters: [] }; }),
        authFetch("/api/me/scene?limit=100").then(function(r) { return r.ok ? r.json() : { scenes: [] }; }),
        authFetch("/api/me/rag?limit=100").then(function(r) { return r.ok ? r.json() : { rags: [] }; }),
      ]).then(function(lists) {
        fillCharacters(lists[0].characters || []);
        fillScenes(lists[1].scenes || []);
        fillRags(lists[2].rags || lists[2].documents || []);
        setStatus("");
      });
    }

    /* ---- 編集モード ---- */
    function loadPack() {
      setStatus("読み込み中...");
      authFetch("/api/me/pack/" + id)
        .then(function(res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return null; }
          if (res.status === 404) throw new Error("このpackは存在しないか、あなたのものではありません");
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function(data) {
          if (!data) return;
          var pk = data.pack || {};
          document.getElementById("pageTitle").textContent = "pack を編集";
          document.getElementById("pk-name").value = pk.name || "";
          document.getElementById("pk-description").value = pk.description || "";
          document.getElementById("pk-tags").value = pk.tags || "";
          document.getElementById("pk-genre").value = pk.genre || "";
          document.getElementById("pk-char-select").value = pk.character_id || "";
          document.getElementById("pk-scene-select").value = pk.scene_id || "";
          document.querySelector('input[name="is_public"]').checked = !!pk.is_public;
          var ragIds = String(pk.rag_ids || "").split(",").filter(Boolean);
          document.querySelectorAll("#pk-rag-list input[type=checkbox]").forEach(function(cb) {
            cb.checked = ragIds.indexOf(cb.value) !== -1;
          });
          document.getElementById("deleteBtn").hidden = false;
          setStatus("");
        })
        .catch(function(err) { setStatus(err.message || "読み込めませんでした", true); });
    }

    /* ---- 保存 ---- */
    function save(e) {
      e.preventDefault();
      var payload = {
        name: document.getElementById("pk-name").value.trim(),
        description: document.getElementById("pk-description").value.trim(),
        tags: document.getElementById("pk-tags").value.trim(),
        genre: document.getElementById("pk-genre").value.trim(),
        character_id: document.getElementById("pk-char-select").value || null,
        scene_id: document.getElementById("pk-scene-select").value || null,
        rag_ids: [],
        is_public: document.querySelector('input[name="is_public"]').checked
      };
      if (!payload.name) { setStatus("名前は必須だよ", true); return; }
      document.querySelectorAll("#pk-rag-list input[type=checkbox]:checked").forEach(function(cb) {
        payload.rag_ids.push(cb.value);
      });
      if (payload.rag_ids.length > MAX_RAG) { setStatus("RAGは" + MAX_RAG + "個までだよ", true); return; }
      if (!payload.rag_ids.length) payload.rag_ids = null;

      document.getElementById("saveBtn").disabled = true;
      setStatus("保存中...");
      authFetch("/api/pack" + (id ? "/" + id : ""), {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      })
        .then(function(res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return; }
          if (!res.ok) return res.json().then(function(d) { throw new Error(d.error || "HTTP " + res.status); });
          location.href = "/create/";
        })
        .catch(function(err) {
          document.getElementById("saveBtn").disabled = false;
          setStatus(err.message || "保存に失敗した", true);
        });
    }

    function remove() {
      if (!confirm("packを削除する？ 導入した人の道具箱からも消えるよ。巻き戻しはできないよ")) return;
      authFetch("/api/pack/" + id, { method: "DELETE" })
        .then(function(res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          location.href = "/create/";
        })
        .catch(function() { setStatus("削除に失敗した", true); });
    }

    form.addEventListener("submit", save);
    document.getElementById("deleteBtn").addEventListener("click", remove);

    /* 認証ゲート: ログイン後のみ */
    if (window.AteneyAuth) {
      AteneyAuth.ready.then(function() {
        if (!AteneyAuth.isLoggedIn()) { location.replace("/login/"); return; }
        // 編集モードでは部品一覧 → pack取得 の順 (チェックボックスに反映するため)
        loadParts().then(function() { if (id) loadPack(); });
      });
    } else {
      location.replace("/login/");
    }
