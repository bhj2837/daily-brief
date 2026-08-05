<script setup>
// 서비스 소개 — Daily Brief 개요 + 정보 모듈 · 활용 API 안내.
// 조판: 신문의 '발행 안내(masthead statement)' 지면. 제호 → 리드문 → 표.
import { useRouter } from 'vue-router'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseCard from '@/components/common/BaseCard.vue'
const router = useRouter()

const modules = [
  ['🗞️ 뉴스', '테크(Hacker News)·우주/과학(Spaceflight News) 실시간, 종합 뉴스'],
  ['🌤️ 날씨', '전국 주요 도시 현재 날씨와 5일 예보, 현재 위치 감지'],
  ['💱 마켓', '환율·암호화폐 실시간 시세와 추세, 주요 증시 지수'],
  ['🔤 끝말잇기', '두음법칙을 반영한 컴퓨터 대전 미니게임'],
]

// 활용한 외부 API (실시간 = 키 없이 동작 · 키 선택 = 키 있으면 실데이터, 없으면 샘플)
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

const stack = ['Vue 3', 'Vite 6', 'Vue Router 4', 'Pinia 2', 'Axios', 'Element Plus', 'ESLint']
</script>

<template>
  <div class="about">
    <!-- 발행 안내 제호 -->
    <header class="masthead-block">
      <div class="rule-double" aria-hidden="true" />
      <span class="kicker">About</span>
      <h1 class="a-title serif">Daily Brief</h1>
      <p class="lead a-lead">
        뉴스·날씨·마켓·끝말잇기를 한 지면에 모은 데일리 브리핑입니다. 모든 모듈은
        <b>API 키 없이도</b> 공개 API로 실시간 동작하고, 호출이 실패하면 단계별 폴백과 샘플 데이터로
        자연스럽게 이어집니다.
      </p>
      <ul class="stack">
        <li v-for="s in stack" :key="s">{{ s }}</li>
      </ul>
      <div class="rule-double" aria-hidden="true" />
    </header>

    <div class="cols">
      <BaseCard v-reveal kicker="Modules" title="정보 모듈" variant="clip">
        <div class="rows">
          <div v-for="[k, v] in modules" :key="k" class="row">
            <b>{{ k }}</b>
            <span>{{ v }}</span>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-reveal="{ delay: 90 }" kicker="Sources" title="활용 API" variant="clip">
        <div class="rows">
          <div v-for="[k, v, live] in apis" :key="k + v" class="row api">
            <b>{{ k }}</b>
            <span>
              {{ v }}
              <em class="tag" :class="live ? 'live' : 'opt'">{{ live ? '실시간' : '키 선택' }}</em>
            </span>
          </div>
        </div>
        <template #footer>
          <p class="a-note">
            '실시간'은 키 없이 항상 실데이터로 동작하고, '키 선택'은 키가 있으면 실데이터, 없으면
            샘플로 대체됩니다.
          </p>
        </template>
      </BaseCard>
    </div>

    <SectionHeader kicker="Go" title="지면 이동" />
    <div class="go">
      <button class="btn-ink btn-ink--accent" @click="router.push('/')">오늘의 브리핑으로 →</button>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: var(--sp-6);
}

.masthead-block {
  text-align: center;
}
.masthead-block .kicker {
  margin-top: var(--sp-4);
}
.a-title {
  font-size: var(--fs-display);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 6px 0 12px;
}
.a-lead {
  max-width: 62ch;
  margin: 0 auto var(--sp-4);
  text-align: left;
}
.a-lead b {
  color: var(--ink);
  font-weight: 700;
}
.stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: var(--sp-4);
}
.stack li {
  font-size: var(--fs-tiny);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink-sub);
  border: var(--rule-thin) solid var(--border-strong);
  border-radius: var(--radius-pill);
  padding: 2px 10px;
}

.cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(16px, 2.4vw, 24px);
  align-items: start;
}

.rows {
  display: grid;
}
.row {
  display: flex;
  gap: 14px;
  align-items: baseline;
  padding: 9px 2px;
  border-bottom: var(--rule-hair) solid var(--border);
  font-size: 13.5px;
}
.row:last-child {
  border-bottom: 0;
}
.row b {
  min-width: 118px;
  font-weight: 800;
  flex-shrink: 0;
}
.row span {
  color: var(--ink-sub);
}
.tag {
  display: inline-block;
  margin-left: 8px;
  font-style: normal;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  border: var(--rule-thin) solid var(--border-strong);
  vertical-align: middle;
  white-space: nowrap;
}
.tag.live {
  color: var(--up);
  border-color: color-mix(in srgb, var(--up) 40%, var(--border-strong));
}
.tag.opt {
  color: var(--ink-mute);
  border-style: dashed;
}
.a-note {
  font-size: var(--fs-tiny);
  color: var(--ink-mute);
  line-height: 1.7;
}
.go {
  display: flex;
  justify-content: center;
  padding-bottom: var(--sp-4);
}

@media (max-width: 560px) {
  .row {
    flex-direction: column;
    gap: 3px;
  }
  .row b {
    min-width: 0;
  }
}
</style>
