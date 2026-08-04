// ===== 날씨 데이터 로딩 Composable =====
// 도시 하나의 현재 날씨 + 예보 로딩 로직을 캡슐화한다. (강의 7장 Axios 패턴 재사용 + 심화)
// 컴포넌트는 상태만 구독하고, fetch/loading/error 처리는 여기서 일원화한다.

import { ref, shallowRef } from 'vue'
import { fetchCurrentByCity, fetchForecastByCity, fetchCurrentByCoords } from '@/api/weather/weatherApi'

export function useWeather() {
  const current = shallowRef(null)
  const forecast = shallowRef(null)
  const isLoading = ref(false)
  const error = ref(null)
  const source = ref(null) // 'api' | 'mock'
  const activeCityId = ref(null)

  const loadCity = async (cityId, { withForecast = true } = {}) => {
    isLoading.value = true
    error.value = null
    activeCityId.value = cityId
    try {
      const cur = await fetchCurrentByCity(cityId)
      current.value = cur.data
      source.value = cur.source
      if (withForecast) {
        const fc = await fetchForecastByCity(cityId)
        forecast.value = fc.data
      }
    } catch (e) {
      error.value = e.message || '날씨를 불러오지 못했습니다.'
    } finally {
      isLoading.value = false
    }
  }

  const loadByCoords = async (lat, lon) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetchCurrentByCoords(lat, lon)
      current.value = res.data
      source.value = res.source
      activeCityId.value = res.cityId
      const fc = await fetchForecastByCity(res.cityId)
      forecast.value = fc.data
      return res.cityId
    } catch (e) {
      error.value = e.message || '현재 위치 날씨를 불러오지 못했습니다.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { current, forecast, isLoading, error, source, activeCityId, loadCity, loadByCoords }
}
