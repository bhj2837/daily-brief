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

// 접두어로 시작하는 실제 단어 목록 (Wiktionary allpages).
// 컴퓨터 AI가 로컬 사전에 없을 때 실제 단어를 이어가기 위해 사용.
const prefixCache = new Map()
export const fetchWordsByPrefix = async (prefix, limit = 60) => {
  const key = String(prefix || '').trim()
  if (!key) return []
  if (prefixCache.has(key)) return prefixCache.get(key)
  try {
    const { data } = await wik.get('/api.php', {
      params: {
        action: 'query',
        list: 'allpages',
        apprefix: key,
        apnamespace: 0,
        aplimit: limit,
        format: 'json',
        origin: '*',
      },
    })
    const pages = data?.query?.allpages || []
    // 순수 한글 2~5글자만(이상한 항목/구문 제외)
    const words = pages.map((p) => p.title).filter((t) => /^[가-힣]{2,5}$/.test(t))
    prefixCache.set(key, words)
    return words
  } catch (e) {
    console.warn('[dict] 접두어 검색 실패:', e.message)
    return []
  }
}
