<template>
  <!-- 编辑个人信息弹窗 -->
  <el-dialog
    v-model="showEditDialog"
    title="编辑个人信息"
    width="600px"
    :close-on-click-modal="false"
    class="edit-dialog"
  >
    <el-form
      ref="profileFormRef"
      :model="profileForm"
      :rules="profileRules"
      label-width="100px"
      class="edit-form"
    >
      <el-form-item label="头像">
        <div class="avatar-upload-wrapper">
          <div class="avatar-preview">
            <img
              v-if="profileForm.avatarUrl"
              :src="profileForm.avatarUrl"
              alt="头像"
              class="avatar-img"
            >
            <div
              v-else
              class="avatar-placeholder"
            >
              <el-icon><User /></el-icon>
            </div>
          </div>
          <el-upload
            ref="uploadRef"
            :before-upload="beforeUpload"
            :show-file-list="false"
            :accept="'image/*'"
            class="avatar-uploader"
          >
            <el-button
              type="primary"
              :loading="uploading"
            >
              <el-icon v-if="!uploading">
                <Upload />
              </el-icon>
              {{ uploading ? '上传中...' : '上传头像' }}
            </el-button>
          </el-upload>
          <p class="upload-tip">
            支持 JPG、PNG 格式，大小不超过 2MB
          </p>
        </div>
      </el-form-item>

      <el-form-item
        label="昵称"
        prop="username"
      >
        <el-input
          v-model="profileForm.username"
          placeholder="请输入您的昵称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item
        label="真实姓名"
        prop="realName"
      >
        <el-input
          v-model="profileForm.realName"
          placeholder="请输入真实姓名"
          maxlength="20"
        />
      </el-form-item>

      <el-form-item
        label="性别"
        prop="gender"
      >
        <el-radio-group v-model="profileForm.gender">
          <el-radio label="male">
            男
          </el-radio>
          <el-radio label="female">
            女
          </el-radio>
          <el-radio label="other">
            其他
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="生日"
        prop="birthday"
      >
        <el-date-picker
          v-model="profileForm.birthday"
          type="date"
          placeholder="选择您的生日"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item
        label="手机号码"
        prop="phone"
      >
        <el-input
          v-model="profileForm.phone"
          placeholder="请输入手机号码"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item
        label="邮箱"
        prop="email"
      >
        <el-input
          v-model="profileForm.email"
          placeholder="请输入邮箱地址"
          maxlength="50"
        />
      </el-form-item>

      <el-form-item
        label="个人简介"
        prop="bio"
      >
        <el-input
          v-model="profileForm.bio"
          type="textarea"
          :rows="4"
          placeholder="简单介绍一下自己吧..."
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showEditDialog = false">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="profileLoading"
        @click="saveProfile"
      >
        <el-icon><Check /></el-icon>
        保存
      </el-button>
    </template>
  </el-dialog>

  <!-- 修改密码弹窗 -->
  <el-dialog
    v-model="showPasswordDialog"
    title="修改密码"
    width="480px"
    :close-on-click-modal="false"
    class="password-dialog"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="100px"
      class="password-form"
    >
      <el-form-item
        label="原密码"
        prop="oldPassword"
      >
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入原密码"
          show-password
        />
      </el-form-item>

      <el-form-item
        label="新密码"
        prop="newPassword"
      >
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
        <div class="password-strength">
          <div class="strength-indicator">
            <div class="strength-label">
              密码强度
            </div>
            <div
              class="strength-value"
              :class="passwordStrengthClass"
            >
              {{ passwordStrengthText }}
            </div>
          </div>
          <div class="strength-bar">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-segment"
              :class="{
                active: i <= passwordStrength,
                [passwordStrengthClass]: i <= passwordStrength
              }"
            />
          </div>
        </div>
      </el-form-item>

      <el-form-item
        label="确认密码"
        prop="confirmPassword"
      >
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <div class="password-tips">
      <el-icon><Warning /></el-icon>
      <span>密码长度建议在 8-20 位之间，建议包含大小写字母、数字和特殊字符</span>
    </div>

    <template #footer>
      <el-button @click="showPasswordDialog = false">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="passwordLoading"
        @click="updatePassword"
      >
        <el-icon><Check /></el-icon>
        确认修改
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User,
  Camera,
  Check,
  Upload,
  Male,
  Female,
  Iphone,
  Message,
  Lock,
  Key,
  CircleCheck,
  Warning,
  Edit,
  Close,
  EditPen
} from '@element-plus/icons-vue'
import { updateUserInfo, changePassword, uploadAvatar } from '@/shared/api/modules/user'
import { useUserStore } from '@/shared/stores/user'

