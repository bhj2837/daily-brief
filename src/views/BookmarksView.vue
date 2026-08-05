<script setup>
// ===== 북마크 모아보기 (스크랩) =====
// 저장한 뉴스 기사 + 즐겨찾기 도시를 한 화면에 모은다 (bookmarkStore 재사용).
// 조판: 신문에서 오려 붙인 스크랩 지면. 항목마다 절취선 느낌의 점선 구분.
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { fetchCurrentByCity } from '@/api/weather/weatherApi'
import { findCityById } from '@/api/weather/cities'
import { timeAgo } from '@/utils/format'
import SectionHeader from '@/components/common/SectionHeader.vue'
import WeatherCard from '@/components/weather/WeatherCard.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const { items } = storeToRefs(bookmarkStore)

const newsBookmarks = computed(() => bookmarkStore.byType('news'))
const cityIds = computed(() => bookmarkStore.cityIds)
const hasAny = computed(() => items.value.length > 0)

const grid = reactive({})
const gridLoading = ref(false)
const loadCities = async () => {
  if (!cityIds.value.length) return
  gridLoading.value = true
  const res = await Promise.all(cityIds.value.map((id) => fetchCurrentByCity(id)))
  res.forEach((r, i) => (grid[cityIds.value[i]] = r.data))
  gridLoading.value = false
}

const removeNews = (id) => bookmarkStore.remove('news', id)
const cityLabel = (id) => findCityById(id)?.ko || id

onMounted(loadCities)
</script>

<template>
  <div class="bm">
    <SectionHeader
      kicker="Clippings"
      title="북마크"
      size="lg"
      :sub="hasAny ? `총 ${items.length}건을 스크랩했습니다` : ''"
    />

    <el-empty
      v-if="!hasAny"
      description="아직 저장한 항목이 없어요. 뉴스와 날씨에서 북마크해 보세요."
    >
      <el-button type="primary" round @click="router.push('/news')">뉴스 보러 가기</el-button>
    </el-empty>

    <template v-else>
      <!-- 뉴스 스크랩 -->
      <section v-if="newsBookmarks.length" class="block">
        <h3 class="b-title dateline">🔖 뉴스 스크랩 {{ newsBookmarks.length }}건</h3>
        <ul class="news-list">
          <li v-for="(b, i) in newsBookmarks" :key="b.id" v-reveal="{ index: i }" class="news-row">
            <button class="news-open serif" @click="router.push(`/news/${b.id}`)">
              <span class="ink-underline">{{ b.label }}</span>
            </button>
            <div class="news-meta">
              <span class="ago dateline">{{ timeAgo(b.at) }} 저장</span>
              <button class="rm" title="삭제" @click="removeNews(b.id)">✕</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 도시 즐겨찾기 -->
      <section v-if="cityIds.length" class="block">
        <h3 class="b-title dateline">⭐ 즐겨찾기 도시 {{ cityIds.length }}곳</h3>
        <div v-if="gridLoading" class="city-grid">
          <SkeletonBlock v-for="n in cityIds.length" :key="n" height="152px" radius="3px" />
        </div>
        <div v-else class="city-grid">
          <WeatherCard
            v-for="(id, i) in cityIds"
            :key="id"
            v-reveal="{ index: i }"
            :city-id="id"
            :weather="grid[id]"
            @select-card="router.push(`/weather/${id}`)"
          />
          <template v-if="!Object.keys(grid).length">
            <p class="muted">{{ cityIds.map(cityLabel).join(', ') }}</p>
          </template>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.bm {
  display: grid;
  gap: 8px;
}
.block {
  margin-top: var(--sp-5);
}
.b-title {
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: var(--rule-thin) solid var(--border-strong);
}

.news-list {
  display: grid;
}
/* 절취선 느낌의 점선 구분 */
.news-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 2px;
  border-bottom: 1px dashed var(--border-strong);
}
.news-row:last-child {
  border-bottom: 0;
}
.news-open {
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  min-width: 0;
}
.news-open .ink-underline {
  background-size: 0% var(--rule-thin);
}
.news-open:hover .ink-underline {
  background-size: 100% var(--rule-thin);
}
.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.rm {
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  cursor: pointer;
  font-size: 13px;
  transition:
    color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease-paper);
}
.rm:hover {
  color: var(--down);
  transform: rotate(90deg);
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
  gap: 14px;
}
.muted {
  color: var(--ink-mute);
}

@media (max-width: 560px) {
  .news-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .news-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
