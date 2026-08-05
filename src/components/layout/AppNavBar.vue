<script setup>
// 마스트헤드(신문 제호) — 발행일 · 제호 · 판(edition) · 섹션 내비게이션.
// 강의 5장 RouterLink + 8장 토글러 배치. 스크롤하면 제호가 접히고 얇은 바로 축소된다(compact).
// 모바일(<820px)에서는 섹션 목록을 접이식 메뉴로 전환한다.
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import UnitToggler from '@/components/weather/UnitToggler.vue'
import ThemeToggler from '@/components/common/ThemeToggler.vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useAuthStore } from '@/stores/authStore'

defineProps({
  // 스크롤 시 제호 영역을 접어 얇게 만든다
  compact: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const bookmarkStore = useBookmarkStore()
const { count } = storeToRefs(bookmarkStore)

const auth = useAuthStore()
const { username, nickname } = storeToRefs(auth)

const logout = () => {
  auth.logout()
  router.push('/')
}

// 발행 정보 — 제호 좌우에 붙는 발행일 / 호수 표기
const now = new Date()
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const dateline = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(
  now.getDate(),
).padStart(2, '0')} (${DAYS[now.getDay()]})`

// 발행 호수: 기준일부터의 일수 — 신문의 "제 N호" 느낌
const issueNo = computed(() => {
  const base = new Date(2025, 0, 1)
  return Math.max(1, Math.floor((now - base) / 86400000) + 1).toLocaleString()
})

const nav = [
  { to: '/', label: '홈', en: 'Front' },
  { to: '/news', label: '뉴스', en: 'News' },
  { to: '/markets', label: '마켓', en: 'Markets' },
  { to: '/weather', label: '날씨', en: 'Weather' },
  { to: '/game', label: '끝말잇기', en: 'Puzzle' },
  { to: '/board', label: '게시판', en: 'Letters' },
  { to: '/bookmarks', label: '북마크', en: 'Clippings' },
  { to: '/about', label: '소개', en: 'About' },
]

// 모바일 메뉴 (라우트가 바뀌면 자동으로 닫는다)
const menuOpen = ref(false)
watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)
</script>

<template>
  <header class="masthead" :class="{ compact }">
    <!-- ── 제호 영역 (스크롤 시 접힘) ── -->
    <div class="plate">
      <div class="plate-inner container">
        <div class="side left">
          <span class="dateline">{{ dateline }}</span>
        </div>

        <RouterLink to="/" class="brand" aria-label="Daily Brief 홈">
          <span class="brand-rule" />
          <span class="brand-name serif">Daily<b>Brief</b></span>
          <span class="brand-rule" />
        </RouterLink>

        <div class="side right">
          <span class="dateline">제 {{ issueNo }} 호</span>
        </div>
      </div>
    </div>

    <!-- ── 유틸 + 내비게이션 바 ── -->
    <div class="bar">
      <div class="bar-inner container">
        <!-- 축소 상태에서만 보이는 작은 제호 -->
        <RouterLink to="/" class="mini-brand serif">Daily<b>Brief</b></RouterLink>

        <nav class="nav" aria-label="섹션">
          <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-link">
            <span class="nav-ko">{{ n.label }}</span>
            <span class="nav-en">{{ n.en }}</span>
            <span v-if="n.to === '/bookmarks' && count" class="badge">{{ count }}</span>
          </RouterLink>
        </nav>

        <div class="actions">
          <UnitToggler class="only-wide" />
          <ThemeToggler />
          <span class="sep only-wide" />
          <template v-if="username">
            <span class="user only-wide">{{ nickname }}</span>
            <button class="auth-btn" @click="logout">로그아웃</button>
          </template>
          <RouterLink v-else to="/login" class="auth-btn login">로그인</RouterLink>

          <button
            class="burger"
            :aria-expanded="menuOpen"
            aria-label="섹션 메뉴"
            @click="menuOpen = !menuOpen"
          >
            <span :class="{ x: menuOpen }" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── 모바일 접이식 섹션 메뉴 ── -->
    <Transition name="drawer">
      <nav v-if="menuOpen" class="drawer" aria-label="모바일 섹션">
        <div class="container drawer-inner">
          <RouterLink v-for="n in nav" :key="n.to" :to="n.to" class="drawer-link">
            <span class="d-en dateline">{{ n.en }}</span>
            <span class="d-ko serif">{{ n.label }}</span>
            <span v-if="n.to === '/bookmarks' && count" class="badge">{{ count }}</span>
          </RouterLink>
          <div class="drawer-foot">
            <UnitToggler />
          </div>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.masthead {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--surface);
  border-bottom: var(--rule-med) solid var(--ink);
  box-shadow: 0 1px 0 var(--shadow);
}

/* ===== 제호 영역 ===== */
.plate {
  overflow: hidden;
  max-height: 132px;
  opacity: 1;
  border-bottom: var(--rule-hair) solid var(--border-strong);
  transition:
    max-height 0.42s var(--ease-paper),
    opacity 0.26s var(--ease),
    border-color 0.3s var(--ease);
}
.masthead.compact .plate {
  max-height: 0;
  opacity: 0;
  border-bottom-color: transparent;
}
.plate-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-4);
  padding-top: 16px;
  padding-bottom: 14px;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.side.right {
  align-items: flex-end;
  text-align: right;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-self: center;
}
.brand-rule {
  width: clamp(16px, 4vw, 46px);
  height: var(--rule-thin);
  background: var(--border-strong);
}
.brand-name {
  font-size: var(--fs-masthead);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
  transition: letter-spacing var(--dur) var(--ease);
}
.brand-name b {
  font-weight: 900;
}
.brand:hover .brand-name {
  letter-spacing: -0.01em;
}

/* ===== 유틸 + 내비 바 ===== */
.bar {
  background: var(--surface);
}
.bar-inner {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

/* 축소 시에만 등장하는 작은 제호 */
.mini-brand {
  flex-shrink: 0;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -0.02em;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width 0.42s var(--ease-paper),
    opacity 0.3s var(--ease),
    margin 0.42s var(--ease-paper);
}
.mini-brand b {
  font-weight: 900;
}
.masthead.compact .mini-brand {
  max-width: 130px;
  opacity: 1;
  margin-right: 14px;
}

.nav {
  display: flex;
  align-items: stretch;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 22px), transparent);
  mask-image: linear-gradient(90deg, #000 calc(100% - 22px), transparent);
}
.nav::-webkit-scrollbar {
  display: none;
}

.nav-link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 8px 13px 7px;
  color: var(--ink-sub);
  white-space: nowrap;
  transition:
    color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}
.nav-ko {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.15;
}
.nav-en {
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint);
  line-height: 1;
  transition: color var(--dur-fast) var(--ease);
}
.nav-link:hover {
  color: var(--ink);
  background: var(--surface-2);
}
.nav-link:hover .nav-en {
  color: var(--ink-mute);
}
/* 활성 섹션: 잉크 밑줄이 좌→우로 그어진다 */
.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  height: var(--rule-med);
  width: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform var(--dur) var(--ease-paper);
}
.nav-link.router-link-exact-active {
  color: var(--ink);
}
.nav-link.router-link-exact-active .nav-en {
  color: var(--accent);
}
.nav-link.router-link-exact-active::after {
  transform: scaleX(1);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 6px 0;
}
.sep {
  width: 1px;
  height: 18px;
  background: var(--border);
}
.user {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--ink);
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.auth-btn {
  border: var(--rule-thin) solid var(--border-strong);
  background: transparent;
  color: var(--ink-sub);
  border-radius: var(--radius-pill);
  padding: 5px 13px;
  font-size: var(--fs-small);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}
.auth-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.auth-btn.login {
  background: var(--ink);
  color: var(--surface);
  border-color: var(--ink);
}
.auth-btn.login:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* 햄버거 */
.burger {
  display: none;
  width: 34px;
  height: 30px;
  border: var(--rule-thin) solid var(--border-strong);
  border-radius: var(--radius);
  background: transparent;
  cursor: pointer;
  position: relative;
}
.burger span,
.burger span::before,
.burger span::after {
  position: absolute;
  width: 16px;
  height: var(--rule-med);
  background: var(--ink);
  transition:
    transform var(--dur) var(--ease-paper),
    background var(--dur-fast) var(--ease);
}
.burger span {
  top: 50%;
  left: 50%;
  margin: -1px 0 0 -8px;
}
.burger span::before,
.burger span::after {
  content: '';
  left: 0;
}
.burger span::before {
  top: -5px;
}
.burger span::after {
  top: 5px;
}
.burger span.x {
  background: transparent;
}
.burger span.x::before {
  transform: translateY(5px) rotate(45deg);
}
.burger span.x::after {
  transform: translateY(-5px) rotate(-45deg);
}

/* ===== 모바일 드로어 ===== */
.drawer {
  border-top: var(--rule-thin) solid var(--border);
  background: var(--surface-2);
  overflow: hidden;
}
.drawer-inner {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  padding-top: var(--sp-3);
  padding-bottom: var(--sp-4);
}
.drawer-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 12px;
  border: var(--rule-hair) solid var(--border);
  background: var(--surface);
  position: relative;
  transition: border-color var(--dur-fast) var(--ease);
}
.drawer-link .d-ko {
  font-size: 16px;
  font-weight: 700;
}
.drawer-link.router-link-exact-active {
  border-color: var(--ink);
}
.drawer-link.router-link-exact-active .d-en {
  color: var(--accent);
}
.drawer-link .badge {
  position: absolute;
  top: 9px;
  right: 10px;
}
.drawer-foot {
  grid-column: 1 / -1;
  padding-top: var(--sp-3);
}
.drawer-enter-active,
.drawer-leave-active {
  transition:
    max-height 0.36s var(--ease-paper),
    opacity 0.24s var(--ease);
  max-height: 480px;
}
.drawer-enter-from,
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
}

.badge {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}
.nav-link .badge {
  position: absolute;
  top: 2px;
  right: 1px;
}

/* ===== 반응형 ===== */
@media (max-width: 1020px) {
  .nav-en {
    display: none;
  }
  .nav-link {
    padding: 12px 12px 10px;
  }
}
@media (max-width: 820px) {
  .plate-inner {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: 8px;
    padding-top: 12px;
    padding-bottom: 11px;
  }
  .side.right {
    display: none;
  }
  .side.left {
    align-items: center;
  }
  .plate {
    max-height: 112px;
  }
  .nav {
    display: none;
  }
  .mini-brand,
  .masthead.compact .mini-brand {
    max-width: 130px;
    opacity: 1;
    margin-right: auto;
  }
  .burger {
    display: block;
  }
  .only-wide {
    display: none;
  }
  .actions {
    margin-left: auto;
  }
}
@media (max-width: 420px) {
  .drawer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
