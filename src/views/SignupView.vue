<script setup>
// 회원가입 — el-form 유효성 검증(비밀번호 확인 포함) + authStore
// 조판: 로그인과 동일한 '구독 신청서' 절취선 양식.
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref(null)
const form = ref({ username: '', nickname: '', password: '', confirm: '' })

const confirmValidator = (_r, value, cb) => {
  if (value !== form.value.password) cb(new Error('비밀번호가 일치하지 않습니다.'))
  else cb()
}
const rules = {
  username: [
    { required: true, message: '아이디를 입력하세요.', trigger: 'blur' },
    { min: 3, message: '3자 이상 입력하세요.', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '비밀번호를 입력하세요.', trigger: 'blur' },
    { min: 4, message: '4자 이상 입력하세요.', trigger: 'blur' },
  ],
  confirm: [{ required: true, validator: confirmValidator, trigger: 'blur' }],
}

const onSubmit = async () => {
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  const res = auth.register(form.value)
  if (!res.ok) {
    ElMessage.error(res.reason)
    return
  }
  ElMessage.success('가입이 완료되었습니다.')
  router.push(route.query.redirect || '/board')
}
</script>

<template>
  <div class="auth">
    <section class="slip">
      <header class="slip-head">
        <span class="kicker">Subscription</span>
        <h1 class="serif">회원가입</h1>
        <p class="slip-sub">계정은 이 브라우저에만 저장됩니다.</p>
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
        <el-form-item label="닉네임 (선택)" prop="nickname">
          <el-input v-model="form.nickname" placeholder="비우면 아이디로 표시" />
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="비밀번호 확인" prop="confirm">
          <el-input v-model="form.confirm" type="password" show-password @keyup.enter="onSubmit" />
        </el-form-item>
        <el-button type="primary" class="submit" @click="onSubmit">가입하기</el-button>
      </el-form>

      <p class="switch">
        이미 계정이 있으신가요?
        <RouterLink :to="{ path: '/login', query: route.query }">로그인</RouterLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.auth {
  max-width: 430px;
  margin: clamp(20px, 5vw, 52px) auto;
}
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
