/**
 * ateney - API クライアント
 * メインコンテンツをAPIから取得する
 */

const API_BASE = 'http://localhost:3000/api';

export interface ApiResponse {
  // APIのレスポンス構造に合わせて拡張してく
  [key: string]: unknown;
}

/**
 * メインコンテンツを取得
 */
export async function fetchMainContent(): Promise<ApiResponse | null> {
  try {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as ApiResponse;
  } catch (err) {
    console.error('[ateney] API取得に失敗:', err);
    return null;
  }
}

/**
 * APIのベースURLを変更したい場合はここを書き換える
 * または環境変数などで上書きできるように拡張してもいい
 */
export function setApiBase(url: string): void {
  // 実行時にベースURLを上書きしたい場合用
  // apiBase = url;  // 必要になったら有効化
  console.warn(`[ateney] setApiBase: ${url} (まだ未実装)`);
}
