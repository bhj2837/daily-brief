<script setup>
// 로그인 — el-form 유효성 검증 + authStore (강의 6장 Pinia · 8장 Element Plus form)
// 조판: 신문 하단의 '구독 신청서'처럼 절취선으로 둘러싸인 기입란.
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

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
    <section class="slip">
      <header class="slip-head">
        <span class="kicker">Subscriber</span>
        <h1 class="serif">로그인</h1>
        <p class="slip-sub">게시판 이용을 위해 계정을 확인합니다.</p>
      </header>
      <div class="rule-double" aria-hidden="true" />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="slip-form"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="아이디" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" class="submit" @click="onSubmit">로그인</el-button>
      </el-form>

      <p class="switch">
        계정이 없으신가요?
        <RouterLink :to="{ path: '/signup', query: route.query }">회원가입</RouterLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.auth {
  max-width: 430px;
  margin: clamp(20px, 5vw, 52px) auto;
}
/* 절취선으로 둘러싼 신청서 */
.slip {
  background: var(--surface);
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius);
  padding: clamp(22px, 4vw, 32px);
}
.slip-head {
  text-align: center;
  margin-bottom: var(--sp-3);
}
.slip-head h1 {
  font-size: var(--fs-h2);
  font-weight: 900;
  margin-top: 4px;
}
.slip-sub {
  font-size: var(--fs-small);
  color: var(--ink-mute);
  margin-top: 5px;
}
.slip-form {
  margin-top: var(--sp-5);
}
.submit {
  width: 100%;
  font-weight: 700;
}
.switch {
  margin-top: var(--sp-4);
  padding-top: var(--sp-3);
  border-top: var(--rule-hair) solid var(--border);
  font-size: var(--fs-small);
  color: var(--ink-sub);
  text-align: center;
}
.switch a {
  color: var(--accent);
  font-weight: 700;
}
.switch a:hover {
  text-decoration: underline;
}
:deep(.el-form-item__label) {
  font-size: var(--fs-tiny);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
</style>
