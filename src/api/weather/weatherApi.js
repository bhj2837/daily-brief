// ===== 날씨 통신 계층 =====
// 실데이터 우선순위:
//   1) OpenWeather (VITE_OPENWEATHER_API_KEY 가 있을 때만)
//   2) Open-Meteo  (키 불필요 · CORS OK · 기본 실데이터 소스)
//   3) Mock        (네트워크 실패 시 최종 폴백)
// 덕분에 키가 없어도 날씨가 항상 실시간으로 동작한다.
import { createHttp } from '@/api/http'
import { buildMockCurrent, buildMockForecast, nearestMockCity } from './mockData'
import { findCityById } from './cities'
import { fetchWeatherOM } from './openMeteo'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'

const http = createHttp({
  baseURL: BASE,
  params: { appid: API_KEY, units: 'metric', lang: 'kr' },
})

export const hasApiKey = () => Boolean(API_KEY)

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
      console.warn('[weatherApi] OpenWeather 실패 → Open-Meteo:', e.message)
    }
  }
  // 2) Open-Meteo (무키 실데이터)
  try {
    const { current } = await fetchWeatherOM(city.lat, city.lon, city.ko)
    return { data: current, source: 'api' }
  } catch (e) {
    console.warn('[weatherApi] Open-Meteo 실패 → mock:', e.message)
  }
  // 3) Mock
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
      console.warn('[weatherApi] OpenWeather forecast 실패 → Open-Meteo:', e.message)
    }
  }
  try {
    const { forecast } = await fetchWeatherOM(city.lat, city.lon, city.ko)
    return { data: forecast, source: 'api' }
  } catch (e) {
    console.warn('[weatherApi] Open-Meteo forecast 실패 → mock:', e.message)
  }
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
      console.warn('[weatherApi] OpenWeather coords 실패 → Open-Meteo:', e.message)
    }
  }
  try {
    const { current } = await fetchWeatherOM(lat, lon, near.ko)
    return { data: current, source: 'api', cityId: near.id }
  } catch (e) {
    console.warn('[weatherApi] Open-Meteo coords 실패 → mock:', e.message)
  }
  return { data: buildMockCurrent(near), source: 'mock', cityId: near.id }
}
