<template>
  <div class="personal-info-card">
    <!-- 头像和基础信息 -->
    <div class="profile-header">
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-avatar
            :size="120"
            :src="userInfo.avatarUrl"
          >
            {{ userInfo.nickname?.charAt(0) || userInfo.username.charAt(0) }}
          </el-avatar>
          <div class="upload-overlay">
            <el-icon><Camera /></el-icon>
            <span>更换头像</span>
          </div>
        </el-upload>
      </div>

      <div class="basic-info">
        <div class="name-section">
          <h2 class="user-name">
            {{ userInfo.nickname || userInfo.username }}
          </h2>
          <VerifiedBadge v-if="userInfo.isVerified" />
          <el-tag
            v-else
            type="warning"
            size="small"
          >
            未实名
          </el-tag>
        </div>
        
        <CreditBadge 
          :score="userInfo.creditScore" 
          size="large" 
          show-score 
        />

        <div class="user-meta">
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>ID: {{ userInfo.id }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>加入于 {{ formatDate(userInfo.createdAt) }}</span>
          </div>
          <div
            v-if="userInfo.location"
            class="meta-item"
          >
            <el-icon><MapLocation /></el-icon>
            <span>{{ userInfo.location }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button
            :icon="Edit"
            @click="handleEdit"
          >
            编辑资料
          </el-button>
          <el-button
            :icon="Setting"
            @click="handleSettings"
          >
            账户设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计数据四宫格 -->
    <div class="stats-grid">
      <div
        class="stat-item"
        @click="handleStatClick('items')"
      >
        <div class="stat-icon items">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ userInfo.itemCount || 0 }}
          </div>
          <div class="stat-label">
            发布物品
          </div>
        </div>
        <el-icon class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>

      <div
        class="stat-item"
        @click="handleStatClick('borrowed')"
      >
        <div class="stat-icon borrowed">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ userInfo.borrowCount || 0 }}
          </div>
          <div class="stat-label">
            借用次数
          </div>
        </div>
        <el-icon class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>

      <div
        class="stat-item"
        @click="handleStatClick('lent')"
      >
        <div class="stat-icon lent">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ userInfo.lendCount || 0 }}
          </div>
          <div class="stat-label">
            出借次数
          </div>
        </div>
        <el-icon class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>

      <div
        class="stat-item"
        @click="handleStatClick('reviews')"
      >
        <div class="stat-icon reviews">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            {{ userInfo.reviewCount || 0 }}
          </div>
          <div class="stat-label">
            评价数
          </div>
        </div>
        <el-icon class="arrow-icon">
          <ArrowRight />
        </el-icon>
      </div>
    </div>

    <!-- 个人简介 -->
    <div
      v-if="userInfo.bio || isEditing"
      class="bio-section"
    >
      <div class="bio-header">
        <span class="bio-title">个人简介</span>
        <el-button
          v-if="!isEditing"
          text
          size="small"
          @click="isEditing = true"
        >
          编辑
        </el-button>
      </div>
      <div
        v-if="!isEditing"
        class="bio-content"
      >
        {{ userInfo.bio || '这个人很懒,什么都没留下...' }}
      </div>
      <div
        v-else
        class="bio-edit"
      >
        <el-input
          v-model="editBio"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="介绍一下自己吧..."
        />
        <div class="bio-actions">
          <el-button
            size="small"
            @click="cancelEdit"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="saveBio"
          >
            保存
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Camera, 
  User, 
  Calendar, 
  MapLocation, 
  Edit, 
  Setting,
  Box,
  ShoppingCart,
  Coin,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CreditBadge from '@/shared/components/CreditBadge.vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'

interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatarUrl: string
  isVerified: boolean
  creditScore: number
  createdAt: number
  location?: string
  bio?: string
  itemCount?: number
  borrowCount?: number
  lendCount?: number
  reviewCount?: number
}

interface Props {
  userInfo: UserInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit': []
  'settings': []
  'stat-click': [type: string]
  'update-bio': [bio: string]
  'update-avatar': [file: File]
}>()

const isEditing = ref(false)
const editBio = ref(props.userInfo.bio || '')

const handleEdit = () => {
  emit('edit')
}

const handleSettings = () => {
  emit('settings')
}

const handleStatClick = (type: string) => {
  emit('stat-click', type)
}

const cancelEdit = () => {
  isEditing.value = false
  editBio.value = props.userInfo.bio || ''
}

const saveBio = () => {
  emit('update-bio', editBio.value)
  isEditing.value = false
}

const handleAvatarSuccess = (response: any, file: any) => {
  ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  emit('update-avatar', file)
  return true
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}
</script>

