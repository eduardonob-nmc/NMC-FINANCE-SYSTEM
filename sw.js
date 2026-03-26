/* ══════════════════════════════════════════════════════
   NMC Personal Finance System — Service Worker v20
   Nobrega Mall Consultant
══════════════════════════════════════════════════════ */

const CACHE_NAME = 'nmc-finance-v20';

// Recursos essenciais para funcionar offline
const ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // Fontes e libs externas (serão cacheadas na primeira visita)
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

// ── Instalação: pré-cache dos assets essenciais ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache o index.html e manifest obrigatoriamente
      return cache.addAll(['./index.html', './manifest.json']).then(() => {
        // Tenta cachear os demais (falha silenciosa se offline)
        return Promise.allSettled(
          ASSETS.slice(2).map(url =>
            cache.add(url).catch(() => null)
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Ativação: limpa caches antigas ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first para assets, Network-first para API ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requisições para API Anthropic: sempre network (nunca cachear)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Requisições GET: cache-first com fallback network
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Cacheia respostas válidas de origens confiáveis
          if (
            response.ok &&
            (url.origin === self.location.origin ||
             url.hostname.includes('googleapis.com') ||
             url.hostname.includes('cloudflare.com') ||
             url.hostname.includes('gstatic.com'))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Offline e não cacheado: retorna o index.html (SPA fallback)
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
