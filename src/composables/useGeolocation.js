// ===== 현재 위치 감지 Composable =====
// navigator.geolocation을 Promise로 감싼다 (강의 9장 Modern JS - Promise p239).

import { ref } from 'vue'

export function useGeolocation() {
  const locating = ref(false)
  const geoError = ref(null)

  const getPosition = () =>
    new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(new Error(err.message || '위치 권한이 거부되었습니다.')),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      )
    })

  const locate = async () => {
    locating.value = true
    geoError.value = null
    try {
      return await getPosition()
    } catch (e) {
      geoError.value = e.message
      throw e
    } finally {
      locating.value = false
    }
  }

  return { locating, geoError, locate }
}
