<script setup>
// ===== 날씨면 =====
// 검색 + 현재위치 + 대표 도시 관측 헤드 + 예보 + 전국 그리드 + 즐겨찾기.
// 조판: 신문 기상면처럼 상단에 큰 관측 기록(온도·체감·습도·바람)을 표로 정리하고,
//       그 아래 예보 스트립과 전국 시군 표를 배치한다.
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { CITIES, findCityById } from '@/api/weather/cities'
import { fetchCurrentByCity } from '@/api/weather/weatherApi'
import { useWeather } from '@/composables/useWeather'
import { useWeatherTheme } from '@/composables/useWeatherTheme'
import { useGeolocation } from '@/composables/useGeolocation'
import { useUnit } from '@/composables/useUnit'
import { useHistoryStore } from '@/stores/historyStore'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import SectionHeader from '@/components/common/SectionHeader.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import SearchBar from '@/components/weather/SearchBar.vue'
import SearchHistory from '@/components/weather/SearchHistory.vue'
import WeatherCard from '@/components/weather/WeatherCard.vue'
import ForecastStrip from '@/components/weather/ForecastStrip.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'

const router = useRouter()
const historyStore = useHistoryStore()
const bookmarkStore = useBookmarkStore()
const { cityIds } = storeToRefs(bookmarkStore)
const { format } = useUnit()

// 대표(관측 헤드) 도시 로딩
const { current, forecast, isLoading, source, activeCityId, loadCity, loadByCoords } = useWeather()
const { emoji, band } = useWeatherTheme(current)

// 그리드용: 모든 도시의 현재 날씨를 병렬 로딩 (강의 9장 Promise.all)
const grid = reactive({})
const gridLoading = ref(true)
const loadGrid = async () => {
  gridLoading.value = true
  const results = await Promise.all(CITIES.map((c) => fetchCurrentByCity(c.id)))
  results.forEach((r, i) => (grid[CITIES[i].id] = r.data))
  gridLoading.value = false
}

const heroCity = computed(() => findCityById(activeCityId.value))
const bandLabel = computed(
  () => ({ dawn: '이른 아침', day: '한낮', dusk: '해질녘', night: '밤' })[band.value],
)
const favCities = computed(() => cityIds.value.map(findCityById).filter(Boolean))

// 관측 기록 표
const observations = computed(() => {
  const c = current.value
  if (!c) return []
  return [
    { k: '체감', v: format(c.main?.feels_like) },
    { k: '습도', v: `${c.main?.humidity ?? '-'}%` },
    { k: '바람', v: `${c.wind?.speed ?? '-'} m/s` },
    { k: '기압', v: c.main?.pressure ? `${c.main.pressure} hPa` : '-' },
  ]
})

