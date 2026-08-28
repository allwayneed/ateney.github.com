/**
 * build.js
 * GitHub Actions内で実行され、config.template.js の
 * プレースホルダを環境変数（Secrets）で置換して config.js を生成する。
 *
 * package.json に:
 *   "scripts": { "build": "node build.js" }
 * を追加すれば、ワークフローの `npm run build` で動く。
 */

const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, "config.template.js");
const outputPath = path.join(__dirname, "config.js");

const template = fs.readFileSync(templatePath, "utf8");

const envMap = {
  __GOOGLE_CLIENT_ID__: { env: "GOOGLE_CLIENT_ID", name: "GOOGLE_CLIENT_ID" },
  __LINE_CHANNEL_ID__:   { env: "LINE_CHANNEL_ID",   name: "LINE_CHANNEL_ID" },
  __APPLE_CLIENT_ID__:   { env: "APPLE_CLIENT_ID",   name: "APPLE_CLIENT_ID" },
  __MICROSOFT_CLIENT_ID__: { env: "MICROSOFT_CLIENT_ID", name: "MICROSOFT_CLIENT_ID" },
  __YAHOO_CLIENT_ID__: { env: "YAHOO_CLIENT_ID", name: "YAHOO_CLIENT_ID" },
};

let output = template;
const missing = [];

for (const [key, { env, name }] of Object.entries(envMap)) {
  const value = process.env[env] || "";
  if (!value) missing.push(name);
  output = output.replaceAll(key, JSON.stringify(value));
}

if (missing.length > 0) {
  console.warn(`⚠️  WARNING: 以下の環境変数が未設定です: ${missing.join(", ")}`);
  console.warn("   config.js は生成されますが、該当のOAuthは動作しません。");
}

fs.writeFileSync(outputPath, output, "utf8");
console.log("✅ config.js を生成しました");
