<script setup>
// 플레이어 턴 제한시간 바. ratio(0~1)에 따라 줄어들고, 임박하면 붉게 경고.
import { computed } from 'vue'
const props = defineProps({
  ratio: { type: Number, default: 1 },
  seconds: { type: Number, default: 0 },
  active: { type: Boolean, default: false },
})
const level = computed(() => (props.ratio > 0.5 ? 'ok' : props.ratio > 0.25 ? 'warn' : 'danger'))
</script>

<template>
  <div class="timer" :class="{ active }">
    <div class="bar">
      <div class="fill" :class="level" :style="{ width: `${ratio * 100}%` }" />
    </div>
    <span class="sec mono" :class="level">{{ seconds.toFixed(1) }}s</span>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.timer.active {
  opacity: 1;
}
.bar {
  flex: 1;
  height: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.1s linear, background 0.3s;
}
.fill.ok {
  background: var(--up);
}
.fill.warn {
  background: #d9a441;
}
.fill.danger {
  background: var(--down);
}
.sec {
  font-size: 13px;
  font-weight: 700;
  min-width: 42px;
  text-align: right;
  color: var(--ink-sub);
}
.sec.danger {
  color: var(--down);
}
</style>
