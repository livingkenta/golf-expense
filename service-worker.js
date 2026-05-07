// ゴルフ割り勘 Service Worker
// 役割：オフライン時でもアプリが起動できるよう、必要ファイルをブラウザにキャッシュする。
// データはブラウザのローカル領域（LocalStorage）にのみ保持され、外部送信は一切しない。

// キャッシュ名にバージョンを含める（将来更新するときはここを変える）
const CACHE_NAME = 'golf-expense-v1';

// インストール時にキャッシュしておくファイル一覧
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── インストールイベント ──────────────────────────────────
// SW が初めて登録されたときに呼ばれる。ファイルをキャッシュに入れる。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // 既存の SW を即座に新しい SW に切り替える（待機をスキップ）
  self.skipWaiting();
});

// ── アクティベートイベント ───────────────────────────────
// 新しい SW が有効になったとき、古いキャッシュを削除する。
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  // すべてのタブで即座に新しい SW を有効にする
  self.clients.claim();
});

// ── フェッチイベント（Cache First 戦略） ──────────────────
// リクエストが来たとき、まずキャッシュを確認する。
// キャッシュにあればそちらを返し、なければネットワークから取得する。
// ゴルフ場のように電波が弱い場所でも、キャッシュ済みファイルはすぐ表示できる。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // キャッシュにヒット → そのまま返す
        return cachedResponse;
      }
      // キャッシュにない → ネットワークから取得する
      return fetch(event.request);
    })
  );
});
