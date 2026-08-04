<script setup>
// ===== 기사 상세 (동적 라우트 /news/:id) =====
// id 접두사로 소스를 판별해 로딩한다: hn-<id> | sf-<id> | mock-<id>.
// HN 기사는 원문 링크 + 상위 댓글, Spaceflight는 요약+이미지+원문, 종합(Mock)은 본문 문단.
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchHnItem, fetchHnComments, fetchSfItem, findMockNews } from '@/api/news'
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
const meta = computed(() => {
  const a = article.value
  if (!a) return ''
  const parts = [a.sourceLabel, timeAgo(a.at)]
  if (a.author) parts.push(`by ${a.author}`)
  if (a.score != null) parts.push(`▲ ${a.score}`)
  if (a.comments != null) parts.push(`💬 ${a.comments}`)
  return parts.filter(Boolean).join(' · ')
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
    <button class="back" @click="router.push('/news')">← 뉴스 목록</button>

    <div v-if="isLoading" class="paper loading">
      <SkeletonBlock width="120px" height="12px" radius="4px" />
      <SkeletonBlock height="30px" :lines="2" />
      <SkeletonBlock height="16px" :lines="3" />
    </div>

    <el-result v-else-if="error" icon="warning" title="기사를 불러오지 못했습니다" :sub-title="error">
      <template #extra>
        <el-button type="primary" round @click="router.push('/news')">뉴스로</el-button>
      </template>
    </el-result>

    <template v-else-if="article">
      <article class="paper art">
        <div class="art-head">
          <SourceBadge :source="article.isLive ? 'live' : 'mock'" :label="article.sourceLabel" />
          <button class="mark" :class="{ on: marked }" @click="toggleMark">
            {{ marked ? '🔖 저장됨' : '📑 북마크' }}
          </button>
        </div>

        <h1 class="art-title serif">{{ article.title }}</h1>
        <p class="art-meta">{{ meta }}</p>

        <img v-if="article.image" :src="article.image" :alt="article.title" class="art-img" />

        <!-- 본문: Mock은 문단 배열, 그 외는 요약 -->
        <div v-if="article.body?.length" class="art-body">
          <p v-for="(p, i) in article.body" :key="i">{{ p }}</p>
        </div>
        <p v-else-if="article.summary" class="art-body">{{ article.summary }}</p>
        <p v-else class="art-body muted">본문 요약이 제공되지 않는 기사입니다. 원문에서 전체 내용을 확인하세요.</p>

        <a
          v-if="article.url"
          :href="article.url"
          target="_blank"
          rel="noopener noreferrer"
          class="src-link"
        >
          원문 보기 ↗
        </a>
      </article>

      <!-- HN 댓글 -->
      <BaseCard v-if="comments.length" title="댓글" kicker="Discussion">
        <ul class="comments">
          <li v-for="c in comments" :key="c.id" class="comment">
            <div class="c-meta">
              <b>{{ c.author }}</b><span>{{ timeAgo(c.at) }}</span>
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
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  justify-self: start;
  padding: 0;
}
.back:hover {
  color: var(--ink);
}
.loading {
  padding: 26px;
  display: grid;
  gap: 14px;
}
.art {
  padding: 30px 32px;
}
.art-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.mark {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink-sub);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.mark.on {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
}
.art-title {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.25;
}
.art-meta {
  color: var(--ink-mute);
  font-size: 13px;
  font-weight: 600;
  margin: 10px 0 18px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--ink);
}
.art-img {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 18px;
}
.art-body {
  font-size: 16.5px;
  line-height: 1.85;
  color: var(--ink);
  font-family: var(--font-serif);
}
.art-body p + p {
  margin-top: 16px;
}
.art-body.muted {
  color: var(--ink-sub);
  font-style: italic;
}
.src-link {
  display: inline-block;
  margin-top: 22px;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-sans);
}
.comments {
  list-style: none;
  display: grid;
  gap: 16px;
}
.comment {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.c-meta {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 5px;
  font-size: 12.5px;
}
.c-meta b {
  font-weight: 800;
}
.c-meta span {
  color: var(--ink-mute);
}
.c-text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--ink-sub);
  white-space: pre-wrap;
  word-break: break-word;
}
@media (max-width: 560px) {
  .art {
    padding: 22px 20px;
  }
  .art-title {
    font-size: 24px;
  }
}
</style>
