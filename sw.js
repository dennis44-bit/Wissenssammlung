/* Hält die App-Dateien offline vor. Die Notizen selbst liegen auf dem
   Speicher-Server und werden hier bewusst NICHT zwischengespeichert. */
var CACHE = "themengebiete-v2";
var DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) { return n !== CACHE; })
                              .map(function (n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  /* alles Fremde (Schriften, der Speicher-Server) direkt durchreichen */
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        var kopie = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
        return r;
      })
      .catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
  );
});
