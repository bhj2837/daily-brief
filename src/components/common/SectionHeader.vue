<script setup>
// 신문 섹션 헤드 스타일 헤더. 킥커 + 제목 + (옵션) 우측 액션 슬롯.
// 아래에 굵은 룰을 그어 매거진 섹션 구분감을 준다.
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="sec-head">
    <div class="sec-text">
      <span v-if="kicker" class="kicker">{{ kicker }}</span>
      <h2 class="sec-title serif">{{ title }}</h2>
    </div>
    <div v-if="$slots.action" class="sec-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--ink);
  margin-bottom: 16px;
}
.sec-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
}
.sec-action {
  flex-shrink: 0;
  padding-bottom: 3px;
}
</style>
