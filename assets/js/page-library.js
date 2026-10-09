/* =========================================================
       library — 道具箱 (オーナーUIシート準拠, 2026-10-08)
       pack専用化 (2026-10-09): Libraryはpackのみ。リスト行 + ···メニュー + インライン詳細
       データ: GET /api/library (統合インベントリ) + GET /api/me/pack (自packの dates/is_public)
    ========================================================= */

    var cfg = window.ATENEY_CONFIG || {};
    var apiBase = (cfg && cfg.API_BASE) || "";

    var libApp = document.getElementById("libApp");
    var libList = document.getElementById("libList");
    var libStateWrap = document.getElementById("libStateWrap");
    var libFilter = document.getElementById("libFilter");
    var libDetail = document.getElementById("libDetail");
    var libDetailTitle = document.getElementById("libDetailTitle");
    var libDetailDates = document.getElementById("libDetailDates");
    var libDetailBody = document.getElementById("libDetailBody");
    var libBackBtn = document.getElementById("libBackBtn");
    var libOverlay = document.getElementById("libOverlay");
    var libPopup = document.getElementById("libPopup");
    var libPopupContent = document.getElementById("libPopupContent");
    var libRenameDlg = document.getElementById("libRenameDlg");
    var libRenameInput = document.getElementById("libRenameInput");
    var libRenameOk = document.getElementById("libRenameOk");
    var libRenameCancel = document.getElementById("libRenameCancel");
    var libRenameTitle = document.getElementById("libRenameTitle");

    var KIND_LABEL = { character: "キャラ", scene: "シーン", rag: "RAG", pack: "pack" };
    var TYPE_LABEL_DETAIL = { character: "キャラクター", scene: "シーン", rag: "RAG", pack: "pack" };

    /* --- 状態管理 --- */
    var items = [];          // GET /api/library の全行 (libPackInfo をマージ済み)
    var packInfo = {};       // 自作packの追加情報 (created_at/updated_at/is_public 等) by id
    var currentFilter = "all";
    var currentItem = null;  // メニュー/詳細対象の行データ
    var menuBusy = false;

    function authHeaders() {
      return window.AteneyAuth ? AteneyAuth.getAuthHeaders() : {};
    }

    function api(path, opts) {
      opts = opts || {};
      opts.headers = Object.assign({}, authHeaders(), opts.headers || {});
      return fetch(apiBase + path, opts);
    }

    function setText(el, text) {
      if (el) el.textContent = text == null ? "" : text;
    }

    // SQLite datetime('now') はUTC "YYYY-MM-DD HH:MM:SS"。JST表記に直す
    function fmtDate(v) {
      if (!v) return "";
      var m = String(v).match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
      if (!m) return String(v);
      try {
        var d = new Date(m[1] + "T" + (m[2] || "00:00") + ":00Z");
        return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
      } catch (e) { return m[1]; }
    }

    /* --- 状態表示 --- */
    function showState(emoji, message) {
      libStateWrap.innerHTML = "";
      var div = document.createElement("div");
      div.className = "lib-state";
      var em = document.createElement("span");
      em.className = "state-emoji";
      em.textContent = emoji;
      div.appendChild(em);
      // message は信頼できる固定文言 + 自前aタグのみ。外挿なし
      div.insertAdjacentHTML("beforeend", message);
      libStateWrap.appendChild(div);
    }
    function clearState() { libStateWrap.innerHTML = ""; }

    /* --- ローディング --- */
    function showSkeletons() {
      libList.innerHTML = "";
      for (var i = 0; i < 4; i++) {
        var skel = document.createElement("div");
        skel.className = "skeleton-card";
        skel.innerHTML = '<div class="skel-img"></div><div class="skel-body"><div class="skel-line"></div><div class="skel-line short"></div></div>';
        libList.appendChild(skel);
      }
    }

    /* --- リスト描画 --- */
    function visibleItems() {
      if (currentFilter === "all") return items;
      return items.filter(function(it) { return it.source === currentFilter; }); // own/added
    }

    function createThumb(item) {
      var thumb = document.createElement("div");
      thumb.className = "lib-thumb";
      var url = item.avatar_url;
      if (url && /^https?:\/\//i.test(url)) {
        var img = document.createElement("img");
        img.alt = item.name || "";
        img.loading = "lazy";
        img.src = url;
        img.addEventListener("error", function() { thumb.textContent = (item.name || "?").charAt(0); });
        thumb.appendChild(img);
      } else {
        thumb.textContent = (item.name || "?").charAt(0);
      }
      return thumb;
    }

    function createRow(item, index) {
      // button入れ子は無効なHTMLなので、行はdiv + role="button"にする
      var row = document.createElement("div");
      row.className = "lib-row";
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.style.setProperty("--row-index", index);

      row.appendChild(createThumb(item));

      var info = document.createElement("div");
      info.className = "lib-row-info";

      var nameLine = document.createElement("div");
      nameLine.className = "lib-row-name";

      var kind = document.createElement("span");
      kind.className = "lib-kind" + (item.item_type === "pack" ? " k-pack" : "");
      kind.textContent = KIND_LABEL[item.item_type] || item.item_type;
      nameLine.appendChild(kind);

      var nm = document.createElement("span");
      nm.style.overflow = "hidden";
      nm.style.textOverflow = "ellipsis";
      setText(nm, item.name);
      nameLine.appendChild(nm);
      info.appendChild(nameLine);

      // 同梱数 (キャラn·シーンn·RAGn)
      var counts = document.createElement("div");
      counts.className = "lib-row-dates";
      var cparts = [];
      if (item.n_characters) cparts.push("キャラ" + item.n_characters);
      if (item.n_scenes) cparts.push("シーン" + item.n_scenes);
      if (item.n_rags) cparts.push("RAG" + item.n_rags);
      var cs = document.createElement("span");
      setText(cs, cparts.length ? cparts.join(" · ") : "空のpack");
      counts.appendChild(cs);
      info.appendChild(counts);

      var dates = document.createElement("div");
      dates.className = "lib-row-dates";
      if (item.source === "own") {
        var c = document.createElement("span");
        setText(c, "作成: " + fmtDate(item.sort_at));
        dates.appendChild(c);
        // 自作packは編集日も出す (me/packからマージ)
        if (item.item_type === "pack" && packInfo[item.item_id] && packInfo[item.item_id].updated_at) {
          var e = document.createElement("span");
          setText(e, "編集: " + fmtDate(packInfo[item.item_id].updated_at));
          dates.appendChild(e);
        }
      } else {
        var a = document.createElement("span");
        setText(a, "追加: " + fmtDate(item.sort_at));
        dates.appendChild(a);
      }
      info.appendChild(dates);
      row.appendChild(info);

      // ··· メニュー (行クリックと分離)
      var menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.className = "lib-menu-btn";
      menuBtn.textContent = "···";
      menuBtn.setAttribute("aria-label", (item.name || "この部品") + "のメニュー");
      menuBtn.addEventListener("click", function(ev) {
        ev.stopPropagation();
        openMenu(item);
      });
      row.appendChild(menuBtn);

      row.addEventListener("click", function() {
        openDetail(item);
      });
      row.addEventListener("keydown", function(ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openDetail(item);
        }
      });
      return row;
    }

    function renderList() {
      libList.innerHTML = "";
      clearState();
      var vis = visibleItems();
      if (!vis.length) {
        showState("🌙", "この区分はまだ空っぽ");
        return;
      }
      vis.forEach(function(it, i) {
        libList.appendChild(createRow(it, i));
      });
    }

    /* --- ··· メニュー --- */
    function closeMenu() {
      libOverlay.classList.remove("active");
      libPopup.classList.remove("active");
      currentItem = null;
    }
    function openMenu(item) {
      currentItem = item;
      libPopupContent.innerHTML = "";

      function mk(label, cls, fn, disabled) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "lib-popup-item" + (cls ? " " + cls : "");
        setText(b, label);
        if (disabled) b.disabled = true;
        b.addEventListener("click", fn);
        libPopupContent.appendChild(b);
        return b;
      }

      if (item.source === "own") {
        var isRag = item.item_type === "rag";
        // 公開/非公開切替 (ragは公開概念なし)
        if (!isRag) {
          var info = packInfo[item.item_id];
          var isPublic = item.item_type === "pack"
            ? (info ? !!info.is_public : !!item.is_public)
            : !!item.is_public;
          mk(isPublic ? "非公開にする" : "公開する", "", function() { togglePublish(item, isPublic); });
        }
        mk("名前の変更", "", function() { openRename(item); });
        mk("削除", "danger", function() { removeOwn(item); });
      } else {
        mk("導入解除", "danger", function() { removeAdded(item); });
      }

      libOverlay.classList.add("active");
      libPopup.classList.add("active");
    }
    libOverlay.addEventListener("click", closeMenu);

    function refreshAfterAction() {
      closeMenu();
      loadAll();
    }

    // 公開切替 (pack/character/scene)。pack_only中間状態はcreate編集ページで扱う
    function togglePublish(item, isPublic) {
      if (menuBusy) return;
      menuBusy = true;
      api("/api/" + item.item_type + "/" + item.item_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      })
        .then(function(res) {
          if (res.status === 401) { location.href = "/login/"; return; }
          if (!res.ok) return res.json().catch(function() { return {}; }).then(function(d) {
            throw new Error(d.error || "HTTP " + res.status);
          });
          refreshAfterAction();
        })
        .catch(function(err) {
          console.error(err);
          alert("公開設定を変更できなかった 😴");
        })
        .then(function() { menuBusy = false; });
    }

    function removeOwn(item) {
      var msg = item.item_type === "pack"
        ? "packを削除する？ 導入した人の道具箱からも消えるよ。巻き戻しはできないよ"
        : "「" + (item.name || "") + "」を削除する？ 巻き戻しはできないよ";
      if (!confirm(msg)) return;
      api("/api/" + item.item_type + "/" + item.item_id, { method: "DELETE" })
        .then(function(res) {
          if (res.status === 401) { location.href = "/login/"; return; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          refreshAfterAction();
        })
        .catch(function(err) {
          console.error(err);
          alert("削除できなかった 😴");
        });
    }

    function removeAdded(item) {
      api("/api/library/" + item.item_type + "/" + item.item_id, { method: "DELETE" })
        .then(function(res) {
          if (res.status === 401) { location.href = "/login/"; return; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          refreshAfterAction();
        })
        .catch(function(err) {
          console.error(err);
          alert("道具箱から削除できなかった 😴");
        });
    }

    /* --- 名前の変更ダイアログ --- */
    function openRename(item) {
      closeMenu();
      currentItem = item;
      setText(libRenameTitle, item.item_type === "rag" ? "タイトルの変更" : "名前の変更");
      libRenameInput.value = item.name || "";
      libRenameDlg.classList.add("active");
      setTimeout(function() { libRenameInput.focus(); libRenameInput.select(); }, 50);
    }
    function closeRename() {
      libRenameDlg.classList.remove("active");
      libRenameInput.value = "";
      currentItem = null;
    }
    function confirmRename() {
      var item = currentItem;
      if (!item || menuBusy) return;
      var newName = libRenameInput.value.trim();
      if (!newName) return;
      menuBusy = true;
      var body = {};
      body[item.item_type === "rag" ? "title" : "name"] = newName;
      api("/api/" + item.item_type + "/" + item.item_id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function(res) {
          if (res.status === 401) { location.href = "/login/"; return; }
          if (!res.ok) return res.json().catch(function() { return {}; }).then(function(d) {
            throw new Error(d.error || "HTTP " + res.status);
          });
          closeRename();
          loadAll();
        })
        .catch(function(err) {
          console.error(err);
          alert("名前を変更できなかった 😴");
        })
        .then(function() { menuBusy = false; });
    }
    libRenameOk.addEventListener("click", confirmRename);
    libRenameCancel.addEventListener("click", closeRename);
    libRenameInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") confirmRename();
    });

    document.addEventListener("keydown", function(e) {
      if (e.key !== "Escape") return;
      if (libRenameDlg.classList.contains("active")) {
        closeRename();
      } else {
        closeMenu();
      }
    });

    /* --- 詳細ビュー --- */
    function backToList() {
      libDetail.classList.remove("active");
      libApp.classList.remove("hidden");
      document.title = "Library - ateney";
    }
    libBackBtn.addEventListener("click", backToList);

    function section(titleText, contentNode) {
      var sec = document.createElement("div");
      sec.className = "lib-section";
      var t = document.createElement("div");
      t.className = "lib-section-title";
      setText(t, titleText);
      sec.appendChild(t);
      sec.appendChild(contentNode);
      return sec;
    }

    function subsection(titleText, entries) {
      // entries: [{name, desc}]
      var sub = document.createElement("div");
      sub.className = "lib-subsection";
      var t = document.createElement("div");
      t.className = "lib-subsection-title";
      setText(t, titleText);
      sub.appendChild(t);
      var wrap = document.createElement("div");
      wrap.className = "lib-subsection-items";
      if (!entries.length) {
        var none = document.createElement("div");
        none.className = "lib-subsection-item";
        setText(none, "—");
        wrap.appendChild(none);
      } else {
        entries.forEach(function(en) {
          var it = document.createElement("div");
          it.className = "lib-subsection-item";
          var nm = document.createElement("span");
          nm.className = "sub-name";
          setText(nm, en.name);
          it.appendChild(nm);
          if (en.desc) {
            var d = document.createElement("span");
            d.className = "sub-desc";
            setText(d, en.desc);
            it.appendChild(d);
          }
          wrap.appendChild(it);
        });
      }
      sub.appendChild(wrap);
      return sub;
    }

    function textNode(text) {
      var div = document.createElement("div");
      div.className = "lib-section-content";
      setText(div, text);
      return div;
    }

    function badgesNode(item) {
      var div = document.createElement("div");
      div.className = "lib-badges";
      if (item.source === "added") {
        var b1 = document.createElement("span");
        b1.className = "lib-badge";
        b1.textContent = "追加した部品";
        div.appendChild(b1);
      }
      if (item.item_type !== "rag" && item.is_public) {
        var b2 = document.createElement("span");
        b2.className = "lib-badge b-public";
        b2.textContent = "公開中";
        div.appendChild(b2);
      }
      if (item.item_type !== "rag" && item.item_type !== "pack" && item.pack_only) {
        var b3 = document.createElement("span");
        b3.className = "lib-badge b-packonly";
        b3.textContent = "pack専用";
        div.appendChild(b3);
      }
      if (div.childNodes.length === 0) return null;
      return div;
    }

    function renderDetailCommon(item, data) {
      // 日付
      libDetailDates.innerHTML = "";
      var dates = [];
      if (item.source === "own") {
        dates.push(["作成日", fmtDate(item.sort_at)]);
        if (item.item_type === "pack" && data && data.pack && data.pack.updated_at) {
          dates.push(["編集日", fmtDate(data.pack.updated_at)]);
        } else if (item.item_type !== "pack") {
          // me/:type/:id にupdated_atがあれば使う
          var full = data && (data.character || data.scene || data.rag || data.document);
          if (full && full.updated_at) dates.push(["編集日", fmtDate(full.updated_at)]);
        }
      } else {
        dates.push(["追加日", fmtDate(item.sort_at)]);
      }
      dates.forEach(function(d) {
        var di = document.createElement("div");
        di.className = "lib-date-item";
        var l = document.createElement("div");
        l.className = "lib-date-label";
        setText(l, d[0]);
        var v = document.createElement("div");
        v.className = "lib-date-value";
        setText(v, d[1]);
        di.appendChild(l); di.appendChild(v);
        libDetailDates.appendChild(di);
      });

      // バッジ
      var badges = badgesNode(item);
      if (badges) libDetailDates.appendChild(badges);
    }

    function openDetail(item) {
      currentItem = item;
      setText(libDetailTitle, item.name || TYPE_LABEL_DETAIL[item.item_type]);
      document.title = (item.name || "Library") + " - ateney";
      libDetailBody.innerHTML = '<div class="lib-state">読み込み中...</div>';
      libDetailDates.innerHTML = "";
      libApp.classList.add("hidden");
      libDetail.classList.add("active");
      window.scrollTo(0, 0);

      var finish = function(data) {
        renderDetailCommon(item, data);
        renderDetailBody(item, data);
      };

      if (item.item_type === "pack") {
        if (item.source === "own") {
          api("/api/me/pack/" + item.item_id + "?expand=1")
            .then(function(res) {
              if (res.status === 401) { location.href = "/login/"; return null; }
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json();
            })
            .then(function(data) { if (data) finish(data); })
            .catch(function() { libDetailBody.innerHTML = ""; libDetailBody.appendChild(textNode("読み込めませんでした")); });
        } else {
          api("/api/pack/" + item.item_id)
            .then(function(res) {
              if (res.status === 401) { location.href = "/login/"; return null; }
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json();
            })
            .then(function(data) { if (data) finish(data); })
            .catch(function() { libDetailBody.innerHTML = ""; libDetailBody.appendChild(textNode("読み込めませんでした")); });
        }
        return;
      }

      // pack専用化 (2026-10-09): 部品単体の分岐は廃止
    }

    function renderDetailBody(item, data) {
      libDetailBody.innerHTML = "";
      var full = data ? (data.character || data.scene || data.rag || data.document || null) : null;

      if (item.item_type === "pack") {
        var pk = data ? (data.pack || {}) : {};
        // 説明
        if (pk.description || item.description) {
          libDetailBody.appendChild(section("説明", textNode(pk.description || item.description)));
        }
        // 同梱物
        var contentSec = document.createElement("div");
        contentSec.className = "lib-section";
        var ct = document.createElement("div");
        ct.className = "lib-section-title";
        setText(ct, "内容");
        contentSec.appendChild(ct);

        // 複数同梱 (2026-10-08): characters/scenes/rags は配列
        var chars = (data && data.characters) ? data.characters : [];
        contentSec.appendChild(subsection("Character (" + chars.length + ")", chars.map(function(c) {
          return { name: c.name, desc: c.description || "" };
        })));
        var scenes = (data && data.scenes) ? data.scenes : [];
        contentSec.appendChild(subsection("Scene (" + scenes.length + ")", scenes.map(function(s) {
          return { name: s.name, desc: s.description || "" };
        })));
        var rags = (data && data.rags) ? data.rags : [];
        contentSec.appendChild(subsection("RAG (" + rags.length + ")", rags.map(function(r) {
          return { name: r.title, desc: r.excerpt || "" };
        })));
        libDetailBody.appendChild(contentSec);
        return;
      }

      // pack専用化 (2026-10-09): 部品単体の詳細描画は廃止
    }

    /* --- フィルタ --- */
    libFilter.addEventListener("click", function(e) {
      var btn = e.target.closest("button[data-source]");
      if (!btn) return;
      currentFilter = btn.getAttribute("data-source");
      libFilter.querySelectorAll("button").forEach(function(b) {
        b.classList.toggle("active", b === btn);
      });
      renderList();
    });

    /* --- 読み込み --- */
    function loadAll() {
      // トークン復号待ち (AES-GCM)
      var ready = (window.AteneyAuth && AteneyAuth.ready)
        ? Promise.resolve(AteneyAuth.ready).catch(function() {})
        : Promise.resolve();

      ready.then(function() {
        if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) {
          libList.innerHTML = "";
          showState("🔑", '道具箱を使うには<a href="/login/" style="color:var(--accent);font-weight:600">ログイン</a>が必要です');
          return;
        }
        showSkeletons();

        var libReq = api("/api/library").then(function(res) {
          if (res.status === 401) { location.href = "/login/"; return null; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        });
        // 自作packの dates/is_public 補強 (なくても動く。失敗は無視)
        var packReq = api("/api/me/pack?limit=100").then(function(res) {
          return res.ok ? res.json() : { packs: [] };
        }).catch(function() { return { packs: [] }; });

        Promise.all([libReq, packReq])
          .then(function(results) {
            var data = results[0];
            if (!data) return;
            items = data.items || [];
            (results[1].packs || []).forEach(function(pk) {
              packInfo[pk.id] = pk;
            });
            renderList();
          })
          .catch(function(err) {
            console.error("Failed to load library:", err);
            libList.innerHTML = "";
            showState("⚠️", "道具箱を読み込めませんでした");
          });
      });
    }

    /* --- packミニ作成フロート (pack-ui.js) --- */
    var libCreateBtn = document.getElementById("libCreateBtn");
    if (libCreateBtn) {
      libCreateBtn.addEventListener("click", function() {
        if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) { location.href = "/login/"; return; }
        if (window.AteneyPackUI) {
          AteneyPackUI.openCreatePack(function() { loadAll(); });
        }
      });
    }

    loadAll();
