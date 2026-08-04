<script setup>
// 도시 하나의 현재 날씨 요약 카드.
// props로 날씨 객체를 받고, 클릭 시 select-card 이벤트를 부모에게 전달 (강의 4장 props/emit).
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
  <article class="wcard" @click="emit('select-card', cityId)">
    <div class="top">
      <div class="city">
        <h3 class="serif">{{ weather.name }}</h3>
        <span class="desc">{{ desc }}</span>
      </div>
      <FavoriteButton :city-id="cityId" />
    </div>

    <div class="mid">
      <span class="emoji">{{ weatherEmoji(main) }}</span>
      <span class="temp mono">{{ format(temp) }}</span>
    </div>

    <div class="bottom">
      <span class="heat" :class="temp >= 25 ? 'hot' : 'cool'">{{ heatLabel }}</span>
      <span class="meta">💧 {{ weather.main?.humidity }}% · 🌬 {{ weather.wind?.speed }}m/s</span>
    </div>

    <span v-if="weather._mock" class="mock-tag">SAMPLE</span>
  </article>
</template>

<style scoped>
.wcard {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s;
  overflow: hidden;
}
.wcard:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px var(--shadow-strong);
  border-color: var(--border-strong);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.city h3 {
  font-size: 18px;
  font-weight: 700;
}
.desc {
  font-size: 13px;
  color: var(--ink-sub);
}
.mid {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 12px;
}
.emoji {
  font-size: 38px;
  line-height: 1;
}
.temp {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
}
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.heat {
  padding: 3px 9px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid var(--border);
  color: var(--ink-sub);
}
.heat.hot {
  color: var(--down);
  border-color: color-mix(in srgb, var(--down) 30%, var(--border));
}
.heat.cool {
  color: var(--link);
  border-color: color-mix(in srgb, var(--link) 30%, var(--border));
}
.meta {
  color: var(--ink-sub);
}
.mock-tag {
  position: absolute;
  top: 12px;
  right: 42px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ink-mute);
  opacity: 0.6;
}
</style>
