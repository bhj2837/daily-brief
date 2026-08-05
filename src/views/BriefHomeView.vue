<script setup>
// ===== 오늘의 브리핑 (홈) · 신문 1면 =====
// 조판 구조
//   ① 발행 헤더(제호 하단 이중선 · 발행일 · 요약 지표)
//   ② 톱기사(lead) — 가장 큰 헤드라인 + 드롭캡 리드문 + 하프톤 사진
//   ③ 부기사 — 다단 헤드라인 목록
//   ④ 사이드바(박스 기사) — 오늘의 날씨 · 마켓 요약
// 날씨/뉴스/마켓 모두 실데이터, 실패 시 각 API 계층에서 폴백된다.
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CITIES } from '@/api/weather/cities'
import { fetchCurrentByCity } from '@/api/weather/weatherApi'
import { useWeather } from '@/composables/useWeather'
import { useNews } from '@/composables/useNews'
import { fetchMarketSummary } from '@/api/markets'
import { weatherEmoji, timeAgo } from '@/utils/format'
import { useUnit } from '@/composables/useUnit'
import BaseCard from '@/components/common/BaseCard.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import HeadlineItem from '@/components/news/HeadlineItem.vue'

const router = useRouter()
const { format } = useUnit()

// ---- 헤드라인(실데이터: Hacker News 상위) ----
const {
  articles: headlines,
  isLoading: newsLoading,
  source: newsSource,
  load: loadNews,
} = useNews()

// 1면 조판: 첫 기사는 톱기사, 나머지는 부기사
const lead = computed(() => headlines.value[0] || null)
const rest = computed(() => headlines.value.slice(1))
const leadMeta = computed(() => {
  const a = lead.value
  if (!a) return ''
  const parts = [a.sourceLabel, timeAgo(a.at)]
  if (a.score != null) parts.push(`▲ ${a.score}`)
  if (a.comments != null) parts.push(`💬 ${a.comments}`)
  return parts.filter(Boolean).join(' · ')
})