// Props
const props = defineProps({
  userInfo: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

const userStore = useUserStore()

// Emits
const emit = defineEmits(['update-profile', 'update-password'])

// 响应式数据
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const profileFormRef = ref()
const passwordFormRef = ref()
const uploadRef = ref()

const profileLoading = ref(false)
const passwordLoading = ref(false)
const uploading = ref(false)

// 表单数据
const profileForm = reactive({
  username: '',
  realName: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  bio: '',
  avatarUrl: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 上传配置已移除，使用API模块

// 表单验证规则
const profileRules = {
  username: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 密码强度计算
const passwordStrength = computed(() => {
  const password = passwordForm.newPassword
  if (!password) return 0

  let strength = 0

  // 长度检查
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++

  // 字符类型检查
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return Math.min(strength, 4)
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'weak'
  if (strength <= 2) return 'medium'
  if (strength <= 3) return 'strong'
  return 'very-strong'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  const texts = ['很弱', '较弱', '中等', '较强', '很强']
  return texts[strength] || '很弱'
})

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const beforeUpload = async (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB！')
    return false
  }

  uploading.value = true

  try {
    // 调用API上传文件
    const result = await uploadAvatar(file)
    console.log('Upload result:', result)

    // uploadAvatar返回 string，经过拦截器处理R<T>
    ElMessage.success('头像上传成功')
    profileForm.avatarUrl = result

    console.log('profileForm.avatarUrl updated to:', profileForm.avatarUrl)
  } catch (error) {
    console.error('Upload failed:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    uploading.value = false
  }

  return false // 阻止el-upload的自动上传
}



const saveProfile = async () => {
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true

    // 转换性别值
    const genderValue = profileForm.gender === 'male' ? 1 : profileForm.gender === 'female' ? 2 : 0

    // 构造完整的用户数据对象，与后端UserDTO保持一致
    const userData = {
      username: profileForm.username,
      email: profileForm.email,
      phone: profileForm.phone,
      avatarUrl: profileForm.avatarUrl,
      realName: profileForm.realName,
      gender: genderValue as 0 | 1 | 2,
      birthday: profileForm.birthday,
      bio: profileForm.bio
    }

    // 调用单个接口更新用户信息
    const result = await updateUserInfo(props.userInfo.id || userStore.userInfo.id, userData)

    // 刷新用户信息
    await userStore.fetchUserInfo()

    ElMessage.success('资料更新成功')
    emit('update-profile', userStore.userInfo)

    // 关闭弹窗
    showEditDialog.value = false
  } catch (error) {
    console.error('Update profile failed:', error)
    ElMessage.error('资料更新失败，请重试')
  } finally {
    profileLoading.value = false
  }
}

const updatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    // 调用修改密码API
    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')
    emit('update-password')

    // 关闭弹窗并重置表单
    showPasswordDialog.value = false
    resetPasswordForm()
  } catch (error) {
    console.error('Update password failed:', error)
    ElMessage.error('密码修改失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

const resetProfileForm = () => {
  const currentUserInfo = props.userInfo.id ? props.userInfo : userStore.userInfo
  Object.assign(profileForm, currentUserInfo)
}

const resetPasswordForm = () => {
  Object.keys(passwordForm).forEach(key => {
    passwordForm[key] = ''
  })
}

// 暴露方法给父组件
defineExpose({
  openEditDialog: () => {
    showEditDialog.value = true
  },
  openPasswordDialog: () => {
    showPasswordDialog.value = true
  }
})

// 初始化数据
onMounted(async () => {
  try {
    // 获取最新的用户信息
    await userStore.fetchUserInfo()
    const currentUserInfo = userStore.userInfo

    console.log('Current user info from store:', currentUserInfo)

    // 填充基本信息，与后端UserDTO字段保持一致
    profileForm.username = currentUserInfo.username || ''
    profileForm.realName = currentUserInfo.realName || ''
    // 处理gender：1-男(male), 2-女(female), 0-保密(other)
    const genderValue = currentUserInfo.gender
    if (genderValue === 1) {
      profileForm.gender = 'male'
    } else if (genderValue === 2) {
      profileForm.gender = 'female'
    } else {
      profileForm.gender = 'other'
    }
    profileForm.birthday = currentUserInfo.birthday || ''
    profileForm.phone = currentUserInfo.phone || ''
    profileForm.email = currentUserInfo.email || ''
    profileForm.bio = currentUserInfo.bio || ''
    profileForm.avatarUrl = currentUserInfo.avatarUrl || ''

    console.log('Profile form initialized:', profileForm)
  } catch (error) {
    console.error('Failed to initialize profile form:', error)
    ElMessage.error('加载用户信息失败')
  }
})

// 监听密码变化计算强度
watch(
  () => passwordForm.newPassword,
  () => {
    // 密码强度会自动通过计算属性更新
  }
)
</script>

<style scoped>
/* 编辑个人信息弹窗 */
:deep(.edit-dialog),
:deep(.password-dialog) {
  .el-overlay {
    background-color: transparent;
  }
  .el-dialog {
    background: #ffffff !important;
  }
  .el-dialog__header {
    background: #ffffff !important;
    border-bottom: none;
    padding: 16px 24px 0;
  }
  .el-dialog__headerbtn {
    background: #ffffff !important;
  }
  .el-dialog__body {
    padding: 24px 32px;
    max-height: 60vh;
    overflow-y: auto;
    background: #ffffff !important;
  }
  .el-dialog__footer {
    background: #ffffff !important;
    border-top: none;
    padding: 16px 24px;
    text-align: right;
  }
}

/* 额外的样式覆盖 */
:deep(.el-dialog__header),
:deep(.el-dialog__footer) {
  background-color: #ffffff !important;
  background: #ffffff !important;
}

.edit-form {
  max-width: 100%;
  background: #ffffff;
}

.avatar-upload-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #ffffff;
  flex-shrink: 0;
}

.avatar-preview .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview .avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d0d0d0;
}

.avatar-preview .avatar-placeholder .el-icon {
  font-size: 48px;
}

.avatar-uploader {
  flex: 1;
}

.upload-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
}

/* 密码弹窗 */
:deep(.password-dialog) {
  .el-dialog__body {
    padding: 24px 32px;
  }
}

.password-form {
  max-width: 100%;
  background: #ffffff;
}

.password-strength {
  margin-top: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.password-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 16px;
}

.password-tips .el-icon {
  color: #e6a23c;
  font-size: 16px;
}

.strength-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.strength-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.strength-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.strength-value.weak {
  color: #f56c6c;
  background: #fef0f0;
}

.strength-value.medium {
  color: #e6a23c;
  background: #fdf6ec;
}

.strength-value.strong {
  color: #67c23a;
  background: #f0f9ff;
}

.strength-value.very-strong {
  color: #409eff;
  background: #ecf5ff;
}

.strength-bar {
  display: flex;
  gap: 6px;
}

.strength-segment {
  flex: 1;
  height: 6px;
  background: #ebeef5;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-segment.active.weak {
  background: #f56c6c;
}

.strength-segment.active.medium {
  background: #e6a23c;
}

.strength-segment.active.strong {
  background: #67c23a;
}

.strength-segment.active.very-strong {
  background: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.edit-dialog),
  :deep(.password-dialog) {
    width: 90% !important;
  }

  .avatar-upload-wrapper {
    flex-direction: column;
    align-items: center;
  }
}
</style>
