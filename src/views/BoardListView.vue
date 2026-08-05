<script setup>
// 게시판 목록 — boardStore(localStorage) 기반 (강의 6장 Pinia · 2장 v-for/v-if)
// 행 렌더링은 PostRow 컴포넌트에 위임하고, 이 뷰는 데이터 조회와 라우팅만 책임진다.
// 조판: 신문 '독자 투고(Letters)'면. 표 형식으로 제목·작성자·일자·조회를 정렬한다.
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import SectionHeader from '@/components/common/SectionHeader.vue'
import PostRow from '@/components/board/PostRow.vue'

const router = useRouter()
const board = useBoardStore()
const auth = useAuthStore()

// 스토어의 정렬된 목록을 단일 소스로 사용한다 (강의 6장 storeToRefs로 반응성 유지)
const { sorted } = storeToRefs(board)
const { username } = storeToRefs(auth)

const total = computed(() => sorted.value.length)

const goWrite = () => router.push('/board/write')

// 자식(PostRow)이 올린 open 이벤트를 받아 상세로 이동 (강의 4장 emit 수신)
const openPost = (id) => router.push(`/board/${id}`)
</script>

<template>
  <div class="board">
    <SectionHeader
      kicker="Letters"
      title="게시판"
      size="lg"
      :sub="total ? `총 ${total}건의 글` : '아직 등록된 글이 없습니다'"
    >
      <template #action>
        <el-button type="primary" round size="small" @click="goWrite">글쓰기</el-button>
      </template>
    </SectionHeader>

    <el-empty v-if="!total" description="첫 글을 남겨보세요.">
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
        <PostRow
          v-for="(p, i) in sorted"
          :key="p.id"
          :post="p"
          :no="total - i"
          :mine="username === p.authorId"
          @open="openPost"
        />
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
.c-no,
.c-author,
.c-date,
.c-views {
  width: 1%;
  white-space: nowrap;
}
.c-date,
.c-views {
  text-align: right;
}

@media (max-width: 640px) {
  .list th.c-author,
  .list th.c-no {
    display: none;
  }
}
</style>