const selectCity = async (cityId) => {
  await loadCity(cityId)
  const c = findCityById(cityId)
  if (c) historyStore.push(c)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const goDetail = (cityId) => router.push(`/weather/${cityId}`)

const { locating, locate } = useGeolocation()
const useMyLocation = async () => {
  try {
    const { lat, lon } = await locate()
    const id = await loadByCoords(lat, lon)
    if (id) ElMessage.success(`현재 위치와 가까운 ${findCityById(id)?.ko} 날씨를 불러왔어요`)
  } catch (e) {
    ElMessage.warning(e.message)
  }
}

onMounted(async () => {
  await loadCity('seoul')
  loadGrid()
})
</script>

<template>
  <div class="weather">
    <SectionHeader kicker="Weather" title="날씨" size="lg" />

    <!-- 검색 -->
    <div class="search-zone">
      <SearchBar @select-city="selectCity" />
      <el-button class="loc-btn" round :loading="locating" @click="useMyLocation">
        📍 내 위치
      </el-button>
    </div>
    <SearchHistory class="hist" @select-city="selectCity" />

    <!-- 관측 헤드 -->
    <section class="obs" :class="{ loading: isLoading }">
      <template v-if="current">
        <div class="obs-main">
          <div class="obs-left">
            <div class="obs-city">
              <span class="kicker">Now</span>
              <h2 class="serif">{{ current.name }}</h2>
              <FavoriteButton v-if="heroCity" :city-id="heroCity.id" />
            </div>
            <p class="obs-desc">{{ bandLabel }} · {{ current.weather?.[0]?.description }}</p>
            <SourceBadge :source="source || 'mock'" class="obs-src" />
          </div>

          <div class="obs-right">
            <span class="obs-emoji">{{ emoji }}</span>
            <span class="obs-temp mono">{{ format(current.main?.temp) }}</span>
          </div>
        </div>

        <!-- 관측 기록 표 -->
        <dl class="obs-table">
          <div v-for="o in observations" :key="o.k">
            <dt class="dateline">{{ o.k }}</dt>
            <dd class="mono">{{ o.v }}</dd>
          </div>
        </dl>

        <div v-if="heroCity" class="obs-foot">
          <button class="btn-ink" @click="goDetail(heroCity.id)">상세 관측 정보 →</button>
        </div>
      </template>
      <SkeletonBlock v-else height="200px" />
    </section>

    <!-- 예보 -->
    <section v-reveal class="paper forecast-zone">
      <ForecastStrip :forecast="forecast" />
    </section>

    <!-- 즐겨찾기 -->
    <section v-if="favCities.length">
      <SectionHeader kicker="Saved" title="즐겨찾기" />
      <div class="city-grid">
        <WeatherCard
          v-for="(c, i) in favCities"
          :key="c.id"
          v-reveal="{ index: i }"
          :city-id="c.id"
          :weather="grid[c.id]"
          @select-card="goDetail"
        />
      </div>
    </section>

    <!-- 전국 그리드 -->
    <section>
      <SectionHeader kicker="Nationwide" title="전국 날씨" />
      <div v-if="gridLoading" class="city-grid">
        <SkeletonBlock v-for="n in 6" :key="n" height="152px" radius="3px" />
      </div>
      <div v-else class="city-grid">
        <WeatherCard
          v-for="(c, i) in CITIES"
          :key="c.id"
          v-reveal="{ index: i }"
          :city-id="c.id"
          :weather="grid[c.id]"
          @select-card="goDetail"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.weather {
  display: grid;
  gap: var(--sp-6);
}
.search-zone {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-zone :deep(.searchbar) {
  flex: 1;
}
.loc-btn {
  white-space: nowrap;
}
.hist {
  margin-top: calc(-1 * var(--sp-4));
}

/* ===== 관측 헤드 ===== */
.obs {
  background: var(--surface);
  border: var(--rule-thin) solid var(--border);
  border-top: var(--rule-thick) solid var(--ink);
  border-radius: var(--radius);
  padding: clamp(20px, 3vw, 30px);
  box-shadow: 0 1px 0 var(--shadow);
  transition: opacity var(--dur) var(--ease);
}
.obs.loading {
  opacity: 0.55;
}
.obs-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-5);
  padding-bottom: var(--sp-4);
  border-bottom: var(--rule-med) solid var(--ink);
}
.obs-city {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.obs-city h2 {
  font-size: var(--fs-h1);
  font-weight: 900;
  letter-spacing: -0.03em;
}
.obs-desc {
  color: var(--ink-sub);
  font-family: var(--font-serif);
  font-size: var(--fs-lead);
  margin: 6px 0 10px;
}
.obs-right {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-shrink: 0;
}
.obs-emoji {
  font-size: clamp(44px, 7vw, 68px);
  line-height: 1;
}
.obs-temp {
  font-size: clamp(42px, 8vw, 66px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
}

/* 관측 기록 표 */
.obs-table {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin-top: var(--sp-4);
}
.obs-table > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-right: var(--rule-hair) solid var(--border);
}
.obs-table > div:last-child {
  border-right: 0;
}
.obs-table dd {
  font-size: 16px;
  font-weight: 800;
}
.obs-foot {
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: var(--rule-hair) solid var(--border);
}

.forecast-zone {
  padding: var(--sp-5);
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
  gap: 14px;
}

@media (max-width: 640px) {
  .obs-main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .obs-city {
    justify-content: center;
  }
  .obs-table {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 8px;
  }
  .obs-table > div:nth-child(2n) {
    border-right: 0;
  }
  .search-zone {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
