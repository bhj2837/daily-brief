<script setup>
// 끝말잇기 진행 체인. 컴퓨터/플레이어 단어를 좌우로 정렬해 대국 기보처럼 보여준다.
// 조판: 말풍선 대신 '활자 조각' — 직각에 가까운 종이 라벨 + 수순 번호.
defineProps({
  chain: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="chain">
    <TransitionGroup name="stamp">
      <div v-for="(c, i) in chain" :key="i" class="row" :class="c.by">
        <span class="no mono">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="who">{{ c.by === 'computer' ? '🤖' : '🙂' }}</span>
        <span class="word serif">{{ c.word }}</span>
      </div>
    </TransitionGroup>
    <p v-if="!chain.length" class="empty">아직 이어진 단어가 없습니다.</p>
  </div>
</template>

<style scoped>
.chain {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  justify-content: center;
}
.row {
  display: flex;
  align-items: center;
  gap: 9px;
}
.row.player {
  flex-direction: row-reverse;
  align-self: flex-end;
}
.no {
  font-size: 10px;
  font-weight: 800;
  color: var(--ink-faint);
  letter-spacing: 0.04em;
}
.who {
  font-size: 17px;
}
/* 활자 조각 */
.word {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  padding: 7px 15px;
  border-radius: var(--radius);
  border: var(--rule-thin) solid var(--border-strong);
  background: var(--surface-2);
}
.row.computer .word {
  border-left: var(--rule-thick) solid var(--ink-mute);
}
.row.player .word {
  background: var(--accent-soft);
  border-color: color-mix(in srgb, var(--accent) 34%, var(--border-strong));
  border-right: var(--rule-thick) solid var(--accent);
}
.empty {
  text-align: center;
  color: var(--ink-faint);
  font-size: var(--fs-small);
}

/* 활자를 찍어내듯 등장 */
.stamp-enter-active {
  transition:
    transform 0.28s var(--ease-paper),
    opacity 0.22s var(--ease);
}
.stamp-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.94);
}
.stamp-move {
  transition: transform 0.3s var(--ease-paper);
}
</style>
