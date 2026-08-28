// このファイルはビルド時に build.js が生成する。
// リポジトリには .gitignore で config.js を除外し、
// config.template.js のみをコミットする。

window.ATENEY_CONFIG = {
  GOOGLE_CLIENT_ID: __GOOGLE_CLIENT_ID__,
  LINE_CHANNEL_ID: __LINE_CHANNEL_ID__,
  APPLE_CLIENT_ID: __APPLE_CLIENT_ID__,
  MICROSOFT_CLIENT_ID: __MICROSOFT_CLIENT_ID__,

  // Cloudflare Worker のAPIベースURL
  API_BASE: "https://ateney-api.ateney-ai.workers.dev",

  // GitHub PagesのURLに合わせて変更
  REDIRECT_BASE: "https://ateney.github.io",
};