const CACHE = "spider-misha-v5";
const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
  "./characters_separated/01_standing.png", "./characters_separated/02_walking.png",
  "./characters_separated/03_running.png", "./characters_separated/04_celebrating.png",
  "./characters_separated/05_thinking.png", "./characters_separated/06_clapping.png",
  "./characters_separated/07_sad.png", "./characters_separated/08_sitting_crying.png",
  "./characters_separated/09_sneezing.png", "./characters_separated/10_surprised.png",
  "./characters_separated/11_pointing.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    return (await caches.match(request)) || (await caches.match("./index.html"));
  }
}
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(event.request.mode === "navigate" ? networkFirst(event.request) : cacheFirst(event.request));
});
