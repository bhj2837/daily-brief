<script setup>
// 판권(colophon) — 신문 하단의 발행 정보 블록. 지면 목록·출처·제작 표기를 3단으로 조판한다.
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()

const navLinks = [
  { to: '/news', label: '뉴스' },
  { to: '/markets', label: '마켓' },
  { to: '/weather', label: '날씨' },
  { to: '/game', label: '끝말잇기' },
  { to: '/board', label: '게시판' },
  { to: '/about', label: '소개' },
]

const sources = [
  { name: 'Hacker News', use: '테크 뉴스' },
  { name: 'Spaceflight News', use: '우주 뉴스' },
  { name: 'Frankfurter', use: '환율' },
  { name: 'CoinGecko', use: '코인' },
  { name: 'Open-Meteo · wttr.in', use: '날씨' },
  { name: 'Wiktionary', use: '국어사전' },
]
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="rule-double" aria-hidden="true" />

      <div class="foot-grid">
        <!-- 제호 -->
        <div class="col brandcol">
          <div class="f-brand serif">Daily<b>Brief</b></div>
          <ul class="f-nav">
            <li v-for="n in navLinks" :key="n.to">
              <RouterLink :to="n.to">{{ n.label }}</RouterLink>
            </li>
          </ul>
        </div>

        <!-- 데이터 출처 -->
        <div class="col">
          <span class="dateline col-head">데이터 출처</span>
          <ul class="src-list">
            <li v-for="s in sources" :key="s.name">
              <span class="s-name">{{ s.name }}</span>
              <span class="s-dot" aria-hidden="true" />
              <span class="s-use">{{ s.use }}</span>
            </li>
          </ul>
        </div>

        <!-- 제작 정보 -->
        <div class="col">
          <span class="dateline col-head">제작</span>
          <p class="f-note">Vue 3 · Vite · Pinia · Vue Router · Element Plus</p>
        </div>
      </div>

      <div class="foot-bottom">
        <span>© {{ year }} Daily Brief</span>
        <span class="dot" aria-hidden="true">·</span>
        <span>SKALA Frontend Framework 종합과제</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--sp-8);
  padding-bottom: var(--sp-7);
  background: var(--surface);
  border-top: var(--rule-thin) solid var(--border);
}
.rule-double {
  margin-top: var(--sp-6);
}
.foot-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.1fr 1fr;
  gap: clamp(20px, 4vw, 46px);
  padding: var(--sp-5) 0 var(--sp-5);
}
.col {
  min-width: 0;
}
.col + .col {
  border-left: var(--rule-hair) solid var(--border);
  padding-left: clamp(16px, 3vw, 34px);
}
.col-head {
  display: block;
  margin-bottom: 10px;
}
.f-brand {
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.f-brand b {
  font-weight: 900;
}
/* 지면 바로가기 */
.f-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 12px;
}
.f-nav a {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--ink-sub);
  transition: color var(--dur-fast) var(--ease);
}
.f-nav a:hover {
  color: var(--accent);
}
.src-list {
  display: grid;
  gap: 6px;
}
.src-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-small);
  color: var(--ink-sub);
}
.s-name {
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}
.s-dot {
  flex: 1;
  height: 1px;
  background: var(--border);
  min-width: 12px;
}
.s-use {
  color: var(--ink-mute);
  font-size: var(--fs-tiny);
  white-space: nowrap;
}
.f-note {
  color: var(--ink-mute);
  font-size: var(--fs-small);
  line-height: 1.7;
}
.f-note + .f-note {
  margin-top: 8px;
}
.foot-bottom {
  border-top: var(--rule-hair) solid var(--border-strong);
  padding-top: 14px;
  color: var(--ink-faint);
  font-size: var(--fs-tiny);
  letter-spacing: 0.03em;
}
.foot-bottom .dot {
  margin: 0 7px;
}

@media (max-width: 860px) {
  .foot-grid {
    grid-template-columns: 1fr 1fr;
  }
  .brandcol {
    grid-column: 1 / -1;
  }
  .col + .col {
    border-left: 0;
    padding-left: 0;
  }
  .brandcol + .col {
    border-top: var(--rule-hair) solid var(--border);
    padding-top: var(--sp-4);
  }
  .brandcol ~ .col:last-child {
    border-top: var(--rule-hair) solid var(--border);
    padding-top: var(--sp-4);
  }
}
@media (max-width: 560px) {
  .foot-grid {
    grid-template-columns: 1fr;
  }
}
</style>
