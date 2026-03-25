<template>
  <div class="profile-card">
    <div class="profile-info">
      <div class="avatar-section">
        <div class="avatar-container">
          <img
            v-if="userInfo.avatar"
            :src="userInfo.avatar"
            alt="用户头像"
            class="avatar"
            :style="{ opacity: imageLoaded ? 1 : 0 }"
            @load="handleImageLoad"
            @error="handleImageError"
          >
          <div
            v-else
            class="avatar-placeholder"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="placeholder-icon"
            ><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg>
          </div>
        </div>
      </div>
      <div class="info-section">
        <div class="user-details">
          <div class="header-row">
            <h2>{{ userInfo.name }}</h2>
            <div
              v-if="userInfo.verified"
              class="verification-badge"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-check-circle"
              ><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span>已认证</span>
            </div>
          </div>
          <div class="user-meta">
            <span class="meta-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-map-pin"
              ><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle
                cx="12"
                cy="10"
                r="3"
              /></svg>
              {{ userInfo.location }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-phone"
              ><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              {{ userInfo.phone }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-mail"
              ><path d="m22 7-8.994 5.72-8.994-5.72" /><rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
              /></svg>
              {{ userInfo.email }}
            </span>
          </div>
          <div
            v-if="userInfo.bio"
            class="bio-section"
          >
            <p class="user-bio">
              {{ userInfo.bio }}
            </p>
          </div>
        </div>
      </div>
      <div class="action-section">
        <el-button
          type="primary"
          class="edit-profile-btn"
          @click="editProfile"
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-edit"
            ><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line
              x1="16"
              x2="8"
              y1="13"
              y2="21"
            /><line
              x1="20"
              x2="8"
              y1="17"
              y2="21"
            /><line
              x1="10"
              x2="8"
              y1="19"
              y2="21"
            /></svg>
          </template>
          编辑资料
        </el-button>
        <el-button
          type="info"
          plain
          class="change-password-btn"
          @click="changePassword"
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-lock"
            ><rect
              width="18"
              height="11"
              x="3"
              y="11"
              rx="2"
              ry="2"
            /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </template>
          修改密码
        </el-button>
        <el-button
          v-if="userInfo.id === currentUserId"
          type="info"
          plain
          class="view-activity-btn"
          @click="viewActivity"
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bar-chart-2"
            ><line
              x1="18"
              x2="18"
              y1="20"
              y2="10"
            /><line
              x1="12"
              x2="12"
              y1="20"
              y2="4"
            /><line
              x1="6"
              x2="6"
              y1="20"
              y2="14"
            /></svg>
          </template>
          查看活跃度
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface UserInfo {
  id: number | string
  name: string
  avatar: string
  location?: string
  phone?: string
  email?: string
  bio?: string
  verified?: boolean
}

const props = defineProps<{ userInfo: UserInfo }>()
const emit = defineEmits(['edit-profile', 'change-password', 'view-activity'])

const currentUserId = ref('1') // TODO: 从登录态获取
const imageLoaded = ref(false)

// 监听头像变化，重置加载状态
watch(() => props.userInfo.avatar, () => {
  imageLoaded.value = false
})

// 图片加载成功处理
const handleImageLoad = () => {
  imageLoaded.value = true
}

// 图片加载失败处理
const handleImageError = () => {
  imageLoaded.value = false
  console.error('头像加载失败')
}

const editProfile = () => {
  emit('edit-profile')
}

const changePassword = () => {
  emit('change-password')
}

const viewActivity = () => {
  emit('view-activity')
}
</script>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 18px;
  border: 1px solid #e8eef8;
  box-shadow: 0 10px 28px rgba(28, 63, 140, 0.08);
  padding: 32px;
  margin-bottom: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(28, 63, 140, 0.14);
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 32px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e8f3ff;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.18);
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease, opacity 0.3s ease;
  position: absolute;
  top: 0;
  left: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: absolute;
  top: 0;
  left: 0;
}

.placeholder-icon {
  color: rgba(255, 255, 255, 0.8);
}

.info-section {
  flex: 1;
  min-width: 0;
}

.user-details {
  width: 100%;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.header-row h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.verification-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #eaf3ff;
  color: #409EFF;
  border: 1px solid #d2e5ff;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
}

.meta-divider {
  color: #e0e0e0;
  margin: 0 4px;
}

.bio-section {
  margin-bottom: 20px;
}

.user-bio {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.action-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.edit-profile-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  flex-shrink: 0;
}

.edit-profile-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.change-password-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #606266;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.change-password-btn:hover {
  color: #409EFF;
  border-color: #409EFF;
  transform: translateY(-1px);
}

.view-activity-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #606266;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.view-activity-btn:hover {
  color: #409EFF;
  border-color: #409EFF;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-info {
    gap: 24px;
  }
  
  .action-section {
    gap: 8px;
  }
  
  .edit-profile-btn,
  .change-password-btn,
  .view-activity-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .profile-card {
    padding: 24px;
  }
  
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }
  
  .header-row {
    justify-content: center;
  }
  
  .user-meta {
    justify-content: center;
  }
  
  .action-section {
    align-items: center;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .edit-profile-btn,
  .change-password-btn,
  .view-activity-btn {
    flex: 1;
    min-width: 140px;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .profile-card {
    padding: 20px;
  }
  
  .avatar-container {
    width: 100px;
    height: 100px;
  }
  
  .header-row h2 {
    font-size: 20px;
  }
  
}
</style>