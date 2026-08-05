<script setup>
// 공통 종이 카드. 부모가 slot으로 내용을 주입한다 (강의 4장 slot · p158 BaseCard 패턴).
// 에디토리얼 톤: 지면 표면 + 얇은 괘선 + 상단 잉크 룰. 요란한 그림자는 쓰지 않는다.
defineProps({
  title: { type: String, default: '' },
  kicker: { type: String, default: '' },
  padded: { type: Boolean, default: true },
  hover: { type: Boolean, default: false },
  // 'plain' 기본 · 'clip' 상단 굵은 잉크 룰(오려낸 기사) · 'boxed' 강조 박스 기사
  variant: { type: String, default: 'plain' },
})
</script>

<template>
  <section class="card" :class="[`v-${variant}`, { padded, lift: hover }]">
    <header v-if="title || kicker || $slots.header" class="card-head">
      <slot name="header">
        <div class="head-text">
          <span v-if="kicker" class="kicker">{{ kicker }}</span>
          <h2 v-if="title" class="card-title serif">{{ title }}</h2>
        </div>
      </slot>
      <div v-if="$slots.action" class="card-action">
        <slot name="action" />
      </div>
    </header>

    <div v-if="title || kicker || $slots.header" class="head-rule" aria-hidden="true" />

    <div class="card-body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card-foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--surface);
  border: var(--rule-thin) solid var(--border);
  border-radius: var(--radius);
  box-shadow:
    0 1px 0 var(--shadow),
    0 1px 3px -1px var(--shadow);
  overflow: hidden;
}
.v-clip {
  border-top: var(--rule-thick) solid var(--ink);
}
.v-boxed {
  background: var(--surface-2);
  border-color: var(--border-strong);
}

.card-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: 15px var(--sp-5) 8px;
}
.head-text {
  min-width: 0;
}
.card-title {
  font-size: var(--fs-h3);
  font-weight: 800;
  margin-top: 2px;
  line-height: 1.2;
}
.card-action {
  flex-shrink: 0;
  padding-bottom: 2px;
}

/* 헤더 아래 얇은 구분 괘선 */
.head-rule {
  height: var(--rule-thin);
  background: var(--border-strong);
  margin: 0 var(--sp-5);
}

.card.padded .card-body {
  padding: var(--sp-4) var(--sp-5) var(--sp-5);
}
.card:not(.padded) .card-body {
  padding: 0;
}

.card-foot {
  border-top: var(--rule-hair) solid var(--border);
  padding: 12px var(--sp-5);
  background: var(--surface-2);
}
.v-boxed .card-foot {
  background: var(--surface-3);
}

@media (max-width: 560px) {
  .card-head {
    padding: 13px var(--sp-4) 7px;
  }
  .head-rule {
    margin: 0 var(--sp-4);
  }
  .card.padded .card-body {
    padding: var(--sp-3) var(--sp-4) var(--sp-4);
  }
  .card-foot {
    padding: 11px var(--sp-4);
  }
}
</style>
