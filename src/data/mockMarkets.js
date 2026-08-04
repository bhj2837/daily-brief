// ===== 마켓 Mock 데이터 =====
// 증시(Finnhub 등)는 무료 키 필요/제한이 있어 기본 Mock을 제공한다.
// 환율/코인 API가 실패할 때의 폴백 값도 함께 정의. (통합 스키마와 동일 형태)
// 스파크라인은 시드 기반의 결정적(재현 가능) 흔들림으로 생성한다.

// 시드 흔들림 스파크라인 생성기 (24포인트)
const spark = (seed, base, vol = 0.02) => {
  let h = seed
  const out = []
  let v = base
  for (let i = 0; i < 24; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    const r = (h / 0x7fffffff - 0.5) * 2
    v = v * (1 + r * vol)
    out.push(Math.round(v * 100) / 100)
  }
  return out
}

// ---- 증시 (기본 Mock) ----
export const MOCK_STOCKS = [
  { id: 'kospi', label: 'KOSPI', name: '코스피', value: 2712.4, change: 0.45, spark: spark(11, 2712, 0.006) },
  { id: 'kosdaq', label: 'KOSDAQ', name: '코스닥', value: 861.2, change: -0.32, spark: spark(23, 861, 0.008) },
  { id: 'spx', label: 'S&P 500', name: 'S&P 500', value: 5487.0, change: 0.28, spark: spark(37, 5487, 0.005) },
  { id: 'ndx', label: 'NASDAQ', name: '나스닥', value: 17842.5, change: 0.61, spark: spark(41, 17842, 0.007) },
  { id: 'nikkei', label: 'Nikkei', name: '닛케이', value: 38210.3, change: -0.18, spark: spark(53, 38210, 0.006) },
]

// ---- 환율 폴백 ----
export const MOCK_RATES = [
  { id: 'krw', label: 'USD/KRW', name: '원', value: 1378.2, change: -0.32, spark: spark(61, 1378, 0.004) },
  { id: 'jpy', label: 'USD/JPY', name: '엔', value: 156.9, change: 0.11, spark: spark(67, 156.9, 0.003) },
  { id: 'eur', label: 'USD/EUR', name: '유로', value: 0.867, change: -0.08, spark: spark(71, 0.867, 0.003) },
]

// ---- 코인 폴백 ----
export const MOCK_CRYPTO = [
  { id: 'btc', label: 'BTC', name: 'Bitcoin', value: 63410, change: 1.84, spark: spark(83, 63410, 0.01) },
  { id: 'eth', label: 'ETH', name: 'Ethereum', value: 3120, change: 0.62, spark: spark(89, 3120, 0.012) },
  { id: 'sol', label: 'SOL', name: 'Solana', value: 146.2, change: 2.1, spark: spark(97, 146, 0.015) },
  { id: 'xrp', label: 'XRP', name: 'XRP', value: 1.07, change: 0.5, spark: spark(101, 1.07, 0.012) },
]
