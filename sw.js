/* Retro Tracker service worker – offline support.
 * SHELL cache (versioned, rebuilt on every release): index.html, manifest, icons, fonts, all JS libs incl. TF.js + WASM, hls.js, face-api.
 * MODELS cache (rt-models-v1, kept across releases): model/ emodel/ facemodel/ – cache-first, filled on the first successful load
 *   or by the in-app "POBIERZ MODELE OFFLINE" button. Everything the AI needs runs locally, so cached models => AI works offline.
 * AI-runtime cache (rt-ai-v1, kept across releases, filled on first use of the chat): lib/webllm/ + lib/wllama/ (≈14 MB of JS/WASM for the local AI chat). The AI *weights* are NOT here:
 *   WebLLM keeps them in the Cache API ('webllm/*'), wllama in OPFS — both written by the library after the user's explicit consent, and never touched by this worker (cross-origin goes straight through).
 * Update flow: a new version installs in the background and WAITS; the app shows "NOWA WERSJA — DOTKNIJ, BY ODŚWIEŻYĆ" and sends SKIP_WAITING. */
const VERSION = 'v6-4b4e5085';
const SHELL = 'rt-shell-' + VERSION, MODELS = 'rt-models-v1', AIRT = 'rt-ai-v1';
const PRECACHE = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png',
  'fonts/pxiKyp0ihIEF2isQFJXUdVNFKPY.woff2', 'fonts/pxiKyp0ihIEF2isRFJXUdVNFKPY.woff2', 'fonts/pxiKyp0ihIEF2isfFJXUdVNF.woff2',
  'lib/face-api.js', 'lib/hls.min.js', 'sounds/ai-terminal.wav',
  'lib/tf/tf.min.js', 'lib/tf/tf-backend-wasm.min.js', 'lib/tf/coco-ssd.min.js',
  'lib/tf/tfjs-backend-wasm.wasm', 'lib/tf/tfjs-backend-wasm-simd.wasm', 'lib/tf/tfjs-backend-wasm-threaded-simd.wasm'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })))));   // no skipWaiting: the app decides when to switch
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if ((k.startsWith('rt-shell-') && k !== SHELL) || (k.startsWith('rt-models-') && k !== MODELS)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
async function modelFetch(req) {
  const c = await caches.open(MODELS), hit = await c.match(req.url);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok && r.status === 200) c.put(req.url, r.clone()).catch(() => {});
  return r;
}
async function aiFetch(req) {
  const c = await caches.open(AIRT), hit = await c.match(req.url);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok && r.status === 200) c.put(req.url, r.clone()).catch(() => {});
  return r;
}
async function shellFetch(req) {
  const c = await caches.open(SHELL);
  let hit = await c.match(req, { ignoreSearch: true });
  if (!hit && req.mode === 'navigate') hit = await c.match('index.html');
  if (hit) return hit;
  try { return await fetch(req); } catch (e) { return new Response('offline', { status: 503, statusText: 'offline' }); }
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;     // streams / other origins go straight to the network
  const sc = new URL(self.registration.scope); if (!url.pathname.startsWith(sc.pathname)) return;
  const rel = url.pathname.slice(sc.pathname.length);
  if (/^(model|emodel|facemodel)\//.test(rel)) e.respondWith(modelFetch(req));
  else if (/^lib\/(webllm|wllama)\//.test(rel)) e.respondWith(aiFetch(req));
  else e.respondWith(shellFetch(req));
});
