// ===== 요청 캐시 · 중복 요청 병합 (강의 7장 Axios 계층 심화) =====
//
// 해결하려는 문제
//   1) 중복 호출  : 홈에서 loadCity('seoul')과 미니 그리드가 서울 날씨를 거의 동시에 요청한다.
//   2) 반복 호출  : 마켓 목록 → 종목 상세 → 뒤로가기를 반복하면 같은 API를 계속 다시 부른다.
//   3) 호출량 제한: CoinGecko·Open-Meteo 같은 무키 공개 API는 분·일 단위 호출 한도가 있어
//                  위 두 상황이 겹치면 429(Too Many Requests)로 화면이 샘플로 떨어질 수 있다.
//
// 해결 방식
//   결과가 아니라 **Promise 자체를 캐시**한다. 그래서 아직 응답이 오지 않은 사이에 들어온
//   동일 요청도 같은 Promise를 받아 네트워크는 한 번만 나간다(in-flight 병합).
//   폴백(mock)으로 내려온 응답은 캐시에 남기지 않아, 다음 시도에 실서버를 다시 두드린다.

const store = new Map()

/**
 * @param {string}   key    캐시 키 (예: 'weather:current:seoul')
 * @param {number}   ttl    유효 시간(ms)
 * @param {Function} loader 실제 요청을 수행하는 함수 → Promise<{ source?: string }>
 */
export function cachedRequest(key, ttl, loader) {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttl) return hit.promise

  const promise = loader()
    .then((res) => {
      // 빈 응답·샘플 폴백은 캐시하지 않는다 (다음 호출에서 실데이터를 다시 시도)
      if (res == null || res.source === 'mock') store.delete(key)
      return res
    })
    .catch((err) => {
      store.delete(key)
      throw err
    })

  store.set(key, { at: Date.now(), promise })
  return promise
}

// 수동 무효화 (예: 사용자가 새로고침 버튼을 누를 때)
export function invalidate(prefix = '') {
  if (!prefix) return store.clear()
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
