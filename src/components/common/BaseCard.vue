<script setup>
// 공통 종이 카드. 부모가 slot으로 내용을 주입한다 (강의 4장 slot · p158 BaseCard 패턴).
// 에디토리얼 톤: 흰 종이 + 얇은 테두리 + 절제된 그림자. title/kicker는 옵션.
defineProps({
  title: { type: String, default: '' },
  kicker: { type: String, default: '' },
  padded: { type: Boolean, default: true },
  hover: { type: Boolean, default: false },
})
</script>

<template>
  <section class="card" :class="{ padded, hover }">
    <header v-if="title || kicker || $slots.header" class="card-head">
      <slot name="header">
        <span v-if="kicker" class="kicker">{{ kicker }}</span>
        <h2 v-if="title" class="card-title serif">{{ title }}</h2>
      </slot>
      <div v-if="$slots.action" class="card-action">
        <slot name="action" />
      </div>
    </header>
    <div class="card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 2px var(--shadow);
  overflow: hidden;
  transition: box-shadow 0.2s var(--ease), transform 0.2s var(--ease), border-color 0.2s;
}
.card.hover:hover {
  box-shadow: 0 10px 30px var(--shadow-strong);
  transform: translateY(-3px);
  border-color: var(--border-strong);
}
.card-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px 0;
}
.card.padded .card-body {
  padding: 16px 20px 20px;
}
.card:not(.padded) .card-head {
  padding-bottom: 12px;
}
.card-title {
  font-size: 19px;
  font-weight: 700;
  margin-top: 2px;
}
.card-action {
  flex-shrink: 0;
}
</style>
