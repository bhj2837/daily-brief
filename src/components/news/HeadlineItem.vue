<script setup>
// 1면 부기사용 컴팩트 헤드라인 (순번 + 제목 + 메타).
// NewsCard와 동일한 원칙: 이동은 부모가 하고, 여기서는 select 이벤트만 올려보낸다.
// 신문 헤드라인처럼 밀도를 높이고, 호버 시 잉크 밑줄이 좌→우로 그어진다.
import { computed } from 'vue'
import { timeAgo } from '@/utils/format'

const props = defineProps({
  article: { type: Object, required: true },
  rank: { type: Number, default: 0 },
})

// 부모(BriefHomeView)로 클릭한 기사 id를 전달 (강의 4장 defineEmits)
const emit = defineEmits(['select'])

const meta = computed(() => {
  const a = props.article
  const parts = [a.sourceLabel, timeAgo(a.at)]
  if (a.score != null) parts.push(`▲ ${a.score}`)
  return parts.filter(Boolean).join(' · ')
})
</script>

<template>
  <button class="hl" @click="emit('select', article.id)">
    <span v-if="rank" class="rank mono">{{ String(rank).padStart(2, '0') }}</span>
    <span class="text">
      <span class="t serif"
        ><span class="ink-underline">{{ article.title }}</span></span
      >
      <span class="m dateline">{{ meta }}</span>
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
  border-bottom: var(--rule-hair) solid var(--border);
  padding: 11px 0;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.hl:hover {
  background: color-mix(in srgb, var(--surface) 70%, transparent);
}
.rank {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
  flex-shrink: 0;
  min-width: 20px;
  letter-spacing: 0.02em;
}
.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.t {
  font-size: 15.5px;
  font-weight: 700;
  line-height: 1.38;
  color: var(--ink);
  word-break: keep-all;
  overflow-wrap: anywhere;
}
/* 2줄 제한: 밑줄 span 안쪽에 적용 */
.t .ink-underline {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  background-size: 0% var(--rule-thin);
}
.hl:hover .t .ink-underline {
  background-size: 100% var(--rule-thin);
}
.m {
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: none;
}
</style>
