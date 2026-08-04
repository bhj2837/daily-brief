<script setup>
// Catch-all 404 페이지 (강의 5장 Unmatched Route Handling)
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="nf">
    <span class="code serif">404</span>
    <h1 class="serif">지면을 찾을 수 없습니다</h1>
    <p>요청하신 경로에는 기사가 없습니다. 첫 지면으로 돌아가 보세요.</p>
    <el-button type="primary" round @click="router.push('/')">홈으로 돌아가기</el-button>
  </div>
</template>

<style scoped>
.nf {
  text-align: center;
  padding: 90px 20px;
  display: grid;
  gap: 12px;
  place-items: center;
}
.code {
  font-size: 72px;
  font-weight: 900;
  color: var(--accent);
  line-height: 1;
}
.nf h1 {
  font-size: 26px;
  font-weight: 800;
}
.nf p {
  color: var(--ink-sub);
  margin-bottom: 12px;
}
</style>
