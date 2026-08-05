<script setup>
// 게시판 목록 — boardStore(localStorage) 기반 (강의 6장 Pinia · 2장 v-for/v-if)
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import { fmtDate } from '@/utils/format'
import SectionHeader from '@/components/common/SectionHeader.vue'

const router = useRouter()
const board = useBoardStore()
const auth = useAuthStore()
const { posts } = storeToRefs(board)
const list = computed(() => board.sorted)

const goWrite = () => router.push('/board/write')
</script>

<template>
  <div class="board">
    <SectionHeader kicker="Board" title="게시판">
      <template #action>
        <el-button type="primary" round size="small" @click="goWrite">글쓰기</el-button>
      </template>
    </SectionHeader>

    <el-empty v-if="!posts.length" description="첫 글을 남겨보세요.">
      <el-button type="primary" round @click="goWrite">글쓰기</el-button>
    </el-empty>

    <table v-else class="list">
      <thead>
        <tr>
          <th class="c-title">제목</th>
          <th class="c-author">작성자</th>
          <th class="c-date">작성일</th>
          <th class="c-views">조회</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in list" :key="p.id" @click="router.push(`/board/${p.id}`)">
          <td class="c-title">
            <span class="title serif">{{ p.title }}</span>
            <span v-if="auth.username === p.authorId" class="mine">내 글</span>
          </td>
          <td class="c-author">{{ p.author }}</td>
          <td class="c-date mono">{{ fmtDate(p.createdAt) }}</td>
          <td class="c-views mono">{{ p.views }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  gap: 4px;
}
.list {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.list th {
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-mute);
  padding: 10px 8px;
  border-bottom: 2px solid var(--ink);
}
.list td {
  padding: 13px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.list tbody tr {
  cursor: pointer;
}
.list tbody tr:hover .title {
  color: var(--accent);
}
.c-author,
.c-date,
.c-views {
  white-space: nowrap;
  color: var(--ink-sub);
}
.c-date,
.c-views {
  text-align: right;
  width: 1%;
}
.c-author {
  width: 1%;
}
.title {
  font-weight: 700;
  font-size: 15.5px;
}
.mine {
  margin-left: 8px;
  font-size: 10px;
  font-weight: 800;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--border));
  border-radius: 999px;
  padding: 1px 7px;
  vertical-align: middle;
}
@media (max-width: 560px) {
  .c-author {
    display: none;
  }
  .list th.c-author,
  .list td.c-author {
    display: none;
  }
}
</style>
