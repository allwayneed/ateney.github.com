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

    var SVG_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
    var SVG_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

    function getAuthHeaders() {
      // auth.js: メモリ上の復号済みトークンから組み立てる (localStorageに平文は無い)
      if (window.AteneyAuth) return AteneyAuth.getAuthHeaders();
      return {};
    }

    if (!apiBase) {
      itemList.innerHTML = '<li style="color:var(--text-secondary);padding:24px 0;text-align:center;font-size:0.88rem;">設定ファイル (config.js) が読み込めていません 😴</li>';
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
      return '<li style="color:var(--text-secondary);padding:24px 0;text-align:center;font-size:0.88rem;">' +
        'まだ' + (type === "rag" ? "RAG" : type) + 'を作ってないよ。上のcreateから作れる ✨</li>';
    }

    function deleteItem(type, id, name) {
      if (!confirm("「" + name + "」を削除する？ 巻き戻しはできないよ")) return;
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
    var listState = { character: { page: 1 }, scene: { page: 1 }, rag: { page: 1 } };

    function loadItems(type, append) {
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
          var items = data.characters || data.scenes || data.rags || data.documents || data.items || data || [];
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

            // 行本体 → 詳細ページ (404 routerが /{type}/{id}/ を処理)
            var a = document.createElement("a");
            a.href = "/" + type + "/" + itemId + "/";
            var thumb = document.createElement("div");
            thumb.className = "item-thumb";
            if (item.avatar_url || item.image_url) {
              var img = document.createElement("img");
              img.src = item.avatar_url || item.image_url;
              img.alt = itemName;
              img.loading = "lazy";
              img.addEventListener("error", function() { thumb.textContent = itemName.charAt(0).toUpperCase(); });
              thumb.appendChild(img);
            } else {
              thumb.textContent = itemName.charAt(0).toUpperCase();
            }
            var name = document.createElement("span");
            name.className = "item-name";
            name.textContent = itemName;
            var tag = document.createElement("span");
            tag.className = "item-type";
            tag.textContent = type;
            a.appendChild(thumb); a.appendChild(name); a.appendChild(tag);

            // 編集・削除
            var actions = document.createElement("div");
            actions.className = "item-actions";
            var editBtn = document.createElement("a");
            editBtn.className = "icon-btn";
            editBtn.href = "/create/" + type + "/?id=" + encodeURIComponent(itemId);
            editBtn.title = "編集";
            editBtn.setAttribute("aria-label", itemName + "を編集");
            editBtn.innerHTML = SVG_EDIT;
            var delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "icon-btn danger";
            delBtn.title = "削除";
            delBtn.setAttribute("aria-label", itemName + "を削除");
            delBtn.innerHTML = SVG_TRASH;
            delBtn.addEventListener("click", function() { deleteItem(type, itemId, itemName); });
            actions.appendChild(editBtn); actions.appendChild(delBtn);

            a.style.opacity = "0"; a.style.transform = "translateY(10px)";
            a.style.transition = "opacity 0.3s var(--ease), transform 0.3s var(--ease)";
            setTimeout(function() { a.style.opacity = "1"; a.style.transform = "translateY(0)"; }, i * 50);
            li.appendChild(a); li.appendChild(actions); itemList.appendChild(li);
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
            itemList.innerHTML = '<li style="color:var(--text-secondary);padding:24px 0;text-align:center;font-size:0.88rem;">ログインの期限が切れました。もう一度ログインしてください 🔒</li>';
          } else {
            itemList.innerHTML = '<li style="color:var(--text-secondary);padding:24px 0;text-align:center;font-size:0.88rem;">読み込めなかった 😴</li>';
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
