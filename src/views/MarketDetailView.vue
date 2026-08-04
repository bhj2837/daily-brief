<script setup>
// ===== 종목 상세 (동적 라우트 /markets/:id) =====
// 환율/코인/증시 중 한 항목을 큰 라인차트와 함께 보여준다.
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarkets } from '@/composables/useMarkets'
import BaseCard from '@/components/common/BaseCard.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import LineChart from '@/components/common/LineChart.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const { sections, loadAll } = useMarkets()

const loading = ref(true)
const sectionLabel = { rates: '환율', crypto: '암호화폐', stocks: '증시' }

const found = computed(() => {
  for (const key of ['rates', 'crypto', 'stocks']) {
    const row = sections[key].data.find((r) => r.id === props.id)
    if (row) return { row, sectionKey: key, source: sections[key].source }
  }
  return null
})

const load = async () => {
  loading.value = true
  await loadAll()
  loading.value = false
}
watch(() => props.id, () => {})
onMounted(load)
</script>

<template>
  <div class="md">
    <button class="back" @click="router.push('/markets')">← 마켓</button>

    <div v-if="loading" class="paper loading">
      <SkeletonBlock width="140px" height="16px" radius="4px" />
      <SkeletonBlock height="40px" width="200px" radius="6px" />
      <SkeletonBlock height="170px" radius="8px" />
    </div>

    <el-result
      v-else-if="!found"
      icon="warning"
      title="종목을 찾을 수 없습니다"
      :sub-title="`ID: ${id}`"
    >
      <template #extra>
        <el-button type="primary" round @click="router.push('/markets')">마켓으로</el-button>
      </template>
    </el-result>

    <template v-else>
      <BaseCard :kicker="sectionLabel[found.sectionKey]" :title="found.row.label">
        <template #action>
          <SourceBadge :source="found.source || 'mock'" />
        </template>

        <div class="head">
          <div class="price mono">{{ found.row.display }}</div>
          <div
            class="chg mono"
            :class="found.row.change > 0 ? 'up' : found.row.change < 0 ? 'down' : ''"
          >
            {{ found.row.change > 0 ? '▲' : found.row.change < 0 ? '▼' : '·' }}
            {{ Math.abs(found.row.change).toFixed(2) }}%
          </div>
          <div v-if="found.row.name" class="name">{{ found.row.name }}</div>
        </div>

        <LineChart :points="found.row.spark" trend :height="220" />
        <p class="note">최근 추세 · {{ sectionLabel[found.sectionKey] }}</p>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.md {
  display: grid;
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  justify-self: start;
  padding: 0;
}
.back:hover {
  color: var(--ink);
}
.loading {
  padding: 26px;
  display: grid;
  gap: 16px;
}
.head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.price {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
}
.chg {
  font-size: 18px;
  font-weight: 700;
}
.chg.up {
  color: var(--up);
}
.chg.down {
  color: var(--down);
}
.name {
  color: var(--ink-sub);
  font-size: 15px;
}
.note {
  margin-top: 12px;
  font-size: 12px;
  color: var(--ink-mute);
  text-align: right;
}
</style>
