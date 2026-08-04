// ===== 마켓 로딩 Composable (강의 심화: Composable 리팩터링) =====
// 환율·코인·증시 3개 섹션을 각각 로딩/에러/출처 상태로 관리하고, 병렬 로딩한다.
import { reactive } from 'vue'
import { fetchRates, fetchCrypto, fetchStocks } from '@/api/markets'

export function useMarkets() {
  const make = () => ({ data: [], loading: false, error: null, source: null })
  const sections = reactive({
    rates: make(),
    crypto: make(),
    stocks: make(),
  })

  const loaders = { rates: fetchRates, crypto: fetchCrypto, stocks: fetchStocks }

  const loadOne = async (key) => {
    const sec = sections[key]
    sec.loading = true
    sec.error = null
    try {
      const res = await loaders[key]()
      sec.data = res.data
      sec.source = res.source
    } catch (e) {
      sec.error = e.message || '불러오지 못했습니다.'
    } finally {
      sec.loading = false
    }
  }

  // 강의 9장 Promise.all: 세 섹션 병렬 로딩
  const loadAll = () => Promise.all(Object.keys(loaders).map(loadOne))

  return { sections, loadOne, loadAll }
}
