<script setup>
// 상단 마스트헤드(신문 제호) + 네비게이션 (강의 5장 RouterLink + 8장 토글러 배치).
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import UnitToggler from '@/components/weather/UnitToggler.vue'
import ThemeToggler from '@/components/common/ThemeToggler.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const { count } = storeToRefs(bookmarkStore)

const auth = useAuthStore()
const { username, nickname } = storeToRefs(auth)

const logout = () => {
  auth.logout()
  router.push('/')
}

const nav = [
  { to: '/', label: '홈' },
  { to: '/news', label: '뉴스' },
  { to: '/markets', label: '마켓' },
  { to: '/weather', label: '날씨' },
  { to: '/game', label: '끝말잇기' },
  { to: '/board', label: '게시판' },
  { to: '/bookmarks', label: '북마크' },
  { to: '/about', label: '소개' },
]
</script>

<template>
  <header class="masthead">
    <div class="bar container">
      <RouterLink to="/" class="brand">
        <span class="mark">📰</span>
        <span class="name serif">Daily<b>Brief</b></span>
      </RouterLink>

      <div class="actions">
        <UnitToggler />
        <ThemeToggler />
        <span class="sep" />
        <template v-if="username">
          <span class="user">{{ nickname }}</span>
          <button class="auth-btn" @click="logout">로그아웃</button>
        </template>
        <RouterLink v-else to="/login" class="auth-btn login">로그인</RouterLink>
      </div>
    </div>

    <nav class="nav">
      <div class="nav-inner container">
        <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-link">
          {{ n.label }}
          <span v-if="n.to === '/bookmarks' && count" class="badge">{{ count }}</span>
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.masthead {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface);
  border-bottom: 2px solid var(--ink);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 10px;
}
.sep {
  width: 1px;
  height: 20px;
  background: var(--border);
  margin: 0 2px;
}
.user {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.auth-btn {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink-sub);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.auth-btn:hover {
  border-color: var(--border-strong);
  color: var(--ink);
}
.auth-btn.login {
  background: var(--ink);
  color: var(--surface);
  border-color: var(--ink);
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 9px;
}
.brand .mark {
  font-size: 22px;
}
.brand .name {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.brand .name b {
  font-weight: 900;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav {
  border-top: 1px solid var(--border);
  background: var(--surface);
}
.nav-inner {
  display: flex;
  gap: 4px;
  overflow-x: auto;
}
.nav-link {
  position: relative;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-sub);
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.18s;
}
.nav-link:hover {
  color: var(--ink);
}
.nav-link.router-link-exact-active {
  color: var(--ink);
  border-bottom-color: var(--accent);
}
.badge {
  display: inline-grid;
  place-items: center;
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  vertical-align: middle;
}
@media (max-width: 560px) {
  .brand .name {
    font-size: 22px;
  }
}
</style>
