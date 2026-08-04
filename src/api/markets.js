// ===== 마켓 통신 계층 (강의 7장 Axios · 9장 Promise.all) =====
//   - 환율 : Frankfurter timeseries (무키 · CORS OK) → 최신값 + 일간변동 + 스파크라인
//   - 코인 : CoinGecko /coins/markets (무키 · CORS OK) → 가격 + 24h변동 + 스파크라인
//   - 증시 : 기본 Mock (Finnhub 등은 키 필요)
// 통합 마켓 스키마:
//   { id, label, name, value(number), display(string), change(number), spark:number[], isLive }
import { createHttp } from './http'
import { MOCK_STOCKS, MOCK_RATES, MOCK_CRYPTO } from '@/data/mockMarkets'

const fx = createHttp({ baseURL: 'https://api.frankfurter.dev/v1' })
const cg = createHttp({ baseURL: 'https://api.coingecko.com/api/v3' })

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

export const fetchRates = async () => {
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
      return withDisplay({ id: sym.toLowerCase(), label, name, value, change, spark: downsample(series), isLive: true })
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

export const fetchCrypto = async () => {
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
    return { data: MOCK_CRYPTO.map((r) => withDisplay({ ...r, isLive: false }, '$')), source: 'mock' }
  }
}

// ---------- 증시 (기본 Mock) ----------
export const fetchStocks = async () => {
  // 실 키(Finnhub 등)가 있으면 여기서 실데이터로 대체 가능. 기본은 Mock.
  return { data: MOCK_STOCKS.map((r) => withDisplay({ ...r, isLive: false })), source: 'mock' }
}

// ---------- 요약(티커/홈용): 병렬 로딩 후 대표 항목 추림 ----------
export const fetchMarketSummary = async () => {
  const [rates, crypto, stocks] = await Promise.all([fetchRates(), fetchCrypto(), fetchStocks()])
  const pick = (res, n) => res.data.slice(0, n)
  const items = [...pick(rates, 3), ...pick(crypto, 3), ...pick(stocks, 2)].map((r) => ({
    label: r.label,
    value: r.display,
    change: r.change,
  }))
  const allLive = rates.source === 'api' && crypto.source === 'api'
  return { items, source: allLive ? 'api' : 'mock' }
}
