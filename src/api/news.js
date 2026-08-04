// ===== 뉴스 통신 계층 (강의 7장 Axios · 9장 Promise.all) =====
// 3개 카테고리를 통합 스키마로 정규화한다.
//   - tech    : Hacker News   (무키 · CORS OK · 항상 실데이터)
//   - space   : Spaceflight News (무키 · CORS OK · 항상 실데이터)
//   - general : 한국 종합뉴스   (키 필요/CORS 이슈 → 기본 Mock 폴백)
// 통합 기사 스키마:
//   { id, category, source, sourceLabel, isLive, title, url, image,
//     summary, author, score, comments, at(ms) }
import { createHttp } from './http'
import { MOCK_GENERAL } from '@/data/mockNews'

const hn = createHttp({ baseURL: 'https://hacker-news.firebaseio.com/v0' })
const sf = createHttp({ baseURL: 'https://api.spaceflightnewsapi.net/v4' })

// 종합뉴스: GNews (키 있을 때만 실데이터, 없으면 Mock)
const GNEWS_KEY = import.meta.env.VITE_GNEWS_API_KEY
const gn = createHttp({ baseURL: 'https://gnews.io/api/v4' })
// 목록→상세 조회를 위한 세션 캐시(GNews는 id별 조회 엔드포인트가 없음)
const gnewsCache = new Map()
const hashUrl = (u) => {
  let h = 0
  const str = String(u)
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff
  return h.toString(36)
}

// ---------- Hacker News ----------
const mapHn = (item) => ({
  id: `hn-${item.id}`,
  rawId: String(item.id),
  category: 'tech',
  source: 'hackernews',
  sourceLabel: 'Hacker News',
  isLive: true,
  title: item.title,
  url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
  image: null,
  summary: item.text ? stripHtml(item.text) : '',
  author: item.by,
  score: item.score,
  comments: item.descendants ?? 0,
  at: (item.time || 0) * 1000,
  kids: item.kids || [],
})

const stripHtml = (s) =>
  String(s || '')
    .replace(/<\s*\/?p\s*>/gi, '\n\n')
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')

export const fetchTechNews = async (limit = 20) => {
  try {
    const { data: ids } = await hn.get('/topstories.json')
    const top = (ids || []).slice(0, limit)
    const items = await Promise.all(
      top.map((id) => hn.get(`/item/${id}.json`).then((r) => r.data).catch(() => null)),
    )
    const list = items.filter(Boolean).map(mapHn)
    return { data: list, source: 'api' }
  } catch (e) {
    console.warn('[news] tech 폴백:', e.message)
    return { data: mockFrom(MOCK_GENERAL, 'tech'), source: 'mock' }
  }
}

export const fetchHnItem = async (rawId) => {
  const { data } = await hn.get(`/item/${rawId}.json`)
  return mapHn(data)
}

// 상세용: 최상위 댓글 몇 개 로딩
export const fetchHnComments = async (kids = [], limit = 6) => {
  const ids = kids.slice(0, limit)
  const items = await Promise.all(
    ids.map((id) => hn.get(`/item/${id}.json`).then((r) => r.data).catch(() => null)),
  )
  return items
    .filter((c) => c && !c.deleted && !c.dead && c.text)
    .map((c) => ({ id: c.id, author: c.by, text: stripHtml(c.text), at: (c.time || 0) * 1000 }))
}

// ---------- Spaceflight News ----------
const mapSf = (a) => ({
  id: `sf-${a.id}`,
  rawId: String(a.id),
  category: 'space',
  source: 'spaceflight',
  sourceLabel: a.news_site || 'Spaceflight News',
  isLive: true,
  title: a.title,
  url: a.url,
  image: a.image_url || null,
  summary: (a.summary || '').trim(),
  author: a.authors?.[0]?.name || a.news_site,
  score: null,
  comments: null,
  at: a.published_at ? new Date(a.published_at).getTime() : Date.now(),
})

export const fetchSpaceNews = async (limit = 20) => {
  try {
    const { data } = await sf.get('/articles/', { params: { limit } })
    return { data: (data.results || []).map(mapSf), source: 'api' }
  } catch (e) {
    console.warn('[news] space 폴백:', e.message)
    return { data: mockFrom(MOCK_GENERAL, 'space'), source: 'mock' }
  }
}

export const fetchSfItem = async (rawId) => {
  const { data } = await sf.get(`/articles/${rawId}/`)
  return mapSf(data)
}

// ---------- 종합(Mock 기본) ----------
const mapMock = (m) => ({
  id: `mock-${m.rawId}`,
  rawId: m.rawId,
  category: 'general',
  source: 'mock',
  sourceLabel: '종합뉴스',
  isLive: false,
  title: m.title,
  url: null,
  image: null,
  summary: m.summary,
  body: m.body,
  author: m.author,
  score: null,
  comments: null,
  at: m.at,
})

const mockFrom = (arr, category) => arr.map((m) => ({ ...mapMock(m), category }))

const mapGnews = (a) => {
  const id = `gnews-${hashUrl(a.url)}`
  const row = {
    id,
    rawId: id.slice(6),
    category: 'general',
    source: 'gnews',
    sourceLabel: a.source?.name || 'GNews',
    isLive: true,
    title: a.title,
    url: a.url,
    image: a.image || null,
    summary: a.description || '',
    // GNews 무료플랜은 본문이 일부만 제공됨(끝의 "[123 chars]" 표시 제거)
    body: a.content ? [String(a.content).replace(/\s*\[\d+\s*chars\]\s*$/, '…')] : null,
    author: a.source?.name,
    score: null,
    comments: null,
    at: a.publishedAt ? new Date(a.publishedAt).getTime() : Date.now(),
  }
  gnewsCache.set(id, row)
  return row
}

export const fetchGeneralNews = async () => {
  // 키가 있으면 GNews 실데이터, 없거나 실패하면 Mock 폴백
  if (GNEWS_KEY) {
    try {
      const { data } = await gn.get('/top-headlines', {
        params: { category: 'general', lang: 'ko', country: 'kr', max: 20, apikey: GNEWS_KEY },
      })
      const arts = data?.articles || []
      if (arts.length) return { data: arts.map(mapGnews), source: 'api' }
    } catch (e) {
      console.warn('[news] 종합 폴백:', e.message)
    }
  }
  return { data: MOCK_GENERAL.map(mapMock), source: 'mock' }
}

export const findMockNews = (rawId) => {
  const m = MOCK_GENERAL.find((x) => x.rawId === rawId)
  return m ? mapMock(m) : null
}

// GNews 상세: 세션 캐시에 없으면 목록을 다시 받아 채운 뒤 반환
export const findGnewsNews = async (id) => {
  if (!gnewsCache.has(id)) await fetchGeneralNews()
  return gnewsCache.get(id) || null
}

// ---------- 카테고리 디스패치 ----------
export const fetchNewsByCategory = (category, limit) => {
  if (category === 'space') return fetchSpaceNews(limit)
  if (category === 'general') return fetchGeneralNews()
  return fetchTechNews(limit)
}
