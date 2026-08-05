// ===== Open-Meteo 통신 어댑터 (무키 · CORS OK · 항상 실데이터) =====
// OpenWeather 키가 없어도 실시간 날씨가 동작하도록 Open-Meteo를 붙인다.
// 응답을 기존 컴포넌트가 소비하는 OpenWeather 형태로 변환해 나머지 코드 변경을 없앤다.
import { createHttp } from '@/api/http'

const om = createHttp({ baseURL: 'https://api.open-meteo.com/v1' })

// 동일 좌표 중복 호출 방지용 짧은 캐시(현재+예보를 한 번의 호출로 공유)
const cache = new Map()
const TTL = 5 * 60 * 1000

// WMO weather_code → OpenWeather 유형(main) + 한국어 설명
const WMO = {
  0: { main: 'Clear', description: '맑음' },
  1: { main: 'Clear', description: '대체로 맑음' },
  2: { main: 'Clouds', description: '구름 조금' },
  3: { main: 'Clouds', description: '흐림' },
  45: { main: 'Fog', description: '안개' },
  48: { main: 'Fog', description: '서리 안개' },
  51: { main: 'Drizzle', description: '약한 이슬비' },
  53: { main: 'Drizzle', description: '이슬비' },
  55: { main: 'Drizzle', description: '강한 이슬비' },
  56: { main: 'Drizzle', description: '어는 이슬비' },
  57: { main: 'Drizzle', description: '강한 어는 이슬비' },
  61: { main: 'Rain', description: '약한 비' },
  63: { main: 'Rain', description: '비' },
  65: { main: 'Rain', description: '강한 비' },
  66: { main: 'Rain', description: '어는 비' },
  67: { main: 'Rain', description: '강한 어는 비' },
  71: { main: 'Snow', description: '약한 눈' },
  73: { main: 'Snow', description: '눈' },
  75: { main: 'Snow', description: '강한 눈' },
  77: { main: 'Snow', description: '싸락눈' },
  80: { main: 'Rain', description: '약한 소나기' },
  81: { main: 'Rain', description: '소나기' },
  82: { main: 'Rain', description: '강한 소나기' },
  85: { main: 'Snow', description: '약한 눈 소나기' },
  86: { main: 'Snow', description: '강한 눈 소나기' },
  95: { main: 'Thunderstorm', description: '뇌우' },
  96: { main: 'Thunderstorm', description: '우박 동반 뇌우' },
  99: { main: 'Thunderstorm', description: '강한 우박 뇌우' },
}
const codeInfo = (c) => WMO[c] || { main: 'Clear', description: '—' }
const secs = (iso) => {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? Math.floor(Date.now() / 1000) : Math.floor(t / 1000)
}

// 좌표 기준 현재+예보를 한 번에 받아 OpenWeather 형태로 변환
export const fetchWeatherOM = async (lat, lon, name = '') => {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.t < TTL) return hit.data

  const { data } = await om.get('/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure',
      hourly: 'temperature_2m,relative_humidity_2m,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: 5,
      wind_speed_unit: 'ms',
    },
  })
  // Open-Meteo는 오류를 200 + { error:true } 로 반환할 수 있음
  if (!data || data.error) throw new Error(data?.reason || 'open-meteo 응답 오류')

  const cur = data.current || {}
  const day = data.daily || {}
  const ci = codeInfo(cur.weather_code)
  const current = {
    _source: 'openmeteo',
    name,
    dt: secs(cur.time),
    coord: { lat, lon },
    weather: [{ id: cur.weather_code, main: ci.main, description: ci.description, icon: '' }],
    main: {
      temp: cur.temperature_2m,
      feels_like: cur.apparent_temperature,
      temp_min: day.temperature_2m_min?.[0] ?? cur.temperature_2m,
      temp_max: day.temperature_2m_max?.[0] ?? cur.temperature_2m,
      humidity: cur.relative_humidity_2m,
      pressure: Math.round(cur.surface_pressure ?? 0),
    },
    wind: { speed: cur.wind_speed_10m, deg: 0 },
    visibility: 10000,
    sys: { country: 'KR' },
  }

  const h = data.hourly || {}
  const list = (h.time || []).map((t, i) => {
    const info = codeInfo(h.weather_code?.[i])
    return {
      dt: secs(t),
      main: { temp: h.temperature_2m?.[i], humidity: h.relative_humidity_2m?.[i] ?? 0 },
      weather: [{ id: h.weather_code?.[i], main: info.main, description: info.description }],
      pop: 0,
    }
  })
  const forecast = { _source: 'openmeteo', city: { name }, list }

  const result = { current, forecast }
  cache.set(key, { t: Date.now(), data: result })
  return result
}
