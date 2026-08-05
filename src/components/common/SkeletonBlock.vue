<script setup>
// 재사용 스켈레톤 로더. 로딩 상태 UX (강의 8장 스켈레톤 개념 + 자체 구현).
// lines>1 이면 여러 줄, 아니면 단일 블록.
// 인쇄물 톤에 맞춰 기본 모서리는 거의 직각(3px)으로 둔다.
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '16px' },
  radius: { type: String, default: '3px' },
  lines: { type: Number, default: 1 },
})
</script>

<template>
  <div v-if="lines > 1" class="skel-lines">
    <span
      v-for="n in lines"
      :key="n"
      class="skel"
      :style="{ height, borderRadius: radius, width: n === lines ? '70%' : '100%' }"
    />
  </div>
  <span v-else class="skel" :style="{ width, height, borderRadius: radius, display: 'block' }" />
</template>

<style scoped>
.skel-lines {
  display: grid;
  gap: 9px;
}
</style>
