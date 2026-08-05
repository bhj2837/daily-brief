// ===== 마켓 통신 계층 (강의 7장 Axios · 9장 Promise.all) =====
//   - 환율 : Frankfurter timeseries (무키 · CORS OK) → 최신값 + 일간변동 + 스파크라인
//   - 코인 : CoinGecko /coins/markets (무키 · CORS OK) → 가격 + 24h변동 + 스파크라인
//   - 증시 : 기본 Mock (Finnhub 등은 키 필요)
// 통합 마켓 스키마:
//   { id, label, name, value(number), display(string), change(number), spark:number[], isLive }
import { createHttp } from './http'
import { cachedRequest } from './cache'
import { MOCK_STOCKS, MOCK_RATES, MOCK_CRYPTO } from '@/data/mockMarkets'

// 시세 캐시 유효 시간 — 무키 공개 API의 호출 한도(429)를 넘기지 않도록 1분간 재사용
const QUOTE_TTL = 60 * 1000

const fx = createHttp({ baseURL: 'https://api.frankfurter.dev/v1' })
const cg = createHttp({ baseURL: 'https://api.coingecko.com/api/v3' })

// 증시: Finnhub (키 있을 때만 실데이터). 무료플랜에서 확실히 동작하는 미국 상장 ETF로
// 주요 지수를 대리 표현한다(지수 직접 조회는 유료). 키가 없으면 Mock 폴백.
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const fh = createHttp({ baseURL: 'https://finnhub.io/api/v1' })
const STOCK_SYMBOLS = [
  { id: 'spy', label: 'S&P 500', name: 'S&P 500 ETF(SPY)', symbol: 'SPY' },
  { id: 'qqq', label: 'NASDAQ 100', name: '나스닥100 ETF(QQQ)', symbol: 'QQQ' },
  { id: 'dia', label: '다우', name: '다우존스 ETF(DIA)', symbol: 'DIA' },
  { id: 'ewy', label: '한국(KOSPI)', name: 'MSCI 한국 ETF(EWY)', symbol: 'EWY' },
]

// ---- 표시용 숫자 포맷 ----
export const fmtNum = (v) => {
  if (v == null || Number.isNaN(v)) return '--'
  if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (v >= 1) return v.toFixed(2)
  return v.toFixed(4)
}
const withDisplay = (row, prefix = '') => ({ ...row, display: prefix + fmtNum(row.value) })

// 배열을 ~24포인트로 다운샘플
const downsample = (arr, n = 24) => {
  if (!arr?.length) return []
  if (arr.length <= n) return arr
  const step = arr.length / n
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)])
}

// ---------- 환율 (Frankfurter) ----------
const FX_SYMBOLS = [
  { sym: 'KRW', label: 'USD/KRW', name: '원' },
  { sym: 'JPY', label: 'USD/JPY', name: '엔' },
  { sym: 'EUR', label: 'USD/EUR', name: '유로' },
  { sym: 'GBP', label: 'USD/GBP', name: '파운드' },
  { sym: 'CNY', label: 'USD/CNY', name: '위안' },
]

const ymd = (d) => d.toISOString().slice(0, 10)

const loadRates = async () => {
  try {
    const end = new Date()
    const start = new Date(end.getTime() - 12 * 86400000) // 최근 ~12일(주말 제외 대비)
    const symbols = FX_SYMBOLS.map((s) => s.sym).join(',')
    const { data } = await fx.get(`/${ymd(start)}..${ymd(end)}`, {
      params: { base: 'USD', symbols },
    })
    const dates = Object.keys(data.rates || {}).sort()
    const rows = FX_SYMBOLS.map(({ sym, label, name }) => {
      const series = dates.map((d) => data.rates[d]?.[sym]).filter((v) => v != null)
      const value = series[series.length - 1]
      const prev = series[series.length - 2] ?? value
      const change = prev ? ((value - prev) / prev) * 100 : 0
      return withDisplay({
        id: sym.toLowerCase(),
        label,
        name,
        value,
        change,
        spark: downsample(series),
        isLive: true,
      })
    })
    return { data: rows, source: 'api' }
  } catch (e) {
    console.warn('[markets] 환율 폴백:', e.message)
    return { data: MOCK_RATES.map((r) => withDisplay({ ...r, isLive: false })), source: 'mock' }
  }
}

