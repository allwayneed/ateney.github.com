/* +create トグル */
    var createToggle = document.getElementById("createToggle");
    var createMenu = document.getElementById("createMenu");
    createToggle.addEventListener("click", function() {
      var isOpen = createMenu.classList.toggle("open");
      createToggle.classList.toggle("open", isOpen);
      createToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    /* =========================
       CREATE — 自分の作品一覧 (/api/me/*)
       ========================= */
    var cfg = window.ATENEY_CONFIG || {};
    var apiBase = (cfg && cfg.API_BASE) || "";
    var itemList = document.getElementById("itemList");
    var filterTabs = document.querySelectorAll("#filter a");

    function getAuthHeaders() {
      // auth.js: メモリ上の復号済みトークンから組み立てる (localStorageに平文は無い)
      if (window.AteneyAuth) return AteneyAuth.getAuthHeaders();
      return {};
    }

    if (!apiBase) {
      itemList.innerHTML = '<li><div class="cr-state"><span class="state-emoji">😴</span>設定ファイル (config.js) が読み込めていません</div></li>';
    }

    filterTabs.forEach(function(tab) {
      tab.addEventListener("click", function(e) {
        e.preventDefault();
        filterTabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        loadItems(tab.getAttribute("data-type"));
      });
    });

    function emptyMsg(type) {
      return '<li><div class="cr-state"><span class="state-emoji">✨</span>' +
        'まだ' + (type === "rag" ? "RAG" : type) + 'を作ってないよ。<br>上の create から作れる</div></li>';
    }

    /* 日付整形 (Library準拠): "2026-10-08 05:21:33" → "2026/10/08" */
    function fmtDate(s) {
      if (!s) return "";
      var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? (m[1] + "/" + m[2] + "/" + m[3]) : "";
    }

    /* 公開状態バッジの文言とclass */
    function visBadge(type, item) {
      if (type === "rag") return null; // RAGは公開概念なし
      if (item.pack_only) return { text: "pack専用", cls: "cr-vis v-packonly" };
      return item.is_public
        ? { text: "公開", cls: "cr-vis v-public" }
        : { text: "非公開", cls: "cr-vis" };
    }

    /* ···メニュー (ボトムシート)。Library準拠 */
    var crPopup = document.getElementById("crPopup");
    var crBackdrop = document.getElementById("crBackdrop");
    var crPopupTitle = document.getElementById("crPopupTitle");
    var crPopupActions = document.getElementById("crPopupActions");

    function closePopup() {
      crPopup.classList.remove("active");
      crBackdrop.classList.remove("active");
    }
    crBackdrop.addEventListener("click", closePopup);
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") closePopup();
    });

    function popupItem(text, danger, onClick) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cr-popup-item" + (danger ? " danger" : "");
      btn.textContent = text;
      if (onClick) btn.addEventListener("click", onClick);
      return btn;
    }

    function openRowMenu(type, item) {
      var name = item.name || item.title || "Untitled";
      crPopupTitle.textContent = name;
      crPopupActions.innerHTML = "";

      // 編集
      var edit = document.createElement("a");
      edit.className = "cr-popup-item";
      edit.href = "/create/" + type + "/?id=" + encodeURIComponent(item.id);
      edit.textContent = "編集";
      crPopupActions.appendChild(edit);

      // 公開⇔非公開切替 (RAG以外。pack_onlyもここで公開扱いに切り替え)
      if (type !== "rag" && typeof item.is_public !== "undefined") {
        var label = (item.pack_only || !item.is_public) ? "公開する" : "非公開にする";
        crPopupActions.appendChild(popupItem(label, false, function() {
          var next = (item.pack_only || !item.is_public) ? 1 : 0;
          fetch(apiBase + "/api/" + type + "/" + item.id, {
            method: "PUT",
            headers: Object.assign({ "Content-Type": "application/json" }, getAuthHeaders()),
            body: JSON.stringify({ is_public: next === 1 }),
          })
            .then(function(res) {
              if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return; }
              if (!res.ok) throw new Error("HTTP " + res.status);
              closePopup();
              loadItems(currentType);
            })
            .catch(function() { alert("変更できなかった 😴"); });
        }));
      }

      // 削除
      crPopupActions.appendChild(popupItem("削除", true, function() {
        closePopup();
        deleteItem(type, item.id, name);
      }));

      crPopup.classList.add("active");
      crBackdrop.classList.add("active");
    }

    function deleteItem(type, id, name) {
      var msg = (type === "pack")
        ? "「" + name + "」を削除する？ほかの人の道具箱からも消えるよ (巻き戻し不可)"
        : "「" + name + "」を削除する？packに同梱されてても消えるよ (巻き戻し不可)";
      if (!confirm(msg)) return;
      fetch(apiBase + "/api/" + type + "/" + id, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
        .then(function(res) {
          if (res.status === 401) { AteneyAuth.logout(); location.replace("/login/"); return; }
          if (!res.ok) throw new Error("HTTP " + res.status);
          loadItems(type);
        })
        .catch(function(err) {
          console.error("deleteItem error:", err);
          alert("削除できなかった 😴");
        });
    }

    // 20件ブロック読み込み (API側ページング ?page=N。デフォルト20/block)
    var listState = { character: { page: 1 }, scene: { page: 1 }, rag: { page: 1 }, pack: { page: 1 } };
    var currentType = "character";

    function loadItems(type, append) {
      currentType = type;
      if (!append) {
        listState[type] = { page: 1 };
        var skel = "";
        for (var i = 0; i < 4; i++) skel += '<li><div class="item-skeleton"></div></li>';
        itemList.innerHTML = skel;
      }

      // 自分の作品だけ。全て認証必須エンドポイント
      fetch(apiBase + "/api/me/" + type + "?page=" + listState[type].page, { headers: getAuthHeaders() })
        .then(function(res) {
          if (res.status === 401) {
            // トークンが無効/期限切れ。掃除して再ログインへ誘導
            if (window.AteneyAuth) AteneyAuth.logout();
            throw new Error("401");
          }
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function(data) {
          var items = data.characters || data.scenes || data.rags || data.packs || data.documents || data.items || data || [];
          var pg = data.pagination || {};
          if (!append) itemList.innerHTML = "";
          if (!Array.isArray(items) || items.length === 0) {
            if (!append) itemList.innerHTML = emptyMsg(type);
            return;
          }
          items.forEach(function(item, i) {
            var itemId = item.id || item.uuid || "";
            var itemName = item.name || item.title || "Untitled";
            var li = document.createElement("li");

            // 行本体 → 編集ページ (createは管理画面なので編集が主操作)
            var row = document.createElement("a");
            row.className = "cr-row";
            row.href = "/create/" + type + "/?id=" + encodeURIComponent(itemId);
            row.style.setProperty("--row-index", String(i % 20));

            var thumb = document.createElement("div");
            thumb.className = "cr-thumb";
            if (item.avatar_url || item.image_url) {
              var img = document.createElement("img");
              img.src = item.avatar_url || item.image_url;
              img.alt = "";
              img.loading = "lazy";
              img.addEventListener("error", function() {
                thumb.textContent = itemName.charAt(0).toUpperCase();
              });
              thumb.appendChild(img);
            } else {
              thumb.textContent = itemName.charAt(0).toUpperCase();
            }

            var info = document.createElement("div");
            info.className = "cr-row-info";
            var nameRow = document.createElement("div");
            nameRow.className = "cr-row-name";
            var nameEl = document.createElement("span");
            nameEl.style.overflow = "hidden";
            nameEl.style.textOverflow = "ellipsis";
            nameEl.textContent = itemName;
            nameRow.appendChild(nameEl);
            var kind = document.createElement("span");
            kind.className = "cr-kind" + (type === "pack" ? " k-pack" : "");
            kind.textContent = type === "rag" ? "RAG" : type;
            nameRow.appendChild(kind);
            var vis = visBadge(type, item);
            if (vis) {
              var visEl = document.createElement("span");
              visEl.className = vis.cls;
              visEl.textContent = vis.text;
              nameRow.appendChild(visEl);
            }
            info.appendChild(nameRow);

            var dates = document.createElement("div");
            dates.className = "cr-row-dates";
            var c = fmtDate(item.created_at), u = fmtDate(item.updated_at);
            if (c) {
              var cEl = document.createElement("span");
              cEl.textContent = "作成: " + c;
              dates.appendChild(cEl);
            }
            if (u && u !== c) {
              var uEl = document.createElement("span");
              uEl.textContent = "編集: " + u;
              dates.appendChild(uEl);
            }
            info.appendChild(dates);
            row.appendChild(thumb);
            row.appendChild(info);

            // ··· メニュー (行クリックを奪わない)
            var menuBtn = document.createElement("button");
            menuBtn.type = "button";
            menuBtn.className = "cr-menu-btn";
            menuBtn.title = "メニュー";
            menuBtn.setAttribute("aria-label", itemName + "のメニュー");
            menuBtn.textContent = "···";
            menuBtn.addEventListener("click", function(e) {
              e.preventDefault();
              e.stopPropagation();
              openRowMenu(type, item);
            });
            row.appendChild(menuBtn);

            li.appendChild(row);
            itemList.appendChild(li);
          });
          // まだ残りがあれば「もっと見る」
          if (pg.has_more) {
            var shown = (pg.page - 1) * (pg.limit || 20) + items.length;
            var more = document.createElement("li");
            more.className = "load-more";
            var moreBtn = document.createElement("button");
            moreBtn.type = "button";
            moreBtn.textContent = "もっと見る (あと" + (pg.total - shown) + "件)";
            moreBtn.addEventListener("click", function() {
              listState[type].page++;
              more.remove();
              loadItems(type, true);
            });
            more.appendChild(moreBtn);
            itemList.appendChild(more);
          }
        })
        .catch(function(err) {
          console.error("loadItems error:", err);
          if (err.message === "401") {
            itemList.innerHTML = '<li><div class="cr-state"><span class="state-emoji">🔒</span>ログインの期限が切れました。<br>もう一度ログインしてください</div></li>';
          } else {
            itemList.innerHTML = '<li><div class="cr-state"><span class="state-emoji">😴</span>読み込めなかった</div></li>';
          }
        });
    }

    // auth.js の復号が終わってから一覧を取る (トークン未復号のまま fetch しない)
    if (window.AteneyAuth && AteneyAuth.ready) {
      AteneyAuth.ready.then(function() {
        if (!AteneyAuth.isLoggedIn()) { location.replace("/login/"); return; }
        loadItems("character");
      });
    } else {
      location.replace("/login/");
    }
