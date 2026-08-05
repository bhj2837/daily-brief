<script setup>
// 최근 검색 기록 칩 목록. 클릭 시 해당 도시 선택, 전체 삭제 지원 (historyStore).
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore'

const emit = defineEmits(['select-city'])
const historyStore = useHistoryStore()
const { items } = storeToRefs(historyStore)
</script>

<template>
  <div v-if="items.length" class="history">
    <span class="label">최근 검색</span>
    <div class="chips">
      <button
        v-for="it in items"
        :key="it.cityId"
        class="chip"
        @click="emit('select-city', it.cityId)"
      >
        {{ it.ko }}
      </button>
    </div>
    <button class="clear" @click="historyStore.clear()">전체 삭제</button>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.label {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  border: var(--rule-thin) solid var(--border-strong);
  background: var(--surface);
  color: var(--ink);
  border-radius: var(--radius-pill);
  padding: 3px 12px;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition:
    transform var(--dur-fast) var(--ease-paper),
    border-color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease);
}
.chip:hover {
  transform: translateY(-2px);
  border-color: var(--ink);
  background: var(--surface-2);
}
.clear {
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  font-size: 12px;
  cursor: pointer;
}
.clear:hover {
  color: var(--accent);
}
</style>
