<script setup>
// 서비스 소개 — Daily Brief 개요 + 정보 모듈 안내.
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
const router = useRouter()

const modules = [
  ['🗞️ 뉴스', '테크(Hacker News)·우주/과학(Spaceflight News) 실시간, 종합 뉴스'],
  ['🌤️ 날씨', '전국 주요 도시 현재 날씨와 5일 예보, 현재 위치 감지'],
  ['💱 마켓', '환율·암호화폐 실시간 시세와 추세, 주요 증시 지수'],
  ['🔤 끝말잇기', '두음법칙을 반영한 컴퓨터 대전 미니게임'],
]
</script>

<template>
  <div class="about">
    <BaseCard>
      <span class="kicker">About</span>
      <h1 class="a-title serif">Daily Brief</h1>

      <h3>정보 모듈</h3>
      <div class="rows">
        <div v-for="[k, v] in modules" :key="k" class="row">
          <b>{{ k }}</b><span>{{ v }}</span>
        </div>
      </div>

      <p class="a-note">
        모든 데이터는 별도 설정 없이도 동작하며, 키가 없을 때는 샘플 데이터로 자연스럽게 대체됩니다.
      </p>

      <el-button type="primary" round class="home-btn" @click="router.push('/')">
        오늘의 브리핑으로 →
      </el-button>
    </BaseCard>
  </div>
</template>

<style scoped>
.about {
  max-width: 760px;
  margin: 0 auto;
}
.a-title {
  font-size: 34px;
  font-weight: 900;
  margin: 4px 0 12px;
}
.a-lead {
  color: var(--ink-sub);
  line-height: 1.75;
  margin-bottom: 8px;
}
.a-lead b {
  color: var(--ink);
}
h3 {
  font-size: 13px;
  margin: 22px 0 10px;
  color: var(--ink-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-sans);
  font-weight: 800;
}
.rows {
  display: grid;
  gap: 2px;
}
.row {
  display: flex;
  gap: 14px;
  align-items: baseline;
  padding: 9px 4px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.row b {
  min-width: 130px;
  font-weight: 800;
}
.row span {
  color: var(--ink-sub);
}
.a-note {
  margin-top: 18px;
  font-size: 13px;
  color: var(--ink-mute);
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.home-btn {
  margin-top: 20px;
}
</style>
