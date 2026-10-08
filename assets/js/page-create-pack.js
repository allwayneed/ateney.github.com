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

    /* ---- 自分の部品一覧を取得してチェックリストに流す (複数同梱対応) ---- */
    function fillPickList(wrapId, entries, labelOf) {
      var wrap = document.getElementById(wrapId);
      wrap.innerHTML = "";
      if (!entries.length) {
        wrap.innerHTML = '<p class="hint">まだ作っていないなら、空のままでOK</p>';
        return;
      }
      entries.forEach(function(en) {
        var label = document.createElement("label");
        label.className = "check-row pk-pick";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = en.id;
        var span = document.createElement("span");
        span.textContent = labelOf(en);
        label.appendChild(cb);
        label.appendChild(span);
        wrap.appendChild(label);
      });
    }
    function fillCharacters(characters) {
      fillPickList("pk-char-list", characters, function(c) { return c.name || "Untitled"; });
    }
    function fillScenes(scenes) {
      fillPickList("pk-scene-list", scenes, function(s) { return s.name || "Untitled"; });
    }
    function fillRags(rags) {
      fillPickList("pk-rag-list", rags, function(r) { return r.title || "Untitled"; });
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
          document.querySelector('input[name="is_public"]').checked = !!pk.is_public;
          // 複数同梱: CSV列をcheckboxに復元
          [["pk-char-list", pk.character_ids], ["pk-scene-list", pk.scene_ids], ["pk-rag-list", pk.rag_ids]]
            .forEach(function(pair) {
              var ids = String(pair[1] || "").split(",").filter(Boolean);
              document.querySelectorAll("#" + pair[0] + " input[type=checkbox]").forEach(function(cb) {
                cb.checked = ids.indexOf(cb.value) !== -1;
              });
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
        character_ids: [],
        scene_ids: [],
        rag_ids: [],
        is_public: document.querySelector('input[name="is_public"]').checked
      };
      if (!payload.name) { setStatus("名前は必須だよ", true); return; }
      [["pk-char-list", "character_ids"], ["pk-scene-list", "scene_ids"], ["pk-rag-list", "rag_ids"]]
        .forEach(function(pair) {
          document.querySelectorAll("#" + pair[0] + " input[type=checkbox]:checked").forEach(function(cb) {
            payload[pair[1]].push(cb.value);
          });
        });
      if (payload.character_ids.length > 10) { setStatus("キャラは10体までだよ", true); return; }
      if (payload.scene_ids.length > 10) { setStatus("シーンは10つまでだよ", true); return; }
      if (payload.rag_ids.length > MAX_RAG) { setStatus("RAGは" + MAX_RAG + "個までだよ", true); return; }
      ["character_ids", "scene_ids", "rag_ids"].forEach(function(k) {
        if (!payload[k].length) payload[k] = null;
      });

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
