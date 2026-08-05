<script setup>
// 게시판 목록의 한 행 (강의 4장 props / emit).
// 표시에 필요한 값만 props로 받고, 클릭하면 글 id를 open 이벤트로 올려보낸다.
// 라우팅은 부모(BoardListView)가 담당해 이 컴포넌트는 어디서든 재사용할 수 있다.
import { computed } from 'vue'
import { fmtDate } from '@/utils/format'

const props = defineProps({
  post: { type: Object, required: true },
  // 표에 표시할 번호 (부모가 계산해 내려준다)
  no: { type: Number, default: 0 },
  // 현재 로그인 사용자의 글인지 여부
  mine: { type: Boolean, default: false },
})

const emit = defineEmits(['open'])

const noLabel = computed(() => String(props.no).padStart(2, '0'))
const dateLabel = computed(() => fmtDate(props.post.createdAt))
</script>

<template>
  <tr class="post-row" @click="emit('open', post.id)">
    <td class="c-no mono">{{ noLabel }}</td>
    <td class="c-title">
      <span class="title serif">
        <span class="ink-underline">{{ post.title }}</span>
      </span>
      <span v-if="mine" class="mine">내 글</span>
    </td>
    <td class="c-author">{{ post.author }}</td>
    <td class="c-date mono">{{ dateLabel }}</td>
    <td class="c-views mono">{{ post.views }}</td>
  </tr>
</template>

<style scoped>
.post-row {
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.post-row:hover {
  background: var(--surface);
}
.post-row td {
  padding: 12px 8px;
  border-bottom: var(--rule-hair) solid var(--border);
  vertical-align: middle;
}
.c-no {
  width: 1%;
  color: var(--ink-faint);
  font-size: var(--fs-tiny);
  font-weight: 700;
  white-space: nowrap;
}
.c-author,
.c-date,
.c-views {
  white-space: nowrap;
  color: var(--ink-sub);
  width: 1%;
}
.c-date,
.c-views {
  text-align: right;
}
.title {
  font-weight: 700;
  font-size: 15.5px;
}
.title .ink-underline {
  background-size: 0% var(--rule-thin);
}
.post-row:hover .title .ink-underline {
  background-size: 100% var(--rule-thin);
}
.mine {
  margin-left: 8px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--accent);
  border: var(--rule-thin) solid color-mix(in srgb, var(--accent) 45%, var(--border));
  border-radius: var(--radius-pill);
  padding: 1px 7px;
  vertical-align: middle;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .c-author,
  .c-no {
    display: none;
  }
}
</style>
