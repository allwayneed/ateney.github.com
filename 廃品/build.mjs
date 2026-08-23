/**
 * ateney - ビルドスクリプト
 * 環境変数からOAuthクライアントIDを読み込んでesbuildのdefineで注入する
 */

import esbuild from 'esbuild';

// 環境変数から各IDを取得（未設定時は空文字）
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';

console.log('Build config:');
console.log(`  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? '✓ set' : '✗ not set'}`);
console.log(`  LINE_CHANNEL_ID:  ${LINE_CHANNEL_ID ? '✓ set' : '✗ not set'}`);
console.log(`  APPLE_CLIENT_ID:  ${APPLE_CLIENT_ID ? '✓ set' : '✗ not set'}`);

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/main.js',
  define: {
    GOOGLE_CLIENT_ID: JSON.stringify(GOOGLE_CLIENT_ID),
    LINE_CHANNEL_ID: JSON.stringify(LINE_CHANNEL_ID),
    APPLE_CLIENT_ID: JSON.stringify(APPLE_CLIENT_ID),
  },
});

console.log('✓ Build complete: dist/main.js');