<template>
  <div class="personal-info-card">
    <!-- 头像和基础信息 -->
    <div class="profile-header">
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-avatar :size="120" :src="userInfo.avatarUrl">
            {{ userInfo.nickname?.charAt(0) || userInfo.username.charAt(0) }}
          </el-avatar>
          <div class="upload-overlay">
            <el-icon><Camera /></el-icon>
            <span>更换头像</span>
          </div>
        </el-upload>
      </div>

      <div class="basic-info">
        <div class="name-section">
          <h2 class="user-name">{{ userInfo.nickname || userInfo.username }}</h2>
          <VerifiedBadge v-if="userInfo.isVerified" />
          <el-tag v-else type="warning" size="small">未实名</el-tag>
        </div>
        
        <CreditBadge 
          :score="userInfo.creditScore" 
          size="large" 
          show-score 
        />

        <div class="user-meta">
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>ID: {{ userInfo.id }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>加入于 {{ formatDate(userInfo.createdAt) }}</span>
          </div>
          <div v-if="userInfo.location" class="meta-item">
            <el-icon><MapLocation /></el-icon>
            <span>{{ userInfo.location }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <el-button :icon="Edit" @click="handleEdit">编辑资料</el-button>
          <el-button :icon="Setting" @click="handleSettings">账户设置</el-button>
        </div>
      </div>
    </div>

    <!-- 统计数据四宫格 -->
    <div class="stats-grid">
      <div class="stat-item" @click="handleStatClick('items')">
        <div class="stat-icon items">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ userInfo.itemCount || 0 }}</div>
          <div class="stat-label">发布物品</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="stat-item" @click="handleStatClick('borrowed')">
        <div class="stat-icon borrowed">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ userInfo.borrowCount || 0 }}</div>
          <div class="stat-label">借用次数</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="stat-item" @click="handleStatClick('lent')">
        <div class="stat-icon lent">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ userInfo.lendCount || 0 }}</div>
          <div class="stat-label">出借次数</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="stat-item" @click="handleStatClick('reviews')">
        <div class="stat-icon reviews">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ userInfo.reviewCount || 0 }}</div>
          <div class="stat-label">评价数</div>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 个人简介 -->
    <div v-if="userInfo.bio || isEditing" class="bio-section">
      <div class="bio-header">
        <span class="bio-title">个人简介</span>
        <el-button v-if="!isEditing" text size="small" @click="isEditing = true">
          编辑
        </el-button>
      </div>
      <div v-if="!isEditing" class="bio-content">
        {{ userInfo.bio || '这个人很懒,什么都没留下...' }}
      </div>
      <div v-else class="bio-edit">
        <el-input
          v-model="editBio"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="介绍一下自己吧..."
        />
        <div class="bio-actions">
          <el-button size="small" @click="cancelEdit">取消</el-button>
          <el-button type="primary" size="small" @click="saveBio">保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { 
  Camera, 
  User, 
  Calendar, 
  MapLocation, 
  Edit, 
  Setting,
  Box,
  ShoppingCart,
  Coin,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CreditBadge from '@/shared/components/CreditBadge.vue'
import VerifiedBadge from '@/shared/components/VerifiedBadge.vue'

interface UserInfo {
  id: number
  username: string
  nickname?: string
  avatarUrl: string
  isVerified: boolean
  creditScore: number
  createdAt: number
  location?: string
  bio?: string
  itemCount?: number
  borrowCount?: number
  lendCount?: number
  reviewCount?: number
}

interface Props {
  userInfo: UserInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit': []
  'settings': []
  'stat-click': [type: string]
  'update-bio': [bio: string]
  'update-avatar': [file: File]
}>()

const isEditing = ref(false)
const editBio = ref(props.userInfo.bio || '')

const handleEdit = () => {
  emit('edit')
}

const handleSettings = () => {
  emit('settings')
}

const handleStatClick = (type: string) => {
  emit('stat-click', type)
}

const cancelEdit = () => {
  isEditing.value = false
  editBio.value = props.userInfo.bio || ''
}

const saveBio = () => {
  emit('update-bio', editBio.value)
  isEditing.value = false
}

const handleAvatarSuccess = (response: any, file: any) => {
  ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  emit('update-avatar', file)
  return true
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}
</script>

<style scoped>
.personal-info-card {
  background: #fff;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 头部区域 */
.profile-header {
  display: flex;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.avatar-section {
  position: relative;
}

.avatar-uploader {
  position: relative;
  display: block;
  cursor: pointer;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  font-size: 14px;
}

.avatar-uploader:hover .upload-overlay {
  opacity: 1;
}

.basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.name-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
}

.action-buttons .el-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.action-buttons .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 统计四宫格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-color-light);
  border-top: 1px solid var(--border-color-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.stat-item:hover {
  background: var(--bg-light);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.items {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.borrowed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.lent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.reviews {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--text-placeholder);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover .arrow-icon {
  opacity: 1;
}

/* 个人简介 */
.bio-section {
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--border-color-light);
}

.bio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.bio-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.bio-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.bio-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.bio-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
  }

  .arrow-icon {
    display: none;
  }
}
</style>

<style scoped>
.personal-info-card {
  background: #fff;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 头部区域 */
.profile-header {
  display: flex;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.avatar-section {
  position: relative;
}

.avatar-uploader {
  position: relative;
  display: block;
  cursor: pointer;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  font-size: 14px;
}

.avatar-uploader:hover .upload-overlay {
  opacity: 1;
}

.basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.name-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
}

.action-buttons .el-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.action-buttons .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 统计四宫格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-color-light);
  border-top: 1px solid var(--border-color-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.stat-item:hover {
  background: var(--bg-light);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.items {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.borrowed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.lent {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.reviews {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--text-placeholder);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover .arrow-icon {
  opacity: 1;
}

/* 个人简介 */
.bio-section {
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--border-color-light);
}

.bio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.bio-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.bio-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.bio-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.bio-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    flex-direction: column;
    text-align: center;
  }

  .arrow-icon {
    display: none;
  }
}
</style>
