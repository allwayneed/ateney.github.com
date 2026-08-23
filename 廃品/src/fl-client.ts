/**
 * fl-client.ts — ブラウザ上で動く連合学習クライアント
 * TensorFlow.js でアダプタのローカル学習を行い、FLサーバーとWebSocket通信する
 */

// @ts-ignore — CDNから読み込み
declare const tf: any;

export type FlStatus = {
  connected: boolean;
  connecting: boolean;
  backend: string;
  clientId: string;
  rank: string;
  role: string;
  rounds: number;
  lossHistory: number[];
  lastLoss: number | null;
  banned: boolean;
  banRemaining: number;
  log: string[];
};

export type FlConfig = {
  serverUrl: string;
  authToken: string;
};

const HIDDEN = 8;
let W1: any = null, b1: any = null, W2: any = null, b2: any = null;
let EMBED_DIM: number | null = null;
let ws: WebSocket | null = null;
let clientId: string;
let status: FlStatus = {
  connected: false, connecting: false, backend: '...',
  clientId: '', rank: '-', role: '-', rounds: 0,
  lossHistory: [], lastLoss: null, banned: false, banRemaining: 0, log: [],
};
let onStatusChange: ((s: FlStatus) => void) | null = null;

function getOrCreateClientId(): string {
  let id = localStorage.getItem('fedClientId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('fedClientId', id);
  }
  return id;
}

export function initFlClient(callback?: (s: FlStatus) => void): void {
  clientId = getOrCreateClientId();
  status.clientId = clientId;
  onStatusChange = callback ?? null;
  callback?.(status);
}

function updateStatus(patch: Partial<FlStatus>): void {
  status = { ...status, ...patch };
  onStatusChange?.(status);
}

function log(msg: string): void {
  const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
  status.log = [...status.log.slice(-49), entry];
  updateStatus({ log: status.log });
}

async function setupBackend(): Promise<string> {
  try {
    await tf.setBackend('webgpu');
    await tf.ready();
  } catch {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
    } catch {
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }
  return tf.getBackend();
}

function initAdapter(embedDim: number, weights?: any): void {
  if (W1) { W1.dispose(); b1.dispose(); W2.dispose(); b2.dispose(); }
  EMBED_DIM = embedDim;
  if (weights) {
    W1 = tf.variable(tf.tensor(weights.W1, [EMBED_DIM, HIDDEN]));
    b1 = tf.variable(tf.tensor(weights.b1, [HIDDEN]));
    W2 = tf.variable(tf.tensor(weights.W2, [HIDDEN, 1]));
    b2 = tf.variable(tf.tensor(weights.b2, [1]));
  } else {
    W1 = tf.variable(tf.randomNormal([EMBED_DIM, HIDDEN], 0, 0.05));
    b1 = tf.variable(tf.zeros([HIDDEN]));
    W2 = tf.variable(tf.randomNormal([HIDDEN, 1], 0, 0.05));
    b2 = tf.variable(tf.zeros([1]));
  }
}

function adapterForward(x: any): any {
  const h = tf.relu(tf.add(tf.matMul(x, W1), b1));
  return tf.add(tf.matMul(h, W2), b2);
}

async function localTrain(features: number[], targets: number[], steps = 30, lr = 0.05): Promise<number> {
  const x = tf.tensor(features, [features.length, EMBED_DIM!]);
  const y = tf.tensor(targets, [targets.length, 1]);
  let lastLoss = 0;
  const optimizer = tf.train.adam(lr);
  for (let step = 0; step < steps; step++) {
    optimizer.minimize(() => {
      const pred = adapterForward(x);
      const loss = tf.losses.meanSquaredError(y, pred);
      lastLoss = loss.dataSync()[0];
      return loss;
    }, true, [W1, b1, W2, b2]);
  }
  x.dispose(); y.dispose();
  return lastLoss;
}

function exportWeights(): any {
  return {
    W1: Array.from(W1.dataSync()),
    b1: Array.from(b1.dataSync()),
    W2: Array.from(W2.dataSync()),
    b2: Array.from(b2.dataSync()),
  };
}

export async function connectFl(config: FlConfig): Promise<void> {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  updateStatus({ connecting: true, log: [] });
  log('TensorFlow.js バックエンド初期化中...');

  const backend = await setupBackend();
  log(`バックエンド: ${backend}`);
  updateStatus({ backend });

  log(`サーバーに接続中: ${config.serverUrl}`);
  ws = new WebSocket(config.serverUrl);

  ws.onopen = () => {
    log('接続成功 — 認証送信中...');
    updateStatus({ connected: true, connecting: false });
    ws!.send(JSON.stringify({
      type: 'hello', id: clientId, kind: 'worker', token: config.authToken
    }));
  };

  ws.onclose = (e: CloseEvent) => {
    if (e.code === 4002) log('認証失敗: トークンが正しくありません');
    else if (e.code === 4003) log('接続拒否: 許可されていないIPです');
    else log(`切断 (code=${e.code})`);
    updateStatus({ connected: false, connecting: false, rank: '-', role: '-' });
    ws = null;
  };

  ws.onerror = () => log('接続エラー');

  ws.onmessage = async (event: MessageEvent) => {
    const msg = JSON.parse(event.data);

    if (msg.type === 'hello_ack') {
      log(`認証成功 — ランク: ${msg.rank}, ロール: ${msg.role}`);
      updateStatus({ rank: msg.rank, role: msg.role, banned: false });
      return;
    }

    if (msg.type === 'banned') {
      log(`ワーカー資格停止中 (残り${msg.remaining_seconds}秒)`);
      updateStatus({ banned: true, banRemaining: msg.remaining_seconds, rank: 'F' });
      return;
    }

    if (msg.type === 'round') {
      log(`ラウンド ${msg.round} 受信 (${msg.features.length}件, dim=${msg.embed_dim})`);
      initAdapter(msg.embed_dim, msg.global_weights);
      const loss = await localTrain(msg.features, msg.targets);
      const updated = exportWeights();
      ws!.send(JSON.stringify({
        type: 'update', weights: updated, n: msg.features.length, loss
      }));
      status.rounds++;
      status.lossHistory = [...status.lossHistory.slice(-19), loss];
      log(`重み送信完了 — loss=${loss.toFixed(4)} (累計${status.rounds}ラウンド)`);
      updateStatus({
        rounds: status.rounds,
        lossHistory: status.lossHistory,
        lastLoss: loss,
      });
      return;
    }

    if (msg.type === 'infer') {
      log(`推論リクエスト受信`);
      if (!W1) initAdapter(msg.embed_dim, msg.global_weights || null);
      const x = tf.tensor(msg.features, [msg.features.length, EMBED_DIM!]);
      const pred = adapterForward(x);
      const value = pred.dataSync()[0];
      x.dispose(); pred.dispose();
      ws!.send(JSON.stringify({ type: 'infer_result', value }));
      log(`推論結果送信: ${value.toFixed(4)}`);
      return;
    }

    if (msg.type === 'error') {
      log(`[エラー] ${msg.message}`);
      return;
    }
  };
}

export function disconnectFl(): void {
  if (ws) {
    ws.close();
    ws = null;
  }
  updateStatus({ connected: false, connecting: false, rank: '-', role: '-' });
  log('手動切断');
}

export function getFlStatus(): FlStatus {
  return status;
}
