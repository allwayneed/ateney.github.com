/**
 * auth.js — ateney 認証情報の安全な保存 (トークン保存の硬化)
 *
 * 脅威モデル:
 *   このサイトは静的ホスティング (GitHub Pages) のため HttpOnly Cookie が使えず、
 *   従来は JWT が localStorage に平文で置かれていた。XSS 1本でトークンが
 *   丸ごと窃取・持ち出せる状態だった。
 *
 *   このモジュールは JWT を AES-GCM で暗号化して保存し、暗号鍵は
 *   IndexedDB に 非抽出可能 (extractable: false) な CryptoKey として置く。
 *   鍵は JS から export できないため、localStorage を丸ごと盗んでも
 *   トークンの平文は復元できない。
 *
 *   誠実な注意: 実行中のページに寄生したXSSはメモリ上のトークンや
 *   このモジュールの API を使って「その場で」ユーザーになりすますことは防げない
 *   (同一オリジンのJSは全て信頼されるというブラウザのモデルなので)。
 *   この対策が封じるのは「トークンを持ち出して後から使い回す」経路。
 *   持ち出し (exfiltration) を封じることで、被害が「開いていたタブの間」に
 *   縮小され、セッション切断後の乗っ取りはできなくなる。
 *
 *   平文保存がどうしても許容できない場合は Worker 側で HttpOnly Cookie に
 *   移行するのが正解 (ateney-api 側の作業)。
 *
 * 使い方:
 *   <script src="/auth.js"></script> を全ページの共通シェルより前に置く。
 *   - 保存:      await AteneyAuth.saveAuth(token, user)
 *   - API呼び出し: AteneyAuth.getAuthHeaders()  (同期, メモリ上のトークンから)
 *   - ログイン判定: AteneyAuth.isLoggedIn() / AteneyAuth.getUser()
 *   - 初期化完了: await AteneyAuth.ready  (復号が終わる前にAPIを叩きたい場合は待つ)
 */
(function () {
  "use strict";

  var LS_TOKEN = "ateney-token-v2";   // 暗号化済みトークン
  var LS_USER  = "ateney-user";        // UI表示用の最小限のユーザー情報 (機密ではなく平文)
  var LEGACY_TOKEN = "ateney-token";   // 旧平文トークン (移行後に削除)
  var DB_NAME = "ateney-auth", STORE = "keys", KEY_ID = "token-key";

  var memToken = null; // 復号済みトークンはメモリにのみ置く
  var memUser = null;

  var storageOk = (function () {
    try { localStorage.setItem("ateney-test", "1"); localStorage.removeItem("ateney-test"); return true; }
    catch (e) { return false; }
  })();

  /* ---------- IndexedDB: 非抽出可能な CryptoKey の保存場所 ---------- */

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("IndexedDB open failed")); };
    });
  }

  function getKey() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(KEY_ID);
        req.onsuccess = function () {
          if (req.result) { resolve(req.result); return; }
          // 鍵が無ければ生成する。extractable: false で JS からは絶対に export できない。
          crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
            .then(function (key) {
              var tx2 = db.transaction(STORE, "readwrite");
              tx2.objectStore(STORE).put(key, KEY_ID);
              tx2.oncomplete = function () { resolve(key); };
              tx2.onerror = function () { reject(tx2.error); };
            })
            .catch(reject);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  /* ---------- 暗号化ヘルパ (base64url系ではなく通常base64でOK, 暗号文だから) ---------- */

  function toB64(buf) {
    var bytes = new Uint8Array(buf);
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function fromB64(str) {
    var bin = atob(str);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function encryptText(key, plain) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var data = new TextEncoder().encode(plain);
    return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data).then(function (ct) {
      return "v1." + toB64(iv) + "." + toB64(ct);
    });
  }

  function decryptText(key, blob) {
    var parts = blob.split(".");
    if (parts[0] !== "v1" || parts.length !== 3) return Promise.reject(new Error("bad token blob"));
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(parts[1]) }, key, fromB64(parts[2]))
      .then(function (pt) { return new TextDecoder().decode(pt); });
  }

  /* ---------- 保存 / 読み込み ---------- */

  function encryptAndStore(key, token) {
    return encryptText(key, token).then(function (blob) {
      localStorage.setItem(LS_TOKEN, blob);
    });
  }

  function saveAuth(token, user) {
    memToken = token || null;
    memUser = user || null;

    if (!storageOk) {
      console.warn("[ateney auth] localStorage が使えないため、ログイン状態はこのタブだけで有効です");
      return Promise.resolve();
    }

    // UI 表示に必要な最小限の情報のみ保存する (PII最小化)
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify({
        name: user.name || "",
        id: user.id || "",
        provider: user.provider || ""
      }));
    } else {
      localStorage.removeItem(LS_USER);
    }

    if (!token) return Promise.resolve();

    return getKey().then(function (key) {
      return encryptAndStore(key, token);
    });
  }

  function logout() {
    memToken = null;
    memUser = null;
    if (!storageOk) return;
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    // 旧キーが残っていれば掃除
    localStorage.removeItem(LEGACY_TOKEN);
  }

  /* ---------- 初期化: 旧平文トークンの移行 + 復号 ---------- */

  var ready = (function () {
    // UI表示用ユーザー情報は平文で持っているので同期で復元
    try { memUser = JSON.parse(localStorage.getItem(LS_USER) || "null"); } catch (e) { memUser = null; }

    if (!storageOk) return Promise.resolve();

    var legacy = localStorage.getItem(LEGACY_TOKEN);
    if (legacy) {
      // 旧平文トークンが残っている環境 (このPRより前のログイン) → 暗号化して移行し、平文は消す
      return getKey()
        .then(function (key) { return encryptAndStore(key, legacy); })
        .then(function () { localStorage.removeItem(LEGACY_TOKEN); })
        .then(function () { return decryptStored(); })
        .catch(function (e) {
          console.warn("[ateney auth] トークン移行に失敗しました。再ログインが必要です:", e);
          logout();
        });
    }

    return decryptStored().catch(function (e) {
      console.warn("[ateney auth] 保存されたトークンの復号に失敗しました。再ログインしてください。", e);
      logout();
    });
  })();

  function decryptStored() {
    var blob = localStorage.getItem(LS_TOKEN);
    if (!blob) return Promise.resolve();
    return getKey().then(function (key) {
      return decryptText(key, blob).then(function (token) { memToken = token; });
    });
  }

  // 公開API (同期で呼べるものはメモリから返す)
  window.AteneyAuth = {
    ready: ready,
    saveAuth: saveAuth,
    logout: logout,
    getToken: function () { return memToken; },
    getUser: function () { return memUser; },
    isLoggedIn: function () { return !!memToken; },
    /** APIのAuthorizationヘッダ。トークンが無い場合は空オブジェクトを返す。 */
    getAuthHeaders: function () {
      return memToken ? { "Authorization": "Bearer " + memToken } : {};
    }
  };
})();
