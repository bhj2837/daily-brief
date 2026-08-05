<script setup>
// 게시글 상세 — 동적 라우트 /board/:id. 작성자만 수정/삭제.
// 조판: 독자 투고 지면. 제목 → 바이라인(이중 괘선) → 본문(세리프 조판).
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import { fmtDate } from '@/utils/format'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const board = useBoardStore()
const auth = useAuthStore()

const post = computed(() => board.byId(props.id))
const isAuthor = computed(() => post.value && auth.username === post.value.authorId)
const edited = computed(() => post.value && post.value.updatedAt !== post.value.createdAt)

const remove = async () => {
  try {
    await ElMessageBox.confirm('이 글을 삭제할까요?', '삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    })
    board.remove(props.id)
    ElMessage.success('삭제되었습니다.')
    router.push('/board')
  } catch {
    /* 취소 */
  }
}

onMounted(() => {
  if (board.byId(props.id)) board.view(props.id)
})
</script>

<template>
  <div class="detail">
    <button class="back" @click="router.push('/board')"><span class="arrow">←</span> 목록</button>

    <el-result v-if="!post" icon="warning" title="게시글을 찾을 수 없습니다">
      <template #extra>
        <el-button type="primary" round @click="router.push('/board')">목록으로</el-button>
      </template>
    </el-result>

    <article v-else class="paper post">
      <span class="kicker">Letters</span>
      <h1 class="title serif">{{ post.title }}</h1>

      <div class="byline-block">
        <span class="dateline">
          글 {{ post.author }} · {{ fmtDate(post.createdAt) }}{{ edited ? ' (수정됨)' : '' }}
        </span>
        <span class="dateline">조회 {{ post.views }}</span>
      </div>

      <div class="content prose">{{ post.content }}</div>

      <div v-if="isAuthor" class="actions">
        <el-button round size="small" @click="router.push(`/board/${post.id}/edit`)">
          수정
        </el-button>
        <el-button round size="small" type="danger" plain @click="remove">삭제</el-button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: var(--sp-4);
  max-width: calc(var(--maxw-read) + 120px);
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: var(--fs-small);
  cursor: pointer;
  justify-self: start;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back .arrow {
  transition: transform var(--dur) var(--ease-paper);
}
.back:hover {
  color: var(--ink);
}
.back:hover .arrow {
  transform: translateX(-4px);
}

.post {
  padding: clamp(22px, 4vw, 40px) clamp(20px, 4vw, 44px);
  border-top: var(--rule-thick) solid var(--ink);
}
.title {
  font-size: var(--fs-h2);
  font-weight: 900;
  line-height: 1.25;
  margin-top: 6px;
  word-break: keep-all;
}
.byline-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
  margin: var(--sp-4) 0 var(--sp-5);
  padding: 9px 0;
  border-top: var(--rule-med) solid var(--ink);
  border-bottom: var(--rule-hair) solid var(--border-strong);
}
.content {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 120px;
  max-width: none;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: var(--sp-6);
  padding-top: var(--sp-4);
  border-top: var(--rule-hair) solid var(--border);
}

@media (max-width: 560px) {
  .byline-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
