<template>
  <div class="account-settings-tab">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="settings-form"
    >
      <!-- 基本信息区 -->
      <div class="settings-section">
        <h3 class="section-title">
          👤 基本信息
        </h3>
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="formData.username"
            disabled
          />
          <span class="help-text">用户名不可修改</span>
        </el-form-item>

        <el-form-item
          label="昵称"
          prop="nickname"
        >
          <el-input 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item
          label="个人简介"
          prop="bio"
        >
          <el-input
            v-model="formData.bio"
            type="textarea"
            :rows="4"
            placeholder="介绍一下自己吧..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item
          label="所在位置"
          prop="location"
        >
          <el-select
            v-model="formData.location"
            placeholder="请选择校区"
          >
            <el-option
              label="东校区"
              value="东校区"
            />
            <el-option
              label="西校区"
              value="西校区"
            />
            <el-option
              label="南校区"
              value="南校区"
            />
            <el-option
              label="北校区"
              value="北校区"
            />
            <el-option
              label="本部"
              value="本部"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 联系方式区 -->
      <div class="settings-section">
        <h3 class="section-title">
          📱 联系方式
        </h3>
        <el-form-item
          label="手机号"
          prop="phone"
        >
          <el-input 
            v-model="formData.phone" 
            placeholder="请输入手机号"
            maxlength="11"
          >
            <template #append>
              <el-button
                v-if="!formData.phoneVerified"
                type="primary"
              >
                验证
              </el-button>
              <el-tag
                v-else
                type="success"
              >
                已验证
              </el-tag>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input 
            v-model="formData.email" 
            placeholder="请输入邮箱"
          >
            <template #append>
              <el-button
                v-if="!formData.emailVerified"
                type="primary"
              >
                验证
              </el-button>
              <el-tag
                v-else
                type="success"
              >
                已验证
              </el-tag>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item
          label="微信号"
          prop="wechat"
        >
          <el-input 
            v-model="formData.wechat" 
            placeholder="请输入微信号"
          />
        </el-form-item>
      </div>

      <!-- 安全设置区 -->
      <div class="settings-section">
        <h3 class="section-title">
          🔒 安全设置
        </h3>
        <el-form-item label="登录密码">
          <el-button @click="handleChangePassword">
            修改密码
          </el-button>
        </el-form-item>

        <el-form-item label="实名认证">
          <div
            v-if="formData.isVerified"
            class="verified-info"
          >
            <el-tag type="success">
              已实名认证
            </el-tag>
            <span class="verified-name">{{ formData.realName }}</span>
          </div>
          <el-button
            v-else
            type="primary"
            @click="handleVerify"
          >
            去认证
          </el-button>
        </el-form-item>

        <el-form-item label="账号注销">
          <el-button
            type="danger"
            @click="handleDeleteAccount"
          >
            注销账号
          </el-button>
          <span class="help-text danger">注销后数据无法恢复,请谨慎操作</span>
        </el-form-item>
      </div>

      <!-- 隐私设置区 -->
      <div class="settings-section">
        <h3 class="section-title">
          🔐 隐私设置
        </h3>
        <el-form-item label="主页可见">
          <el-switch v-model="formData.profileVisible" />
          <span class="help-text">关闭后他人无法访问你的主页</span>
        </el-form-item>

        <el-form-item label="展示信用分">
          <el-switch v-model="formData.showCreditScore" />
          <span class="help-text">是否在个人主页展示信用分</span>
        </el-form-item>

        <el-form-item label="联系方式可见">
          <el-switch v-model="formData.contactVisible" />
          <span class="help-text">是否允许他人查看联系方式</span>
        </el-form-item>
      </div>

      <!-- 通知设置区 -->
      <div class="settings-section">
        <h3 class="section-title">
          🔔 通知设置
        </h3>
        <el-form-item label="订单通知">
          <el-switch v-model="formData.orderNotification" />
        </el-form-item>

        <el-form-item label="评价通知">
          <el-switch v-model="formData.reviewNotification" />
        </el-form-item>

        <el-form-item label="系统通知">
          <el-switch v-model="formData.systemNotification" />
        </el-form-item>

        <el-form-item label="邮件通知">
          <el-switch v-model="formData.emailNotification" />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button
          size="large"
          @click="handleReset"
        >
          重置
        </el-button>
        <el-button
          type="primary"
          size="large"
          :loading="saving"
          @click="handleSave"
        >
          保存设置
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

