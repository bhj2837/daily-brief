<script setup>
// 도시 검색바 — Element Plus el-autocomplete + 디바운스 + watch 감시.
// 강의 p126 요구사항(searchQuery 감시, 한글 검색 필터링)을 계승하고
// Element Plus 컴포넌트와 디바운스(300ms)로 확장 (강의 8장 UI 라이브러리).
import { ref, watch } from 'vue'
import { CITIES } from '@/api/weather/cities'
import { useHistoryStore } from '@/stores/historyStore'

const emit = defineEmits(['select-city'])
const historyStore = useHistoryStore()
const query = ref('')

// el-autocomplete가 요구하는 (query, cb) 형태의 서제스트 함수. 한글/영문 부분일치.
const querySuggestions = (q, cb) => {
  const kw = String(q || '').trim().toLowerCase()
  const list = (kw ? CITIES.filter((c) => c.ko.includes(kw) || c.en.toLowerCase().includes(kw)) : CITIES).map(
    (c) => ({ value: c.ko, city: c }),
  )
  cb(list)
}

const onSelect = (item) => {
  const city = item.city
  historyStore.push(city) // 검색 기록 적재
  emit('select-city', city.id)
  query.value = ''
}

// 검색어 변화 감시 (강의 p126 watch 요구사항)
watch(query, (val) => {
  if (val) console.log('[SearchBar] 검색어 추적:', val)
})
</script>

<template>
  <div class="searchbar">
    <span class="ic">🔍</span>
    <el-autocomplete
      v-model="query"
      :fetch-suggestions="querySuggestions"
      :debounce="300"
      placeholder="도시를 검색하세요 (예: 서울, busan)"
      clearable
      :trigger-on-focus="true"
      class="ac"
      @select="onSelect"
    >
      <template #default="{ item }">
        <div class="ac-item">
          <b>{{ item.city.ko }}</b>
          <span class="en">{{ item.city.en }}</span>
        </div>
      </template>
    </el-autocomplete>
  </div>
</template>

<style scoped>
.searchbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 8px 4px 16px;
}
.searchbar:focus-within {
  border-color: var(--border-strong);
}
.ic {
  font-size: 15px;
  opacity: 0.6;
}
.ac {
  flex: 1;
}
.ac-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.ac-item .en {
  color: var(--ink-mute);
  font-size: 12px;
}
:deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  padding-left: 0;
}
:deep(.el-input__inner) {
  color: var(--ink);
  font-size: 15px;
}
:deep(.el-input__inner::placeholder) {
  color: var(--ink-mute);
}
</style>
