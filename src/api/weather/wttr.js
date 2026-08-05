// ===== wttr.in 통신 어댑터 (무키 · CORS OK) =====
// Open-Meteo가 사용량 한도 등으로 실패할 때를 대비한 2차 무키 기상 소스.
// 강의 7장 Axios 방식(createHttp 인스턴스 + params + response.data)을 그대로 사용하고,
// 응답을 기존 컴포넌트가 쓰는 OpenWeather 형태로 변환한다.
import { createHttp } from '@/api/http'

const wttr = createHttp({ baseURL: 'https://wttr.in' })

const cache = new Map()
const TTL = 5 * 60 * 1000

// WWO weather_code → OpenWeather 유형(main) + 한국어 설명
const WWO = {
  113: ['Clear', '맑음'],
  116: ['Clouds', '구름 조금'],
  119: ['Clouds', '흐림'],
  122: ['Clouds', '흐림'],
  143: ['Fog', '안개'],
  248: ['Fog', '안개'],
  260: ['Fog', '서리 안개'],
  176: ['Rain', '약한 비'],
  263: ['Drizzle', '약한 이슬비'],
  266: ['Drizzle', '이슬비'],
  281: ['Drizzle', '어는 이슬비'],
  284: ['Drizzle', '강한 어는 이슬비'],
  293: ['Rain', '약한 비'],
  296: ['Rain', '비'],
  299: ['Rain', '비'],
  302: ['Rain', '비'],
  305: ['Rain', '강한 비'],
  308: ['Rain', '강한 비'],
  311: ['Rain', '어는 비'],
  314: ['Rain', '강한 어는 비'],
  353: ['Rain', '약한 소나기'],
  356: ['Rain', '소나기'],
  359: ['Rain', '폭우'],
  185: ['Drizzle', '어는 이슬비'],
  179: ['Snow', '약한 눈'],
  182: ['Snow', '진눈깨비'],
  227: ['Snow', '눈보라'],
  230: ['Snow', '폭설'],
  317: ['Snow', '진눈깨비'],
  320: ['Snow', '진눈깨비'],
  323: ['Snow', '약한 눈'],
  326: ['Snow', '눈'],
  329: ['Snow', '눈'],
  332: ['Snow', '눈'],
  335: ['Snow', '강한 눈'],
  338: ['Snow', '강한 눈'],
  350: ['Snow', '우박'],
  362: ['Snow', '진눈깨비'],
  365: ['Snow', '진눈깨비'],
  368: ['Snow', '약한 눈 소나기'],
  371: ['Snow', '눈 소나기'],
  374: ['Snow', '우박'],
  377: ['Snow', '우박'],
  200: ['Thunderstorm', '뇌우'],
  386: ['Thunderstorm', '뇌우'],
  389: ['Thunderstorm', '강한 뇌우'],
  392: ['Thunderstorm', '뇌우'],
  395: ['Thunderstorm', '강한 뇌우'],
}
const codeInfo = (c) => WWO[Number(c)] || ['Clear', '—']
const num = (v) => (v == null || v === '' ? undefined : Number(v))

// 좌표 기준 현재+예보를 받아 OpenWeather 형태로 변환
export const fetchWeatherWttr = async (lat, lon, name = '') => {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.t < TTL) return hit.data

  const { data } = await wttr.get(`/${lat},${lon}`, { params: { format: 'j1' } })
  const cc = data?.current_condition?.[0]
  const days = data?.weather || []
  if (!cc || !days.length) throw new Error('wttr.in 응답 형식 오류')

  const today = days[0]
  const [cMain, cDesc] = codeInfo(cc.weatherCode)
  const current = {
    _source: 'wttr',
    name,
    dt: Math.floor(Date.now() / 1000),
    coord: { lat, lon },
    weather: [{ id: num(cc.weatherCode), main: cMain, description: cDesc, icon: '' }],
    main: {
      temp: num(cc.temp_C),
      feels_like: num(cc.FeelsLikeC),
      temp_min: num(today.mintempC),
      temp_max: num(today.maxtempC),
      humidity: num(cc.humidity),
      pressure: num(cc.pressure),
    },
    // km/h → m/s
    wind: { speed: Math.round((num(cc.windspeedKmph) / 3.6) * 10) / 10, deg: num(cc.winddirDegree) || 0 },
    visibility: (num(cc.visibility) || 10) * 1000,
    sys: { country: 'KR' },
  }

  // 시간별(3시간 간격 × 최대 3일) → OpenWeather forecast.list 형태
  const list = []
  for (const w of days) {
    for (const h of w.hourly || []) {
      const hour = String(Math.floor(num(h.time) / 100)).padStart(2, '0')
      const dt = Math.floor(new Date(`${w.date}T${hour}:00:00`).getTime() / 1000)
      const [main, desc] = codeInfo(h.weatherCode)
      list.push({
        dt,
        main: { temp: num(h.tempC), humidity: num(h.humidity) },
        weather: [{ id: num(h.weatherCode), main, description: desc }],
        pop: (num(h.chanceofrain) || 0) / 100,
      })
    }
  }
  const forecast = { _source: 'wttr', city: { name }, list }

  const result = { current, forecast }
  cache.set(key, { t: Date.now(), data: result })
  return result
}
