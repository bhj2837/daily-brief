<script setup>
// 끝말잇기 진행 체인. 컴퓨터/플레이어 말풍선을 좌우로 정렬해 대화처럼 보여준다.
defineProps({
  chain: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="chain">
    <TransitionGroup name="pop">
      <div v-for="(c, i) in chain" :key="i" class="bubble-row" :class="c.by">
        <span class="who">{{ c.by === 'computer' ? '🤖' : '🙂' }}</span>
        <span class="bubble serif">{{ c.word }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.chain {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;
}
.bubble-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bubble-row.player {
  flex-direction: row-reverse;
  align-self: flex-end;
}
.who {
  font-size: 18px;
}
.bubble {
  font-size: 20px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
}
.bubble-row.computer .bubble {
  background: var(--surface-2);
  border-top-left-radius: 4px;
}
.bubble-row.player .bubble {
  background: var(--accent-soft);
  border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
  border-top-right-radius: 4px;
}
.pop-enter-active {
  transition: transform 0.25s var(--ease), opacity 0.25s;
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
