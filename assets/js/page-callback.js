// ダークモード復元
    try {
      if (localStorage.getItem("ateney-dark") === "1") {
        document.body.classList.add("dark");
      }
    } catch (e) {}

    const statusEl = document.getElementById("status");
    const errorEl = document.getElementById("error");
    const cfg = window.ATENEY_CONFIG || {};
    const redirectBase = cfg.REDIRECT_BASE || window.location.origin;

    /* =========================
       ログユーティリティ（デバッグ時のみconsoleに出す）
       debugモード: URLに ?atdebug 付き or localStorage["ateney-debug"]=="1"
       認証コード等の機微情報を無条件にconsoleへ出さないためのゲート (Issue #10)
    ========================= */
    var DEBUG = false;
    try {
      DEBUG = /[?&]atdebug/.test(window.location.search) || localStorage.getItem("ateney-debug") === "1";
    } catch (e) {}
    function logLine(msg) {
      if (DEBUG) console.log("[ateney callback]", msg);
    }

    function setError(msg) {
      errorEl.textContent = msg;
      statusEl.textContent = "エラーが発生しました";
      console.error("[ateney callback]", msg);
    }

    /* =========================
       認証成功後の共通処理
       Workerから { token, user } が返ってくる
       token (JWT) → auth.js 経由で AES-GCM 暗号化して保存 (localStorageに平文は置かない)
       user        → UI表示に必要な最小限 (name/id/provider) のみ ateney-user に保存
    ========================= */
    async function saveAuthResult(data, provider) {
      // JWT は auth.js (AES-GCM暗号化 + 非抽出可能鍵) で保存する。
      // localStorage に平文トークンを置かない (XSS持ち出し対策)。
      // ユーザー情報は UI 表示に必要な最小限 (name/id/provider) のみ保存する (PII最小化)。
      const u = data.user || {};
      const user = {
        name: u.name || data.name || "",
        id: u.id || data.id || "",
        provider: provider
      };

      try {
        await AteneyAuth.saveAuth(data.token, user);
      } catch (err) {
        setError("ログイン情報の保存に失敗しました: " + err.message);
        return;
      }

      logLine("認証成功: provider=" + provider);
      logLine("JWT保存: " + (!!data.token));

      var providerLabel = { line: "LINE", google: "Google", microsoft: "Microsoft", yahoo: "Yahoo", apple: "Apple" }[provider] || provider;
      statusEl.textContent = providerLabel + "認証完了！リダイレクト中...";
      setTimeout(function() { window.location.href = "/"; }, 1000);
    }

    /* =========================
       URLパラメータ解析
       GET = LINE, Google（response_type=code のリダイレクト）
       Apple は response_mode=form_post のため別途Worker経由が必要
       ========================= */
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);

      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");


      if (error) {
        setError("OAuth error: " + error + " - " + (params.get("error_description") || ""));
        return;
      }

      if (code && state) {
        // どのプロバイダのstateと一致するかで振り分ける
        let provider = null;
        if (state === sessionStorage.getItem("line-state")) provider = "line";
        else if (state === sessionStorage.getItem("google-state")) provider = "google";
        else if (state === sessionStorage.getItem("microsoft-state")) provider = "microsoft";
        else if (state === sessionStorage.getItem("yahoo-state")) provider = "yahoo";
        else if (state === sessionStorage.getItem("apple-state")) provider = "apple";
        if (!provider) {
          setError("state検証失敗: あ！こけた！！お膝擦りむいたぁ！！！");
          return;
        }
        sessionStorage.removeItem(provider + "-state");
        logLine("provider: " + provider);

        const apiBase = cfg.API_BASE || "";
        if (!apiBase) {
          setError("API_BASEが未設定です！開発者が馬鹿なせいで今止まりました！すんません！");
          return;
        }

        const redirectUri = redirectBase + "/callback.html";

        if (provider === "line") {
          statusEl.textContent = "ﾋﾟﾋﾟｯ！認証コード受信。トークン交換中...";

          const verifier = sessionStorage.getItem("line-verifier");
          sessionStorage.removeItem("line-verifier");

          if (!verifier) {
            setError("PKCE verifierが見つかりません。セッションが切れた！ごめん！！！！");
            return;
          }

          try {
            logLine("APIに送信リクエスト開始...");
            statusEl.textContent = "サーバーで認証処理中...";

            const res = await fetch(apiBase + "/login/line", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: code,
                verifier: verifier,
                redirect_uri: redirectUri,
              }),
            });

            if (!res.ok) {
              const errBody = await res.text();
              throw new Error("Worker応答エラー (" + res.status + "): " + errBody);
            }

            const data = await res.json();
            await saveAuthResult(data, "line");
          } catch (err) {
            setError("LINE認証エラー: " + err.message);
          }
        } else if (provider === "google") {
          statusEl.textContent = "Google認証コード受信。トークン交換中...";

          try {
            logLine("Google code → Workerに送信中...");
            statusEl.textContent = "サーバーで認証処理中...";

            // Workerにcode交換を頼む — client_secretはサーバー側で持ってる
            const res = await fetch(apiBase + "/login/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: code,
                redirect_uri: redirectUri,
              }),
            });

            if (!res.ok) {
              const errBody = await res.text();
              throw new Error("Worker応答エラー (" + res.status + "): " + errBody);
            }

            const data = await res.json();
            await saveAuthResult(data, "google");
          } catch (err) {
            setError("Google認証エラー: " + err.message);
          }
        }　else if (provider === "microsoft") {
          statusEl.textContent = "ちょいまち、今怪電波拾ったんだけどw電波電波の怪電波～♪";
          const verifier = sessionStorage.getItem("microsoft-verifier");
          sessionStorage.removeItem("microsoft-verifier");
          
          if (!verifier) {
            setError("待って、PKCEが壊れてんだけど！何やってんだ開発者ぁ！！！！！");
            return;
          }
          try {
            logLine("APIに送信リクエスト開始...");
            statusEl.textContent = "サーバーで認証処理中...";

            const res = await fetch(apiBase + "/login/microsoft", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: code,
                verifier: verifier,
                redirect_uri: redirectUri,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error("API応答エラー (" + res.status + "): " + errBody);
            }
            const data = await res.json();
            await saveAuthResult(data, "microsoft");
          } catch (err) {
            setError("エラー出たぁ！バ〇ルドームも出たぁ！！！: " + err.message);
          }
        } else if (provider === "yahoo") {
          statusEl.textContent = "yahoo! hahha! oh!!!!!"
          // PKCEいらないんだぜ。yahoo,私の気分も、yahoooooo!!!!
          try {
            logLine("APIに送信リクエスト開始...");
            statusEl.textContent = "サーバーで認証処理中...";

            const res = await fetch(apiBase + "/login/yahoo", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: code,
                redirect_uri: redirectUri,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error("API応答エラー (" + res.status + "): " + errBody);
            }
            const data = await res.json();
            await saveAuthResult(data, "yahoo");
          } catch (err) {
            setError("エラー出たぁ！バ〇ルドームも出たぁ！！！: " + err.message);
          }
        } else if (provider === "apple") {
          statusEl.textContent = "Apple認証コード受信。トークン交換中...";

          try {
            statusEl.textContent = "サーバーで認証処理中...";
            // Issue #2: query 方式に切り替えたので、他プロバイダと同じ窓口で受けられる。
            // Worker側の /login/apple はまだ未実装。実装されたらこの呼び出しで動く。
            const res = await fetch(apiBase + "/login/apple", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: code,
                redirect_uri: redirectUri,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error("Worker応答エラー (" + res.status + "): " + errBody);
            }
            const data = await res.json();
            await saveAuthResult(data, "apple");
          } catch (err) {
            setError("Apple認証エラー: " + err.message);
          }
        }

        return;
      }

      setError("不明なコールバック、なんかあると思ったら大間違い！ただ受け取る場所だからな。悪用できないで～");
      setTimeout(function() { window.location.href = "/"; }, 5000);
    }

    handleCallback().catch(function(err) { setError(err.message); });
