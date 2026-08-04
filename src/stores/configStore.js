// ===== 환경 설정 Store: 온도 단위 + 테마 =====
// 강의 6장 Pinia(state/getters/actions) + localStorage 영속(강의 authStore 패턴 p186·188).
// 단위(℃/℉)와 테마(light/dark/auto)를 관리한다. 'auto'는 시간대로 결정.
import { defineStore } from 'pinia'

const LS_KEY = 'daily-brief-config'

export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 'celsius' | 'fahrenheit'
    theme: 'auto', // 'light' | 'dark' | 'auto'
  }),
  getters: {
    // 현재 단위 기호 (강의 p191 unitSymbol)
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),
    // 'auto'일 때 시간대로 라이트/다크 결정 (밤엔 다크)
    resolvedTheme: (state) => {
      if (state.theme !== 'auto') return state.theme
      const h = new Date().getHours()
      return h >= 19 || h < 7 ? 'dark' : 'light'
    },
  },
  actions: {
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
      this.persist()
    },
    setTheme(theme) {
      this.theme = theme
      this.persist()
    },
    // 자동 → 라이트 → 다크 순환
    cycleTheme() {
      const order = ['auto', 'light', 'dark']
      this.theme = order[(order.indexOf(this.theme) + 1) % order.length]
      this.persist()
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify({ unit: this.unit, theme: this.theme }))
    },
    init() {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
        if (saved.unit) this.unit = saved.unit
        if (saved.theme) this.theme = saved.theme
      } catch {
        /* 손상된 저장값 무시 */
      }
    },
  },
})
