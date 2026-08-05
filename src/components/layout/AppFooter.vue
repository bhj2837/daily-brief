<script setup>
// 하단 푸터 — 서비스/출처 정보.
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container f-inner">
      <div class="f-brand serif">Daily<b>Brief</b></div>
      <p class="f-src">
        데이터 출처: Hacker News · Spaceflight News · Frankfurter · CoinGecko · Open-Meteo · Wiktionary
        <span class="dot">·</span> 키 없이 실시간 동작
      </p>
      <p class="f-copy">© {{ year }} Daily Brief · Vue 3 + Vite</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 2px solid var(--ink);
  background: var(--surface);
  margin-top: 40px;
  padding: 26px 0 34px;
}
.f-brand {
  font-size: 20px;
  font-weight: 700;
}
.f-brand b {
  font-weight: 900;
}
.f-src {
  color: var(--ink-mute);
  font-size: 12.5px;
}
.f-src .dot {
  margin: 0 6px;
}
.f-copy {
  color: var(--ink-mute);
  font-size: 12px;
  margin-top: 10px;
}
</style>
