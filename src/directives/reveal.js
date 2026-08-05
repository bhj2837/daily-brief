/**
 * v-reveal — 스크롤 리빌 커스텀 디렉티브 (강의 8장 커스텀 디렉티브 · 생명주기 훅 활용)
 *
 * 화면에 들어오는 순간 요소를 "잉크가 지면에 앉듯" 등장시킨다.
 * 실제 애니메이션은 main.css의 [data-reveal] 규칙이 담당하고,
 * 여기서는 IntersectionObserver로 data-reveal 값을 'out' → 'in' 으로 바꾸기만 한다.
 *
 * 사용법
 *   <div v-reveal />                          기본
 *   <div v-reveal="{ delay: 120 }" />         지연 등장
 *   <li v-for="..." v-reveal="{ index: i }" /> index * 60ms 스태거
 *
 * 옵션
 *   delay  number(ms)  지연 시간
 *   index  number      스태거용 인덱스 (delay 미지정 시 index*60ms, 최대 480ms)
 *   once   boolean     한 번만 등장 (기본 true)
 *   margin string      rootMargin (기본 '0px 0px -12% 0px')
 */

// 요소별 observer를 기억해 unmounted에서 정리한다 (메모리 누수 방지)
const observers = new WeakMap()

// 접근성: 모션 최소화를 선호하면 애니메이션 없이 즉시 표시
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export const vReveal = {
  mounted(el, binding) {
    const opt = typeof binding.value === 'number' ? { index: binding.value } : binding.value || {}
    const once = opt.once !== false

    // SSR/구형 브라우저 폴백 + 모션 최소화 → 바로 노출
    if (typeof IntersectionObserver === 'undefined' || prefersReduced()) {
      el.dataset.reveal = 'in'
      return
    }

    el.dataset.reveal = 'out'
    // 등장 전에만 합성 레이어를 예약한다 (CSS가 등장 후 will-change를 해제)
    el.style.willChange = 'opacity, transform'

    // 지연: 명시값 우선, 없으면 index 기반 스태거
    const delay = opt.delay ?? Math.min((opt.index ?? 0) * 60, 480)
    if (delay) el.style.transitionDelay = `${delay}ms`

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.dataset.reveal = 'in'
            if (!once) return
            io.disconnect()
            observers.delete(el)
            // 등장 후에는 지연값을 지워 이후 호버 전환이 밀리지 않게 한다
            setTimeout(() => {
              el.style.transitionDelay = ''
              el.style.willChange = ''
            }, 700 + delay)
          } else if (!once) {
            el.dataset.reveal = 'out'
          }
        })
      },
      { threshold: 0.08, rootMargin: opt.margin || '0px 0px -12% 0px' },
    )

    io.observe(el)
    observers.set(el, io)
  },

  unmounted(el) {
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}

export default vReveal
