<script setup>
// ===== 북마크 모아보기 =====
// 저장한 뉴스 기사 + 즐겨찾기 도시를 한 화면에 모은다 (bookmarkStore 재사용).
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
    <SectionHeader kicker="Saved" title="북마크" />

    <el-empty
      v-if="!hasAny"
      description="아직 저장한 항목이 없어요. 뉴스와 날씨에서 북마크해 보세요."
    >
      <el-button type="primary" round @click="router.push('/news')">뉴스 보러 가기</el-button>
    </el-empty>

    <template v-else>
      <!-- 뉴스 북마크 -->
      <section v-if="newsBookmarks.length" class="block">
        <h3 class="b-title">🔖 뉴스 {{ newsBookmarks.length }}</h3>
        <ul class="news-list">
          <li v-for="b in newsBookmarks" :key="b.id" class="news-row">
            <button class="news-open serif" @click="router.push(`/news/${b.id}`)">{{ b.label }}</button>
            <div class="news-meta">
              <span class="ago">{{ timeAgo(b.at) }} 저장</span>
              <button class="rm" title="삭제" @click="removeNews(b.id)">✕</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- 도시 즐겨찾기 -->
      <section v-if="cityIds.length" class="block">
        <h3 class="b-title">⭐ 즐겨찾기 도시 {{ cityIds.length }}</h3>
        <div v-if="gridLoading" class="city-grid">
          <SkeletonBlock v-for="n in cityIds.length" :key="n" height="150px" />
        </div>
        <div v-else class="city-grid">
          <WeatherCard
            v-for="id in cityIds"
            :key="id"
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
  margin-top: 18px;
}
.b-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ink-sub);
  margin-bottom: 12px;
  font-family: var(--font-sans);
}
.news-list {
  list-style: none;
  display: grid;
}
.news-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
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
}
.news-open:hover {
  color: var(--accent);
}
.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.ago {
  font-size: 11.5px;
  color: var(--ink-mute);
}
.rm {
  border: 0;
  background: transparent;
  color: var(--ink-mute);
  cursor: pointer;
  font-size: 13px;
}
.rm:hover {
  color: var(--down);
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.muted {
  color: var(--ink-mute);
}
</style>
