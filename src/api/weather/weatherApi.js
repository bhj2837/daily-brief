// ===== 날씨 통신 계층 (강의 7장 Axios) =====
// 실데이터 우선순위(모두 Axios/createHttp 방식으로 호출):
//   1) OpenWeather (VITE_OPENWEATHER_API_KEY 가 있을 때만)
//   2) Open-Meteo  (키 불필요 · CORS OK)
//   3) wttr.in     (키 불필요 · CORS OK · Open-Meteo 실패 시 대체)
//   4) Mock        (모두 실패 시 최종 폴백)
// 덕분에 키가 없거나 특정 무키 API가 한도에 걸려도 날씨가 실시간으로 유지된다.
import { createHttp } from '@/api/http'
import { buildMockCurrent, buildMockForecast, nearestMockCity } from './mockData'
import { findCityById } from './cities'
import { fetchWeatherOM } from './openMeteo'
import { fetchWeatherWttr } from './wttr'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'

const http = createHttp({
  baseURL: BASE,
  params: { appid: API_KEY, units: 'metric', lang: 'kr' },
})

export const hasApiKey = () => Boolean(API_KEY)

// 무키 소스들을 순서대로 시도 → { current, forecast } 반환(모두 실패 시 null)
const KEYLESS_PROVIDERS = [fetchWeatherOM, fetchWeatherWttr]
const fetchKeyless = async (lat, lon, name) => {
  for (const provider of KEYLESS_PROVIDERS) {
    try {
      return await provider(lat, lon, name)
    } catch (e) {
      console.warn(`[weatherApi] 무키 소스 실패(${provider.name}) → 다음 시도:`, e.message)
    }
  }
  return null
}

// ---------- 도시 ID 기반 현재 날씨 ----------
export const fetchCurrentByCity = async (cityId) => {
  const city = findCityById(cityId)
  if (!city) throw new Error(`알 수 없는 도시: ${cityId}`)

  // 1) OpenWeather (키 있을 때만)
  if (API_KEY) {
    try {
      const res = await http.get('/weather', { params: { lat: city.lat, lon: city.lon } })
      return { data: res.data, source: 'api' }
    } catch (e) {
      console.warn('[weatherApi] OpenWeather 실패 → 무키 소스:', e.message)
    }
  }
  // 2·3) Open-Meteo → wttr.in
  const kw = await fetchKeyless(city.lat, city.lon, city.ko)
  if (kw) return { data: kw.current, source: 'api' }
  // 4) Mock
  return { data: buildMockCurrent(city), source: 'mock' }
}

// ---------- 도시 ID 기반 예보 ----------
export const fetchForecastByCity = async (cityId) => {
  const city = findCityById(cityId)
  if (!city) throw new Error(`알 수 없는 도시: ${cityId}`)

  if (API_KEY) {
    try {
      const res = await http.get('/forecast', { params: { lat: city.lat, lon: city.lon } })
      return { data: res.data, source: 'api' }
    } catch (e) {
      console.warn('[weatherApi] OpenWeather forecast 실패 → 무키 소스:', e.message)
    }
  }
  const kw = await fetchKeyless(city.lat, city.lon, city.ko)
  if (kw) return { data: kw.forecast, source: 'api' }
  return { data: buildMockForecast(city), source: 'mock' }
}

// ---------- 좌표 기반 현재 날씨 (현재 위치 자동 감지) ----------
export const fetchCurrentByCoords = async (lat, lon) => {
  const near = nearestMockCity(lat, lon)

  if (API_KEY) {
    try {
      const res = await http.get('/weather', { params: { lat, lon } })
      return { data: res.data, source: 'api', cityId: near.id }
    } catch (e) {
      console.warn('[weatherApi] OpenWeather coords 실패 → 무키 소스:', e.message)
    }
  }
  const kw = await fetchKeyless(lat, lon, near.ko)
  if (kw) return { data: kw.current, source: 'api', cityId: near.id }
  return { data: buildMockCurrent(near), source: 'mock', cityId: near.id }
}
