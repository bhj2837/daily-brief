// ===== 한국어 단어 검증 (Wiktionary Open API) =====
// 로컬 사전에 없는 실제 단어를 온라인으로 확인한다. 키 불필요 · CORS 허용(origin=*).
// 존재하는 단어는 pageid를 반환하고, 없는 단어는 missing 플래그가 붙는다.
import { createHttp } from './http'

const wik = createHttp({ baseURL: 'https://ko.wiktionary.org/w' })

// 간단한 메모리 캐시(같은 단어 반복 조회 방지)
const cache = new Map()

// 반환: true(존재) | false(없음) | 'unknown'(네트워크 실패)
export const verifyKoreanWord = async (word) => {
  const key = String(word || '').trim()
  if (!key) return false
  if (cache.has(key)) return cache.get(key)
  try {
    const { data } = await wik.get('/api.php', {
      params: { action: 'query', titles: key, format: 'json', origin: '*' },
    })
    const pages = data?.query?.pages || {}
    const exists = Object.values(pages).some((p) => !('missing' in p))
    cache.set(key, exists)
    return exists
  } catch (e) {
    console.warn('[dict] 온라인 검증 실패:', e.message)
    return 'unknown'
  }
}
