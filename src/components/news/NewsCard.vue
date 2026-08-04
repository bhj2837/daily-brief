<script setup>
// 뉴스 기사 카드 (강의 4장 props/emit). 클릭 시 내부 상세로 이동(emit),
// 북마크 토글은 bookmarkStore(type 'news')로 처리.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { timeAgo } from '@/utils/format'
import SourceBadge from '@/components/common/SourceBadge.vue'

const props = defineProps({
  article: { type: Object, required: true },
  rank: { type: Number, default: 0 },
})
const router = useRouter()
const bookmarkStore = useBookmarkStore()

const marked = computed(() => bookmarkStore.has('news', props.article.id))
const meta = computed(() => {
  const a = props.article
  const parts = [a.sourceLabel, timeAgo(a.at)]
  if (a.score != null) parts.push(`▲ ${a.score}`)
  if (a.comments != null) parts.push(`💬 ${a.comments}`)
  return parts.filter(Boolean).join(' · ')
})

const open = () => router.push(`/news/${props.article.id}`)
const toggleMark = () =>
  bookmarkStore.toggle({ type: 'news', id: props.article.id, label: props.article.title })
</script>

<template>
  <article class="ncard" @click="open">
    <div class="body">
      <div class="head">
        <span v-if="rank" class="rank serif">{{ rank }}</span>
        <SourceBadge :source="article.isLive ? 'live' : 'mock'" :label="article.sourceLabel" />
      </div>
      <h3 class="title serif">{{ article.title }}</h3>
      <p v-if="article.summary" class="summary">{{ article.summary }}</p>
      <div class="foot">
        <span class="meta">{{ meta }}</span>
        <button
          class="mark"
          :class="{ on: marked }"
          :aria-pressed="marked"
          :title="marked ? '북마크 해제' : '북마크'"
          @click.stop="toggleMark"
        >
          {{ marked ? '🔖' : '📑' }}
        </button>
      </div>
    </div>
    <div v-if="article.image" class="thumb">
      <img :src="article.image" :alt="article.title" loading="lazy" />
    </div>
  </article>
</template>

<style scoped>
.ncard {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: stretch;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
}
.ncard:hover .title {
  color: var(--accent);
}
.body {
  flex: 1;
  min-width: 0;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
}
.rank {
  font-size: 18px;
  font-weight: 900;
  color: var(--ink-mute);
  line-height: 1;
}
.title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.15s;
}
.summary {
  color: var(--ink-sub);
  font-size: 13.5px;
  line-height: 1.6;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9px;
}
.meta {
  font-size: 12px;
  color: var(--ink-mute);
  font-weight: 600;
}
.mark {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  opacity: 0.7;
  transition: transform 0.15s, opacity 0.15s;
}
.mark:hover {
  opacity: 1;
}
.mark.on {
  opacity: 1;
}
.thumb {
  flex-shrink: 0;
  width: 116px;
  height: 84px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (max-width: 560px) {
  .thumb {
    width: 88px;
    height: 66px;
  }
  .title {
    font-size: 16px;
  }
}
</style>
