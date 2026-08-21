// ===== FLサーバー状態（公開エンドポイント、認証不要） =====
export async function getFlStatus(): Promise<{ fl_server_url: string; fl_auth_token: string | null; fl_token_required: boolean }> {
  // 公開エンドポイントなので直接fetch（認証ヘッダー不要）
  const res = await fetch(`${API_BASE}/fl/status`);
  if (!res.ok) return { fl_server_url: 'offline', fl_auth_token: null, fl_token_required: true };
  return res.json();
}
