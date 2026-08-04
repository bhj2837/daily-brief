/* Daily Brief 서비스워커 — 앱 셸 프리캐시 + 런타임 전략
   base 하위 경로(GitHub Pages 등)에서도 동작하도록 상대경로/scope 기반으로 작성.
   - 정적 자산: 캐시 우선(cache-first)
   - 페이지 이동(navigate): 네트워크 우선 + 오프라인 시 캐시된 셸 폴백
   - API 요청: 항상 네트워크(캐시하지 않음)
*/
const VERSION = 'db-v2'
// self.registration.scope 기준 상대경로 → 루트/하위 경로 모두 대응
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // 외부 API/도메인은 관여하지 않음(항상 네트워크)
  if (url.origin !== self.location.origin) return

  // 페이지 이동: 네트워크 우선, 실패 시 캐시된 셸(scope 기준 index.html)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match(new URL('./index.html', self.registration.scope)).then(
          (r) => r || caches.match(new URL('./', self.registration.scope)),
        ),
      ),
    )
    return
  }

  // 정적 자산: 캐시 우선 + 백그라운드 갱신
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(VERSION).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
