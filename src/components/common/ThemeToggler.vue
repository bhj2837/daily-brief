<script setup>
// 테마 순환: 자동 → 라이트 → 다크 (강의 6장 configStore 활용)
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
const icon = computed(() => ({ auto: '◑', light: '☀', dark: '☾' })[configStore.theme])
const label = computed(() => ({ auto: '자동', light: '라이트', dark: '다크' })[configStore.theme])
</script>

<template>
  <button class="theme-toggle" :title="`테마: ${label}`" :aria-label="`테마 전환, 현재 ${label}`" @click="configStore.cycleTheme()">
    <span class="ic">{{ icon }}</span>
    <span class="lb">{{ label }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--ink);
  border-radius: 999px;
  padding: 5px 12px 5px 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: transform 0.12s, border-color 0.2s;
}
.theme-toggle:hover {
  border-color: var(--border-strong);
}
.theme-toggle:active {
  transform: scale(0.95);
}
.theme-toggle .ic {
  font-size: 14px;
}
.theme-toggle .lb {
  color: var(--ink-sub);
}
@media (max-width: 560px) {
  .theme-toggle .lb {
    display: none;
  }
}
</style>
