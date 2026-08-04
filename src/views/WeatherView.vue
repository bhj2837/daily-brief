<script setup>
// ===== 날씨 모듈 (기존 skala-weather 이식) =====
// 검색 + 현재위치 + 대표 도시 히어로 + 예보 + 전국 그리드 + 즐겨찾기.
// 몰입형 무드 배경은 제거하고 에디토리얼 톤으로 재구성. 로직/컴포저블/스토어는 그대로 재활용.
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

// 대표(히어로) 도시 로딩
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
    <!-- 검색 -->
    <div class="search-zone">
      <SearchBar @select-city="selectCity" />
      <el-button class="loc-btn" round :loading="locating" @click="useMyLocation">📍 내 위치</el-button>
    </div>
    <SearchHistory class="hist" @select-city="selectCity" />

    <!-- 히어로 -->
    <section class="hero" :class="{ loading: isLoading }">
      <div v-if="current" class="hero-inner">
        <div class="hero-left">
          <div class="hero-city">
            <span class="kicker">Now</span>
            <h1 class="serif">{{ current.name }}</h1>
            <FavoriteButton v-if="heroCity" :city-id="heroCity.id" />
          </div>
          <p class="hero-sub">{{ bandLabel }} · {{ current.weather?.[0]?.description }}</p>
          <SourceBadge :source="source || 'mock'" class="hero-src" />
          <div class="hero-metrics mono">
            <span>체감 {{ format(current.main?.feels_like) }}</span>
            <span>💧 {{ current.main?.humidity }}%</span>
            <span>🌬 {{ current.wind?.speed }}m/s</span>
          </div>
          <el-button v-if="heroCity" type="primary" round @click="goDetail(heroCity.id)">
            상세 관측 정보 →
          </el-button>
        </div>
        <div class="hero-right">
          <div class="hero-emoji">{{ emoji }}</div>
          <div class="hero-temp mono">{{ format(current.main?.temp) }}</div>
        </div>
      </div>
      <SkeletonBlock v-else height="180px" />
    </section>

    <!-- 예보 -->
    <section class="paper forecast-zone">
      <ForecastStrip :forecast="forecast" />
    </section>

    <!-- 즐겨찾기 -->
    <section v-if="favCities.length">
      <SectionHeader kicker="Saved" title="즐겨찾기" />
      <div class="city-grid">
        <WeatherCard
          v-for="c in favCities"
          :key="c.id"
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
        <SkeletonBlock v-for="n in 6" :key="n" height="150px" />
      </div>
      <div v-else class="city-grid">
        <WeatherCard
          v-for="c in CITIES"
          :key="c.id"
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
  gap: 22px;
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
  margin-top: -8px;
}

.hero {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 30px;
  box-shadow: 0 1px 2px var(--shadow);
  min-height: 200px;
  transition: opacity 0.3s;
}
.hero.loading {
  opacity: 0.6;
}
.hero-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.hero-city {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero-city h1 {
  font-size: 40px;
  font-weight: 900;
}
.hero-sub {
  color: var(--ink-sub);
  font-size: 16px;
  margin: 6px 0 10px;
}
.hero-src {
  margin-bottom: 14px;
}
.hero-metrics {
  display: flex;
  gap: 16px;
  font-size: 15px;
  margin-bottom: 18px;
  color: var(--ink-sub);
}
.hero-right {
  text-align: center;
}
.hero-emoji {
  font-size: 76px;
  line-height: 1;
}
.hero-temp {
  font-size: 68px;
  font-weight: 800;
  letter-spacing: -3px;
}
.forecast-zone {
  padding: 20px 22px;
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
@media (max-width: 640px) {
  .hero {
    padding: 22px;
  }
  .hero-inner {
    flex-direction: column;
    text-align: center;
  }
  .hero-city {
    justify-content: center;
  }
  .hero-temp {
    font-size: 56px;
  }
}
</style>
