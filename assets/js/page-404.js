/* =========================
       LOGO EASTER EGG
       イースターエッグだけど、探してもここには何もないよ〜。。。
    ========================= */
    var logo = document.getElementById("logo");
    if (logo) {
      logo.addEventListener("dblclick", function(e) {
        e.preventDefault();
        var msgs = [
          "そこ。何もないよ。",
          "ダブルクリックする元気があるなら開発も進むはず。",
          "叩かないで。痛い。",
          "君、Troble好きでしょ。",
          "ここに何もないって言ったけど、実は何かあったら面白かったのにね。",
        ];
        var m = msgs[Math.floor(Math.random() * msgs.length)];
        var orig = logo.innerHTML;
        logo.innerHTML = '<span style="font-size:0.7rem;color:var(--accent)">' + m + '</span>';
        setTimeout(function() { logo.innerHTML = orig; }, 2500);
      });
    }

    /* =========================
       LOADING MESSAGE ROTATION
       ローディング中にメッセージが変わる
    ========================= */
    var loadingMsgs = [
      "ateneyがデータベースのチャイム鳴らしてます...",
      "まだ呼んでいます...",
      "DB「怒ってます。寝てたから。」",
      "DB「起きました、探してきます。」",
      "DB「もうちょっと。人前に出るので髪直してます。」",
      "DB「やっぱ二度寝します、おやすみ...」",
      "DB「Zzz...」",
      "ateneyがDBの扉を蹴り破ってデータ探しています。。。",
    ];
    var loadingIdx = 0;
    var loadingInterval = null;
    function startLoadingRotation() {
      var el = document.getElementById("loading-text");
      if (!el) return;
      loadingIdx = 0;
      loadingInterval = setInterval(function() {
        loadingIdx++;
        if (loadingIdx < loadingMsgs.length) {
          el.textContent = loadingMsgs[loadingIdx];
        }
      }, 1500);
    }
    function stopLoadingRotation() {
      if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
    }

    /* =========================
       SPA ROUTER — 404.html ハック
       GitHub Pagesはファイルがないパスに404.htmlを返す。
       これを利用して /character/:uuid/ をルーティングする。
       つまり独自サーバーに移り住んだら404.htmlに飛ぶようにすること、
    ========================= */
    var path = window.location.pathname;
    var content = document.getElementById("content");
    var cfg = window.ATENEY_CONFIG || {};
    var apiBase = (cfg && cfg.API_BASE) || "";


    function setText(el, text) { if (el) el.textContent = text || ""; }

    // XSS対策: innerHTMLに差し込む動的値は必ずこれを通す
    function escapeHtml(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function(ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      });
    }
    // --- 道具箱 (Library本実装 2026-10-08): /api/library/:type/:id ---
    // own部品は常に在庫なのでボタン自体を隠す。added/not-yet でトグル。
    var libBusy = false;
    var LIB_LABELS = {
      character: { add: "道具箱に追加", remove: "道具箱から削除" },
      scene: { add: "道具箱に追加", remove: "道具箱から削除" },
      pack: { add: "道具箱に入れる", remove: "道具箱から出す" }
    };
    function setupLibraryButton(itemId, itemType) {
      var btn = document.getElementById("chat-btn");
      if (!btn) return;
      if (!LIB_LABELS[itemType]) return; // ragは対象外
      var icon = btn.querySelector("svg") ? btn.querySelector("svg").outerHTML : "";
      var inLibrary = false;

      function setBtn(label) {
        btn.innerHTML = icon + escapeHtml(label);
      }

      function authReady() {
        return (window.AteneyAuth && AteneyAuth.ready)
          ? Promise.resolve(AteneyAuth.ready).catch(function() {})
          : Promise.resolve();
      }

      btn.addEventListener("click", function() {
        if (libBusy) return;
        authReady().then(function() {
          if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) {
            location.href = "/login/";
            return;
          }
          libBusy = true;
          btn.disabled = true;
          var method = inLibrary ? "DELETE" : "POST";
          fetch(apiBase + "/api/library/" + encodeURIComponent(itemType) + "/" + encodeURIComponent(itemId), {
            method: method,
            headers: AteneyAuth.getAuthHeaders(),
          })
            .then(function(res) {
              if (res.status === 401) { location.href = "/login/"; return null; }
              if (!res.ok) throw new Error("HTTP " + res.status);
              inLibrary = !inLibrary;
              setBtn(inLibrary ? LIB_LABELS[itemType].remove : LIB_LABELS[itemType].add);
            })
            .catch(function(err) {
              console.error(err);
              setBtn(inLibrary ? LIB_LABELS[itemType].remove : LIB_LABELS[itemType].add);
            })
            .then(function() { btn.disabled = false; libBusy = false; });
        });
      });

      // ログイン済みなら所持状態をボタンに反映 (ownなら非表示)
      authReady().then(function() {
        if (!window.AteneyAuth || !AteneyAuth.isLoggedIn()) return;
        fetch(apiBase + "/api/library", { headers: AteneyAuth.getAuthHeaders() })
          .then(function(res) { return res.ok ? res.json() : { items: [] }; })
          .then(function(data) {
            var items = data.items || [];
            for (var i = 0; i < items.length; i++) {
              if (items[i].item_id === itemId && items[i].item_type === itemType) {
                if (items[i].source === "own") {
                  // 自作部品: 常に在庫。ボタンは無意味なので隠す
                  var sec = btn.closest(".char-section");
                  if (sec) sec.style.display = "none";
                  else btn.style.display = "none";
                  return;
                }
                inLibrary = true;
                setBtn(LIB_LABELS[itemType].remove);
                return;
              }
            }
          })
          .catch(function(e) { /* 所持チェック失敗はクリック時に再試行 */ });
      });
    }


    // アバターURLはhttp(s)のみ許可
    function safeAvatarUrl(u) {
      return (typeof u === "string" && /^https?:\/\//i.test(u)) ? u : null;
    }

    var notFoundMessages = [
      { h: "404", p: "ここにページはなかった。妖精が持っていったのかも。もしかしたらTKに、、、" },
      { h: "404", p: "リンク切れ。頭も切れる。" },
      { h: "404", p: "ページが迷子になっています。道案内してあげてね。いざヴァルハラへ！" },
      { h: "40404040...", p: "このURL、行き止まり。しかし線路は続くよどこまでも" },
      { h: "404", p: "ページが存在しない。お前も存在しないかも" },
      { h: "404", p: "何も見つからない。静寂、お前の財布の中も静寂が支配している。" },
      { h: "404", p: "404 — 「存在しない」の3文字(!?)。" },
      { h: "404", p: "Get 404ed lol."}
    ];

    function showNotFound() {
      document.title = "404 - ateney";
      var msg = notFoundMessages[Math.floor(Math.random() * notFoundMessages.length)];
      content.innerHTML =
        '<div class="not-found">' +
        '<h1>' + msg.h + '</h1>' +
        '<p>' + msg.p + '</p>' +
        '<p style="margin-top:20px"><a href="/">ホームに戻る</a></p>' +
        '</div>';
    }

    function showError(msg) {
      document.title = "エラー - ateney";
      content.innerHTML =
        '<div class="error-state">' +
        '<p>' + escapeHtml(msg) + '</p>' +
        '<p style="margin-top:16px"><a href="/" style="color:var(--accent);text-decoration:none;font-weight:500">ホームに戻る</a></p>' +
        '</div>';
    }

    function renderCharacter(c) {
      document.title = (c.name || "Character") + " - ateney";

      // アバター（XSS対策: エスケープ + http(s)スキーム検証、onerrorはJSで後付け）
      var avatarHtml = "";
      if (safeAvatarUrl(c.avatar_url)) {
        avatarHtml = '<img class="char-avatar-img" src="' + escapeHtml(c.avatar_url) + '" alt="' + escapeHtml(c.name || "character") + '">';
      } else {
        avatarHtml = '<div class="char-avatar-fallback">' + escapeHtml((c.name || "?").charAt(0)) + '</div>';
      }

      // タグ
      var tagsHtml = "";
      if (c.tags) {
        var tagList = c.tags.split(",").map(function(t) { return t.trim(); }).filter(Boolean);
        tagsHtml = tagList.map(function(t) {
          return '<span class="char-tag">' + escapeHtml(t) + '</span>';
        }).join("");
      }
      // genreもタグとして表示
      if (c.genre) {
        var genres = c.genre.split(",").map(function(g) { return g.trim(); }).filter(Boolean);
        genres.forEach(function(g) {
          tagsHtml += '<span class="char-tag">' + escapeHtml(g) + '</span>';
        });
      }

      // セクション組み立て
      var html = '<div class="char-detail">';
      html += '<a href="/characters/" class="char-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>キャラクター一覧</a>';

      html += '<div class="char-header">';
      html += '<div class="char-avatar">' + avatarHtml + '</div>';
      html += '<div class="char-title"><h1 id="char-name"></h1><div class="char-tags" id="char-tags">' + tagsHtml + '</div></div>';
      html += '</div>';

      if (c.description) {
        html += '<div class="char-section"><h2>説明</h2><p id="char-desc"></p></div>';
      }
      if (c.personality) {
        html += '<div class="char-section"><h2>性格</h2><p id="char-personality"></p></div>';
      }
      if (c.greeting) {
        html += '<div class="char-section"><h2>挨拶</h2><p id="char-greeting" style="font-style:italic"></p></div>';
      }

      html += '<div class="char-section"><button class="char-chat-btn" id="chat-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>道具箱に追加</button></div>';

      html += '</div>';

      content.innerHTML = html;

      // 道具箱ボタン (Library本実装)
      setupLibraryButton(c.id, "character");

      // 画像読み込み失敗時のフォールバック（textContentで安全に）
      var img = content.querySelector(".char-avatar-img");
      if (img) {
        img.addEventListener("error", function() {
          var wrap = img.parentElement;
          wrap.innerHTML = "";
          var fb = document.createElement("div");
          fb.className = "char-avatar-fallback";
          fb.textContent = (c.name || "?").charAt(0);
          wrap.appendChild(fb);
        });
      }

      // セキュアにDOM設定（XSS対策 — textContent使用）
      setText(document.getElementById("char-name"), c.name);
      setText(document.getElementById("char-desc"), c.description);
      setText(document.getElementById("char-personality"), c.personality);
      setText(document.getElementById("char-greeting"), c.greeting);
    }
    function renderscene(c) {
      document.title = (c.name || "Scene") + " - ateney";

      // アバター
      var avatarHtml = "";
      avatarHtml = '<div class="char-avatar-fallback">' + escapeHtml((c.name || "?").charAt(0)) + '</div>';
      // タグ
      var tagsHtml = "";
      if (c.tags) {
        var tagList = c.tags.split(",").map(function(t) { return t.trim(); }).filter(Boolean);
        tagsHtml = tagList.map(function(t) {
          return '<span class="char-tag">' + escapeHtml(t) + '</span>';
        }).join("");
      }
      // genreもタグとして表示
      if (c.genre) {
        var genres = c.genre.split(",").map(function(g) { return g.trim(); }).filter(Boolean);
        genres.forEach(function(g) {
          tagsHtml += '<span class="char-tag">' + escapeHtml(g) + '</span>';
        });
      }

      // セクション組み立て
      var html = '<div class="char-detail">';
      html += '<a href="/scene/" class="char-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>シーン一覧</a>';

      html += '<div class="char-header">';
      html += '<div class="char-avatar">' + avatarHtml + '</div>';
      html += '<div class="char-title"><h1 id="char-name"></h1><div class="char-tags" id="char-tags">' + tagsHtml + '</div></div>';
      html += '</div>';

      if (c.description) {
        html += '<div class="char-section"><h2>説明</h2><p id="char-desc"></p></div>';
      }
      if (c.setting) {
        html += '<div class="char-section"><h2>場面設定</h2><p id="char-setting"></p></div>';
        html += '<div class="char-section"><button class="char-chat-btn" id="chat-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>道具箱に追加</button></div>';
      }


      html += '</div>';

      content.innerHTML = html;

      // セキュアにDOM設定（XSS対策 — textContent使用）
      setText(document.getElementById("char-name"), c.name);
      setText(document.getElementById("char-desc"), c.description);
      setText(document.getElementById("char-setting"), c.setting);
      // 道具箱ボタン (Library本実装)
      setupLibraryButton(c.id, "scene");
    }

    function renderRAG(c) {
      document.title = (c.name || c.title || "RAG") + " - ateney";

      // アバター（キャラと同じく safeAvatarUrl で http(s) のみ許可）
      var avatarHtml = "";
      if (safeAvatarUrl(c.avatar_url || c.image_url)) {
        avatarHtml = '<img class="char-avatar-img" src="' + escapeHtml(c.avatar_url || c.image_url) + '" alt="' + escapeHtml(c.name || c.title || "rag") + '">';
      } else {
        avatarHtml = '<div class="char-avatar-fallback">' + escapeHtml(((c.name || c.title || "?").charAt(0))) + '</div>';
      }

      var html = '<div class="char-detail">';
      html += '<a href="/rag/" class="char-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>RAG一覧</a>';
      html += '<div class="char-header">';
      html += '<div class="char-avatar">' + avatarHtml + '</div>';
      html += '<div class="char-title"><h1 id="char-name"></h1></div>';
      html += '</div>';
      if (c.description) {
        html += '<div class="char-section"><h2>説明</h2><p id="char-desc"></p></div>';
      }
      html += '</div>';
      content.innerHTML = html;

      // 画像読み込み失敗時のフォールバック
      var img = content.querySelector(".char-avatar-img");
      if (img) {
        img.addEventListener("error", function() {
          var wrap = img.parentElement;
          wrap.innerHTML = "";
          var fb = document.createElement("div");
          fb.className = "char-avatar-fallback";
          fb.textContent = (c.name || c.title || "?").charAt(0);
          wrap.appendChild(fb);
        });
      }

      setText(document.getElementById("char-name"), c.name || c.title);
      setText(document.getElementById("char-desc"), c.description);
    }

    async function loadrag(uuid) {
      startLoadingRotation();
      try {
        // /api/rag は認証必須なので、ログイン済みなら Authorization を付ける
        var headers = window.AteneyAuth ? AteneyAuth.getAuthHeaders() : {};
        var res = await fetch(apiBase + "/api/rag/" + uuid, { headers: headers });

        if (res.status === 401) {
          // RAG は認証必須。未ログイン/期限切れならエラー画面でなくログインへ
          stopLoadingRotation();
          location.href = "/login/";
          return;
        }
        if (res.status === 404) {
          stopLoadingRotation();
          showNotFound();
          return;
        }
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        var data = await res.json();
        stopLoadingRotation();
        var r = data.rag || data.document || data;
        renderRAG(r);
      } catch (e) {
        console.error("[ateney] Failed to load rag:", e);
        stopLoadingRotation();
        showError("RAGを読み込めませんでした: " + e.message);
      }
    }

    async function loadCharacter(uuid) {
      startLoadingRotation();
      try {
        var res = await fetch(apiBase + "/api/character/" + uuid);

        if (res.status === 404) {
          stopLoadingRotation();
          showNotFound();
          return;
        }
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        var data = await res.json();
        stopLoadingRotation();
        var c = data.character || data;
        renderCharacter(c);
      } catch (e) {
        console.error("[ateney] Failed to load character:", e);
        stopLoadingRotation();
        showError("キャラクターを読み込めませんでした: " + e.message);
      }
    }
    async function loadscene(uuid) {
      startLoadingRotation();
      try {
        var res = await fetch(apiBase + "/api/scene/" + uuid);

        if (res.status === 404) {
          stopLoadingRotation();
          showNotFound();
          return;
        }
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        var data = await res.json();
        stopLoadingRotation();
        var s = data.scene || data;
        renderscene(s);
      } catch (e) {
        console.error("[ateney] Failed to load scene:", e);
        stopLoadingRotation();
        showError("シーンがしーんとなってました。: " + e.message);
      }
    }

    // =========================
    //  pack 詳細 (/pack/:id/ — 公開packの同梱物展開, Library本実装)
    //  pack_only部品は単体詳細を持たない (SoC) ので、中身はこのページに全展開する
    // =========================
    function renderPack(d) {
      var pk = d.pack || {};
      var ch = d.character;
      var sc = d.scene;
      var rags = d.rags || [];

      document.title = (pk.name || "Pack") + " - ateney";

      var avatarHtml = '<div class="char-avatar-fallback">' + escapeHtml((pk.name || "?").charAt(0)) + '</div>';

      var tagsHtml = "";
      if (pk.tags) {
        pk.tags.split(",").map(function(t){ return t.trim(); }).filter(Boolean).forEach(function(t) {
          tagsHtml += '<span class="char-tag">' + escapeHtml(t) + '</span>';
        });
      }
      if (pk.genre) {
        pk.genre.split(",").map(function(g){ return g.trim(); }).filter(Boolean).forEach(function(g) {
          tagsHtml += '<span class="char-tag">' + escapeHtml(g) + '</span>';
        });
      }

      var html = '<div class="char-detail pk-detail">';
      html += '<a href="/pack/" class="char-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>pack一覧</a>';

      html += '<div class="char-header">';
      html += '<div class="char-avatar">' + avatarHtml + '</div>';
      html += '<div class="char-title"><h1 id="char-name"></h1><div class="char-tags">' + tagsHtml + '</div></div>';
      html += '</div>';

      if (pk.description) {
        html += '<div class="char-section"><h2>説明</h2><p id="char-desc"></p></div>';
      }

      // 同梱キャラ (pack_onlyでもここに全部見える)
      if (ch && ch.id) {
        var chAvatar = safeAvatarUrl(ch.avatar_url)
          ? '<img class="pk-part-avatar" src="' + escapeHtml(ch.avatar_url) + '" alt="' + escapeHtml(ch.name || "character") + '">'
          : '<div class="pk-part-avatar pk-part-fallback">' + escapeHtml((ch.name || "?").charAt(0)) + '</div>';
        html += '<div class="char-section pk-part">';
        html += '<h2>同梱キャラ</h2>';
        html += '<div class="pk-part-head">' + chAvatar + '<h3 class="pk-part-name"></h3></div>';
        html += '<p class="pk-part-body pk-ch-desc"></p>';
        html += '<p class="pk-part-body pk-subtle pk-ch-personality"></p>';
        html += '<p class="pk-part-body pk-greeting pk-ch-greeting"></p>';
        html += '</div>';
      }

      // 同梱シーン
      if (sc && sc.id) {
        html += '<div class="char-section pk-part">';
        html += '<h2>同梱シーン</h2>';
        html += '<h3 class="pk-part-name"></h3>';
        html += '<p class="pk-part-body pk-sc-desc"></p>';
        html += '<p class="pk-part-body pk-subtle pk-sc-setting"></p>';
        html += '</div>';
      }

      // 同梱RAG (最大20, 冒頭500字のexcerpt)
      if (rags.length) {
        html += '<div class="char-section"><h2>同梱RAG (' + rags.length + ')</h2>';
        html += '<ul class="pk-rag-list">';
        rags.forEach(function(r) {
          html += '<li><h4 class="pk-rag-title"></h4><p class="pk-rag-excerpt"></p></li>';
        });
        html += '</ul></div>';
      }

      html += '<div class="char-section"><button class="char-chat-btn" id="chat-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>道具箱に入れる</button></div>';
      html += '</div>';

      content.innerHTML = html;

      setText(document.getElementById("char-name"), pk.name);
      setText(document.getElementById("char-desc"), pk.description);

      // 各パーツを安全にDOM設定 (XSS対策 — textContent)
      var root = content.querySelector(".pk-detail");
      var pkName = root ? root.querySelectorAll(".pk-part-name") : [];
      if (ch && ch.id && pkName.length > 0) {
        setText(pkName[0], ch.name);
        var chBox = root.querySelector(".pk-part");
        setText(chBox.querySelector(".pk-ch-desc"), ch.description);
        setText(chBox.querySelector(".pk-ch-personality"), ch.personality ? "性格: " + ch.personality : "");
        setText(chBox.querySelector(".pk-ch-greeting"), ch.greeting ? "「" + ch.greeting + "」" : "");
      }
      if (sc && sc.id && pkName.length > (ch && ch.id ? 1 : 0)) {
        var scBox = root.querySelectorAll(".pk-part")[ch && ch.id ? 1 : 0];
        if (scBox) {
          setText(scBox.querySelector(".pk-part-name"), sc.name);
          setText(scBox.querySelector(".pk-sc-desc"), sc.description);
          setText(scBox.querySelector(".pk-sc-setting"), sc.setting);
        }
      }
      var ragItems = root ? root.querySelectorAll(".pk-rag-list li") : [];
      rags.forEach(function(r, i) {
        if (!ragItems[i]) return;
        setText(ragItems[i].querySelector(".pk-rag-title"), r.title);
        setText(ragItems[i].querySelector(".pk-rag-excerpt"), r.excerpt);
      });

      // アバター画像の読み込み失敗フォールバック
      var pimg = content.querySelector(".pk-part-avatar");
      if (pimg && pimg.tagName === "IMG") {
        pimg.addEventListener("error", function() {
          var fb = document.createElement("div");
          fb.className = "pk-part-avatar pk-part-fallback";
          fb.textContent = (pk.name || "?").charAt(0);
          pimg.replaceWith(fb);
        });
      }

      // 道具箱ボタン (packは追加系のみ)
      setupLibraryButton(pk.id, "pack");
    }

    async function loadPack(uuid) {
      startLoadingRotation();
      try {
        var res = await fetch(apiBase + "/api/pack/" + uuid);
        if (res.status === 404) { stopLoadingRotation(); showNotFound(); return; }
        if (!res.ok) throw new Error("HTTP " + res.status);
        var data = await res.json();
        stopLoadingRotation();
        renderPack(data);
      } catch (e) {
        console.error("[ateney] Failed to load pack:", e);
        stopLoadingRotation();
        showError("packを読み込めませんでした: " + e.message);
      }
    }

    // ルーティング判定
    function getRoute() {
      var parts =
        window.location.pathname
          .split("/")
          .filter(Boolean);

      return {
        name: parts[0] || null,
        id: parts[1] || null,
      };
    }

    function router() {
      var route = getRoute();

      if (!apiBase) {
        // config.js が読み込めていない環境 (Issue #4: URLはconfig.jsが唯一の発生源)
        document.title = "エラー - ateney";
        content.innerHTML =
          '<div class="error-state">' +
          '<p>設定ファイル (config.js) が読み込めていません。</p>' +
          '<p style="margin-top:16px"><a href="/" style="color:var(--accent);text-decoration:none;font-weight:500">ホームに戻る</a></p>' +
          '</div>';
        return;
      }
    
      var detailLoaders = {
        character: loadCharacter,
        scene: loadscene,
        rag: loadrag,
        pack: loadPack
      };

      if (route.name && route.id && detailLoaders[route.name]) {
        detailLoaders[route.name](route.id);
        return;
      }

      showNotFound();
    }


    /* =========================
       START
    ========================= */

    router();
