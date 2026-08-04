// ===== 날씨/시간대 → 배경 무드 매핑 Composable =====
// 몰입형 컨셉의 핵심. 날씨 상태와 현재 시간대를 조합해 배경 그라디언트(CSS 변수)와
// 파티클 종류(비/눈/맑음)를 결정한다. computed 반응형으로 상태가 바뀌면 배경이 전환된다.

import { computed } from 'vue'

// OpenWeather weather[0].main 값을 대분류로 정규화
const normalize = (main) => {
  const m = String(main || '').toLowerCase()
  if (m.includes('clear')) return 'clear'
  if (m.includes('cloud')) return 'clouds'
  if (m.includes('rain') || m.includes('drizzle')) return 'rain'
  if (m.includes('thunder')) return 'thunder'
  if (m.includes('snow')) return 'snow'
  if (m.includes('fog') || m.includes('mist') || m.includes('haze')) return 'fog'
  return 'clear'
}

const timeBand = (hour) => {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

// [상태][시간대] → [상단색, 하단색]
const PALETTE = {
  clear: {
    dawn: ['#f6b17a', '#7a5c8e'],
    day: ['#4a90d9', '#8ec9f0'],
    dusk: ['#e8703a', '#7d4a8f'],
    night: ['#0f1a3c', '#25366b'],
  },
  clouds: {
    dawn: ['#9aa2b8', '#c2a98f'],
    day: ['#6d84a3', '#a8b9cc'],
    dusk: ['#8a7d92', '#b5865f'],
    night: ['#232838', '#3c4557'],
  },
  rain: {
    dawn: ['#5a6b82', '#3f4d63'],
    day: ['#5c7089', '#7b8ea3'],
    dusk: ['#4a4f66', '#6b5670'],
    night: ['#151b2b', '#2a3242'],
  },
  thunder: {
    dawn: ['#3a3550', '#565073'],
    day: ['#464b66', '#6a6f8c'],
    dusk: ['#332c48', '#4a4363'],
    night: ['#0d0f1f', '#232640'],
  },
  snow: {
    dawn: ['#c8d3e6', '#e7edf6'],
    day: ['#a9c3e0', '#dfeaf7'],
    dusk: ['#a2a7c4', '#cdb9d6'],
    night: ['#26304a', '#48567a'],
  },
  fog: {
    dawn: ['#b3b0ac', '#d3cfc7'],
    day: ['#a7a9ac', '#cfd2d6'],
    dusk: ['#928d94', '#b3a79f'],
    night: ['#2b2d33', '#474a52'],
  },
}

const EMOJI = {
  clear: { day: '☀️', night: '🌙' },
  clouds: { day: '⛅', night: '☁️' },
  rain: { day: '🌧️', night: '🌧️' },
  thunder: { day: '⛈️', night: '⛈️' },
  snow: { day: '❄️', night: '🌨️' },
  fog: { day: '🌫️', night: '🌫️' },
}

// weatherRef: 현재 날씨 객체(ref/computed)를 받아 무드 정보를 계산
export function useWeatherTheme(weatherRef) {
  const kind = computed(() => normalize(weatherRef.value?.weather?.[0]?.main))
  const band = computed(() => timeBand(new Date().getHours()))
  const isNight = computed(() => band.value === 'night' || band.value === 'dawn')

  const colors = computed(() => PALETTE[kind.value]?.[band.value] || PALETTE.clear.day)

  const emoji = computed(() => {
    const set = EMOJI[kind.value] || EMOJI.clear
    return isNight.value ? set.night : set.day
  })

  // 배경 파티클 종류: rain / snow / stars / none
  const particle = computed(() => {
    if (kind.value === 'rain' || kind.value === 'thunder') return 'rain'
    if (kind.value === 'snow') return 'snow'
    if (isNight.value && kind.value === 'clear') return 'stars'
    return 'none'
  })

  return { kind, band, isNight, colors, emoji, particle }
}
