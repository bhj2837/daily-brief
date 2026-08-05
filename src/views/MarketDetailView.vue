<script setup>
// ===== 종목 상세 (동적 라우트 /markets/:id) =====
// 환율/코인/증시 중 한 항목을 큰 라인차트와 함께 보여준다.
// 조판: 시세 헤드(대형 등폭 숫자) → 도표 → 통계 표(고가/저가/변동폭).
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

// 추세 통계 — 신문 시세표 하단의 고가/저가/변동폭 표기
const stats = computed(() => {
  const p = found.value?.row?.spark?.filter((v) => v != null) || []
  if (p.length < 2) return null
  const max = Math.max(...p)
  const min = Math.min(...p)
  const fmt = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(4).replace(/0+$/, ''))
  return {
    high: fmt(max),
    low: fmt(min),
    range: (((max - min) / (min || 1)) * 100).toFixed(2),
    n: p.length,
  }
})

const load = async () => {
  loading.value = true
  await loadAll()
  loading.value = false
}

// 동적 라우트 재사용 대응: /markets/a → /markets/b 로 이동하면 컴포넌트가 재생성되지 않는다.
// 이미 받아둔 데이터에 해당 종목이 있으면 computed가 알아서 갱신되고,
// 없을 때만(직접 링크 진입 등) 다시 조회한다.
watch(
  () => props.id,
  () => {
    if (!found.value) load()
  },
)

onMounted(load)
</script>

<template>
  <div class="md">
    <button class="back" @click="router.push('/markets')"><span class="arrow">←</span> 마켓</button>

    <div v-if="loading" class="paper loading">
      <SkeletonBlock width="140px" height="14px" radius="2px" />
      <SkeletonBlock height="40px" width="200px" radius="3px" />
      <SkeletonBlock height="170px" radius="3px" />
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
      <BaseCard
        :kicker="sectionLabel[found.sectionKey]"
        :title="found.row.label"
        variant="clip"
        class="quote-card"
      >
        <template #action>
          <SourceBadge :source="found.source || 'mock'" />
        </template>

        <!-- 시세 헤드 -->
        <div class="head">
          <div class="price mono">{{ found.row.display }}</div>
          <div
            class="chg mono"
            :class="found.row.change > 0 ? 'up' : found.row.change < 0 ? 'down' : ''"
          >
            {{ found.row.change > 0 ? '▲' : found.row.change < 0 ? '▼' : '·' }}
            {{ Math.abs(found.row.change).toFixed(2) }}%
          </div>
          <div v-if="found.row.name" class="name byline">{{ found.row.name }}</div>
        </div>

        <div class="chart-rule" aria-hidden="true" />
        <LineChart :points="found.row.spark" trend :height="230" />

        <!-- 통계 표 -->
        <dl v-if="stats" class="stats">
          <div>
            <dt class="dateline">고가</dt>
            <dd class="mono">{{ stats.high }}</dd>
          </div>
          <div>
            <dt class="dateline">저가</dt>
            <dd class="mono">{{ stats.low }}</dd>
          </div>
          <div>
            <dt class="dateline">변동폭</dt>
            <dd class="mono">{{ stats.range }}%</dd>
          </div>
          <div>
            <dt class="dateline">표본</dt>
            <dd class="mono">{{ stats.n }}p</dd>
          </div>
        </dl>

        <template #footer>
          <p class="note">최근 추세 · {{ sectionLabel[found.sectionKey] }}</p>
        </template>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.md {
  display: grid;
  gap: var(--sp-4);
  max-width: calc(var(--maxw-read) + 120px);
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: var(--fs-small);
  cursor: pointer;
  justify-self: start;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back .arrow {
  transition: transform var(--dur) var(--ease-paper);
}
.back:hover {
  color: var(--ink);
}
.back:hover .arrow {
  transform: translateX(-4px);
}
.loading {
  padding: var(--sp-6);
  display: grid;
  gap: var(--sp-4);
}

.head {
  display: flex;
  align-items: baseline;
  gap: var(--sp-4);
  flex-wrap: wrap;
  padding-bottom: var(--sp-4);
}
.price {
  font-size: clamp(32px, 5.5vw, 46px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1;
}
.chg {
  font-size: 18px;
  font-weight: 800;
}
.chg.up {
  color: var(--up);
}
.chg.down {
  color: var(--down);
}
.name {
  margin-left: auto;
}

.chart-rule {
  height: var(--rule-med);
  background: var(--ink);
  margin-bottom: var(--sp-4);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin-top: var(--sp-5);
  border-top: var(--rule-thin) solid var(--border-strong);
  padding-top: var(--sp-3);
}
.stats > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px;
  border-right: var(--rule-hair) solid var(--border);
}
.stats > div:last-child {
  border-right: 0;
}
.stats dd {
  font-size: 15px;
  font-weight: 800;
}

.note {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  text-align: right;
}

@media (max-width: 560px) {
  .name {
    margin-left: 0;
    width: 100%;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 10px;
  }
  .stats > div:nth-child(2n) {
    border-right: 0;
  }
}
</style>
