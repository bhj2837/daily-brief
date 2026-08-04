<script setup>
// 마켓 표: 라벨 · 값 · 변동률 · 스파크라인. 로딩/에러/빈 상태 처리.
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
    <div v-if="loading" class="rows">
      <div v-for="n in 4" :key="n" class="row skel-row">
        <SkeletonBlock width="80px" height="14px" radius="4px" />
        <SkeletonBlock width="70px" height="14px" radius="4px" />
      </div>
    </div>

    <p v-else-if="error" class="err">⚠️ {{ error }}</p>

    <el-empty v-else-if="!rows.length" description="데이터 없음" :image-size="60" />

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
.rows {
  display: grid;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 14px;
  padding: 12px 2px;
  border-bottom: 1px solid var(--border);
}
.row:last-child {
  border-bottom: 0;
}
.row.clickable {
  cursor: pointer;
  transition: background 0.15s;
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
}
.label .l {
  font-size: 15px;
  font-weight: 700;
}
.label .n {
  font-size: 11.5px;
  color: var(--ink-mute);
}
.sp {
  opacity: 0.9;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 92px;
}
.val {
  font-size: 15px;
  font-weight: 700;
}
.chg {
  font-size: 12px;
  font-weight: 700;
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
  font-size: 14px;
  padding: 12px 0;
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
