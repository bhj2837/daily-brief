<script setup>
// 앱 전역 셸: 읽기 진행바 + 마스트헤드 + 실시간 티커 + 지면(RouterView) + 판권(푸터).
// 종이 질감(.paper-grain)은 셸 전체에 아주 옅게 깔아 "인쇄된 지면" 인상을 만든다.
// 테마는 configStore.resolvedTheme → .theme-light / .theme-dark 로 반영된다.
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppNavBar from '@/components/layout/AppNavBar.vue'
import TickerBar from '@/components/layout/TickerBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useConfigStore } from '@/stores/configStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useReadProgress } from '@/composables/useReadProgress'
import { fetchMarketSummary } from '@/api/markets'

const configStore = useConfigStore()
const bookmarkStore = useBookmarkStore()
const historyStore = useHistoryStore()
const { resolvedTheme } = storeToRefs(configStore)

const themeClass = computed(() => (resolvedTheme.value === 'dark' ? 'theme-dark' : 'theme-light'))

// 스크롤 진행률 → 상단 잉크 라인 / 마스트헤드 축소
const { progress, scrolled } = useReadProgress()

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
  <div class="app-shell paper-grain" :class="themeClass">
    <!-- 읽기 진행바: 스크롤한 만큼 잉크 라인이 그어진다 -->
    <div
      class="read-progress"
      :style="{ transform: `scaleX(${progress})` }"
      role="progressbar"
      aria-label="읽기 진행률"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
    />

    <AppNavBar :compact="scrolled" />
    <TickerBar :items="tickerItems" />

    <main class="app-main">
      <div class="container">
        <!-- 지면 넘김 전환(page): 새 지면이 아래에서 올라오며 초점이 잡힌다 -->
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
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
/* 그레인 오버레이가 클릭을 막지 않도록 콘텐츠를 위로 올린다 */
.app-shell > * {
  position: relative;
  z-index: 1;
}
.app-main {
  flex: 1;
  width: 100%;
  padding: clamp(20px, 3.4vw, 38px) 0 var(--sp-5);
}
</style>
