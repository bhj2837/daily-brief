<script setup>
// 마켓 시세표: 라벨 · 값 · 변동률 · 스파크라인. 로딩/에러/빈 상태 처리.
// 조판: 신문 시세표처럼 헤더 괘선 + 등폭 숫자(tabular-nums) 우측 정렬.
// 행 클릭 시 종목 상세(/markets/:id)로 이동.
import { useRouter } from 'vue-router'
import Sparkline from './Sparkline.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})
const router = useRouter()
const sign = (c) => (c > 0 ? '▲' : c < 0 ? '▼' : '·')
const openDetail = (id) => router.push(`/markets/${id}`)
</script>

<template>
  <div class="mt">
    <!-- 표 머리 -->
    <div v-if="!error && (loading || rows.length)" class="thead">
      <span class="dateline">종목</span>
      <span class="dateline th-mid">추세</span>
      <span class="dateline th-right">시세 / 등락</span>
    </div>

    <div v-if="loading" class="rows">
      <div v-for="n in 4" :key="n" class="row skel-row">
        <SkeletonBlock width="80px" height="14px" radius="2px" />
        <SkeletonBlock width="70px" height="14px" radius="2px" />
      </div>
    </div>

    <p v-else-if="error" class="err">⚠️ {{ error }}</p>

    <el-empty v-else-if="!rows.length" description="데이터 없음" :image-size="56" />

    <div v-else class="rows">
      <div
        v-for="r in rows"
        :key="r.id"
        class="row clickable"
        role="button"
        tabindex="0"
        @click="openDetail(r.id)"
        @keyup.enter="openDetail(r.id)"
      >
        <div class="label">
          <span class="l serif">{{ r.label }}</span>
          <span v-if="r.name" class="n">{{ r.name }}</span>
        </div>
        <Sparkline :points="r.spark" class="sp" />
        <div class="right">
          <span class="val mono">{{ r.display }}</span>
          <span class="chg mono" :class="r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'flat'">
            {{ sign(r.change) }} {{ Math.abs(r.change).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thead {
  display: grid;
  grid-template-columns: 1fr auto minmax(92px, auto);
  gap: 14px;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: var(--rule-med) solid var(--ink);
}
.th-mid {
  text-align: center;
}
.th-right {
  text-align: right;
}

.rows {
  display: grid;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto minmax(92px, auto);
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: var(--rule-hair) solid var(--border);
}
.row:last-child {
  border-bottom: 0;
}
.row.clickable {
  cursor: pointer;
  position: relative;
  transition: background var(--dur-fast) var(--ease);
}
/* 호버 시 왼쪽에 잉크 마진 마크가 그어진다 */
.row.clickable::before {
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
.row.clickable:hover::before {
  transform: scaleY(1);
}
.row.clickable:hover {
  background: var(--surface-2);
}
.row.clickable:hover .l {
  color: var(--accent);
}
.skel-row {
  grid-template-columns: 1fr auto;
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
.row.clickable:hover .sp {
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
.err {
  color: var(--down);
  font-size: var(--fs-small);
  padding: 12px 0;
}

@media (max-width: 480px) {
  .sp,
  .th-mid {
    display: none;
  }
  .thead,
  .row {
    grid-template-columns: 1fr auto;
  }
}
</style>
