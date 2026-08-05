import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ===== 라우트 정의 =====
// 강의 5장 Vue Router 개념 총망라:
//  - Lazy Loading (동적 import)     : 각 view를 () => import(...)로 지연 로딩
//  - 동적 경로 매칭 (:param)         : /weather/:cityId, /news/:id
//  - Catch-all (Unmatched Route)     : /:pathMatch(.*)*
//  - Navigation Guard (afterEach)    : 문서 제목 갱신
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/BriefHomeView.vue'),
    meta: { title: '오늘의 브리핑' },
  },
  // ---- 뉴스 ----
  {
    path: '/news',
    name: 'news',
    component: () => import('@/views/NewsView.vue'),
    meta: { title: '뉴스' },
  },
  {
    // 동적 라우트: 기사 상세
    path: '/news/:id',
    name: 'news-detail',
    component: () => import('@/views/NewsDetailView.vue'),
    props: true,
    meta: { title: '기사' },
  },
  // ---- 마켓 ----
  {
    path: '/markets',
    name: 'markets',
    component: () => import('@/views/MarketsView.vue'),
    meta: { title: '마켓' },
  },
  {
    // 동적 라우트: 종목 상세 (환율/코인/증시)
    path: '/markets/:id',
    name: 'market-detail',
    component: () => import('@/views/MarketDetailView.vue'),
    props: true,
    meta: { title: '종목 상세' },
  },
  // ---- 날씨 (기존 skala-weather 이식) ----
  {
    path: '/weather',
    name: 'weather',
    component: () => import('@/views/WeatherView.vue'),
    meta: { title: '날씨' },
  },
  {
    // 동적 경로 매칭: /weather/seoul
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
    props: true,
    meta: { title: '날씨 상세' },
  },
  // ---- 게임 ----
  {
    path: '/game',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
    meta: { title: '끝말잇기' },
  },
  // ---- 게시판 ----
  {
    path: '/board',
    name: 'board',
    component: () => import('@/views/BoardListView.vue'),
    meta: { title: '게시판' },
  },
  {
    path: '/board/write',
    name: 'board-write',
    component: () => import('@/views/BoardFormView.vue'),
    meta: { title: '글쓰기', requiresAuth: true },
  },
  {
    path: '/board/:id',
    name: 'board-detail',
    component: () => import('@/views/BoardDetailView.vue'),
    props: true,
    meta: { title: '게시글' },
  },
  {
    path: '/board/:id/edit',
    name: 'board-edit',
    component: () => import('@/views/BoardFormView.vue'),
    props: true,
    meta: { title: '글 수정', requiresAuth: true },
  },
  // ---- 인증 ----
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '로그인' },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { title: '회원가입' },
  },
  // ---- 북마크 ----
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/views/BookmarksView.vue'),
    meta: { title: '북마크' },
  },
  // ---- 소개 ----
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '소개' },
  },
  // ---- Catch-all 404 ----
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '페이지를 찾을 수 없음' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  },
})

// 인증 가드: 로그인이 필요한 경로 보호 (강의 Navigation Guard - beforeEach)
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

// 전역 가드: 탭 제목 갱신 (강의 Navigation Guard - afterEach)
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Daily Brief` : 'Daily Brief'
})

export default router