interface FormData {
  username: string
  nickname: string
  bio: string
  location: string
  phone: string
  phoneVerified: boolean
  email: string
  emailVerified: boolean
  wechat: string
  isVerified: boolean
  realName: string
  profileVisible: boolean
  showCreditScore: boolean
  contactVisible: boolean
  orderNotification: boolean
  reviewNotification: boolean
  systemNotification: boolean
  emailNotification: boolean
}

interface Props {
  userSettings: Partial<FormData>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'save': [data: FormData]
  'change-password': []
  'verify': []
  'delete-account': []
}>()

const formRef = ref()
const saving = ref(false)

const formData = reactive<FormData>({
  username: '',
  nickname: '',
  bio: '',
  location: '',
  phone: '',
  phoneVerified: false,
  email: '',
  emailVerified: false,
  wechat: '',
  isVerified: false,
  realName: '',
  profileVisible: true,
  showCreditScore: true,
  contactVisible: true,
  orderNotification: true,
  reviewNotification: true,
  systemNotification: true,
  emailNotification: false,
  ...props.userSettings
})

const formRules = {
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    emit('save', formData)
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handleChangePassword = () => {
  emit('change-password')
}

const handleVerify = () => {
  emit('verify')
}

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '注销后账号数据将被永久删除且无法恢复,确定要注销吗?',
      '危险操作',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete-account')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="account-settings-tab">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="settings-form"
    >
      <!-- 基本信息区 -->
      <div class="settings-section">
        <h3 class="section-title">👤 基本信息</h3>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" disabled />
          <span class="help-text">用户名不可修改</span>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input 
            v-model="formData.nickname" 
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="formData.bio"
            type="textarea"
            :rows="4"
            placeholder="介绍一下自己吧..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="所在位置" prop="location">
          <el-select v-model="formData.location" placeholder="请选择校区">
            <el-option label="东校区" value="东校区" />
            <el-option label="西校区" value="西校区" />
            <el-option label="南校区" value="南校区" />
            <el-option label="北校区" value="北校区" />
            <el-option label="本部" value="本部" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 联系方式区 -->
      <div class="settings-section">
        <h3 class="section-title">📱 联系方式</h3>
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="formData.phone" 
            placeholder="请输入手机号"
            maxlength="11"
          >
            <template #append>
              <el-button v-if="!formData.phoneVerified" type="primary">验证</el-button>
              <el-tag v-else type="success">已验证</el-tag>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="formData.email" 
            placeholder="请输入邮箱"
          >
            <template #append>
              <el-button v-if="!formData.emailVerified" type="primary">验证</el-button>
              <el-tag v-else type="success">已验证</el-tag>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="微信号" prop="wechat">
          <el-input 
            v-model="formData.wechat" 
            placeholder="请输入微信号"
          />
        </el-form-item>
      </div>

      <!-- 安全设置区 -->
      <div class="settings-section">
        <h3 class="section-title">🔒 安全设置</h3>
        <el-form-item label="登录密码">
          <el-button @click="handleChangePassword">修改密码</el-button>
        </el-form-item>

        <el-form-item label="实名认证">
          <div v-if="formData.isVerified" class="verified-info">
            <el-tag type="success">已实名认证</el-tag>
            <span class="verified-name">{{ formData.realName }}</span>
          </div>
          <el-button v-else type="primary" @click="handleVerify">
            去认证
          </el-button>
        </el-form-item>

        <el-form-item label="账号注销">
          <el-button type="danger" @click="handleDeleteAccount">
            注销账号
          </el-button>
          <span class="help-text danger">注销后数据无法恢复,请谨慎操作</span>
        </el-form-item>
      </div>

      <!-- 隐私设置区 -->
      <div class="settings-section">
        <h3 class="section-title">🔐 隐私设置</h3>
        <el-form-item label="主页可见">
          <el-switch v-model="formData.profileVisible" />
          <span class="help-text">关闭后他人无法访问你的主页</span>
        </el-form-item>

        <el-form-item label="展示信用分">
          <el-switch v-model="formData.showCreditScore" />
          <span class="help-text">是否在个人主页展示信用分</span>
        </el-form-item>

        <el-form-item label="联系方式可见">
          <el-switch v-model="formData.contactVisible" />
          <span class="help-text">是否允许他人查看联系方式</span>
        </el-form-item>
      </div>

      <!-- 通知设置区 -->
      <div class="settings-section">
        <h3 class="section-title">🔔 通知设置</h3>
        <el-form-item label="订单通知">
          <el-switch v-model="formData.orderNotification" />
        </el-form-item>

        <el-form-item label="评价通知">
          <el-switch v-model="formData.reviewNotification" />
        </el-form-item>

        <el-form-item label="系统通知">
          <el-switch v-model="formData.systemNotification" />
        </el-form-item>

        <el-form-item label="邮件通知">
          <el-switch v-model="formData.emailNotification" />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" @click="handleReset">重置</el-button>
        <el-button type="primary" size="large" :loading="saving" @click="handleSave">
          保存设置
        </el-button>
      </div>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

interface FormData {
  username: string
  nickname: string
  bio: string
  location: string
  phone: string
  phoneVerified: boolean
  email: string
  emailVerified: boolean
  wechat: string
  isVerified: boolean
  realName: string
  profileVisible: boolean
  showCreditScore: boolean
  contactVisible: boolean
  orderNotification: boolean
  reviewNotification: boolean
  systemNotification: boolean
  emailNotification: boolean
}

interface Props {
  userSettings: Partial<FormData>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'save': [data: FormData]
  'change-password': []
  'verify': []
  'delete-account': []
}>()

const formRef = ref()
const saving = ref(false)

const formData = reactive<FormData>({
  username: '',
  nickname: '',
  bio: '',
  location: '',
  phone: '',
  phoneVerified: false,
  email: '',
  emailVerified: false,
  wechat: '',
  isVerified: false,
  realName: '',
  profileVisible: true,
  showCreditScore: true,
  contactVisible: true,
  orderNotification: true,
  reviewNotification: true,
  systemNotification: true,
  emailNotification: false,
  ...props.userSettings
})

const formRules = {
  nickname: [
    { max: 20, message: '昵称不能超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    emit('save', formData)
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handleChangePassword = () => {
  emit('change-password')
}

const handleVerify = () => {
  emit('verify')
}

const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '注销后账号数据将被永久删除且无法恢复,确定要注销吗?',
      '危险操作',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete-account')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.account-settings-tab {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-form {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-section {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color-light);
}

.settings-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.help-text {
  display: block;
  font-size: 13px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

.help-text.danger {
  color: var(--danger-color);
}

.verified-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.verified-name {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-form {
    padding: var(--spacing-lg);
  }

  :deep(.el-form-item__label) {
    width: 100px !important;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>

<style scoped>
.account-settings-tab {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-form {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-section {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color-light);
}

.settings-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

.help-text {
  display: block;
  font-size: 13px;
  color: var(--text-placeholder);
  margin-top: 4px;
}

.help-text.danger {
  color: var(--danger-color);
}

.verified-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.verified-name {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-form {
    padding: var(--spacing-lg);
  }

  :deep(.el-form-item__label) {
    width: 100px !important;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>
