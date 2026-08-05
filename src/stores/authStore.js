// ===== 인증 Store (회원가입/로그인/세션) =====
// 서버 없이 동작하도록 localStorage에 사용자 목록과 세션을 영속화한다.
// (강의 authStore의 localStorage 패턴 p186·188). 데모용이라 비밀번호는 간이 해시 저장.
import { defineStore } from 'pinia'

const LS_USERS = 'daily-brief-users'
const LS_SESSION = 'daily-brief-session'

// 간이 해시(djb2) — 평문 저장을 피하기 위한 데모용(실제 보안용 아님)
const hash = (str) => {
  let h = 5381
  const s = String(str)
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: [], // { username, nickname, pass, createdAt }
    username: null, // 로그인된 아이디
  }),
  getters: {
    isLoggedIn: (s) => Boolean(s.username),
    currentUser: (s) => s.users.find((u) => u.username === s.username) || null,
    nickname: (s) => {
      const u = s.users.find((x) => x.username === s.username)
      return u?.nickname || s.username || ''
    },
  },
  actions: {
    register({ username, password, nickname }) {
      const id = String(username || '').trim()
      const nick = String(nickname || '').trim() || id
      if (id.length < 3) return { ok: false, reason: '아이디는 3자 이상이어야 합니다.' }
      if (String(password || '').length < 4)
        return { ok: false, reason: '비밀번호는 4자 이상이어야 합니다.' }
      if (this.users.some((u) => u.username === id))
        return { ok: false, reason: '이미 사용 중인 아이디입니다.' }
      this.users.push({ username: id, nickname: nick, pass: hash(password), createdAt: Date.now() })
      this.persistUsers()
      this.username = id
      this.persistSession()
      return { ok: true }
    },
    login({ username, password }) {
      const id = String(username || '').trim()
      const u = this.users.find((x) => x.username === id)
      if (!u || u.pass !== hash(password))
        return { ok: false, reason: '아이디 또는 비밀번호가 올바르지 않습니다.' }
      this.username = u.username
      this.persistSession()
      return { ok: true }
    },
    logout() {
      this.username = null
      this.persistSession()
    },
    persistUsers() {
      localStorage.setItem(LS_USERS, JSON.stringify(this.users))
    },
    persistSession() {
      localStorage.setItem(LS_SESSION, JSON.stringify({ username: this.username }))
    },
    init() {
      try {
        const users = JSON.parse(localStorage.getItem(LS_USERS) || '[]')
        if (Array.isArray(users)) this.users = users
        const sess = JSON.parse(localStorage.getItem(LS_SESSION) || '{}')
        this.username = sess.username || null
      } catch {
        /* 무시 */
      }
    },
  },
})
