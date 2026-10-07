/* ダークモードFOUC防止 — 描画前にbodyへクラスを付与 (実体はcommon.js) */
    try { if (localStorage.getItem("ateney-dark") === "1") document.body.classList.add("dark"); } catch (e) {}