// ---------- 코인 (CoinGecko) ----------
const COINS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin']
const SYMBOL_KO = { btc: 'BTC', eth: 'ETH', sol: 'SOL', xrp: 'XRP', doge: 'DOGE' }

const loadCrypto = async () => {
  try {
    const { data } = await cg.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: COINS.join(','),
        order: 'market_cap_desc',
        sparkline: true,
        price_change_percentage: '24h',
      },
    })
    // 레이트리밋 시 CoinGecko가 배열 대신 에러 객체를 200으로 반환할 수 있음 → 폴백
    if (!Array.isArray(data)) throw new Error('CoinGecko 응답 형식 오류(레이트리밋 가능)')
    const rows = data.map((c) => {
      const sym = c.symbol.toLowerCase()
      return withDisplay(
        {
          id: sym,
          label: SYMBOL_KO[sym] || c.symbol.toUpperCase(),
          name: c.name,
          value: c.current_price,
          change: c.price_change_percentage_24h ?? 0,
          spark: downsample(c.sparkline_in_7d?.price || []),
          isLive: true,
        },
        '$',
      )
    })
    return { data: rows, source: 'api' }
  } catch (e) {
    console.warn('[markets] 코인 폴백:', e.message)
    return {
      data: MOCK_CRYPTO.map((r) => withDisplay({ ...r, isLive: false }, '$')),
      source: 'mock',
    }
  }
}

// ---------- 증시 (기본 Mock) ----------
const loadStocks = async () => {
  // 키가 있으면 Finnhub 실데이터, 없거나 실패하면 Mock 폴백
  if (FINNHUB_KEY) {
    try {
      const quotes = await Promise.all(
        STOCK_SYMBOLS.map((s) =>
          fh
            .get('/quote', { params: { symbol: s.symbol, token: FINNHUB_KEY } })
            .then((r) => ({ s, q: r.data }))
            .catch(() => ({ s, q: null })),
        ),
      )
      const rows = quotes
        .filter(({ q }) => q && typeof q.c === 'number' && q.c > 0)
        .map(({ s, q }) =>
          withDisplay(
            {
              id: s.id,
              label: s.label,
              name: s.name,
              value: q.c,
              change: q.dp ?? 0,
              // Finnhub 무료플랜은 캔들(시계열)이 유료라 전일종가→시가→현재가로 간이 추세선 구성
              spark: [q.pc, q.o, q.c].filter((v) => typeof v === 'number' && v > 0),
              isLive: true,
            },
            '$',
          ),
        )
      if (rows.length) return { data: rows, source: 'api' }
    } catch (e) {
      console.warn('[markets] 증시 폴백:', e.message)
    }
  }
  return { data: MOCK_STOCKS.map((r) => withDisplay({ ...r, isLive: false })), source: 'mock' }
}

// ---------- 공개 API 진입점 (요청 캐시 적용) ----------
// 마켓 목록 ↔ 종목 상세를 오갈 때마다 같은 API를 다시 부르지 않도록 1분간 결과를 재사용한다.
// 응답이 오기 전에 들어온 동일 요청은 같은 Promise를 공유해 네트워크가 한 번만 나간다.
export const fetchRates = () => cachedRequest('markets:rates', QUOTE_TTL, loadRates)
export const fetchCrypto = () => cachedRequest('markets:crypto', QUOTE_TTL, loadCrypto)
export const fetchStocks = () => cachedRequest('markets:stocks', QUOTE_TTL, loadStocks)

// ---------- 요약(티커/홈용): 병렬 로딩 후 대표 항목 추림 ----------
// 상단 티커(App)와 홈 요약이 거의 동시에 호출하지만, 아래 3개 fetch가 이미 캐시를 공유한다.
export const fetchMarketSummary = () =>
  cachedRequest('markets:summary', QUOTE_TTL, async () => {
    // 강의 9장 Promise.all: 세 섹션 병렬 로딩
    const [rates, crypto, stocks] = await Promise.all([fetchRates(), fetchCrypto(), fetchStocks()])
    const pick = (res, n) => res.data.slice(0, n)
    const items = [...pick(rates, 3), ...pick(crypto, 3), ...pick(stocks, 2)].map((r) => ({
      label: r.label,
      value: r.display,
      change: r.change,
    }))
    const allLive = rates.source === 'api' && crypto.source === 'api'
    return { items, source: allLive ? 'api' : 'mock' }
  })
