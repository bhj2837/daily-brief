<script setup>
// 앱 전역 셸: 마스트헤드 + 실시간 티커 + RouterView + 푸터 (강의 5장 App.vue 확장).
// 테마는 configStore.resolvedTheme로 결정되어 .theme-light / .theme-dark 클래스로 반영된다.
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppNavBar from '@/components/layout/AppNavBar.vue'
import TickerBar from '@/components/layout/TickerBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useHistoryStore } from '@/stores/historyStore'
import { fetchMarketSummary } from '@/api/markets'

const configStore = useConfigStore()
const bookmarkStore = useBookmarkStore()
const historyStore = useHistoryStore()
const { resolvedTheme } = storeToRefs(configStore)

const themeClass = computed(() => (resolvedTheme.value === 'dark' ? 'theme-dark' : 'theme-light'))

// 상단 티커용 실시간 마켓 요약 (실패 시 TickerBar 내부 샘플로 폴백)
const tickerItems = ref(null)

onMounted(async () => {
  // localStorage에서 설정/북마크/검색기록 복원 (강의 6장 영속)
  configStore.init()
  bookmarkStore.init()
  historyStore.init()

  try {
    const { items } = await fetchMarketSummary()
    tickerItems.value = items
  } catch {
    /* 샘플 폴백 유지 */
  }
})
</script>

<template>
  <div class="app-shell" :class="themeClass">
    <AppNavBar />
    <TickerBar :items="tickerItems" />

    <main class="app-main">
      <div class="container">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--ink);
}
.app-main {
  flex: 1;
  width: 100%;
  padding: 26px 0 10px;
}
</style>
