<script setup>
// ===== 오늘의 브리핑 (홈) =====
// 하루치 정보를 한 화면에 요약하는 데일리 브리핑형 세로 스크롤 레이아웃.
// 날씨 요약 · 뉴스 헤드라인은 실데이터로 동작, 마켓 요약은 다음 단계 연결용 플레이스홀더.
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CITIES } from '@/api/weather/cities'
import { fetchCurrentByCity } from '@/api/weather/weatherApi'
import { useWeather } from '@/composables/useWeather'
import { useNews } from '@/composables/useNews'
import { fetchMarketSummary } from '@/api/markets'
import { weatherEmoji } from '@/utils/format'
import { useUnit } from '@/composables/useUnit'
import BaseCard from '@/components/common/BaseCard.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import HeadlineItem from '@/components/news/HeadlineItem.vue'

const router = useRouter()
const { format } = useUnit()

// ---- 헤드라인(실데이터: Hacker News 상위) ----
const { articles: headlines, isLoading: newsLoading, source: newsSource, load: loadNews } = useNews()

// ---- 상단 발행일(신문 제호 하단) ----
const today = new Date()
const dateLine = computed(() => {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${days[today.getDay()]})`
})

// ---- 날씨 요약(실데이터) : 대표 도시 서울 + 주요 도시 미니 그리드 ----
const { current, source, loadCity } = useWeather()
const miniCities = CITIES.slice(0, 4)
const mini = reactive({})
const miniLoading = ref(true)

const loadMini = async () => {
  miniLoading.value = true
  const res = await Promise.all(miniCities.map((c) => fetchCurrentByCity(c.id)))
  res.forEach((r, i) => (mini[miniCities[i].id] = r.data))
  miniLoading.value = false
}

// ---- 마켓 요약(실데이터) ----
const marketItems = ref([])
const marketLoading = ref(true)
const marketSource = ref('mock')
const loadMarkets = async () => {
  marketLoading.value = true
  try {
    const { items, source: src } = await fetchMarketSummary()
    marketItems.value = items.slice(0, 6)
    marketSource.value = src
  } finally {
    marketLoading.value = false
  }
}
const sign = (c) => (c > 0 ? '▲' : c < 0 ? '▼' : '·')

onMounted(async () => {
  loadNews('tech', 7)
  loadMarkets()
  await loadCity('seoul')
  loadMini()
})

const goWeather = () => router.push('/weather')
const goDetail = (id) => router.push(`/weather/${id}`)
</script>

<template>
  <div class="brief">
    <!-- 발행 헤더 -->
    <header class="edition">
      <div class="edition-line">
        <span class="rule-tick" />
        <span class="date">{{ dateLine }}</span>
        <span class="rule-tick" />
      </div>
      <h1 class="edition-title serif">오늘의 브리핑</h1>
    </header>

    <div class="layout">
      <!-- 메인 컬럼: 헤드라인 -->
      <div class="col-main">
        <SectionHeader kicker="Headlines" title="헤드라인">
          <template #action>
            <div class="head-action">
              <SourceBadge v-if="!newsLoading" :source="newsSource || 'live'" />
              <button class="more" @click="router.push('/news')">뉴스 전체 →</button>
            </div>
          </template>
        </SectionHeader>

        <!-- 실데이터: Hacker News 상위 헤드라인 -->
        <div v-if="newsLoading" class="headline-list">
          <div v-for="n in 6" :key="n" class="hl-skel">
            <SkeletonBlock height="16px" :lines="2" />
          </div>
        </div>
        <div v-else class="headline-list">
          <HeadlineItem
            v-for="(a, i) in headlines"
            :key="a.id"
            :article="a"
            :rank="i + 1"
          />
        </div>
      </div>

      <!-- 사이드바: 날씨 요약(실데이터) + 마켓 요약(예정) -->
      <aside class="col-side">
        <!-- 날씨 요약 위젯 -->
        <BaseCard kicker="Weather" title="오늘의 날씨">
          <template #action>
            <SourceBadge :source="source || 'mock'" />
          </template>

          <div v-if="current" class="wsum">
            <div class="wsum-hero" @click="goDetail('seoul')">
              <span class="wemoji">{{ weatherEmoji(current.weather?.[0]?.main) }}</span>
              <div class="wtext">
                <div class="wcity serif">{{ current.name }}</div>
                <div class="wdesc">{{ current.weather?.[0]?.description }}</div>
              </div>
              <div class="wtemp mono">{{ format(current.main?.temp) }}</div>
            </div>
            <div class="wmeta">
              체감 {{ format(current.main?.feels_like) }} · 💧 {{ current.main?.humidity }}% · 🌬
              {{ current.wind?.speed }}m/s
            </div>
          </div>
          <SkeletonBlock v-else height="88px" />

          <div class="mini-grid">
            <template v-if="!miniLoading">
              <button
                v-for="c in miniCities"
                :key="c.id"
                class="mini"
                @click="goDetail(c.id)"
              >
                <span class="m-emoji">{{ weatherEmoji(mini[c.id]?.weather?.[0]?.main) }}</span>
                <span class="m-city">{{ c.ko }}</span>
                <span class="m-temp mono">{{ format(mini[c.id]?.main?.temp) }}</span>
              </button>
            </template>
            <SkeletonBlock v-for="n in 4" v-else :key="n" height="58px" />
          </div>

          <button class="more full" @click="goWeather">전국 날씨 보기 →</button>
        </BaseCard>

        <!-- 마켓 요약(실데이터) -->
        <BaseCard kicker="Markets" title="마켓 요약">
          <template #action>
            <SourceBadge v-if="!marketLoading" :source="marketSource" />
          </template>
          <div v-if="marketLoading" class="market-skel">
            <div v-for="n in 5" :key="n" class="mrow">
              <SkeletonBlock width="70px" height="14px" radius="4px" />
              <SkeletonBlock width="90px" height="14px" radius="4px" />
            </div>
          </div>
          <ul v-else class="market-list">
            <li v-for="m in marketItems" :key="m.label" class="mrow2">
              <span class="ml-label">{{ m.label }}</span>
              <span class="ml-right">
                <span class="ml-val mono">{{ m.value }}</span>
                <span class="ml-chg mono" :class="m.change > 0 ? 'up' : m.change < 0 ? 'down' : ''">
                  {{ sign(m.change) }} {{ Math.abs(m.change).toFixed(2) }}%
                </span>
              </span>
            </li>
          </ul>
          <button class="more full" @click="router.push('/markets')">마켓 상세 →</button>
        </BaseCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.brief {
  display: grid;
  gap: 26px;
}
.edition {
  text-align: center;
  padding: 8px 0 6px;
}
.edition-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--ink-sub);
}
.edition-line .rule-tick {
  height: 1px;
  width: 60px;
  background: var(--border-strong);
}
.edition-line .date {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.edition-title {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 8px 0 6px;
}
.edition-sub {
  color: var(--ink-sub);
  font-size: 15px;
}

.layout {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 28px;
  align-items: start;
}

/* 헤드라인 */
.headline-list {
  display: grid;
}
.head-action {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hl-skel {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.soon-note {
  color: var(--ink-mute);
  font-size: 13px;
  padding-top: 4px;
}
.soon-note.sm {
  font-size: 12px;
  margin-top: 4px;
}

.col-side {
  display: grid;
  gap: 18px;
}

/* 날씨 요약 */
.wsum-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.wemoji {
  font-size: 44px;
  line-height: 1;
}
.wtext {
  flex: 1;
}
.wcity {
  font-size: 20px;
  font-weight: 700;
}
.wdesc {
  color: var(--ink-sub);
  font-size: 13px;
}
.wtemp {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -1px;
}
.wmeta {
  color: var(--ink-sub);
  font-size: 12.5px;
  margin: 10px 0 14px;
}
.mini-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  cursor: pointer;
  transition: border-color 0.18s, transform 0.15s;
}
.mini:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
}
.m-emoji {
  font-size: 20px;
}
.m-city {
  font-size: 12px;
  color: var(--ink-sub);
}
.m-temp {
  font-size: 14px;
  font-weight: 700;
}
.market-skel {
  display: grid;
  gap: 12px;
  padding: 4px 0 2px;
}
.mrow {
  display: flex;
  justify-content: space-between;
}
.market-list {
  list-style: none;
  display: grid;
}
.mrow2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}
.mrow2:last-child {
  border-bottom: 0;
}
.ml-label {
  font-size: 13.5px;
  font-weight: 700;
}
.ml-right {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.ml-val {
  font-size: 13.5px;
  font-weight: 700;
}
.ml-chg {
  font-size: 12px;
  font-weight: 700;
  min-width: 62px;
  text-align: right;
}
.ml-chg.up {
  color: var(--up);
}
.ml-chg.down {
  color: var(--down);
}

.more {
  border: 0;
  background: transparent;
  color: var(--accent);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.more.full {
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 14px;
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--ink);
  transition: border-color 0.18s, background 0.18s;
}
.more.full:hover {
  border-color: var(--ink);
  background: var(--surface-2);
}

@media (max-width: 860px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .edition-title {
    font-size: 34px;
  }
}
</style>
