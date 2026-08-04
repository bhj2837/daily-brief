// ===== 북마크 Store (일반화) =====
// 도시 즐겨찾기에서 출발했지만, 뉴스 기사 북마크까지 재사용할 수 있도록
// { type, id, label, at } 형태로 일반화했다 (강의 6장 Pinia + localStorage 영속).
//   - type 'city' : 날씨 즐겨찾기 도시
//   - type 'news' : 뉴스 기사 (뉴스 모듈에서 사용 예정)
import { defineStore } from 'pinia'

const LS_KEY = 'daily-brief-bookmarks'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    items: [], // { type, id, label, at }
  }),
  getters: {
    // (type, id) 북마크 여부
    has: (state) => (type, id) => state.items.some((b) => b.type === type && b.id === id),
    // 특정 타입만 최신순
    byType: (state) => (type) =>
      state.items.filter((b) => b.type === type).sort((a, b) => b.at - a.at),
    count: (state) => state.items.length,
    cityIds: (state) => state.items.filter((b) => b.type === 'city').map((b) => b.id),
  },
  actions: {
    toggle({ type, id, label }) {
      const i = this.items.findIndex((b) => b.type === type && b.id === id)
      if (i === -1) this.items.push({ type, id, label, at: Date.now() })
      else this.items.splice(i, 1)
      this.persist()
    },
    remove(type, id) {
      this.items = this.items.filter((b) => !(b.type === type && b.id === id))
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
