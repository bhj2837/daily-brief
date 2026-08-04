// ===== 뉴스 로딩 Composable (강의 심화: Composable 리팩터링) =====
// 카테고리별 목록 로딩과 로딩/에러/출처(source) 상태를 캡슐화한다.
// 컴포넌트는 상태만 구독하고 fetch/폴백 처리는 여기서 일원화.
import { ref, shallowRef } from 'vue'
import { fetchNewsByCategory } from '@/api/news'

export function useNews() {
  const articles = shallowRef([])
  const isLoading = ref(false)
  const error = ref(null)
  const source = ref(null) // 'api' | 'mock'
  const category = ref('tech')

  const load = async (cat = 'tech', limit = 20) => {
    category.value = cat
    isLoading.value = true
    error.value = null
    try {
      const res = await fetchNewsByCategory(cat, limit)
      articles.value = res.data
      source.value = res.source
    } catch (e) {
      error.value = e.message || '뉴스를 불러오지 못했습니다.'
      articles.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { articles, isLoading, error, source, category, load }
}
