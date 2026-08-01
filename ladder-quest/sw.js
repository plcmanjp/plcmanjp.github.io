// Ladder Quest 서비스워커 (S0008).
//
// 빌드 파이프라인을 타지 않는 정적 파일이다. Vite가 자산 파일명에 내용 해시를
// 붙이므로 프리캐시 목록을 여기 하드코딩할 수 없다 — 대신 런타임 캐싱으로 채운다.
//
// 전략은 둘이다.
//   네비게이션(HTML) : network-first — 새 빌드가 다음 접속에서 바로 반영된다
//   그 외 같은 출처 자산 : cache-first — 파일명이 곧 내용이라 캐시가 항상 맞다
//
// 캐시 이름의 버전을 올리면 activate에서 옛 캐시를 전부 지운다.

const CACHE = 'ladder-quest-v1'
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg']

/**
 * 이 HTML이 더는 참조하지 않는 자산을 캐시에서 지운다.
 *
 * 자산 파일명에 내용 해시가 붙어 배포마다 새 이름이 생기는데, 캐시 이름을
 * 그대로 두면 옛 번들이 계속 쌓인다 — `activate`의 정리는 **다른 이름의**
 * 캐시만 지우므로 같은 `CACHE` 안에 쌓이는 것은 건드리지 못한다.
 *
 * 새 HTML을 네트워크에서 받은 순간이 "지금 무엇이 현재인가"를 아는 유일한
 * 시점이라 그때 정리한다. 캐시 폴백으로 옛 HTML을 쓴 경우에는 부르지 않는다 —
 * 그걸로 정리하면 아직 쓰이는 자산을 지운다.
 *
 * 지우는 것은 `assets/` 아래뿐이다. 앱 셸(`index.html`·매니페스트·아이콘)은
 * 해시가 붙지 않아 이름이 그대로이고 HTML에 참조가 없을 수도 있다.
 */
async function pruneStaleAssets(cache, html) {
  const referenced = new Set(Array.from(html.matchAll(/assets\/[\w.-]+/g), (m) => m[0]))
  // 참조를 하나도 못 찾으면 정리하지 않는다. 빈 응답·파싱 실패로 캐시를
  // 통째로 비우는 편보다 조금 쌓이는 편이 낫다.
  if (referenced.size === 0) return

  for (const request of await cache.keys()) {
    const path = new URL(request.url).pathname
    const at = path.indexOf('assets/')
    if (at === -1) continue
    if (!referenced.has(path.slice(at))) await cache.delete(request)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // 셸 중 하나가 실패해도 설치를 막지 않는다. 나머지는 첫 요청에서 채워진다.
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  // 저장·전송 의미가 있는 요청은 건드리지 않는다.
  if (request.method !== 'GET') return

  // 다른 출처는 그대로 통과시킨다. 이 게임은 외부 요청을 하지 않지만,
  // 확장 프로그램 등이 끼어들 때 워커가 개입할 이유가 없다.
  if (new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          // 이 응답이 곧 현재 상태다. 캐시에 넣은 뒤 그것이 참조하지 않는
          // 옛 자산을 같은 자리에서 정리한다.
          const forPrune = response.clone()
          event.waitUntil(
            caches.open(CACHE).then(async (cache) => {
              await cache.put(request, copy)
              await pruneStaleAssets(cache, await forPrune.text())
            }),
          )
          return response
        })
        .catch(() =>
          caches.match(request).then((hit) => hit ?? caches.match('./index.html')),
        ),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit !== undefined) return hit
      return fetch(request).then((response) => {
        // 부분 응답·오류는 캐시하지 않는다. 다음에 다시 받는 편이 낫다.
        if (response.ok && response.status === 200) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
