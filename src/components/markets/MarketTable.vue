<script setup>
// 마켓 시세표 (강의 4장 props / emit).
// 표의 골격(머리·로딩·에러·빈 상태)만 담당하고, 행 렌더링은 MarketRow에 위임한다.
// 자식(MarketRow)이 올린 select를 그대로 상위(MarketsView)로 다시 올려보내는 emit 체인 구조.
// 조판: 신문 시세표처럼 헤더 괘선 + 등폭 숫자(tabular-nums) 우측 정렬.
import MarketRow from './MarketRow.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

const emit = defineEmits(['select'])

// 자식 → 부모로 이벤트를 그대로 중계 (라우팅 책임은 뷰에 둔다)
const onSelect = (id) => emit('select', id)
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
      <div v-for="n in 4" :key="n" class="skel-row">
        <SkeletonBlock width="80px" height="14px" radius="2px" />
        <SkeletonBlock width="70px" height="14px" radius="2px" />
      </div>
    </div>

    <p v-else-if="error" class="err">⚠️ {{ error }}</p>

    <el-empty v-else-if="!rows.length" description="데이터 없음" :image-size="56" />

    <div v-else class="rows">
      <MarketRow v-for="r in rows" :key="r.id" :row="r" @select="onSelect" />
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
.skel-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 11px 0;
  border-bottom: var(--rule-hair) solid var(--border);
}
.err {
  color: var(--down);
  font-size: var(--fs-small);
  padding: 12px 0;
}

@media (max-width: 480px) {
  .thead {
    grid-template-columns: 1fr auto;
  }
  .th-mid {
    display: none;
  }
}
</style>
