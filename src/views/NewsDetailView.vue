<script setup>
// ===== 기사 상세 (동적 라우트 /news/:id) =====
// id 접두사로 소스를 판별해 로딩한다: hn-<id> | sf-<id> | gnews-<id> | mock-<id>.
// 조판: 킥커 → 헤드라인 → 바이라인(이중 괘선) → 하프톤 사진 → 본문(드롭캡·세리프).
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchHnItem, fetchHnComments, fetchSfItem, findMockNews, findGnewsNews } from '@/api/news'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { timeAgo } from '@/utils/format'
import BaseCard from '@/components/common/BaseCard.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'

const props = defineProps({
  id: { type: String, required: true },
})
const router = useRouter()
const bookmarkStore = useBookmarkStore()

const article = ref(null)
const comments = ref([])
const isLoading = ref(false)
const error = ref(null)

const marked = computed(() => (article.value ? bookmarkStore.has('news', article.value.id) : false))

// 바이라인: 필자/시각을 좌측, 반응 지표를 우측으로 분리 조판
const bylineLeft = computed(() => {
  const a = article.value
  if (!a) return ''
  return [a.author ? `글 ${a.author}` : null, timeAgo(a.at)].filter(Boolean).join(' · ')
})
const bylineRight = computed(() => {
  const a = article.value
  if (!a) return ''
  const parts = []
  if (a.score != null) parts.push(`▲ ${a.score}`)
  if (a.comments != null) parts.push(`💬 ${a.comments}`)
  return parts.join(' · ')
})

const load = async (id) => {
  isLoading.value = true
  error.value = null
  comments.value = []
  article.value = null
  try {
    if (id.startsWith('hn-')) {
      const raw = id.slice(3)
      const a = await fetchHnItem(raw)
      article.value = a
      if (a.kids?.length) comments.value = await fetchHnComments(a.kids)
    } else if (id.startsWith('sf-')) {
      article.value = await fetchSfItem(id.slice(3))
    } else if (id.startsWith('gnews-')) {
      article.value = await findGnewsNews(id)
      if (!article.value) error.value = '기사를 찾을 수 없습니다. 목록에서 다시 열어 주세요.'
    } else if (id.startsWith('mock-')) {
      article.value = findMockNews(id.slice(5))
      if (!article.value) error.value = '기사를 찾을 수 없습니다.'
    } else {
      error.value = '알 수 없는 기사입니다.'
    }
  } catch (e) {
    error.value = e.message || '기사를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const toggleMark = () =>
  bookmarkStore.toggle({ type: 'news', id: article.value.id, label: article.value.title })

watch(() => props.id, load)
onMounted(() => load(props.id))
</script>

<template>
  <div class="detail">
    <button class="back" @click="router.push('/news')">
      <span class="arrow">←</span> 뉴스 목록
    </button>

    <div v-if="isLoading" class="paper loading">
      <SkeletonBlock width="110px" height="11px" radius="2px" />
      <SkeletonBlock height="30px" :lines="2" />
      <SkeletonBlock height="15px" :lines="4" />
    </div>

    <el-result
      v-else-if="error"
      icon="warning"
      title="기사를 불러오지 못했습니다"
      :sub-title="error"
    >
      <template #extra>
        <el-button type="primary" round @click="router.push('/news')">뉴스로</el-button>
      </template>
    </el-result>

    <template v-else-if="article">
      <article class="paper art">
        <!-- 킥커 줄 -->
        <div class="art-kicker">
          <SourceBadge :source="article.isLive ? 'live' : 'mock'" :label="article.sourceLabel" />
          <button class="mark" :class="{ on: marked }" @click="toggleMark">
            {{ marked ? '🔖 저장됨' : '📑 북마크' }}
          </button>
        </div>

        <h1 class="art-title serif">{{ article.title }}</h1>

        <!-- 바이라인: 위아래 괘선으로 감싼 신문 표기 -->
        <div class="byline-block">
          <span class="dateline">{{ bylineLeft }}</span>
          <span v-if="bylineRight" class="dateline right">{{ bylineRight }}</span>
        </div>

        <figure v-if="article.image" v-reveal class="art-fig halftone">
          <img :src="article.image" :alt="article.title" decoding="async" />
        </figure>
        <figcaption v-if="article.image" class="art-cap">
          {{ article.sourceLabel }} 제공 사진
        </figcaption>

        <!-- 본문: Mock은 문단 배열, 그 외는 요약 -->
        <div v-if="article.body?.length" class="prose art-body">
          <p v-for="(p, i) in article.body" :key="i" :class="{ dropcap: i === 0 }">{{ p }}</p>
        </div>
        <p v-else-if="article.summary" class="prose art-body dropcap">{{ article.summary }}</p>
        <p v-else class="prose art-body muted">
          본문 요약이 제공되지 않는 기사입니다. 원문에서 전체 내용을 확인하세요.
        </p>

        <div v-if="article.url" class="art-foot">
          <a :href="article.url" target="_blank" rel="noopener noreferrer" class="btn-ink">
            원문 보기 ↗
          </a>
        </div>
      </article>

      <!-- HN 댓글 -->
      <BaseCard v-if="comments.length" v-reveal title="독자 토론" kicker="Discussion">
        <ul class="comments">
          <li v-for="(c, i) in comments" :key="c.id" v-reveal="{ index: i }" class="comment">
            <div class="c-meta">
              <b>{{ c.author }}</b>
              <span class="c-dot" aria-hidden="true" />
              <span>{{ timeAgo(c.at) }}</span>
            </div>
            <p class="c-text">{{ c.text }}</p>
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: var(--sp-4);
  max-width: calc(var(--maxw-read) + 120px);
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: var(--fs-small);
  cursor: pointer;
  justify-self: start;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back .arrow {
  transition: transform var(--dur) var(--ease-paper);
}
.back:hover {
  color: var(--ink);
}
.back:hover .arrow {
  transform: translateX(-4px);
}

.loading {
  padding: var(--sp-6);
  display: grid;
  gap: var(--sp-4);
}

.art {
  padding: clamp(22px, 4vw, 42px) clamp(20px, 4vw, 46px) clamp(26px, 4vw, 42px);
  border-top: var(--rule-thick) solid var(--ink);
}
.art-kicker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}
.mark {
  border: var(--rule-thin) solid var(--border-strong);
  background: transparent;
  color: var(--ink-sub);
  border-radius: var(--radius-pill);
  padding: 5px 13px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--dur-fast) var(--ease),
    border-color var(--dur-fast) var(--ease);
}
.mark:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.mark.on {
  color: var(--accent);
  border-color: var(--accent);
}

