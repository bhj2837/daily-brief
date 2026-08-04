<script setup>
// 도시 상세 페이지. 동적 라우트 :cityId를 받아 상세 관측 정보 + 예보를 보여준다.
// 강의 5장 동적 경로 매칭 + 7장 응답 필드 활용. 에디토리얼 톤으로 재구성.
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

// 라우트 파라미터가 바뀌면 재로딩 (동적 경로 재사용 대응)
watch(() => props.cityId, (id) => loadCity(id))
onMounted(() => loadCity(props.cityId))
</script>

<template>
  <div class="detail">
    <button class="back" @click="router.push('/weather')">← 날씨 목록</button>

    <div v-if="!city" class="paper unknown">
      <p>알 수 없는 도시입니다: {{ cityId }}</p>
      <el-button type="primary" round @click="router.push('/weather')">날씨 홈으로</el-button>
    </div>

    <template v-else>
      <section class="dhero paper">
        <div class="dhero-head">
          <div class="title">
            <h1 class="serif">{{ city.ko }}</h1>
            <span class="en">{{ city.en }}</span>
            <FavoriteButton :city-id="city.id" />
          </div>
          <SourceBadge :source="source || 'mock'" />
        </div>

        <div v-if="current" class="dhero-body">
          <span class="big-emoji">{{ emoji }}</span>
          <div class="big-temp mono">{{ format(current.main?.temp) }}</div>
          <div class="cond">{{ current.weather?.[0]?.description }}</div>
        </div>
        <SkeletonBlock v-else height="140px" />
      </section>

      <BaseCard title="상세 관측 정보" kicker="Observation">
        <div class="metrics">
          <div v-for="m in metrics" :key="m.label" class="metric">
            <span class="mi">{{ m.icon }}</span>
            <span class="ml">{{ m.label }}</span>
            <span class="mv mono">{{ m.value }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-if="tempSeries.points.length" title="시간별 기온" kicker="Trend">
        <template #action>
          <span class="unit mono">{{ unitSymbol }}</span>
        </template>
        <LineChart :points="tempSeries.points" :labels="tempSeries.labels" trend :height="170" />
      </BaseCard>

      <BaseCard title="예보" kicker="Forecast">
        <ForecastStrip :forecast="forecast" />
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: 18px;
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
.unknown {
  padding: 30px;
  text-align: center;
  display: grid;
  gap: 14px;
}
.dhero {
  padding: 28px 30px;
  text-align: center;
}
.dhero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dhero-head .title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.dhero-head h1 {
  font-size: 36px;
  font-weight: 900;
}
.dhero-head .en {
  color: var(--ink-sub);
  font-size: 16px;
}
.dhero-body {
  margin-top: 16px;
}
.big-emoji {
  font-size: 72px;
}
.big-temp {
  font-size: 62px;
  font-weight: 800;
  letter-spacing: -2px;
}
.cond {
  color: var(--ink-sub);
  font-size: 17px;
}
.unit {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-sub);
}
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.metric .mi {
  font-size: 20px;
}
.metric .ml {
  font-size: 12px;
  color: var(--ink-sub);
}
.metric .mv {
  font-size: 18px;
  font-weight: 700;
}
@media (max-width: 560px) {
  .dhero-head {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
