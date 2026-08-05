import { onMounted, onUnmounted, ref } from 'vue'

/**
 * useReadProgress — 문서 읽기 진행률 (강의 7장 컴포저블 · 생명주기 훅)
 *
 * 신문 지면을 얼마나 읽어 내려왔는지를 상단 잉크 라인으로 보여주기 위한 값.
 * 반환값 progress 는 0~1. scaleX에 그대로 바인딩해 쓴다.
 *
 * 스크롤 핸들러는 requestAnimationFrame으로 스로틀해 리렌더 부담을 줄인다.
 */
export function useReadProgress() {
  const progress = ref(0)
  // 헤더가 축소(compact)될 기준선을 넘었는지 — 마스트헤드 축소 연출에 사용
  const scrolled = ref(false)
  let ticking = false

  const measure = () => {
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - window.innerHeight
    progress.value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
    scrolled.value = window.scrollY > 24
    ticking = false
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(measure)
  }

  onMounted(() => {
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  return { progress, scrolled }
}
