<script setup>
// 로그인 — el-form 유효성 검증 + authStore (강의 6장 Pinia · 8장 Element Plus form)
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import BaseCard from '@/components/common/BaseCard.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref(null)
const form = ref({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '아이디를 입력하세요.', trigger: 'blur' }],
  password: [{ required: true, message: '비밀번호를 입력하세요.', trigger: 'blur' }],
}

const onSubmit = async () => {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  const res = auth.login(form.value)
  if (!res.ok) {
    ElMessage.error(res.reason)
    return
  }
  router.push(route.query.redirect || '/board')
}
</script>

<template>
  <div class="auth">
    <BaseCard title="로그인">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="아이디" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" @keyup.enter="onSubmit" />
        </el-form-item>
        <el-button type="primary" class="submit" @click="onSubmit">로그인</el-button>
      </el-form>
      <p class="switch">
        계정이 없으신가요?
        <RouterLink :to="{ path: '/signup', query: route.query }">회원가입</RouterLink>
      </p>
    </BaseCard>
  </div>
</template>

<style scoped>
.auth {
  max-width: 400px;
  margin: 40px auto;
}
.submit {
  width: 100%;
}
.switch {
  margin-top: 16px;
  font-size: 13px;
  color: var(--ink-sub);
  text-align: center;
}
.switch a {
  color: var(--accent);
  font-weight: 700;
}
</style>
