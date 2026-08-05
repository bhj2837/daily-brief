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

// 활용한 외부 API (● 무키 실시간 · ○ 키 있으면 실데이터, 없으면 샘플)
const apis = [
  ['뉴스 · 테크', 'Hacker News API', true],
  ['뉴스 · 우주/과학', 'Spaceflight News API', true],
  ['뉴스 · 종합', 'GNews', false],
  ['날씨', 'Open-Meteo', true],
  ['날씨 (대체)', 'wttr.in', true],
  ['날씨 (선택)', 'OpenWeather', false],
  ['환율', 'Frankfurter', true],
  ['암호화폐', 'CoinGecko', true],
  ['증시', 'Finnhub', false],
  ['끝말잇기 단어 검증', '위키낱말사전(Wiktionary) API', true],
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

      <h3>활용 API</h3>
      <div class="rows">
        <div v-for="[k, v, live] in apis" :key="k + v" class="row api">
          <b>{{ k }}</b>
          <span>
            {{ v }}
            <em class="tag" :class="live ? 'live' : 'opt'">{{ live ? '무키 실시간' : '키 선택' }}</em>
          </span>
        </div>
      </div>

      <p class="a-note">
        무키 실시간 API는 키 없이도 항상 실데이터로 동작하고, '키 선택' 항목은 키를 넣으면 실데이터,
        없으면 샘플로 대체됩니다.
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
.tag {
  display: inline-block;
  margin-left: 8px;
  font-style: normal;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  vertical-align: middle;
}
.tag.live {
  color: var(--up);
  border-color: color-mix(in srgb, var(--up) 35%, var(--border));
}
.tag.opt {
  color: var(--ink-mute);
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
