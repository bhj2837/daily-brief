<script setup>
// 5일 / 시간별 예보 스트립. OpenWeather forecast의 list(3시간 간격)를
// 일자별로 묶어 요일별 최고/최저를 보여준다 (강의 7장 데이터 가공 + v-for).
// 조판: 신문 기상면의 예보표 — 요일별 기온 범위를 가로 막대로 시각화한다.
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

// 5일 전체의 기온 범위 → 각 요일 막대의 위치/길이 계산 (백분율)
const scale = computed(() => {
  if (!daily.value.length) return null
  const lo = Math.min(...daily.value.map((d) => d.min))
  const hi = Math.max(...daily.value.map((d) => d.max))
  const span = hi - lo || 1
  return {
    bar: (d) => ({
      left: `${((d.min - lo) / span) * 100}%`,
      width: `${Math.max(((d.max - d.min) / span) * 100, 6)}%`,
    }),
  }
})

// 향후 8개 구간(24시간) 시간별
const hourly = computed(() => (props.forecast?.list || []).slice(0, 8))
</script>

<template>
  <div v-if="daily.length" class="forecast">
    <!-- 시간별 -->
    <div class="block">
      <h4 class="dateline">시간별 예보</h4>
      <div class="hstrip">
        <div v-for="h in hourly" :key="h.dt" class="hitem">
          <span class="t">{{ hourLabel(h.dt) }}</span>
          <span class="e">{{ weatherEmoji(h.weather[0].main) }}</span>
          <span class="v mono">{{ format(h.main.temp) }}</span>
        </div>
      </div>
    </div>

    <!-- 5일 예보표 -->
    <div class="block">
      <h4 class="dateline">5일 예보</h4>
      <ul class="dlist">
        <li v-for="d in daily" :key="d.key" class="drow">
          <span class="d serif">{{ d.day }}</span>
          <span class="dk mono">{{ d.key }}</span>
          <span class="e">{{ weatherEmoji(d.main) }}</span>
          <span class="lo mono">{{ format(d.min) }}</span>
          <span class="track">
            <span class="bar" :style="scale.bar(d)" />
          </span>
          <span class="hi mono">{{ format(d.max) }}</span>
        </li>
      </ul>
    </div>
  </div>
  <p v-else class="empty">예보 데이터를 불러오는 중…</p>
</template>

<style scoped>
.forecast {
  display: grid;
  gap: var(--sp-5);
}
h4 {
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: var(--rule-thin) solid var(--border-strong);
}

/* 시간별 */
.hstrip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: thin;
}
.hitem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 62px;
  padding: 10px 8px;
  background: var(--surface-2);
  border: var(--rule-thin) solid var(--border);
  border-radius: var(--radius);
  transition:
    border-color var(--dur-fast) var(--ease),
    transform var(--dur-fast) var(--ease-paper);
}
.hitem:hover {
  border-color: var(--ink);
  transform: translateY(-2px);
}
.hitem .t {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  font-weight: 600;
}
.hitem .e {
  font-size: 21px;
}
.hitem .v {
  font-weight: 800;
  font-size: 14px;
}

/* 5일 예보표 */
.dlist {
  display: grid;
}
.drow {
  display: grid;
  grid-template-columns: 42px 60px 30px 52px minmax(60px, 1fr) 52px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: var(--rule-hair) solid var(--border);
}
.drow:last-child {
  border-bottom: 0;
}
.drow .d {
  font-weight: 800;
  font-size: 15px;
}
.drow .dk {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
}
.drow .e {
  font-size: 20px;
  text-align: center;
}
.lo,
.hi {
  font-size: 13.5px;
  font-weight: 700;
}
.lo {
  color: var(--ink-sub);
  text-align: right;
}
.hi {
  text-align: right;
}

/* 기온 범위 막대 */
.track {
  position: relative;
  height: 5px;
  background: var(--surface-3);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.bar {
  position: absolute;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--link), var(--accent));
  border-radius: var(--radius-pill);
  transition:
    left 0.5s var(--ease-paper),
    width 0.5s var(--ease-paper);
}

.empty {
  color: var(--ink-mute);
  font-size: var(--fs-small);
  padding: 12px 0;
}

@media (max-width: 560px) {
  .drow {
    grid-template-columns: 38px 30px 46px minmax(40px, 1fr) 46px;
    gap: 8px;
  }
  .drow .dk {
    display: none;
  }
}
</style>
