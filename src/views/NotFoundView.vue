<script setup>
// Catch-all 404 페이지 (강의 5장 Unmatched Route Handling)
// 조판: 인쇄 사고로 비어버린 지면 — 굵은 괘선 사이에 404 활자만 남긴다.
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf">
    <div class="nf-rule" aria-hidden="true" />
    <span class="kicker">Missing Page</span>
    <span class="code display">404</span>
    <h1 class="serif">지면을 찾을 수 없습니다</h1>
    <p class="lead">요청하신 경로에는 기사가 실려 있지 않습니다. 첫 지면으로 돌아가 보세요.</p>
    <button class="btn-ink btn-ink--accent" @click="router.push('/')">
      첫 지면으로 돌아가기 →
    </button>
    <div class="nf-rule" aria-hidden="true" />
  </div>
</template>

<style scoped>
.nf {
  text-align: center;
  padding: clamp(40px, 8vw, 84px) 20px;
  display: grid;
  gap: var(--sp-3);
  place-items: center;
  max-width: 560px;
  margin: 0 auto;
}
.nf-rule {
  width: 100%;
  height: var(--rule-thick);
  background: var(--ink);
  margin: var(--sp-3) 0;
}
.code {
  font-size: clamp(70px, 16vw, 128px);
  font-weight: 900;
  color: var(--accent);
  line-height: 0.9;
  letter-spacing: -0.04em;
}
.nf h1 {
  font-size: var(--fs-h2);
  font-weight: 900;
}
.nf .lead {
  margin-bottom: var(--sp-3);
}
</style>
