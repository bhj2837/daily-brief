<script setup>
// 홈 브리핑용 컴팩트 헤드라인 (제목 + 메타만). 목록 밀도를 높인 신문 헤드라인 스타일.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { timeAgo } from '@/utils/format'

const props = defineProps({
  article: { type: Object, required: true },
  rank: { type: Number, default: 0 },
})
const router = useRouter()
const meta = computed(() => {
  const a = props.article
  const parts = [a.sourceLabel, timeAgo(a.at)]
  if (a.score != null) parts.push(`▲ ${a.score}`)
  return parts.filter(Boolean).join(' · ')
})
</script>

<template>
  <button class="hl" @click="router.push(`/news/${article.id}`)">
    <span v-if="rank" class="rank serif">{{ String(rank).padStart(2, '0') }}</span>
    <span class="text">
      <span class="t serif">{{ article.title }}</span>
      <span class="m">{{ meta }}</span>
    </span>
  </button>
</template>

<style scoped>
.hl {
  display: flex;
  gap: 12px;
  align-items: baseline;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border);
  padding: 12px 0;
  cursor: pointer;
}
.hl:hover .t {
  color: var(--accent);
}
.rank {
  font-size: 14px;
  font-weight: 900;
  color: var(--accent);
  flex-shrink: 0;
  min-width: 22px;
}
.text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.t {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--ink);
  transition: color 0.15s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.m {
  font-size: 11.5px;
  color: var(--ink-mute);
  font-weight: 600;
}
</style>
