import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus는 전역 등록 대신 온디맨드(unplugin-vue-components)로 컴포넌트만 자동 임포트.
// 템플릿에 없는 프로그램적 API(ElMessage/ElMessageBox)만 스타일을 개별로 로드한다.
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-overlay.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/authStore'
import { useBoardStore } from './stores/boardStore'
import { vReveal } from './directives/reveal'

// Vue 앱 부트스트랩: Pinia + Router + Element Plus 전역 주입 (강의 6·5·8장)
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 라우터 가드(beforeEach)가 로그인 상태를 참조하므로, 라우터 사용 전에 세션 복원
useAuthStore(pinia).init()
useBoardStore(pinia).init()

// 커스텀 디렉티브: v-reveal (스크롤 진입 시 등장) — 전 페이지 공통 인터랙션
app.directive('reveal', vReveal)

app.use(router)
app.mount('#app')

// PWA: 서비스워커 등록 (프로덕션 빌드에서만 · 설치/오프라인 지원)
// base 하위 경로(GitHub Pages 등)에서도 동작하도록 BASE_URL 기준으로 등록/스코프 지정.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((e) => {
      console.warn('[pwa] 서비스워커 등록 실패:', e.message)
    })
  })
}
