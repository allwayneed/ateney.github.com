var TYPE = "rag";
    var cfg = window.ATENEY_CONFIG || {};
    var apiBase = (cfg && cfg.API_BASE) || "";
    var form = document.getElementById("editorForm");
    var statusEl = document.getElementById("status");
    var id = new URLSearchParams(location.search).get("id");

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

    function fill(data) {
      for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (!el.name) continue;
        if (el.name in data) el.value = data[el.name] == null ? "" : data[el.name];
      }
    }

    function load() {
      setStatus("読み込み中...");
      authFetch("/api/me/" + TYPE + "/" + id)
        .then(function (res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return null; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          if (!data) return;
          document.getElementById("pageTitle").textContent = "RAG を編集";
          fill(data[TYPE] || {});
          setStatus("");
        })
        .catch(function () { setStatus("読み込めませんでした", true); });
    }

    function save(e) {
      e.preventDefault();
      var payload = {};
      for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (!el.name) continue;
        payload[el.name] = el.value.trim();
      }
      if (!payload.title) { setStatus("タイトルは必須だよ", true); return; }
      document.getElementById("saveBtn").disabled = true;
      setStatus("保存中...");
      authFetch("/api/" + TYPE + (id ? "/" + id : ""), {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return; }
          if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || "HTTP " + res.status); });
          location.href = "/create/";
        })
        .catch(function (err) {
          document.getElementById("saveBtn").disabled = false;
          setStatus(err.message || "保存に失敗した", true);
        });
    }

    function remove() {
      if (!confirm("本当に削除する？ 巻き戻しはできないよ")) return;
      authFetch("/api/" + TYPE + "/" + id, { method: "DELETE" })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          location.href = "/create/";
        })
        .catch(function () { setStatus("削除に失敗した", true); });
    }

    form.addEventListener("submit", save);
    document.getElementById("deleteBtn").addEventListener("click", remove);

    /* 認証ゲート: ログイン後のみ編集できる (RAGは全て非公開・認証必須) */
    if (window.AteneyAuth) {
      AteneyAuth.ready.then(function () {
        if (!AteneyAuth.isLoggedIn()) { location.replace("/login/"); return; }
        if (id) load();
      });
    } else {
      location.replace("/login/");
    }
