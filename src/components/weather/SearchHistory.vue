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
  font-size: 12px;
  color: var(--ink-sub);
  font-weight: 700;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s;
}
.chip:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
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
