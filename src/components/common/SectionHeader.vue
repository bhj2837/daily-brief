<script setup>
// 신문 섹션 헤드. 킥커 + 제목 + (옵션) 우측 액션 슬롯.
// 제목 아래는 굵은 잉크 룰, 그 아래 헤어라인 — 신문 섹션 구분선의 이중 괘선을 재현.
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, required: true },
  // 부제(선택): 제목 오른쪽 아래에 얇게 붙는 설명
  sub: { type: String, default: '' },
  // 'lg' 는 지면 최상단 섹션용 큰 제목
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div class="sec-head" :class="`is-${size}`">
    <div class="sec-row">
      <div class="sec-text">
        <span v-if="kicker" class="kicker">{{ kicker }}</span>
        <h2 class="sec-title serif">{{ title }}</h2>
        <p v-if="sub" class="sec-sub">{{ sub }}</p>
      </div>
      <div v-if="$slots.action" class="sec-action">
        <slot name="action" />
      </div>
    </div>
    <div class="sec-rules" aria-hidden="true">
      <span class="r1" />
      <span class="r2" />
    </div>
  </div>
</template>

<style scoped>
.sec-head {
  margin-bottom: var(--sp-4);
}
.sec-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-4);
  padding-bottom: 9px;
}
.sec-text {
  min-width: 0;
}
.sec-title {
  font-size: var(--fs-h2);
  font-weight: 800;
  line-height: 1.14;
  margin-top: 2px;
}
.is-lg .sec-title {
  font-size: var(--fs-h1);
  font-weight: 900;
}
.sec-sub {
  font-size: var(--fs-small);
  color: var(--ink-mute);
  margin-top: 4px;
}
.sec-action {
  flex-shrink: 0;
  padding-bottom: 3px;
}

/* 이중 괘선 */
.sec-rules {
  display: block;
}
.sec-rules .r1,
.sec-rules .r2 {
  display: block;
  width: 100%;
}
.sec-rules .r1 {
  height: var(--rule-med);
  background: var(--ink);
}
.sec-rules .r2 {
  height: var(--rule-hair);
  background: var(--border-strong);
  margin-top: 2px;
}
.is-lg .sec-rules .r1 {
  height: var(--rule-thick);
}

@media (max-width: 560px) {
  .sec-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-2);
  }
  .sec-action {
    padding-bottom: 0;
  }
}
</style>
