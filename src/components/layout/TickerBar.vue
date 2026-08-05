<script setup>
// 상단 실시간 시세 테이프. 증권면 상단의 흐르는 시세 스트립을 재현한다.
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
// 끊김 없는 마퀴를 위해 목록을 두 번 이어 붙인다
const loop = computed(() => [...data.value, ...data.value])
const sign = (c) => (c > 0 ? '▲' : c < 0 ? '▼' : '·')
</script>

<template>
  <div class="ticker" :aria-label="isSample ? '샘플 시세 티커' : '실시간 시세 티커'">
    <span class="tag" :class="isSample ? 'is-sample' : 'is-live'">
      <span class="tag-dot" />
      <span class="tag-text">{{ isSample ? 'SAMPLE' : 'LIVE' }}</span>
    </span>

    <div class="viewport">
      <div class="track">
        <span v-for="(it, i) in loop" :key="i" class="tick">
          <span class="lbl">{{ it.label }}</span>
          <span class="val mono">{{ it.value }}</span>
          <span class="chg mono" :class="it.change > 0 ? 'up' : it.change < 0 ? 'down' : ''">
            {{ sign(it.change) }} {{ Math.abs(it.change).toFixed(2) }}%
          </span>
          <span class="sep" aria-hidden="true">◆</span>
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
  height: 32px;
  border-bottom: var(--rule-thin) solid var(--ink);
}
.theme-dark .ticker {
  background: #0a0b0e;
}
/* 잉크 면에 얇은 인쇄 결 */
.ticker::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.035) 0 1px,
    transparent 1px 3px
  );
}

/* 상태 태그: 흐르는 텍스트 위로 확실히 덮이도록 z-index/그림자 */
.tag {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  padding: 0 13px;
  color: #fff;
  box-shadow: 8px 0 12px -3px var(--ink);
}
.theme-dark .tag {
  box-shadow: 8px 0 12px -3px #0a0b0e;
}
.tag.is-live {
  background: #12734f;
}
.tag.is-sample {
  background: #8a5a12;
}
.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
}
.tag.is-live .tag-dot {
  animation: blink 1.6s ease infinite;
}

/* 뷰포트가 마퀴를 클립하고 양끝을 페이드 처리 */
.viewport {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 26px,
    #000 calc(100% - 44px),
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 26px,
    #000 calc(100% - 44px),
    transparent 100%
  );
}
.track {
  display: flex;
  white-space: nowrap;
  padding-left: 22px;
  animation: slide 44s linear infinite;
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
  padding-right: 22px;
}
.tick .lbl {
  color: rgba(255, 255, 255, 0.58);
  font-weight: 700;
  letter-spacing: 0.04em;
}
.tick .val {
  font-weight: 700;
}
.tick .chg {
  font-size: 11px;
  opacity: 0.95;
}
.tick .chg.up {
  color: #5fd39b;
}
.tick .chg.down {
  color: #ff8a80;
}
.tick .sep {
  color: rgba(255, 255, 255, 0.16);
  font-size: 7px;
  padding-left: 14px;
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
    opacity: 0.3;
  }
}

@media (max-width: 560px) {
  .ticker {
    height: 28px;
  }
  .tag {
    padding: 0 10px;
  }
  .tag-text {
    display: none;
  }
  .tick {
    font-size: 11.5px;
  }
}
</style>