.art-title {
  font-size: var(--fs-h1);
  font-weight: 900;
  line-height: 1.16;
  letter-spacing: -0.026em;
  word-break: keep-all;
}

.byline-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin: var(--sp-4) 0 var(--sp-5);
  padding: 9px 0;
  border-top: var(--rule-med) solid var(--ink);
  border-bottom: var(--rule-hair) solid var(--border-strong);
}

.art-fig {
  border: var(--rule-thin) solid var(--border-strong);
  background: var(--surface-2);
  margin-bottom: 7px;
}
.art-fig img {
  width: 100%;
}
.art-cap {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  border-left: var(--rule-med) solid var(--border-strong);
  padding-left: 8px;
  margin-bottom: var(--sp-5);
}

.art-body {
  max-width: none;
}
.art-body.muted {
  color: var(--ink-sub);
  font-style: italic;
}

.art-foot {
  margin-top: var(--sp-6);
  padding-top: var(--sp-4);
  border-top: var(--rule-hair) solid var(--border-strong);
}

/* 댓글 */
.comments {
  display: grid;
  gap: var(--sp-4);
}
.comment {
  padding-bottom: var(--sp-3);
  border-bottom: var(--rule-hair) solid var(--border);
}
.comment:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.c-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12.5px;
  color: var(--ink-mute);
}
.c-meta b {
  font-weight: 800;
  color: var(--ink);
}
.c-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--ink-faint);
}
.c-text {
  font-family: var(--font-serif);
  font-size: 14.5px;
  line-height: 1.72;
  color: var(--ink-sub);
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 560px) {
  .byline-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
