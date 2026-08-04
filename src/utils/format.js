// 공통 포맷/매핑 유틸

const EMOJI_BY_MAIN = {
  Clear: '☀️',
  Clouds: '⛅',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
  Smoke: '🌫️',
}

export const weatherEmoji = (main) => EMOJI_BY_MAIN[main] || '🌡️'

// UNIX(초) → "오후 3시" 스타일
export const hourLabel = (dtSeconds) => {
  const d = new Date(dtSeconds * 1000)
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${h12}시`
}

// UNIX(초) → 요일
export const dayLabel = (dtSeconds) => {
  const d = new Date(dtSeconds * 1000)
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
}

export const dateKey = (dtSeconds) => {
  const d = new Date(dtSeconds * 1000)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// UNIX(ms) → "3시간 전" 상대 시간 (뉴스/마켓 공용)
export const timeAgo = (ms) => {
  if (!ms) return ''
  const diff = Date.now() - ms
  const s = Math.floor(diff / 1000)
  if (s < 60) return '방금 전'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  const dt = new Date(ms)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}
