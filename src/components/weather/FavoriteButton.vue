<script setup>
// 즐겨찾기(북마크) 토글 버튼. 일반화된 bookmarkStore를 type 'city'로 사용.
import { computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { findCityById } from '@/api/weather/cities'

const props = defineProps({
  cityId: { type: String, required: true },
})
const bookmarkStore = useBookmarkStore()
const active = computed(() => bookmarkStore.has('city', props.cityId))

const onToggle = () => {
  const c = findCityById(props.cityId)
  bookmarkStore.toggle({ type: 'city', id: props.cityId, label: c?.ko || props.cityId })
}
</script>

<template>
  <button
    class="fav-btn"
    :class="{ active }"
    :aria-pressed="active"
    :title="active ? '즐겨찾기 해제' : '즐겨찾기 추가'"
    @click.stop="onToggle"
  >
    {{ active ? '★' : '☆' }}
  </button>
</template>

<style scoped>
.fav-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 19px;
  line-height: 1;
  color: var(--ink-mute);
  transition: transform 0.15s, color 0.2s;
}
.fav-btn.active {
  color: var(--accent);
}
.fav-btn:active {
  transform: scale(1.3);
}
</style>
