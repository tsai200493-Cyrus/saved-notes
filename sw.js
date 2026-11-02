// 離線快取（加到主畫面後，收訊差也打得開看過的內容）。m05 會把這個檔複製到 site/。
// 圖片 i/*.bin 檔名＝內容雜湊、永遠不會變 → 先用快取；網頁本體會更新 → 先上網抓最新的，抓不到才用快取
// 快取裡存的都是加密過的檔案，跟網站上的一樣，沒有密碼還是看不到
const CACHE = 'saved-notes-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/i/')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
