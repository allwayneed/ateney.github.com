/* =========================================================
   pack-ui — pack追加/作成フロートUI (共有, 2026-10-09)
   Library pack専用化に伴い、部品詳細ページ (404) と library
   ページの両方から使う。CSPは外部JS+外部CSSのみ許可なので、
   スタイルはここで<style>を注入する (style-src 'unsafe-inline'許可済み)。
   AteneyPackUI.openAddToPack(type, id, name)  部品→pack追加ピッカー
   AteneyPackUI.openCreatePack(onCreated)      新規packミニ作成
   ateney.github.com — page共通UIパーツ
   ========================================================= */

(function () {
  "use strict";

  var cfg = window.ATENEY_CONFIG || {};
  var apiBase = (cfg && cfg.API_BASE) || "";

  var CSS_INJECTED = false;

  function injectStyleOnce() {
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;
    var css = "" +
      ".pkui-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;opacity:0;transition:opacity 0.2s ease;}" +
      ".pkui-overlay.active{opacity:1;}" +
      ".pkui-sheet{position:fixed;left:50%;bottom:0;transform:translate(-50%,100%);width:100%;max-width:480px;max-height:82vh;overflow-y:auto;" +
      " background:var(--bg-elevated,#222);border-radius:16px 16px 0 0;z-index:1001;transition:transform 0.25s ease;padding-bottom:env(safe-area-inset-bottom);}" +
      ".pkui-sheet.active{transform:translate(-50%,0);}" +
      ".pkui-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border,#444);position:sticky;top:0;background:var(--bg-elevated,#222);z-index:2;}" +
      ".pkui-title{font-size:0.95rem;font-weight:600;color:var(--text,#eee);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}" +
      ".pkui-close{background:none;border:none;color:var(--text-secondary,#999);font-size:1.2rem;cursor:pointer;padding:4px 8px;line-height:1;}" +
      ".pkui-body{padding:14px 18px 18px;}" +
      ".pkui-msg{font-size:0.8rem;color:var(--text-secondary,#999);margin:0 0 12px;}" +
      ".pkui-packlist{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}" +
      ".pkui-pack{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:1px solid var(--border,#444);border-radius:10px;background:transparent;cursor:pointer;text-align:left;color:var(--text,#eee);transition:border-color 0.15s ease;}" +
      ".pkui-pack:hover{border-color:var(--accent,#7c6ff0);}" +
      ".pkui-pack .pkui-pack-name{font-size:0.9rem;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}" +
      ".pkui-pack .pkui-pack-count{font-size:0.72rem;color:var(--text-secondary,#999);white-space:nowrap;}" +
      ".pkui-empty{font-size:0.85rem;color:var(--text-secondary,#999);padding:8px 0 12px;}" +
      ".pkui-newbtn{display:block;width:100%;padding:11px;border:1.5px dashed var(--accent,#7c6ff0);border-radius:10px;background:transparent;color:var(--accent,#7c6ff0);font-size:0.88rem;font-weight:600;cursor:pointer;transition:background 0.15s ease;}" +
      ".pkui-newbtn:hover{background:var(--bg,#111);}" +
      ".pkui-label{display:block;font-size:0.78rem;font-weight:600;color:var(--text-secondary,#999);margin:10px 0 5px;}" +
      ".pkui-input,.pkui-textarea{width:100%;padding:10px 12px;border:1px solid var(--border,#444);border-radius:8px;background:var(--bg,#111);color:var(--text,#eee);font-size:0.9rem;font-family:inherit;box-sizing:border-box;}" +
      ".pkui-textarea{min-height:70px;resize:vertical;}" +
      ".pkui-input:focus,.pkui-textarea:focus{outline:none;border-color:var(--accent,#7c6ff0);}" +
      ".pkui-check{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:0.82rem;color:var(--text,#eee);cursor:pointer;}" +
      ".pkui-check input{accent-color:var(--accent,#7c6ff0);width:16px;height:16px;}" +
      ".pkui-actions{display:flex;gap:10px;margin-top:16px;}" +
      ".pkui-actions button{flex:1;padding:11px;border-radius:8px;font-size:0.88rem;font-weight:600;cursor:pointer;border:1px solid var(--border,#444);background:transparent;color:var(--text,#eee);}" +
      ".pkui-actions .pkui-primary{background:var(--accent,#7c6ff0);border-color:var(--accent,#7c6ff0);color:#fff;}" +
      ".pkui-actions .pkui-primary:disabled{opacity:0.5;cursor:default;}" +
      ".pkui-done{padding:28px 18px;text-align:center;font-size:0.95rem;color:var(--text,#eee);}" +
      ".pkui-done .pkui-done-em{font-size:2rem;display:block;margin-bottom:8px;}";
    var styleEl = document.createElement("style");
    styleEl.id = "pkui-style";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function authReady() {
    return (window.AteneyAuth && AteneyAuth.ready)
      ? Promise.resolve(AteneyAuth.ready).catch(function () {})
      : Promise.resolve();
  }

  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({}, window.AteneyAuth ? AteneyAuth.getAuthHeaders() : {}, opts.headers || {});
    return fetch(apiBase + path, opts);
  }

  function loginRedirect() { location.href = "/login/"; }

  var TYPE_JA = { character: "キャラ", scene: "シーン", rag: "RAG" };

  /* --- シート骨組み --- */
  var ui = null; // { overlay, sheet, body }

  function ensureSheet() {
    injectStyleOnce();
    if (ui) return ui;
    var overlay = document.createElement("div");
    overlay.className = "pkui-overlay";
    var sheet = document.createElement("div");
    sheet.className = "pkui-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
    // シート内のクリックがバブルでオーバーレイに届き、
    // 即closeSheet()されてフロートが勝手に閉じるバグ (2026-10-09 E2Eで発見)。
    // 背景 (overlay直下クリック) のときだけ閉じる。
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSheet();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSheet();
    });
    ui = { overlay: overlay, sheet: sheet, body: null };
    return ui;
  }

  var busy = false;

  function closeSheet() {
    if (!ui) return;
    ui.overlay.classList.remove("active");
    ui.sheet.classList.remove("active");
    busy = false;
  }

  function openSheet(titleText, bodyBuilder) {
    var s = ensureSheet();
    busy = false;
    s.sheet.innerHTML = "";
    var head = document.createElement("div");
    head.className = "pkui-head";
    var t = document.createElement("div");
    t.className = "pkui-title";
    t.textContent = titleText;
    var x = document.createElement("button");
    x.type = "button";
    x.className = "pkui-close";
    x.setAttribute("aria-label", "閉じる");
    x.textContent = "×";
    head.appendChild(t);
    head.appendChild(x);
    s.sheet.appendChild(head);
    var body = document.createElement("div");
    body.className = "pkui-body";
    s.sheet.appendChild(body);
    s.body = body;
    bodyBuilder(body);
    requestAnimationFrame(function () {
      s.overlay.classList.add("active");
      s.sheet.classList.add("active");
    });
    return s;
  }

  /* --- 部品をpackへ追加 (ピッカー) --- */
  function openAddToPack(itemType, itemId, itemName) {
    authReady().then(function () {
      if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) { loginRedirect(); return; }
      var typeName = TYPE_JA[itemType] || itemType;

      var s = openSheet("どのpackに追加する？", function (body) {
        body.innerHTML = '<p class="pkui-msg">読み込み中...</p>';
        api("/api/me/pack?limit=100")
          .then(function (res) {
            if (res.status === 401) { loginRedirect(); return null; }
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
          })
          .then(function (data) {
            if (!data) return;
            renderPickerList(s, body, data.packs || [], itemType, itemId, itemName, typeName);
          })
          .catch(function () {
            body.innerHTML = "";
            var m = document.createElement("p");
            m.className = "pkui-msg";
            m.textContent = "pack一覧を取得できなかった。通信を見直してね";
            body.appendChild(m);
          });
      });
    });
  }

  function renderPickerList(s, body, packs, itemType, itemId, itemName, typeName) {
    body.innerHTML = "";
    var msg = document.createElement("p");
    msg.className = "pkui-msg";
    msg.textContent = "「" + (itemName || typeName) + "」を同梱するpackを選んでね";
    body.appendChild(msg);

    if (!packs.length) {
      var empty = document.createElement("div");
      empty.className = "pkui-empty";
      empty.textContent = "まだpackが無い。この下で作れるよ";
      body.appendChild(empty);
    } else {
      var list = document.createElement("div");
      list.className = "pkui-packlist";
      packs.forEach(function (pk) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pkui-pack";
        var nm = document.createElement("span");
        nm.className = "pkui-pack-name";
        nm.textContent = pk.name || "(無題)";
        var ct = document.createElement("span");
        ct.className = "pkui-pack-count";
        var parts = [];
        if (pk.n_characters) parts.push("キャラ" + pk.n_characters);
        if (pk.n_scenes) parts.push("シーン" + pk.n_scenes);
        if (pk.n_rags) parts.push("RAG" + pk.n_rags);
        ct.textContent = parts.length ? parts.join(" · ") : "空";
        btn.appendChild(nm);
        btn.appendChild(ct);
        btn.addEventListener("click", function () {
          addToPack(pk.id, pk.name, itemType, itemId, itemName, s);
        });
        list.appendChild(btn);
      });
      body.appendChild(list);
    }

    var newBtn = document.createElement("button");
    newBtn.type = "button";
    newBtn.className = "pkui-newbtn";
    newBtn.textContent = "＋ 新しいpackを作る";
    newBtn.addEventListener("click", function () {
      renderCreateForm(s, s.body, function (createdId, createdName) {
        addToPack(createdId, createdName, itemType, itemId, itemName, s);
      });
    });
    body.appendChild(newBtn);
  }

  function addToPack(packId, packName, itemType, itemId, itemName, s) {
    if (busy) return;
    busy = true;
    s.body.innerHTML = '<p class="pkui-msg">追加中...</p>';
    api("/api/me/pack/" + encodeURIComponent(packId) + "/contents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: itemType, id: itemId }),
    })
      .then(function (res) {
        if (res.status === 401) { loginRedirect(); return null; }
        if (!res.ok) return res.json().catch(function () { return {}; }).then(function (d) {
          throw new Error(d.error || "HTTP " + res.status);
        });
        return res.json();
      })
      .then(function (d) {
        if (!d) return;
        showDone(s, d.already ? "already" : "ok", packName, itemName);
      })
      .catch(function (err) {
        console.error(err);
        s.body.innerHTML = "";
        var m = document.createElement("p");
        m.className = "pkui-msg";
        m.textContent = "追加できなかった 😴 (" + (err.message || "エラー") + ")";
        var back = document.createElement("button");
        back.type = "button";
        back.className = "pkui-newbtn";
        back.textContent = "戻る";
        back.addEventListener("click", function () { closeSheet(); openAddToPack(itemType, itemId, itemName); });
        s.body.appendChild(m);
        s.body.appendChild(back);
      })
      .then(function () { busy = false; });
  }

  function showDone(s, kind, packName, itemName) {
    s.body.innerHTML = "";
    var done = document.createElement("div");
    done.className = "pkui-done";
    var em = document.createElement("span");
    em.className = "pkui-done-em";
    em.textContent = kind === "already" ? "🤔" : "✅";
    done.appendChild(em);
    done.appendChild(document.createTextNode(
      kind === "already"
        ? "「" + (packName || "pack") + "」にはもう入ってた"
        : "「" + (itemName || "部品") + "」を「" + (packName || "pack") + "」に追加した"
    ));
    s.body.appendChild(done);
    setTimeout(closeSheet, 1400);
  }

  /* --- 新規packミニ作成フォーム --- */
  function renderCreateForm(s, body, onCreated) {
    body.innerHTML = "";
    var nameL = document.createElement("label");
    nameL.className = "pkui-label";
    nameL.textContent = "pack名";
    var nameI = document.createElement("input");
    nameI.type = "text";
    nameI.className = "pkui-input";
    nameI.maxLength = 100;
    nameI.placeholder = "新しいpackの名前";
    nameI.autocomplete = "off";
    var descL = document.createElement("label");
    descL.className = "pkui-label";
    descL.textContent = "説明 (任意)";
    var descI = document.createElement("textarea");
    descI.className = "pkui-textarea";
    descI.placeholder = "どんなpack？";
    var pubL = document.createElement("label");
    pubL.className = "pkui-check";
    var pubI = document.createElement("input");
    pubI.type = "checkbox";
    pubI.checked = false;
    var pubT = document.createElement("span");
    pubT.textContent = "公開する (チェックを外すと自分専用)";
    pubL.appendChild(pubI);
    pubL.appendChild(pubT);
    var actions = document.createElement("div");
    actions.className = "pkui-actions";
    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "キャンセル";
    cancel.addEventListener("click", closeSheet);
    var ok = document.createElement("button");
    ok.type = "button";
    ok.className = "pkui-primary";
    ok.textContent = "作成";
    actions.appendChild(cancel);
    actions.appendChild(ok);
    body.appendChild(nameL);
    body.appendChild(nameI);
    body.appendChild(descL);
    body.appendChild(descI);
    body.appendChild(pubL);
    body.appendChild(actions);

    function submit() {
      if (busy) return;
      var name = nameI.value.trim();
      if (!name) { nameI.focus(); return; }
      busy = true;
      ok.disabled = true;
      api("/api/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          description: descI.value.trim() || null,
          is_public: pubI.checked,
        }),
      })
        .then(function (res) {
          if (res.status === 401) { loginRedirect(); return null; }
          if (!res.ok) return res.json().catch(function () { return {}; }).then(function (d) {
            throw new Error(d.error || "HTTP " + res.status);
          });
          return res.json();
        })
        .then(function (d) {
          if (!d) return;
          // busy=trueのままonCreated→addToPackに入ると
          // 「if (busy) return」で追加が無言で中断されるバグ (2026-10-09)
          busy = false;
          if (onCreated) onCreated(d.id, d.name, s);
          else showDone(s, "ok", d.name, null);
        })
        .catch(function (err) {
          console.error(err);
          ok.disabled = false;
          busy = false;
          alert("packを作成できなかった 😴 (" + (err.message || "エラー") + ")");
        });
    }
    ok.addEventListener("click", submit);
    nameI.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); submit(); }
    });
    setTimeout(function () { nameI.focus(); }, 120);
  }

  /* --- 新規pack作成 (libraryページの「＋ packを作る」から) --- */
  function openCreatePack(onCreated) {
    authReady().then(function () {
      if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) { loginRedirect(); return; }
      openSheet("新しいpackを作る", function (body) {
        renderCreateForm(ui, body, function (id, name) {
          closeSheet();
          if (onCreated) onCreated(id, name);
        });
      });
    });
  }

  window.AteneyPackUI = {
    openAddToPack: openAddToPack,
    openCreatePack: openCreatePack,
  };
})();
