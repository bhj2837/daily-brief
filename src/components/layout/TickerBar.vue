<script setup>
// 상단 실시간 티커 스트립. 마켓 지표(환율/코인/증시)를 흐르는 마퀴로 보여준다.
// items가 없으면 샘플 데이터로 컴포넌트를 시연한다(App에서 실시간 요약 주입).
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: null },
})

const SAMPLE = [
  { label: 'USD/KRW', value: '1,378.20', change: -0.32 },
  { label: 'BTC', value: '$63,410', change: 1.84 },
  { label: 'ETH', value: '$3,120', change: 0.62 },
  { label: 'USD/JPY', value: '146.90', change: 0.11 },
  { label: 'USD/EUR', value: '0.921', change: -0.08 },
  { label: 'KOSPI', value: '2,712.4', change: 0.45 },
]

const data = computed(() => (props.items?.length ? props.items : SAMPLE))
const isSample = computed(() => !props.items?.length)
const loop = computed(() => [...data.value, ...data.value])
const sign = (c) => (c > 0 ? '▲' : c < 0 ? '▼' : '·')
</script>

<template>
  <div class="ticker" :aria-label="isSample ? '샘플 시세 티커' : '실시간 시세 티커'">
    <span class="tag" :class="isSample ? 'is-sample' : 'is-live'">
      <span class="tag-dot" />
      {{ isSample ? 'SAMPLE' : 'LIVE' }}
    </span>
    <div class="viewport">
      <div class="track">
        <span v-for="(it, i) in loop" :key="i" class="tick">
          <span class="lbl">{{ it.label }}</span>
          <span class="val mono">{{ it.value }}</span>
          <span class="chg mono" :class="it.change > 0 ? 'up' : it.change < 0 ? 'down' : ''">
            {{ sign(it.change) }} {{ Math.abs(it.change).toFixed(2) }}%
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker {
  position: relative;
  display: flex;
  align-items: stretch;
  background: var(--ink);
  color: var(--surface);
  overflow: hidden;
  height: 34px;
}
.theme-dark .ticker {
  background: #0c0d10;
}

/* 태그: 완전 불투명 + 흐르는 텍스트 위로 확실히 덮도록 z-index/그림자 */
.tag {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0 14px;
  color: #fff;
  box-shadow: 6px 0 10px -2px var(--ink);
}
.theme-dark .tag {
  box-shadow: 6px 0 10px -2px #0c0d10;
}
.tag.is-live {
  background: #16a34a;
}
.tag.is-sample {
  background: #b45309;
}
.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}
.tag.is-live .tag-dot {
  animation: blink 1.6s ease infinite;
}

/* 뷰포트가 마퀴를 클립하고, 좌측은 페이드로 태그 뒤에서 자연스럽게 사라지게 */
.viewport {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 24px, #000 calc(100% - 40px), transparent 100%);
}
.track {
  display: flex;
  gap: 30px;
  white-space: nowrap;
  padding-left: 20px;
  animation: slide 40s linear infinite;
  will-change: transform;
}
.track:hover {
  animation-play-state: paused;
}
.tick {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
}
.tick .lbl {
  color: rgba(255, 255, 255, 0.62);
  font-weight: 700;
}
.tick .val {
  font-weight: 700;
}
.tick .chg {
  font-size: 11px;
  opacity: 0.95;
}
.tick .chg.up {
  color: #4ade80;
}
.tick .chg.down {
  color: #ff7a7a;
}
@keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
</style>
