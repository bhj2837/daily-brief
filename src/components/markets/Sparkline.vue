<script setup>
// 미니 스파크라인 (SVG). 값 배열을 정규화해 추세선을 그린다.
// 신문 시세표의 미니 도표처럼 기준선(첫 값) 위에 얇은 잉크 선을 얹는다.
// 상승/하락 색은 첫 값 대비 마지막 값으로 결정.
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, default: () => [] },
  width: { type: Number, default: 84 },
  height: { type: Number, default: 28 },
})

const up = computed(() => {
  const p = props.points
  return p.length >= 2 ? p[p.length - 1] >= p[0] : true
})

const geo = computed(() => {
  const p = props.points
  if (p.length < 2) return null
  const min = Math.min(...p)
  const max = Math.max(...p)
  const range = max - min || 1
  const dx = props.width / (p.length - 1)
  const pad = 3
  const h = props.height - pad * 2
  const y = (v) => pad + h - ((v - min) / range) * h
  const coords = p.map((v, i) => [i * dx, y(v)])
  return {
    line: coords
      .map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`)
      .join(' '),
    // 기준선: 첫 값 높이의 점선
    baseY: y(p[0]),
    lastX: coords[coords.length - 1][0],
    lastY: coords[coords.length - 1][1],
  }
})
</script>

<template>
  <svg
    v-if="geo"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="spark"
    :class="up ? 'up' : 'down'"
    aria-hidden="true"
  >
    <!-- 시작값 기준선 -->
    <line
      x1="0"
      :x2="width"
      :y1="geo.baseY"
      :y2="geo.baseY"
      class="base"
      stroke-dasharray="2 3"
      vector-effect="non-scaling-stroke"
    />
    <path
      :d="geo.line"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linejoin="round"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
    <circle :cx="geo.lastX" :cy="geo.lastY" r="1.8" fill="currentColor" />
  </svg>
  <span v-else class="spark-empty" aria-hidden="true" />
</template>

<style scoped>
.spark.up {
  color: var(--up);
}
.spark.down {
  color: var(--down);
}
.base {
  stroke: var(--border-strong);
  stroke-width: 1;
}
.spark-empty {
  display: inline-block;
  width: v-bind('width + "px"');
  height: v-bind('height + "px"');
}
</style>
