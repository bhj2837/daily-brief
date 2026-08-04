// ===== 검색 기록 Store =====
// 최근 검색한 도시를 최신순 최대 8개까지 localStorage에 영속화 (강의 6장 Pinia).
import { defineStore } from 'pinia'

const LS_KEY = 'daily-brief-history'
const MAX = 8

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [], // { cityId, ko, at } 최신순
  }),
  actions: {
    push(city) {
      this.items = this.items.filter((it) => it.cityId !== city.id)
      this.items.unshift({ cityId: city.id, ko: city.ko, at: Date.now() })
      if (this.items.length > MAX) this.items = this.items.slice(0, MAX)
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.items))
    },
    init() {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
        if (Array.isArray(saved)) this.items = saved
      } catch {
        this.items = []
      }
    },
  },
})
