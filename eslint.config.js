import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

// ESLint Flat Config (강의 10장)
export default [
  // 빌드 산출물/의존성은 검사 대상에서 제외
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'public/sw.js'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        navigator: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // 스크롤 리빌/진행바에서 사용하는 브라우저 API
        requestAnimationFrame: 'readonly',
        IntersectionObserver: 'readonly',
        WeakMap: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
]
