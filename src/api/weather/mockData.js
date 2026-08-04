// ===== Mock 폴백 데이터 =====
// API 키가 없거나 호출이 실패해도 앱이 항상 동작하도록 OpenWeather 응답 형태를 모사한다.
// (강의 p204의 response.data 구조: main.temp, weather[0].description, main.humidity 등)

import { CITIES } from './cities'

// 도시별로 안정적인(랜덤이지만 고정) 값이 나오도록 시드 해시 사용
const seeded = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}

const CONDITIONS = [
  { id: 800, main: 'Clear', description: '맑음', icon: '01d' },
  { id: 801, main: 'Clouds', description: '구름 조금', icon: '02d' },
  { id: 803, main: 'Clouds', description: '흐림', icon: '04d' },
  { id: 500, main: 'Rain', description: '약한 비', icon: '10d' },
  { id: 600, main: 'Snow', description: '눈', icon: '13d' },
  { id: 741, main: 'Fog', description: '안개', icon: '50d' },
]

// 현재 날씨 (OpenWeather current 형태)
export const buildMockCurrent = (city) => {
  const s = seeded(city.en)
  const cond = CONDITIONS[s % CONDITIONS.length]
  const hour = new Date().getHours()
  const base = 12 + (s % 18) // 12~29도
  const dayBoost = hour >= 11 && hour <= 16 ? 3 : hour <= 6 ? -4 : 0
  const temp = base + dayBoost + (hour >= 18 || hour <= 6 ? 0 : 1)
  return {
    _mock: true,
    name: city.ko,
    dt: Math.floor(Date.now() / 1000),
    coord: { lat: city.lat, lon: city.lon },
    weather: [{ id: cond.id, main: cond.main, description: cond.description, icon: cond.icon }],
    main: {
      temp: Math.round(temp * 10) / 10,
      feels_like: Math.round((temp - 1.5) * 10) / 10,
      temp_min: temp - 3,
      temp_max: temp + 3,
      humidity: 40 + (s % 50),
      pressure: 1004 + (s % 20),
    },
    wind: { speed: Math.round((1 + (s % 60) / 10) * 10) / 10, deg: s % 360 },
    visibility: 8000 + (s % 2000),
    sys: { country: 'KR', sunrise: 0, sunset: 0 },
  }
}

// 5일 / 3시간 간격 예보 (OpenWeather forecast의 list 형태 축약)
export const buildMockForecast = (city) => {
  const s = seeded(city.en + 'fc')
  const now = Date.now()
  const list = Array.from({ length: 40 }, (_, i) => {
    const cond = CONDITIONS[(s + i * 3) % CONDITIONS.length]
    const t = 10 + ((s + i * 7) % 20) + Math.sin(i / 4) * 4
    return {
      dt: Math.floor((now + i * 3 * 3600 * 1000) / 1000),
      main: { temp: Math.round(t * 10) / 10, humidity: 40 + ((s + i) % 45) },
      weather: [{ id: cond.id, main: cond.main, description: cond.description, icon: cond.icon }],
      pop: Math.round(((s + i * 5) % 100) / 100 / 1) * 1 * 0.1 * ((i % 10) / 3),
    }
  })
  return { _mock: true, city: { name: city.ko }, list }
}

// 임의 좌표(현재 위치)용 Mock — 가장 가까운 등록 도시로 근사
export const nearestMockCity = (lat, lon) => {
  let best = CITIES[0]
  let bestD = Infinity
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best
}
