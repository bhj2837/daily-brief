<script setup>
// 게시판 목록 — boardStore(localStorage) 기반 (강의 6장 Pinia · 2장 v-for/v-if)
// 조판: 신문 '독자 투고(Letters)'면. 표 형식으로 제목·작성자·일자·조회를 정렬한다.
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
    <SectionHeader
      kicker="Letters"
      title="게시판"
      size="lg"
      :sub="posts.length ? `총 ${posts.length}건의 글` : '아직 등록된 글이 없습니다'"
    >
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
          <th class="c-no dateline">번호</th>
          <th class="c-title dateline">제목</th>
          <th class="c-author dateline">작성자</th>
          <th class="c-date dateline">작성일</th>
          <th class="c-views dateline">조회</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in list" :key="p.id" @click="router.push(`/board/${p.id}`)">
          <td class="c-no mono">{{ String(list.length - i).padStart(2, '0') }}</td>
          <td class="c-title">
            <span class="title serif"
              ><span class="ink-underline">{{ p.title }}</span></span
            >
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
  font-size: var(--fs-small);
}
.list th {
  text-align: left;
  padding: 8px;
  border-bottom: var(--rule-med) solid var(--ink);
}
.list td {
  padding: 12px 8px;
  border-bottom: var(--rule-hair) solid var(--border);
  vertical-align: middle;
}
.list tbody tr {
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease);
}
.list tbody tr:hover {
  background: var(--surface);
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
.list tbody tr:hover .title .ink-underline {
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
  .list th.c-author,
  .list td.c-author,
  .list th.c-no,
  .list td.c-no {
    display: none;
  }
}
</style>
