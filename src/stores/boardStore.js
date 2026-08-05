// ===== 게시판 Store (게시글 CRUD) =====
// 서버 없이 localStorage에 게시글을 영속화한다 (강의 6장 Pinia + 영속 패턴).
import { defineStore } from 'pinia'

const LS = 'daily-brief-posts'

export const useBoardStore = defineStore('board', {
  state: () => ({
    posts: [], // { id, title, content, author, authorId, createdAt, updatedAt, views }
  }),
  getters: {
    sorted: (s) => [...s.posts].sort((a, b) => b.createdAt - a.createdAt),
    byId: (s) => (id) => s.posts.find((p) => p.id === id) || null,
    count: (s) => s.posts.length,
  },
  actions: {
    create({ title, content, author, authorId }) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const now = Date.now()
      this.posts.push({
        id,
        title: title.trim(),
        content,
        author,
        authorId,
        createdAt: now,
        updatedAt: now,
        views: 0,
      })
      this.persist()
      return id
    },
    update(id, { title, content }) {
      const p = this.byId(id)
      if (!p) return false
      p.title = title.trim()
      p.content = content
      p.updatedAt = Date.now()
      this.persist()
      return true
    },
    remove(id) {
      this.posts = this.posts.filter((p) => p.id !== id)
      this.persist()
    },
    view(id) {
      const p = this.byId(id)
      if (p) {
        p.views = (p.views || 0) + 1
        this.persist()
      }
    },
    persist() {
      localStorage.setItem(LS, JSON.stringify(this.posts))
    },
    init() {
      try {
        const s = JSON.parse(localStorage.getItem(LS) || '[]')
        if (Array.isArray(s)) this.posts = s
      } catch {
        /* 무시 */
      }
    },
  },
})
