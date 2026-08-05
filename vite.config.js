import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Vite 빌드 설정 (강의 10장)
// command === 'build' 일 때만 프로덕션 최적화를 켠다(개발 중 console은 그대로 유지).
export default defineConfig(({ command }) => ({
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
  // 프로덕션 번들에서만 개발용 로그 제거 (warn/error는 남겨 장애 추적 가능)
  esbuild: {
    pure: command === 'build' ? ['console.log', 'console.debug'] : [],
    drop: command === 'build' ? ['debugger'] : [],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // 프레임워크 코어를 별도 청크로 고정 → 앱 코드가 바뀌어도 브라우저 캐시가 유지된다
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          axios: ['axios'],
        },
      },
    },
  },
}))
