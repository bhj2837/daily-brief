import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Vite 빌드 설정 (강의 10장)
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 온디맨드: 템플릿에서 실제 사용하는 컴포넌트만 자동 임포트(+개별 CSS)
    // → 전역 등록(전 컴포넌트+전체 CSS) 대비 번들 대폭 축소
    Components({ resolvers: [ElementPlusResolver()] }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
