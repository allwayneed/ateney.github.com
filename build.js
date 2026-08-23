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

const replacements = {
  __GOOGLE_CLIENT_ID__: process.env.GOOGLE_CLIENT_ID || "",
  __LINE_CHANNEL_ID__:   process.env.LINE_CHANNEL_ID || "",
  __APPLE_CLIENT_ID__:   process.env.APPLE_CLIENT_ID || "",
};

let output = template;
for (const [key, value] of Object.entries(replacements)) {
  output = output.replaceAll(key, JSON.stringify(value));
}

// 値が空文字でも壊れないようにチェック
const emptyKeys = Object.entries(replacements)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (emptyKeys.length > 0) {
  console.warn(`⚠️  WARNING: 以下の環境変数が未設定です: ${emptyKeys.join(", ")}`);
  console.warn("   config.js は生成されますが、該当のOAuthは動作しません。");
}

fs.writeFileSync(outputPath, output, "utf8");
console.log("✅ config.js を生成しました");
