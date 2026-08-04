import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Vue 앱 부트스트랩: Pinia + Router + Element Plus 전역 주입 (강의 6·5·8장)
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// PWA: 서비스워커 등록 (프로덕션 빌드에서만 · 설치/오프라인 지원)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('[pwa] 서비스워커 등록 실패:', e.message)
    })
  })
}
