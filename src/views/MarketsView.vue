<script setup>
// ===== 마켓 =====
// 환율(Frankfurter) · 암호화폐(CoinGecko) 실시간 + 증시(Mock) 3섹션.
// 강의 7장 Axios · 9장 Promise.all · 8장 Element Plus(skeleton/empty).
import { onMounted } from 'vue'
import { useMarkets } from '@/composables/useMarkets'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import MarketTable from '@/components/markets/MarketTable.vue'

const { sections, loadAll } = useMarkets()

const meta = [
  { key: 'rates', kicker: 'FX', title: '환율', note: 'USD 기준 · Frankfurter' },
  { key: 'crypto', kicker: 'Crypto', title: '암호화폐', note: 'USD · CoinGecko' },
  { key: 'stocks', kicker: 'Equities', title: '증시', note: '주요 지수' },
]

onMounted(loadAll)
</script>

<template>
  <div class="markets">
    <SectionHeader kicker="Markets" title="마켓" />
    <p class="lead">환율과 암호화폐는 실시간, 증시는 샘플 데이터로 표시됩니다.</p>

    <div class="grid">
      <BaseCard v-for="m in meta" :key="m.key" :kicker="m.kicker" :title="m.title">
        <template #action>
          <SourceBadge
            v-if="!sections[m.key].loading"
            :source="sections[m.key].source || 'mock'"
          />
        </template>
        <MarketTable
          :rows="sections[m.key].data"
          :loading="sections[m.key].loading"
          :error="sections[m.key].error"
        />
        <p class="note">{{ m.note }}</p>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.markets {
  display: grid;
  gap: 4px;
}
.lead {
  color: var(--ink-sub);
  font-size: 14px;
  margin-bottom: 18px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
  align-items: start;
}
.note {
  margin-top: 12px;
  font-size: 11.5px;
  color: var(--ink-mute);
  text-align: right;
}
</style>
