<script setup>
// 미니 스파크라인 (SVG polyline). 값 배열을 정규화해 추세선을 그린다.
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

const path = computed(() => {
  const p = props.points
  if (p.length < 2) return ''
  const min = Math.min(...p)
  const max = Math.max(...p)
  const range = max - min || 1
  const dx = props.width / (p.length - 1)
  const pad = 3
  const h = props.height - pad * 2
  return p
    .map((v, i) => {
      const x = i * dx
      const y = pad + h - ((v - min) / range) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="spark"
    :class="up ? 'up' : 'down'"
    aria-hidden="true"
    preserveAspectRatio="none"
  >
    <path :d="path" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.spark.up {
  color: var(--up);
}
.spark.down {
  color: var(--down);
}
</style>