// ---- 발행 정보 ----
const today = new Date()
const dateLine = computed(() => {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`
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
  loadNews('tech', 9)
  loadMarkets()
  await loadCity('seoul')
  loadMini()
})

const goWeather = () => router.push('/weather')
const goDetail = (id) => router.push(`/weather/${id}`)
const openLead = () => lead.value && router.push(`/news/${lead.value.id}`)
</script>

<template>
  <div class="brief">
    <!-- ① 발행 헤더 -->
    <header class="edition">
      <div class="edition-rule" aria-hidden="true" />
      <div class="edition-bar">
        <span class="dateline">{{ dateLine }}</span>
        <span class="edition-mid serif">오늘의 브리핑</span>
        <span class="dateline right">Front Page</span>
      </div>
      <div class="edition-rule thin" aria-hidden="true" />
    </header>

    <div class="layout fold-line">
      <!-- ② + ③ 메인 컬럼 -->
      <div class="col-main">
        <SectionHeader kicker="Headlines" title="헤드라인" size="lg">
          <template #action>
            <div class="head-action">
              <SourceBadge v-if="!newsLoading" :source="newsSource || 'live'" />
              <button class="more-link" @click="router.push('/news')">
                뉴스 전체 <span class="arrow">→</span>
              </button>
            </div>
          </template>
        </SectionHeader>

        <!-- 로딩 -->
        <div v-if="newsLoading" class="lead-skel">
          <SkeletonBlock height="34px" :lines="2" />
          <SkeletonBlock height="15px" :lines="3" />
          <div class="hl-skel-list">
            <div v-for="n in 5" :key="n" class="hl-skel">
              <SkeletonBlock height="15px" :lines="2" />
            </div>
          </div>
        </div>

        <template v-else>
          <!-- ② 톱기사 -->
          <article v-if="lead" v-reveal class="lead-art" @click="openLead">
            <span class="kicker">Top Story</span>
            <h2 class="lead-title serif">
              <span class="ink-underline">{{ lead.title }}</span>
            </h2>
            <p class="lead-meta dateline">{{ leadMeta }}</p>

            <div class="lead-body" :class="{ 'no-fig': !lead.image }">
              <figure v-if="lead.image" class="lead-fig halftone">
                <img :src="lead.image" :alt="lead.title" decoding="async" />
              </figure>
              <p v-if="lead.summary" class="lead-text prose dropcap">{{ lead.summary }}</p>
              <p v-else class="lead-text prose">
                자세한 내용은 기사 상세에서 원문과 토론을 확인할 수 있습니다.
              </p>
            </div>
            <span class="more-link">기사 읽기 <span class="arrow">→</span></span>
          </article>

          <!-- ③ 부기사 다단 -->
          <div class="rest">
            <div class="rest-label dateline">더 읽을거리</div>
            <div class="rest-list columns-2">
              <HeadlineItem
                v-for="(a, i) in rest"
                :key="a.id"
                v-reveal="{ index: i }"
                :article="a"
                :rank="i + 2"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- ④ 사이드바 -->
      <aside class="col-side rule-left">
        <!-- 날씨 요약 -->
        <BaseCard v-reveal kicker="Weather" title="오늘의 날씨" variant="clip">
          <template #action>
            <SourceBadge :source="source || 'mock'" />
          </template>

          <div v-if="current" class="wsum">
            <button class="wsum-hero" @click="goDetail('seoul')">
              <span class="wemoji">{{ weatherEmoji(current.weather?.[0]?.main) }}</span>
              <span class="wtext">
                <span class="wcity serif">{{ current.name }}</span>
                <span class="wdesc">{{ current.weather?.[0]?.description }}</span>
              </span>
              <span class="wtemp mono">{{ format(current.main?.temp) }}</span>
            </button>
            <dl class="wmeta">
              <div>
                <dt>체감</dt>
                <dd class="mono">{{ format(current.main?.feels_like) }}</dd>
              </div>
              <div>
                <dt>습도</dt>
                <dd class="mono">{{ current.main?.humidity }}%</dd>
              </div>
              <div>
                <dt>바람</dt>
                <dd class="mono">{{ current.wind?.speed }}m/s</dd>
              </div>
            </dl>
          </div>
          <SkeletonBlock v-else height="88px" />

          <div class="mini-grid">
            <template v-if="!miniLoading">
              <button v-for="c in miniCities" :key="c.id" class="mini" @click="goDetail(c.id)">
                <span class="m-emoji">{{ weatherEmoji(mini[c.id]?.weather?.[0]?.main) }}</span>
                <span class="m-city">{{ c.ko }}</span>
                <span class="m-temp mono">{{ format(mini[c.id]?.main?.temp) }}</span>
              </button>
            </template>
            <SkeletonBlock v-for="n in 4" v-else :key="n" height="58px" />
          </div>

          <template #footer>
            <button class="foot-btn" @click="goWeather">
              전국 날씨 보기 <span class="arrow">→</span>
            </button>
          </template>
        </BaseCard>

        <!-- 마켓 요약 -->
        <BaseCard v-reveal="{ delay: 90 }" kicker="Markets" title="마켓 요약" variant="clip">
          <template #action>
            <SourceBadge v-if="!marketLoading" :source="marketSource" />
          </template>

          <div v-if="marketLoading" class="market-skel">
            <div v-for="n in 5" :key="n" class="mrow">
              <SkeletonBlock width="70px" height="14px" radius="3px" />
              <SkeletonBlock width="90px" height="14px" radius="3px" />
            </div>
          </div>
          <ul v-else class="market-list">
            <li v-for="m in marketItems" :key="m.label" class="mrow2">
              <span class="ml-label">{{ m.label }}</span>
              <span class="ml-lead" aria-hidden="true" />
              <span class="ml-right">
                <span class="ml-val mono">{{ m.value }}</span>
                <span class="ml-chg mono" :class="m.change > 0 ? 'up' : m.change < 0 ? 'down' : ''">
                  {{ sign(m.change) }} {{ Math.abs(m.change).toFixed(2) }}%
                </span>
              </span>
            </li>
          </ul>

          <template #footer>
            <button class="foot-btn" @click="router.push('/markets')">
              마켓 상세 <span class="arrow">→</span>
            </button>
          </template>
        </BaseCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.brief {
  display: grid;
  gap: var(--sp-6);
}

/* ===== ① 발행 헤더 ===== */
.edition-rule {
  height: var(--rule-thick);
  background: var(--ink);
}
.edition-rule.thin {
  height: var(--rule-thin);
}
.edition-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-4);
  padding: 9px 2px;
}
.edition-bar .right {
  text-align: right;
}
.edition-mid {
  font-size: clamp(15px, 2vw, 19px);
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* ===== 레이아웃 ===== */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
  gap: clamp(22px, 3.2vw, 40px);
  align-items: start;
}
.head-action {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== ② 톱기사 ===== */
.lead-art {
  cursor: pointer;
  padding-bottom: var(--sp-5);
  border-bottom: var(--rule-med) solid var(--ink);
  margin-bottom: var(--sp-5);
}
.lead-title {
  font-size: var(--fs-display);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.028em;
  margin: 6px 0 10px;
}
.lead-title .ink-underline {
  background-size: 0% 3px;
}
.lead-art:hover .lead-title .ink-underline {
  background-size: 100% 3px;
}
.lead-meta {
  padding-bottom: 12px;
  border-bottom: var(--rule-hair) solid var(--border-strong);
  margin-bottom: var(--sp-4);
}
.lead-body {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--sp-5);
  align-items: start;
}
.lead-body.no-fig {
  grid-template-columns: 1fr;
}
.lead-fig {
  border: var(--rule-thin) solid var(--border-strong);
  background: var(--surface-2);
  aspect-ratio: 4 / 3;
}
.lead-fig img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lead-text {
  max-width: none;
}
.lead-art .more-link {
  margin-top: var(--sp-4);
  display: inline-flex;
}

/* 로딩 스켈레톤 */
.lead-skel {
  display: grid;
  gap: var(--sp-4);
}
.hl-skel-list {
  display: grid;
  gap: 2px;
  margin-top: var(--sp-3);
}
.hl-skel {
  padding: 12px 0;
  border-bottom: var(--rule-thin) solid var(--border);
}

/* ===== ③ 부기사 ===== */
.rest-label {
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: var(--rule-thin) solid var(--border-strong);
}
.rest-list {
  padding-top: 2px;
}

/* ===== ④ 사이드바 ===== */
.col-side {
  display: grid;
  gap: var(--sp-5);
  position: sticky;
  top: 118px;
}

/* 날씨 요약 */
.wsum-hero {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0 0 12px;
  border-bottom: var(--rule-hair) solid var(--border-strong);
}
.wemoji {
  font-size: 42px;
  line-height: 1;
  transition: transform var(--dur) var(--ease-paper);
}
.wsum-hero:hover .wemoji {
  transform: scale(1.1) rotate(-4deg);
}
.wtext {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.wcity {
  font-size: 19px;
  font-weight: 700;
}
.wdesc {
  color: var(--ink-sub);
  font-size: var(--fs-small);
}
.wtemp {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.wmeta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 12px 0 var(--sp-4);
}
.wmeta > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 7px 4px;
  border-right: var(--rule-hair) solid var(--border);
}
.wmeta > div:last-child {
  border-right: 0;
}
.wmeta dt {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  font-weight: 700;
  letter-spacing: 0.06em;
}
.wmeta dd {
  font-size: 14px;
  font-weight: 700;
}
.mini-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 9px 4px;
  border: var(--rule-thin) solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-2);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease-paper),
    background var(--dur-fast) var(--ease);
}
.mini:hover {
  border-color: var(--ink);
  background: var(--surface);
  transform: translateY(-2px);
}
.m-emoji {
  font-size: 19px;
}
.m-city {
  font-size: var(--fs-tiny);
  color: var(--ink-sub);
  font-weight: 600;
}
.m-temp {
  font-size: 13.5px;
  font-weight: 800;
}

/* 마켓 요약 */
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
  display: grid;
}
.mrow2 {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: var(--rule-hair) solid var(--border);
}
.mrow2:last-child {
  border-bottom: 0;
}
.ml-label {
  font-size: 13.5px;
  font-weight: 700;
  white-space: nowrap;
}
/* 시세표의 점선 유도선 */
.ml-lead {
  flex: 1;
  height: 1px;
  border-bottom: 1px dotted var(--border-strong);
  min-width: 10px;
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
  font-size: var(--fs-tiny);
  font-weight: 800;
  min-width: 60px;
  text-align: right;
}
.ml-chg.up {
  color: var(--up);
}
.ml-chg.down {
  color: var(--down);
}

/* 카드 푸터 버튼 */
.foot-btn {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-weight: 700;
  font-size: var(--fs-small);
  cursor: pointer;
  padding: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.foot-btn .arrow {
  transition: transform var(--dur) var(--ease-paper);
}
.foot-btn:hover {
  color: var(--accent);
}
.foot-btn:hover .arrow {
  transform: translateX(4px);
}

/* ===== 반응형 ===== */
@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .col-side {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .lead-body {
    grid-template-columns: 1fr;
  }
  .lead-fig {
    aspect-ratio: 16 / 9;
  }
  .col-side {
    grid-template-columns: 1fr;
  }
  .edition-bar {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: 4px;
  }
  .edition-bar .right {
    display: none;
  }
}
</style>
