<script setup>
// 재사용 라인 차트 (순수 SVG). 값 배열을 받아 추세선 + 영역 그라디언트로 그린다.
// 반응형: viewBox 기반으로 컨테이너 폭에 맞춰 늘어난다.
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] }, // x축 라벨(옵션, HTML로 렌더)
  height: { type: Number, default: 180 },
  color: { type: String, default: 'var(--accent)' },
  // true면 첫→끝 추세로 상승/하락 색 자동
  trend: { type: Boolean, default: false },
  area: { type: Boolean, default: true },
  suffix: { type: String, default: '' },
})

const W = 600
const PAD = 10

const stats = computed(() => {
  const p = props.points.filter((v) => v != null && !Number.isNaN(v))
  if (!p.length) return null
  const min = Math.min(...p)
  const max = Math.max(...p)
  return { min, max, range: max - min || 1, first: p[0], last: p[p.length - 1] }
})

const stroke = computed(() => {
  if (!props.trend || !stats.value) return props.color
  return stats.value.last >= stats.value.first ? 'var(--up)' : 'var(--down)'
})

const coords = computed(() => {
  const p = props.points
  const s = stats.value
  if (!s || p.length < 2) return []
  const h = props.height
  const dx = (W - PAD * 2) / (p.length - 1)
  return p.map((v, i) => {
    const x = PAD + i * dx
    const y = PAD + (h - PAD * 2) * (1 - (v - s.min) / s.range)
    return [x, y]
  })
})

const linePath = computed(() =>
  coords.value.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
)
const areaPath = computed(() => {
  const c = coords.value
  if (!c.length) return ''
  const bottom = props.height - PAD
  return (
    `M${c[0][0]},${bottom} ` +
    c.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ` L${c[c.length - 1][0]},${bottom} Z`
  )
})
const gid = `lg-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <div class="chart">
    <svg
      v-if="coords.length"
      :viewBox="`0 0 ${W} ${height}`"
      class="svg"
      :style="{ color: stroke }"
      preserveAspectRatio="none"
      role="img"
      aria-label="추세 차트"
    >
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.22" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path v-if="area" :d="areaPath" :fill="`url(#${gid})`" stroke="none" />
      <path :d="linePath" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      <circle
        :cx="coords[coords.length - 1][0]"
        :cy="coords[coords.length - 1][1]"
        r="3.5"
        fill="currentColor"
      />
    </svg>
    <p v-else class="empty">차트 데이터가 없습니다.</p>

    <div v-if="labels.length" class="labels">
      <span v-for="(l, i) in labels" :key="i">{{ l }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
}
.svg {
  width: 100%;
  height: v-bind('height + "px"');
  display: block;
  overflow: visible;
}
.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--ink-mute);
  font-family: var(--font-mono);
}
.empty {
  color: var(--ink-mute);
  font-size: 13px;
  padding: 20px 0;
  text-align: center;
}
</style>
