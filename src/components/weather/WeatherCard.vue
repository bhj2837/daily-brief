<script setup>
// 도시 하나의 현재 날씨 요약 카드.
// props로 날씨 객체를 받고, 클릭 시 select-card 이벤트를 부모에게 전달 (강의 4장 props/emit).
// 조판: 신문 기상면의 도시별 관측 박스. 호버 시 종이가 살짝 들린다.
import { computed } from 'vue'
import { useUnit } from '@/composables/useUnit'
import { weatherEmoji } from '@/utils/format'
import FavoriteButton from './FavoriteButton.vue'

const props = defineProps({
  cityId: { type: String, required: true },
  weather: { type: Object, required: true },
})
const emit = defineEmits(['select-card'])

const { format } = useUnit()
const main = computed(() => props.weather?.weather?.[0]?.main)
const desc = computed(() => props.weather?.weather?.[0]?.description || '-')
const temp = computed(() => props.weather?.main?.temp)
// 25도 기준 라벨 (강의 p98 조건부 렌더링 요구사항 계승)
const heatLabel = computed(() => (temp.value >= 25 ? '더움' : '선선함'))
</script>

<template>
  <article class="wcard lift" @click="emit('select-card', cityId)">
    <div class="top">
      <div class="city">
        <h3 class="serif">{{ weather.name }}</h3>
        <span class="desc">{{ desc }}</span>
      </div>
      <FavoriteButton :city-id="cityId" />
    </div>

    <div class="rule-thin" aria-hidden="true" />

    <div class="mid">
      <span class="emoji">{{ weatherEmoji(main) }}</span>
      <span class="temp mono">{{ format(temp) }}</span>
    </div>

    <div class="bottom">
      <span class="heat" :class="temp >= 25 ? 'hot' : 'cool'">{{ heatLabel }}</span>
      <span class="meta mono">
        💧 {{ weather.main?.humidity }}% · 🌬 {{ weather.wind?.speed }}m/s
      </span>
    </div>

    <span v-if="weather._mock" class="mock-tag">SAMPLE</span>
  </article>
</template>

<style scoped>
.wcard {
  position: relative;
  background: var(--surface);
  border: var(--rule-thin) solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px 15px;
  cursor: pointer;
  overflow: hidden;
}
/* 좌측 잉크 마진 마크 — 호버 시 그어진다 */
.wcard::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: 50% 0;
  transition: transform var(--dur) var(--ease-paper);
}
.wcard:hover::before {
  transform: scaleY(1);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 9px;
}
.city {
  min-width: 0;
}
.city h3 {
  font-size: 17.5px;
  font-weight: 700;
}
.desc {
  font-size: var(--fs-small);
  color: var(--ink-sub);
}
.rule-thin {
  height: var(--rule-hair);
  background: var(--border-strong);
}
.mid {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0 12px;
}
.emoji {
  font-size: 36px;
  line-height: 1;
  transition: transform var(--dur) var(--ease-paper);
}
.wcard:hover .emoji {
  transform: scale(1.1) rotate(-5deg);
}
.temp {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin-left: auto;
}
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-tiny);
}
.heat {
  padding: 2px 9px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  letter-spacing: 0.04em;
  border: var(--rule-thin) solid var(--border-strong);
  color: var(--ink-sub);
  white-space: nowrap;
}
.heat.hot {
  color: var(--down);
  border-color: color-mix(in srgb, var(--down) 38%, var(--border-strong));
}
.heat.cool {
  color: var(--link);
  border-color: color-mix(in srgb, var(--link) 38%, var(--border-strong));
}
.meta {
  color: var(--ink-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mock-tag {
  position: absolute;
  top: 11px;
  right: 40px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--ink-faint);
}
</style>
