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

export const fetchGeneralNews = async () => {
  // 실 키(GNews/NewsData/Guardian)가 있으면 여기서 실데이터로 대체 가능. 기본은 Mock.
  return { data: MOCK_GENERAL.map(mapMock), source: 'mock' }
}

export const findMockNews = (rawId) => {
  const m = MOCK_GENERAL.find((x) => x.rawId === rawId)
  return m ? mapMock(m) : null
}

// ---------- 카테고리 디스패치 ----------
export const fetchNewsByCategory = (category, limit) => {
  if (category === 'space') return fetchSpaceNews(limit)
  if (category === 'general') return fetchGeneralNews()
  return fetchTechNews(limit)
}
