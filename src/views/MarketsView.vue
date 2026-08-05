<script setup>
// ===== 마켓 (증권면) =====
// 환율(Frankfurter) · 암호화폐(CoinGecko) 실시간 + 증시(Finnhub/샘플) 3섹션.
// 강의 7장 Axios · 9장 Promise.all · 8장 Element Plus(skeleton/empty).
// 조판: 신문 증권면처럼 시세표를 세로 괘선으로 구분된 3단으로 배치한다.
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarkets } from '@/composables/useMarkets'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import MarketTable from '@/components/markets/MarketTable.vue'

const router = useRouter()
const { sections, loadAll } = useMarkets()

const meta = [
  { key: 'rates', kicker: 'FX', title: '환율', note: 'USD 기준 · Frankfurter' },
  { key: 'crypto', kicker: 'Crypto', title: '암호화폐', note: 'USD · CoinGecko' },
  { key: 'stocks', kicker: 'Equities', title: '증시', note: '주요 지수' },
]

// 상단 요약 지표: 전체 종목 중 상승/하락 개수 (신문 증권면의 등락 종목 수)
const tally = computed(() => {
  const rows = meta.flatMap((m) => sections[m.key]?.data || [])
  return {
    total: rows.length,
    up: rows.filter((r) => r.change > 0).length,
    down: rows.filter((r) => r.change < 0).length,
  }
})

const quotedAt = computed(() =>
  new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
)

// MarketRow → MarketTable → 이곳으로 올라온 select 이벤트를 라우팅으로 처리
const openDetail = (id) => router.push(`/markets/${id}`)

onMounted(loadAll)
</script>

<template>
  <div class="markets">
    <SectionHeader kicker="Markets" title="마켓" size="lg" />

    <!-- 증권면 상단 요약 스트립 -->
    <div class="tally">
      <div class="t-item">
        <span class="t-label dateline">종목</span>
        <span class="t-val mono">{{ tally.total }}</span>
      </div>
      <div class="t-item">
        <span class="t-label dateline">상승</span>
        <span class="t-val mono up">▲ {{ tally.up }}</span>
      </div>
      <div class="t-item">
        <span class="t-label dateline">하락</span>
        <span class="t-val mono down">▼ {{ tally.down }}</span>
      </div>
      <div class="t-item wide">
        <span class="t-label dateline">기준</span>
        <span class="t-val mono">{{ quotedAt }} 조회</span>
      </div>
    </div>

    <div class="grid">
      <BaseCard
        v-for="(m, i) in meta"
        :key="m.key"
        v-reveal="{ index: i }"
        :kicker="m.kicker"
        :title="m.title"
        variant="clip"
      >
        <template #action>
          <SourceBadge v-if="!sections[m.key].loading" :source="sections[m.key].source || 'mock'" />
        </template>

        <MarketTable
          :rows="sections[m.key].data"
          :loading="sections[m.key].loading"
          :error="sections[m.key].error"
          @select="openDetail"
        />

        <template #footer>
          <p class="note">{{ m.note }}</p>
        </template>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.markets {
  display: grid;
  gap: 4px;
}

/* 상단 요약 스트립 */
.tally {
  display: grid;
  grid-template-columns: repeat(3, auto) 1fr;
  gap: 1px;
  border-top: var(--rule-thin) solid var(--border-strong);
  border-bottom: var(--rule-thin) solid var(--border-strong);
  margin-bottom: var(--sp-5);
}
.t-item {
  display: flex;
  align-items: baseline;
  gap: 9px;
  padding: 9px 18px 9px 0;
  border-right: var(--rule-hair) solid var(--border);
}
.t-item.wide {
  justify-content: flex-end;
  border-right: 0;
  padding-right: 0;
}
.t-val {
  font-size: 15px;
  font-weight: 800;
}
.t-val.up {
  color: var(--up);
}
.t-val.down {
  color: var(--down);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: clamp(16px, 2.4vw, 24px);
  align-items: start;
}
.note {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  text-align: right;
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .tally {
    grid-template-columns: repeat(3, 1fr);
  }
  .t-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 8px 10px 8px 0;
  }
  .t-item.wide {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-start;
    gap: 8px;
    border-top: var(--rule-hair) solid var(--border);
  }
}
</style>
