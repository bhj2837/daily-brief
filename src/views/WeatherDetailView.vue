<script setup>
// 도시 상세 페이지. 동적 라우트 :cityId를 받아 상세 관측 정보 + 예보를 보여준다.
// 강의 5장 동적 경로 매칭 + 7장 응답 필드 활용.
// 조판: 관측소 게시판처럼 도시명(제호) → 대형 관측값 → 지표표 → 기온 도표 → 예보.
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { findCityById } from '@/api/weather/cities'
import { useWeather } from '@/composables/useWeather'
import { useWeatherTheme } from '@/composables/useWeatherTheme'
import { useUnit } from '@/composables/useUnit'
import { hourLabel } from '@/utils/format'
import BaseCard from '@/components/common/BaseCard.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import LineChart from '@/components/common/LineChart.vue'
import ForecastStrip from '@/components/weather/ForecastStrip.vue'
import FavoriteButton from '@/components/weather/FavoriteButton.vue'

const props = defineProps({
  cityId: { type: String, required: true },
})
const router = useRouter()
const { current, forecast, source, loadCity } = useWeather()
const { emoji } = useWeatherTheme(current)
const { format, convert, unitSymbol } = useUnit()

const city = computed(() => findCityById(props.cityId))

// 시간별 기온 차트(다음 12구간, 현재 단위로 변환)
const tempSeries = computed(() => {
  const list = forecast.value?.list?.slice(0, 12) || []
  return {
    points: list.map((it) => convert(it.main.temp)),
    labels: list.filter((_, i) => i % 3 === 0).map((it) => hourLabel(it.dt)),
  }
})

// 상세 지표(강의 p204의 응답 필드 활용)
const metrics = computed(() => {
  const m = current.value?.main || {}
  const w = current.value?.wind || {}
  return [
    { label: '체감온도', value: format(m.feels_like), icon: '🌡️' },
    { label: '최고/최저', value: `${format(m.temp_max)} / ${format(m.temp_min)}`, icon: '📊' },
    { label: '습도', value: `${m.humidity ?? '-'}%`, icon: '💧' },
    { label: '기압', value: `${m.pressure ?? '-'} hPa`, icon: '⚖️' },
    { label: '풍속', value: `${w.speed ?? '-'} m/s`, icon: '🌬️' },
    {
      label: '가시거리',
      value: current.value?.visibility ? `${(current.value.visibility / 1000).toFixed(1)} km` : '-',
      icon: '👁️',
    },
  ]
})

// 관측 시각 표기
const observedAt = computed(() =>
  new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
)

// 라우트 파라미터가 바뀌면 재로딩 (동적 경로 재사용 대응)
watch(
  () => props.cityId,
  (id) => loadCity(id),
)
onMounted(() => loadCity(props.cityId))
</script>

<template>
  <div class="detail">
    <button class="back" @click="router.push('/weather')">
      <span class="arrow">←</span> 날씨 목록
    </button>

    <div v-if="!city" class="paper unknown">
      <p>알 수 없는 도시입니다: {{ cityId }}</p>
      <el-button type="primary" round @click="router.push('/weather')">날씨 홈으로</el-button>
    </div>

    <template v-else>
      <!-- 관측소 제호 -->
      <section class="dhero paper">
        <div class="dhero-head">
          <div class="title">
            <h1 class="serif">{{ city.ko }}</h1>
            <span class="en dateline">{{ city.en }}</span>
            <FavoriteButton :city-id="city.id" />
          </div>
          <div class="head-right">
            <span class="dateline">{{ observedAt }} 관측</span>
            <SourceBadge :source="source || 'mock'" />
          </div>
        </div>

        <div class="dhero-rule" aria-hidden="true" />

        <div v-if="current" class="dhero-body">
          <span class="big-emoji">{{ emoji }}</span>
          <span class="big-temp mono">{{ format(current.main?.temp) }}</span>
          <span class="cond serif">{{ current.weather?.[0]?.description }}</span>
        </div>
        <SkeletonBlock v-else height="140px" />
      </section>

      <BaseCard v-reveal title="상세 관측 정보" kicker="Observation" variant="clip">
        <div class="metrics">
          <div v-for="m in metrics" :key="m.label" class="metric">
            <span class="mi">{{ m.icon }}</span>
            <span class="ml dateline">{{ m.label }}</span>
            <span class="mv mono">{{ m.value }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard
        v-if="tempSeries.points.length"
        v-reveal
        title="시간별 기온"
        kicker="Trend"
        variant="clip"
      >
        <template #action>
          <span class="unit mono">{{ unitSymbol }}</span>
        </template>
        <LineChart :points="tempSeries.points" :labels="tempSeries.labels" trend :height="180" />
      </BaseCard>

      <BaseCard v-reveal title="예보" kicker="Forecast" variant="clip">
        <ForecastStrip :forecast="forecast" />
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: var(--sp-5);
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
.unknown {
  padding: var(--sp-6);
  text-align: center;
  display: grid;
  gap: 14px;
  justify-items: center;
}

.dhero {
  padding: clamp(20px, 3vw, 30px);
  border-top: var(--rule-thick) solid var(--ink);
}
.dhero-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
  padding-bottom: 10px;
}
.dhero-head .title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.dhero-head h1 {
  font-size: var(--fs-h1);
  font-weight: 900;
  letter-spacing: -0.03em;
}
.head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dhero-rule {
  height: var(--rule-med);
  background: var(--ink);
}

.dhero-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 3vw, 26px);
  flex-wrap: wrap;
  padding: var(--sp-5) 0 var(--sp-2);
}
.big-emoji {
  font-size: clamp(50px, 9vw, 78px);
  line-height: 1;
}
.big-temp {
  font-size: clamp(46px, 9vw, 70px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
}
.cond {
  color: var(--ink-sub);
  font-size: var(--fs-lead);
  font-style: italic;
}

.unit {
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--ink-sub);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 10px;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px 14px;
  background: var(--surface-2);
  border: var(--rule-thin) solid var(--border);
  border-left: var(--rule-med) solid var(--border-strong);
  border-radius: var(--radius);
  transition: border-left-color var(--dur) var(--ease);
}
.metric:hover {
  border-left-color: var(--accent);
}
.metric .mi {
  font-size: 19px;
}
.metric .mv {
  font-size: 18px;
  font-weight: 800;
}

@media (max-width: 560px) {
  .dhero-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
