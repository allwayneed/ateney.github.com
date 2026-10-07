(async function () {
      "use strict";

      var cfg = window.ATENEY_CONFIG || {};
      var apiBase = cfg.API_BASE || "";

      // auth.js の復号完了を待つ (isLoggedIn はメモリ上のトークン依存)
      if (window.AteneyAuth && AteneyAuth.ready) {
        try { await AteneyAuth.ready; } catch (e) {}
      }

      var loggedIn = !!(window.AteneyAuth && AteneyAuth.isLoggedIn());
      var user = (window.AteneyAuth && AteneyAuth.getUser()) || {};

      var PROVIDERS = {
        line: "LINE",
        google: "Google",
        microsoft: "Microsoft",
        yahoo: "Yahoo! JAPAN",
        apple: "Apple",
      };

      var guestCard = document.getElementById("guestCard");
      var accountCard = document.getElementById("accountCard");

      if (!loggedIn) {
        guestCard.hidden = false;
        return;
      }

      accountCard.hidden = false;

      // 動的値はすべて textContent (XSS対策。innerHTMLには静的構造のみ)
      document.getElementById("userName").textContent = user.name || "ユーザー";
      document.getElementById("userId").textContent = user.id || "";
      var providerLabel = PROVIDERS[user.provider] || (user.provider || "不明");
      document.getElementById("providerBadge").textContent = providerLabel;
      document.getElementById("providerText").textContent = providerLabel;

      // 作品数 (APIのpagination.total。limit=1で総数だけ安く取る)
      if (apiBase) {
        var headers = AteneyAuth.getAuthHeaders();
        [
          ["character", "charCount", "charTile"],
          ["scene", "sceneCount", "sceneTile"],
          ["rag", "ragCount", "ragTile"],
        ].forEach(function (pair) {
          var type = pair[0], numId = pair[1], tileId = pair[2];
          fetch(apiBase + "/api/me/" + type + "?limit=1", { headers: headers })
            .then(function (res) {
              if (!res.ok) throw new Error("HTTP " + res.status);
              return res.json();
            })
            .then(function (data) {
              var total = data.pagination ? data.pagination.total : null;
              document.getElementById(numId).textContent =
                typeof total === "number" ? String(total) : "—";
              document.getElementById(tileId).classList.remove("loading");
            })
            .catch(function () {
              document.getElementById(numId).textContent = "—";
              document.getElementById(tileId).classList.remove("loading");
            });
        });
      } else {
        ["charCount", "sceneCount", "ragCount"].forEach(function (id) {
          document.getElementById(id).textContent = "—";
        });
      }

      // ログアウト (common.js のドロップダウンと同一処理)
      document.getElementById("accountLogoutBtn").addEventListener("click", function () {
        if (window.AteneyAuth) {
          AteneyAuth.logout();
        } else {
          localStorage.removeItem("ateney-user");
          localStorage.removeItem("ateney-token");
          localStorage.removeItem("ateney-token-v2");
        }
        window.location.href = "/login/";
      });
    })();
