<script setup>
// 5일 / 시간별 예보 스트립. OpenWeather forecast의 list(3시간 간격)를
// 일자별로 묶어 요일별 최고/최저를 보여준다 (강의 7장 데이터 가공 + v-for).
import { computed } from 'vue'
import { useUnit } from '@/composables/useUnit'
import { weatherEmoji, dayLabel, dateKey, hourLabel } from '@/utils/format'

const props = defineProps({
  forecast: { type: Object, default: null },
})
const { format } = useUnit()

// 일자별 그룹핑 → 요일 카드 (최대 5일)
const daily = computed(() => {
  const list = props.forecast?.list || []
  const groups = {}
  for (const item of list) {
    const k = dateKey(item.dt)
    if (!groups[k]) groups[k] = { key: k, day: dayLabel(item.dt), items: [] }
    groups[k].items.push(item)
  }
  return Object.values(groups)
    .slice(0, 5)
    .map((g) => {
      const temps = g.items.map((i) => i.main.temp)
      const noon = g.items.find((i) => new Date(i.dt * 1000).getHours() >= 12) || g.items[0]
      return { ...g, max: Math.max(...temps), min: Math.min(...temps), main: noon.weather[0].main }
    })
})

// 향후 8개 구간(24시간) 시간별
const hourly = computed(() => (props.forecast?.list || []).slice(0, 8))
</script>

<template>
  <div v-if="daily.length" class="forecast">
    <div class="block">
      <h4>시간별</h4>
      <div class="hstrip">
        <div v-for="h in hourly" :key="h.dt" class="hitem">
          <span class="t">{{ hourLabel(h.dt) }}</span>
          <span class="e">{{ weatherEmoji(h.weather[0].main) }}</span>
          <span class="v mono">{{ format(h.main.temp) }}</span>
        </div>
      </div>
    </div>

    <div class="block">
      <h4>5일 예보</h4>
      <div class="dstrip">
        <div v-for="d in daily" :key="d.key" class="ditem">
          <span class="d serif">{{ d.day }}</span>
          <span class="dk">{{ d.key }}</span>
          <span class="e">{{ weatherEmoji(d.main) }}</span>
          <span class="range mono">
            <b>{{ format(d.max) }}</b>
            <i>{{ format(d.min) }}</i>
          </span>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="empty">예보 데이터를 불러오는 중…</p>
</template>

<style scoped>
.forecast {
  display: grid;
  gap: 18px;
}
h4 {
  font-size: 12px;
  color: var(--ink-sub);
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.hstrip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.hitem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 62px;
  padding: 11px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.hitem .t {
  font-size: 11px;
  color: var(--ink-sub);
}
.hitem .e {
  font-size: 21px;
}
.hitem .v {
  font-weight: 700;
  font-size: 14px;
}
.dstrip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
  gap: 8px;
}
.ditem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 13px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.ditem .d {
  font-weight: 800;
  font-size: 15px;
}
.ditem .dk {
  font-size: 11px;
  color: var(--ink-sub);
}
.ditem .e {
  font-size: 25px;
  margin: 2px 0;
}
.range b {
  font-weight: 800;
}
.range i {
  font-style: normal;
  color: var(--ink-sub);
  margin-left: 6px;
}
.empty {
  color: var(--ink-mute);
  font-size: 14px;
  padding: 12px 0;
}
</style>
