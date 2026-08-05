<script setup>
// 뉴스 기사 카드 (강의 4장 props/emit). 클릭 시 내부 상세로 이동,
// 북마크 토글은 bookmarkStore(type 'news')로 처리.
// 조판: 좌측 본문 + 우측 하프톤 사진. 호버 시 망점이 걷히고 제목에 잉크 밑줄이 그어진다.
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
    <span v-if="rank" class="rank serif" aria-hidden="true">{{ rank }}</span>

    <div class="body">
      <div class="head">
        <SourceBadge :source="article.isLive ? 'live' : 'mock'" :label="article.sourceLabel" />
      </div>

      <h3 class="title serif">
        <span class="ink-underline">{{ article.title }}</span>
      </h3>

      <p v-if="article.summary" class="summary">{{ article.summary }}</p>

      <div class="foot">
        <span class="meta dateline">{{ meta }}</span>
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

    <figure v-if="article.image" class="thumb halftone">
      <img :src="article.image" :alt="article.title" loading="lazy" decoding="async" />
    </figure>
  </article>
</template>

<style scoped>
.ncard {
  display: flex;
  gap: var(--sp-4);
  align-items: flex-start;
  padding: var(--sp-4) 0;
  border-bottom: var(--rule-thin) solid var(--border);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.ncard:hover {
  background: color-mix(in srgb, var(--surface) 65%, transparent);
}

/* 순번 활자 — 신문 랭킹 표기 */
.rank {
  flex-shrink: 0;
  width: 34px;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  color: var(--ink-faint);
  padding-top: 2px;
  transition: color var(--dur) var(--ease);
}
.ncard:hover .rank {
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
  margin-bottom: 8px;
}
.title {
  font-size: 18.5px;
  font-weight: 700;
  line-height: 1.32;
  word-break: keep-all;
  overflow-wrap: anywhere;
}
.title .ink-underline {
  background-size: 0% var(--rule-med);
}
.ncard:hover .title .ink-underline {
  background-size: 100% var(--rule-med);
}
.summary {
  color: var(--ink-sub);
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.68;
  margin-top: 7px;
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
  gap: var(--sp-3);
  margin-top: 10px;
}
.meta {
  text-transform: none;
  letter-spacing: 0.06em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mark {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  opacity: 0.55;
  flex-shrink: 0;
  transition:
    transform var(--dur-fast) var(--ease-paper),
    opacity var(--dur-fast) var(--ease);
}
.mark:hover {
  opacity: 1;
  transform: scale(1.15);
}
.mark.on {
  opacity: 1;
}

.thumb {
  flex-shrink: 0;
  width: 124px;
  height: 88px;
  border-radius: var(--radius);
  border: var(--rule-thin) solid var(--border-strong);
  background: var(--surface-2);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 640px) {
  .ncard {
    gap: var(--sp-3);
  }
  .rank {
    width: 24px;
    font-size: 19px;
  }
  .thumb {
    width: 88px;
    height: 66px;
  }
  .title {
    font-size: 16px;
  }
  .summary {
    display: none;
  }
}
</style>
