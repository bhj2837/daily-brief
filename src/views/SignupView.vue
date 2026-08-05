<script setup>
// 회원가입 — el-form 유효성 검증(비밀번호 확인 포함) + authStore
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'
import BaseCard from '@/components/common/BaseCard.vue'

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
    <BaseCard title="회원가입">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="아이디" prop="username">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="닉네임 (선택)" prop="nickname">
          <el-input v-model="form.nickname" placeholder="비우면 아이디로 표시" />
        </el-form-item>
        <el-form-item label="비밀번호" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" />
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
