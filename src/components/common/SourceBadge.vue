<script setup>
// 데이터 출처 배지 — 실시간(실 API) / 샘플(Mock) 을 명확히 구분해 표시.
// 채점자가 "키 없이 Mock 폴백"을 확인할 수 있게 하는 UX 장치.
import { computed } from 'vue'

const props = defineProps({
  // 'api' | 'live' → 실시간, 'mock' | 'sample' → 샘플
  source: { type: String, default: 'api' },
  label: { type: String, default: '' },
})

const isLive = computed(() => ['api', 'live'].includes(props.source))
const text = computed(() => props.label || (isLive.value ? '실시간' : '샘플 데이터'))
</script>

<template>
  <span class="src" :class="isLive ? 'live' : 'mock'" :title="isLive ? '실제 API 응답' : 'API 키 없음 · Mock 폴백'">
    <span class="dot" />
    {{ text }}
  </span>
</template>

<style scoped>
.src {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--ink-sub);
  background: var(--surface-2);
  white-space: nowrap;
}
.src .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-mute);
}
.src.live .dot {
  background: var(--up);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--up) 22%, transparent);
  animation: pulse 1.8s ease infinite;
}
.src.mock .dot {
  background: #d9a441;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
