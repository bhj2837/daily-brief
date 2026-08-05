<script setup>
// 게시글 상세 — 동적 라우트 /board/:id. 작성자만 수정/삭제.
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
    <button class="back" @click="router.push('/board')">← 목록</button>

    <el-result v-if="!post" icon="warning" title="게시글을 찾을 수 없습니다">
      <template #extra>
        <el-button type="primary" round @click="router.push('/board')">목록으로</el-button>
      </template>
    </el-result>

    <article v-else class="paper post">
      <h1 class="title serif">{{ post.title }}</h1>
      <div class="meta">
        <span>{{ post.author }}</span>
        <span class="mono">{{ fmtDate(post.createdAt) }}{{ edited ? ' (수정됨)' : '' }}</span>
        <span class="mono">조회 {{ post.views }}</span>
      </div>
      <div class="content">{{ post.content }}</div>

      <div v-if="isAuthor" class="actions">
        <el-button round size="small" @click="router.push(`/board/${post.id}/edit`)">수정</el-button>
        <el-button round size="small" type="danger" plain @click="remove">삭제</el-button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.detail {
  display: grid;
  gap: 16px;
  max-width: 760px;
  margin: 0 auto;
}
.back {
  border: 0;
  background: transparent;
  color: var(--ink-sub);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  justify-self: start;
  padding: 0;
}
.back:hover {
  color: var(--ink);
}
.post {
  padding: 30px 32px;
}
.title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.3;
}
.meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--ink-mute);
  margin: 12px 0 18px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--ink);
}
.content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 120px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
@media (max-width: 560px) {
  .post {
    padding: 22px 20px;
  }
  .title {
    font-size: 22px;
  }
}
</style>
