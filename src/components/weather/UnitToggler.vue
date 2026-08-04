<script setup>
// 섭씨/화씨 단위 토글 (강의 p191 UnitToggler + configStore)
import { useUnit } from '@/composables/useUnit'
const { unit, toggle } = useUnit()
</script>

<template>
  <div class="unit-toggle" role="group" aria-label="온도 단위">
    <button :class="{ on: unit === 'celsius' }" @click="unit !== 'celsius' && toggle()">℃</button>
    <button :class="{ on: unit === 'fahrenheit' }" @click="unit !== 'fahrenheit' && toggle()">℉</button>
  </div>
</template>

<style scoped>
.unit-toggle {
  display: inline-flex;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 3px;
}
.unit-toggle button {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  width: 36px;
  height: 28px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.18s;
}
.unit-toggle button.on {
  background: var(--ink);
  color: var(--surface);
}
</style>
