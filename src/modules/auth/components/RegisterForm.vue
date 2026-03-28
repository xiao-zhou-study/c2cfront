<template>
  <div class="register-section">
    <div class="register-card">
      <div class="register-header">
        <h2>创建账户</h2>
        <p>加入我们的社区</p>
      </div>
      
      <el-form 
        ref="registerFormRef"
        :model="registerForm" 
        :rules="rules"
        label-width="0"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            :disabled="loading"
            clearable
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">👤</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
            :disabled="loading"
            clearable
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">✉️</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :disabled="loading"
            show-password
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">🔒</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            :disabled="loading"
            show-password
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">✅</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="studentId">
          <el-input 
            v-model="registerForm.studentId"
            placeholder="请输入学号"
            size="large"
            :disabled="loading"
            clearable
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">🎓</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="school">
          <el-input 
            v-model="registerForm.school"
            placeholder="请输入学校"
            size="large"
            :disabled="loading"
            clearable
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">🏫</span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="department">
          <el-select 
            v-model="registerForm.department"
            placeholder="请选择院系"
            size="large"
            :disabled="loading"
            class="custom-input"
          >
            <template #prefix>
              <span class="input-icon">🏛️</span>
            </template>
            <el-option 
              v-for="department in departmentOptions" 
              :key="department" 
              :label="department" 
              :value="department" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            size="large"
            class="register-button"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '创建账户' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        <span>已有账号？</span>
        <el-link 
          type="primary" 
          :underline="false"
          class="login-link"
          @click="$router.push('/login')"
        >
          立即登录
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElLink, ElSelect, ElOption } from 'element-plus'
import { register } from '@/shared/api/modules/auth'

const router = useRouter()
const registerFormRef = ref()
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  studentId: '',
  school: '',
  department: '',
  type: 1 // 默认为普通学生
})
const loading = ref(false)

// 院系选项
const departmentOptions = [
  '计算机学院',
  '软件学院',
  '信息学院',
  '电子工程学院',
  '机械工程学院',
  '材料科学与工程学院',
  '化学工程学院',
  '生物工程学院',
  '土木工程学院',
  '经济管理学院',
  '文学院',
  '外国语学院',
  '法学院',
  '教育学院',
  '艺术学院'
]

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    { max: 100, message: '邮箱长度不能超过100位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { max: 50, message: '学号长度不能超过50位', trigger: 'blur' }
  ],
  school: [
    { required: true, message: '请输入学校', trigger: 'blur' },
    { max: 100, message: '学校名称不能超过100位', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择院系', trigger: 'change' },
    { max: 100, message: '院系名称不能超过100位', trigger: 'change' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    // 确保所有必需字段都有值
    const registerData = {
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
      studentId: registerForm.value.studentId,
      school: registerForm.value.school,
      department: registerForm.value.department,
      type: registerForm.value.type || 1
    }
    
    // 调用注册API
    await register(registerData)
    
    // 注册成功
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请检查填写信息')
  } finally {
    loading.value = false
  }
}

// 清除表单
const clearForm = () => {
  registerForm.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    school: '',
    department: '',
    type: 1
  }
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate()
  }
}

// 暴露方法给父组件
defineExpose({
  clearForm,
  registerForm
})
</script>

<style scoped>
.register-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0;
  background: transparent;
  position: relative;
}

.register-card {
  width: 100%;
  max-width: 400px;
  position: relative;
}

.register-header {
  text-align: center;
  margin-bottom: 48px;
}

.register-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.register-header p {
  font-size: 14px;
  color: #334155;
  margin: 0;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
}

.register-form {
  margin-bottom: 24px;
}

.custom-input {
  width: 100%;
  margin-bottom: 12px;
}

.custom-input :deep(.el-input__wrapper),
.custom-input :deep(.el-select .el-input__wrapper),
.custom-input :deep(.el-select__wrapper) {
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-select .el-input__wrapper:hover),
.custom-input :deep(.el-select__wrapper:hover) {
  border-color: #94A3B8;
  box-shadow: 0 2px 12px rgba(3, 166, 136, 0.08);
}

.custom-input :deep(.el-input__wrapper.is-focus),
.custom-input :deep(.el-select .el-input__wrapper.is-focus),
.custom-input :deep(.el-select__wrapper.is-focused) {
  border-color: #03a688;
  box-shadow: 0 0 0 3px rgba(3, 166, 136, 0.2), 0 2px 8px rgba(3, 166, 136, 0.08);
}

.custom-input :deep(.el-input__inner),
.custom-input :deep(.el-select .el-input__inner) {
  font-size: 15px;
  color: #0f172a;
}

.custom-input :deep(.el-input__inner::placeholder),
.custom-input :deep(.el-select .el-input__inner::placeholder) {
  color: #0f172a;
  opacity: 0.85;
}

/* el-select 占位符「请选择院系」 */
.custom-input :deep(.el-select__placeholder) {
  color: #0f172a !important;
  opacity: 0.85;
}

.input-icon {
  font-size: 1.1rem;
  margin-right: 8px;
  opacity: 0.7;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(180deg, #04c79e 0%, #03a688 100%) !important;
  border: none !important;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(3, 166, 136, 0.3);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  margin-top: 8px;
}

.register-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #03a688 0%, #028a73 100%) !important;
  box-shadow: 0 6px 20px rgba(3, 166, 136, 0.4);
  transform: translateY(-1px);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(3, 166, 136, 0.25);
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

.login-link {
  font-weight: 600;
  color: #03a688 !important;
}

.login-link:hover {
  color: #028a73 !important;
}

@media (max-width: 480px) {
  .register-section {
    flex: none;
    padding: 32px 24px;
  }
  .register-card {
    max-width: 100%;
  }
}
</style>
