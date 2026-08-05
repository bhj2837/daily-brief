<script setup>
// 시세표의 한 행 (강의 4장 props / emit).
// 종목 하나를 표시하는 최소 단위로 분리해 재사용성과 테스트 용이성을 높였다.
// 클릭/엔터 시 종목 id를 select 이벤트로 올려보내고, 라우팅은 상위가 담당한다.
import { computed } from 'vue'
import Sparkline from './Sparkline.vue'

const props = defineProps({
  row: { type: Object, required: true },
})

const emit = defineEmits(['select'])

// 등락 방향에 따른 기호/클래스 (강의 3장 computed + 조건부 클래스)
const sign = computed(() => (props.row.change > 0 ? '▲' : props.row.change < 0 ? '▼' : '·'))
const trend = computed(() => (props.row.change > 0 ? 'up' : props.row.change < 0 ? 'down' : 'flat'))

const select = () => emit('select', props.row.id)
</script>

<template>
  <div class="row" role="button" tabindex="0" @click="select" @keyup.enter="select">
    <div class="label">
      <span class="l serif">{{ row.label }}</span>
      <span v-if="row.name" class="n">{{ row.name }}</span>
    </div>

    <Sparkline :points="row.spark" class="sp" />

    <div class="right">
      <span class="val mono">{{ row.display }}</span>
      <span class="chg mono" :class="trend">
        {{ sign }} {{ Math.abs(row.change).toFixed(2) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.row {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto minmax(92px, auto);
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: var(--rule-hair) solid var(--border);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.row:last-child {
  border-bottom: 0;
}
/* 호버 시 왼쪽에 잉크 마진 마크가 그어진다 */
.row::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 6px;
  bottom: 6px;
  width: var(--rule-med);
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: 50% 0;
  transition: transform var(--dur) var(--ease-paper);
}
.row:hover::before {
  transform: scaleY(1);
}
.row:hover {
  background: var(--surface-2);
}
.row:hover .l {
  color: var(--accent);
}

.label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.label .l {
  font-size: 15px;
  font-weight: 700;
  transition: color var(--dur-fast) var(--ease);
}
.label .n {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sp {
  opacity: 0.85;
  transition: opacity var(--dur-fast) var(--ease);
}
.row:hover .sp {
  opacity: 1;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.val {
  font-size: 15px;
  font-weight: 700;
}
.chg {
  font-size: var(--fs-tiny);
  font-weight: 800;
}
.chg.up {
  color: var(--up);
}
.chg.down {
  color: var(--down);
}
.chg.flat {
  color: var(--ink-mute);
}

@media (max-width: 480px) {
  .sp {
    display: none;
  }
  .row {
    grid-template-columns: 1fr auto;
  }
}
</style>
