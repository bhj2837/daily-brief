// ===== 공통 Axios 팩토리 (강의 7장 p202~207) =====
// 모듈별(news/markets/weather) HTTP 클라이언트를 일관된 설정으로 생성한다.
// 인터셉터로 요청/응답 로깅과 에러 정규화를 한 곳에서 처리.
import axios from 'axios'

export function createHttp(config = {}) {
  const instance = axios.create({
    timeout: 8000,
    ...config,
  })

  // 응답 인터셉터: 에러 메시지를 사람이 읽기 좋게 정규화
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const url = err?.config?.url || ''
      const status = err?.response?.status
      console.warn(`[http] 요청 실패 ${status || ''} ${url}: ${err.message}`)
      return Promise.reject(err)
    },
  )
  return instance
}

export default createHttp
