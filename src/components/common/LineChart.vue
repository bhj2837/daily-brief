<script setup>
// 재사용 라인 차트 (순수 SVG). 값 배열을 받아 추세선 + 영역을 그린다.
// 에디토리얼 톤: 신문 도표처럼 가로 괘선(모눈) 위에 잉크 선을 얹고,
// 마운트 시 선이 좌→우로 "그려지는" 인쇄 연출(stroke-dashoffset)을 준다.
// 반응형: viewBox 기반으로 컨테이너 폭에 맞춰 늘어난다.
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  points: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] }, // x축 라벨(옵션, HTML로 렌더)
  height: { type: Number, default: 180 },
  color: { type: String, default: 'var(--accent)' },
  // true면 첫→끝 추세로 상승/하락 색 자동
  trend: { type: Boolean, default: false },
  area: { type: Boolean, default: true },
  suffix: { type: String, default: '' },
  // 가로 괘선(모눈) 표시
  grid: { type: Boolean, default: true },
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

// 가로 괘선 y좌표 (4등분)
const gridLines = computed(() => {
  const h = props.height
  const top = PAD
  const bottom = h - PAD
  return [0, 0.25, 0.5, 0.75, 1].map((t) => top + (bottom - top) * t)
})

// 최고/최저 지점 — 신문 도표의 극값 표시
const extremes = computed(() => {
  const c = coords.value
  const s = stats.value
  if (!c.length || !s) return null
  let hi = 0
  let lo = 0
  props.points.forEach((v, i) => {
    if (v > props.points[hi]) hi = i
    if (v < props.points[lo]) lo = i
  })
  return { hi: c[hi], lo: c[lo], hiV: s.max, loV: s.min }
})

// 마운트 후 클래스를 붙여 선 그리기 애니메이션 시작
const drawn = ref(false)
onMounted(() => requestAnimationFrame(() => (drawn.value = true)))

const gid = `lg-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <div class="chart">
    <svg
      v-if="coords.length"
      :viewBox="`0 0 ${W} ${height}`"
      class="svg"
      :class="{ drawn }"
      :style="{ color: stroke }"
      preserveAspectRatio="none"
      role="img"
      aria-label="추세 차트"
    >
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.2" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 모눈 괘선 -->
      <g v-if="grid" class="grid">
        <line
          v-for="(y, i) in gridLines"
          :key="i"
          :x1="PAD"
          :x2="W - PAD"
          :y1="y"
          :y2="y"
          :class="{ base: i === gridLines.length - 1 }"
          vector-effect="non-scaling-stroke"
        />
      </g>

      <path v-if="area" class="area" :d="areaPath" :fill="`url(#${gid})`" stroke="none" />
      <path
        class="line"
        :d="linePath"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />

      <!-- 극값 마커 -->
      <template v-if="extremes">
        <circle class="dot ext" :cx="extremes.hi[0]" :cy="extremes.hi[1]" r="2.6" />
        <circle class="dot ext" :cx="extremes.lo[0]" :cy="extremes.lo[1]" r="2.6" />
      </template>

      <circle
        class="dot last"
        :cx="coords[coords.length - 1][0]"
        :cy="coords[coords.length - 1][1]"
        r="3.6"
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

/* 모눈: 아주 옅은 헤어라인, 바닥선만 진하게 */
.grid line {
  stroke: var(--border);
  stroke-width: 1;
}
.grid line.base {
  stroke: var(--border-strong);
}

/* 인쇄되듯 좌→우로 그려지는 선 */
.line {
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  transition: stroke-dashoffset 1.1s var(--ease-paper);
}
.svg.drawn .line {
  stroke-dashoffset: 0;
}
.area,
.dot {
  opacity: 0;
  transition: opacity 0.5s var(--ease) 0.5s;
}
.svg.drawn .area,
.svg.drawn .dot {
  opacity: 1;
}
.dot.ext {
  fill: var(--surface);
  stroke: currentColor;
  stroke-width: 1.5;
}

.labels {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  font-size: 10.5px;
  color: var(--ink-mute);
  font-family: var(--font-mono);
}
.empty {
  color: var(--ink-mute);
  font-size: var(--fs-small);
  padding: 20px 0;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .line {
    stroke-dashoffset: 0;
  }
  .area,
  .dot {
    opacity: 1;
  }
}
</style>
