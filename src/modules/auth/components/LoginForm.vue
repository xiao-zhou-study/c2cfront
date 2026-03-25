<template>
  <div class="login-section">
    <div class="login-card">
      <div class="login-header">
        <h2>欢迎回来</h2>
        <p>登录您的账号以继续使用</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入邮箱或学号"
            size="large"
            :disabled="loading"
            clearable
            class="custom-input"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span class="input-icon">👤</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :disabled="loading"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span class="input-icon">🔒</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox
            v-model="rememberAccount"
            :disabled="loading"
            class="remember-checkbox"
          >
            记住账号
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="auth-footer">
        <span>还没有账号？</span>
        <el-link
          type="primary"
          :underline="false"
          class="register-link"
          @click="$router.push('/register')"
        >
          立即注册
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/shared/stores/user'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElLink, ElCheckbox } from 'element-plus'
import { storage } from '@/shared/utils/storage'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()

const loginForm = ref({
  type: 1,
  account: '',
  password: ''
})

const loading = ref(false)
const rememberAccount = ref(false)
const isHandlingLogin = ref(false)

const isFormValid = computed(() => {
  return loginForm.value.account && loginForm.value.password
})

const isEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const validateAccount = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱或学号'))
  } else if (isEmail(value)) {
    callback()
  } else if (/^\d{8,12}$/.test(value)) {
    callback()
  } else {
    callback(new Error('请输入有效的邮箱或学号（8-12位数字）'))
  }
}

const rules = {
  account: [
    { required: true, message: '请输入邮箱或学号', trigger: 'blur' },
    { validator: validateAccount, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    const redirect = router.currentRoute.value.query.redirect as string || '/dashboard'
    router.push(redirect)
    return
  }
  const savedAccount = storage.get('rememberedAccount', '')
  if (savedAccount) {
    loginForm.value.account = savedAccount
    rememberAccount.value = true
  }
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  if (isHandlingLogin.value) return
  try {
    isHandlingLogin.value = true
    await loginFormRef.value.validate()
    if (!isFormValid.value) {
      ElMessage.warning('请填写完整信息')
      return
    }
    loading.value = true
    userStore.clearToken()
    const account = loginForm.value.account
    const loginData: any = {
      type: loginForm.value.type,
      password: loginForm.value.password,
      rememberMe: rememberAccount.value
    }
    if (isEmail(account)) {
      loginData.email = account
    } else {
      loginData.studentId = account
    }
    await userStore.login(loginData)
    if (rememberAccount.value) {
      storage.set('rememberedAccount', account)
    } else {
      storage.remove('rememberedAccount')
    }
    ElMessage.success('登录成功！')
    const redirect = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    setTimeout(() => {
      router.push(redirect)
    }, 500)
  } catch (error: any) {
    console.error('登录失败:', error)
    if (error.message && error.message !== '登录失败') {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请检查学号和密码')
    }
  } finally {
    loading.value = false
    isHandlingLogin.value = false
  }
}

const clearForm = () => {
  loginForm.value = { type: 1, account: '', password: '' }
  if (loginFormRef.value) loginFormRef.value.clearValidate()
}

defineExpose({ clearForm })
</script>

<style scoped>
.login-section {
  flex: 0 0 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: transparent;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.5s ease-out both;
  position: relative;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.login-header p {
  font-size: 14px;
  color: #334155;
  margin: 0;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}

.login-form {
  margin-bottom: 24px;
}

.custom-input {
  width: 100%;
  margin-bottom: 16px;
}

.custom-input :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #94A3B8;
  box-shadow: 0 2px 12px rgba(3, 166, 136, 0.08);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #03a688;
  box-shadow: 0 0 0 3px rgba(3, 166, 136, 0.2), 0 2px 8px rgba(3, 166, 136, 0.08);
}

.custom-input :deep(.el-input__inner) {
  font-size: 15px;
  color: #0f172a;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #0f172a;
  opacity: 0.85;
}

.input-icon {
  font-size: 1.1rem;
  margin-right: 8px;
  opacity: 0.7;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(180deg, #04c79e 0%, #03a688 100%) !important;
  border: none !important;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(3, 166, 136, 0.3);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #03a688 0%, #028a73 100%) !important;
  box-shadow: 0 6px 20px rgba(3, 166, 136, 0.4);
  transform: translateY(-1px);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(3, 166, 136, 0.25);
}

.remember-checkbox :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #475569;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.auth-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 14px;
}

.auth-footer span {
  color: #475569;
  margin-right: 6px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
}

.register-link {
  font-weight: 600;
  color: #03a688 !important;
}

.register-link:hover {
  color: #028a73 !important;
}

@media (max-width: 480px) {
  .login-section {
    flex: none;
    padding: 32px 24px;
  }
  .login-card {
    max-width: 100%;
  }
}
</style>
