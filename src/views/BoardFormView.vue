<script setup>
// 게시글 작성/수정 공용 — /board/write, /board/:id/edit (requiresAuth 가드 보호)
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBoardStore } from '@/stores/boardStore'
import { useAuthStore } from '@/stores/authStore'
import BaseCard from '@/components/common/BaseCard.vue'

const props = defineProps({ id: { type: String, default: '' } })
const router = useRouter()
const board = useBoardStore()
const auth = useAuthStore()

const isEdit = computed(() => Boolean(props.id))
const formRef = ref(null)
const form = ref({ title: '', content: '' })
const rules = {
  title: [{ required: true, message: '제목을 입력하세요.', trigger: 'blur' }],
  content: [{ required: true, message: '내용을 입력하세요.', trigger: 'blur' }],
}

onMounted(() => {
  if (isEdit.value) {
    const p = board.byId(props.id)
    if (!p) {
      ElMessage.error('게시글을 찾을 수 없습니다.')
      router.replace('/board')
      return
    }
    if (p.authorId !== auth.username) {
      ElMessage.warning('작성자만 수정할 수 있습니다.')
      router.replace(`/board/${props.id}`)
      return
    }
    form.value = { title: p.title, content: p.content }
  }
})

const onSubmit = async () => {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  if (isEdit.value) {
    board.update(props.id, form.value)
    router.push(`/board/${props.id}`)
  } else {
    const id = board.create({
      title: form.value.title,
      content: form.value.content,
      author: auth.nickname,
      authorId: auth.username,
    })
    router.push(`/board/${id}`)
  }
}

const cancel = () => router.back()
</script>

<template>
  <div class="write">
    <BaseCard :title="isEdit ? '글 수정' : '글쓰기'" kicker="Letters" variant="clip">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="제목" prop="title">
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="내용" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="12" resize="none" />
        </el-form-item>
        <div class="actions">
          <el-button round @click="cancel">취소</el-button>
          <el-button type="primary" round @click="onSubmit">{{
            isEdit ? '수정' : '등록'
          }}</el-button>
        </div>
      </el-form>
    </BaseCard>
  </div>
</template>

<style scoped>
.write {
  max-width: calc(var(--maxw-read) + 120px);
  margin: 0 auto;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: var(--sp-2);
  border-top: var(--rule-hair) solid var(--border);
}
:deep(.el-form-item__label) {
  font-size: var(--fs-tiny);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
/* 본문 입력란은 세리프로 — 원고지에 쓰듯 */
:deep(.el-textarea__inner) {
  font-family: var(--font-serif);
  font-size: 15.5px;
  line-height: 1.8;
}
</style>
