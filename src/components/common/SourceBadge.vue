<script setup>
// 데이터 출처 배지 — 실시간 응답인지 샘플 데이터인지 구분해 표시.
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
  <span
    class="src"
    :class="isLive ? 'live' : 'mock'"
    :title="isLive ? '실시간 응답' : '샘플 데이터'"
  >
    <span class="dot" />
    {{ text }}
  </span>
</template>

<style scoped>
/* 지면 위에 찍힌 작은 스탬프 라벨 */
.src {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 3px 9px;
  border-radius: var(--radius);
  border: var(--rule-thin) solid var(--border-strong);
  color: var(--ink-sub);
  background: var(--surface-2);
  white-space: nowrap;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}
.src.live {
  border-color: color-mix(in srgb, var(--up) 40%, var(--border-strong));
}
.src.mock {
  border-style: dashed;
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
