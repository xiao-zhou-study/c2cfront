<template>
  <div class="profile-page">
    <div class="profile-layout">
      <!-- 左侧侧边栏 -->
      <el-aside class="profile-sidebar">
        <!-- 用户信息卡片 -->
        <el-card
          class="user-card"
          shadow="hover"
        >
          <div class="user-avatar-wrapper">
            <el-avatar
              :size="80"
              :src="userInfo.avatarUrl"
              class="user-avatar"
            >
              {{ userInfo.username?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="avatar-decoration" />
          </div>
          <h2 class="user-name">
            {{ userInfo.username || '用户' }}
          </h2>
          <el-tag
            v-if="userInfo.school"
            type="info"
            size="small"
            effect="plain"
            class="user-school-tag"
          >
            {{ userInfo.school }}
          </el-tag>
          <el-space
            wrap
            class="user-actions"
          >
            <el-button
              size="small"
              round
              @click="editProfile"
            >
              编辑资料
            </el-button>
            <el-button
              size="small"
              type="primary"
              round
              plain
              class="btn-black-text"
              @click="changePassword"
            >
              修改密码
            </el-button>
          </el-space>
        </el-card>

        <!-- 导航菜单 -->
        <el-card
          class="nav-card"
          shadow="hover"
        >
          <el-menu
            :default-active="activeSection"
            class="nav-menu"
            @select="switchSection"
          >
            <el-menu-item index="published">
              <el-icon><Document /></el-icon>
              <span>我发布的</span>
            </el-menu-item>
            <el-menu-item index="bought">
              <el-icon><ShoppingBag /></el-icon>
              <span>我买到的</span>
            </el-menu-item>
            <el-menu-item index="sold">
              <el-icon><Sell /></el-icon>
              <span>我卖出的</span>
            </el-menu-item>
            <el-menu-item index="reviews">
              <el-icon><Star /></el-icon>
              <span>我评价的</span>
            </el-menu-item>
          </el-menu>
        </el-card>

        </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="profile-content">
        <!-- 我发布的 -->
        <el-card
          v-show="activeSection === 'published'"
          class="content-card"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon published-icon">
                <Document />
              </el-icon>
              <span>我发布的物品</span>
            </div>
          </template>
          <PublishedItems
            :published-items="publishedItems"
            :loading="publishedLoading"
            @view-item="viewItem"
            @edit-item="editItem"
            @refresh="refreshPublishedItems"
            @item-action="handleItemAction"
          />
        </el-card>

        <!-- 我买到的 -->
        <el-card
          v-show="activeSection === 'bought'"
          class="content-card"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon bought-icon">
                <ShoppingBag />
              </el-icon>
              <span>我买到的订单</span>
            </div>
          </template>
          <BorrowRecords />
        </el-card>

        <!-- 我卖出的 -->
        <el-card
          v-show="activeSection === 'sold'"
          class="content-card"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon sold-icon">
                <Sell />
              </el-icon>
              <span>我卖出的订单</span>
            </div>
          </template>
          <LendingRecords />
        </el-card>

        <!-- 我评价的 -->
        <el-card
          v-show="activeSection === 'reviews'"
          class="content-card"
          shadow="never"
        >
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon reviews-icon">
                <Star />
              </el-icon>
              <span>我的评价记录</span>
            </div>
          </template>
          <ReviewRecords
            :review-records="reviewRecords"
            :loading="reviewLoading"
            @view-item="viewItem"
            @refresh="refreshReviewRecords"
          />
        </el-card>
      </el-main>
    </div>

    <!-- 个人设置组件 -->
    <ProfileSettings
      ref="profileSettingsRef"
      :user-info="userInfo"
      @update-profile="updateUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, ShoppingBag, Sell, Star } from '@element-plus/icons-vue'

import ProfileSettings from '../components/ProfileSettings.vue'
import PublishedItems from '../components/PublishedItems.vue'
import BorrowRecords from '../components/BorrowRecords.vue'
import LendingRecords from '../components/LendingRecords.vue'
import ReviewRecords from '../components/ReviewRecords.vue'

import { useUser } from '../../auth/composables/useUser'
import { usePublishedItems } from '../composables/usePublishedItems'
import { useReviewRecords } from '../composables/useReviewRecords'

const router = useRouter()
const route = useRoute()

const SECTION_KEYS = ['published', 'bought', 'sold', 'reviews'] as const

// composables
const { userInfo } = useUser()
const {
  publishedItems,
  loading: publishedLoading,
  getPublishedItems,
  refreshPublishedItems,
  toggleItemStatus,
  deleteItem
} = usePublishedItems()
const {
  reviewRecords,
  loading: reviewLoading,
  getReviewRecords,
  refreshReviewRecords
} = useReviewRecords()

// 当前激活区域
const activeSection = ref<string>('published')

// refs
const profileSettingsRef = ref()

// 从URL恢复section
const restoreSection = () => {
  const q = route.query.tab
  if (typeof q === 'string' && SECTION_KEYS.includes(q as any)) {
    activeSection.value = q
  }
}

// 切换section
const switchSection = (key: string) => {
  activeSection.value = key
  router.replace({ path: route.path, query: { ...route.query, tab: key } })
}

// 操作方法
const editProfile = () => profileSettingsRef.value?.openEditDialog()
const changePassword = () => profileSettingsRef.value?.openPasswordDialog()
const updateUser = (updatedUser: any) => Object.assign(userInfo, updatedUser)
const viewItem = (id: number) => router.push(`/items/${id}`)
const editItem = (id: number) => router.push(`/publish?edit=${id}`)

const handleItemAction = async (command: any) => {
  try {
    const { action, item } = command
    if (action === 'toggle') await toggleItemStatus(item)
    else if (action === 'delete') await deleteItem(item.id)
  } catch (error) {
    console.error('处理物品操作失败:', error)
  }
}

// 监听URL变化
watch(() => route.query.tab, restoreSection, { immediate: true })

// 初始化
onMounted(async () => {
  restoreSection()
  await Promise.all([getPublishedItems(), getReviewRecords()])
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: transparent;
}

.profile-layout {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  gap: var(--spacing-lg);
}

/* ==================== 左侧侧边栏 ==================== */

.profile-sidebar {
  width: 260px !important;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow: visible;
}

/* 用户信息卡片 */
.user-card {
  border-radius: 16px;
  text-align: center;
  border: none;
  background: var(--bg-white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.user-card :deep(.el-card__body) {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  border: 3px solid var(--brand-primary-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary-light) 0%, transparent 70%);
  z-index: -1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.user-name {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--text-primary);
}

.user-school-tag {
  margin-top: var(--spacing-xs);
}

.user-actions {
  margin-top: var(--spacing-sm);
}

.btn-black-text {
  color: #303133 !important;
}

.btn-black-text:hover {
  color: #606266 !important;
}

/* 导航卡片 */
.nav-card {
  border-radius: 16px;
  border: none;
  background: var(--bg-white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.nav-card :deep(.el-card__body) {
  padding: var(--spacing-sm);
}

.nav-menu {
  border: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin: 4px 0;
  height: 44px;
  line-height: 44px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: var(--brand-primary-light);
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-menu :deep(.el-menu-item.is-active .el-icon) {
  color: white;
}

/* ==================== 右侧内容区 ==================== */

.profile-content {
  flex: 1;
  min-width: 0;
  padding: 0;
  overflow: visible;
}

.content-card {
  border-radius: 16px;
  border: none;
  background: var(--bg-white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 500px;
}

.content-card :deep(.el-card__header) {
  border-bottom: 1px solid var(--border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-white);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-medium);
  font-weight: 600;
  color: var(--text-primary);
}

.header-icon {
  font-size: 18px;
  color: var(--text-secondary);
}

/* 各模块图标颜色 */
.published-icon {
  color: #4a90d9;
}

.bought-icon {
  color: #5cb85c;
}

.sold-icon {
  color: #f0a500;
}

.reviews-icon {
  color: #d9534f;
}

.content-card :deep(.el-card__body) {
  padding: var(--spacing-lg);
}

/* ==================== 响应式设计 ==================== */

@media (max-width: 900px) {
  .profile-layout {
    flex-direction: column;
    padding: var(--spacing-md);
  }

  .profile-sidebar {
    width: 100% !important;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .user-card {
    flex: 2;
    min-width: 200px;
  }

  .nav-card {
    flex: 3;
    min-width: 280px;
  }

  .nav-menu {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-menu :deep(.el-menu-item) {
    width: auto;
    min-width: 100px;
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .profile-sidebar {
    flex-direction: column;
  }

  .user-card,
  .nav-card {
    flex: none;
    width: 100%;
  }

  .nav-menu {
    flex-direction: column;
  }

  .nav-menu :deep(.el-menu-item) {
    width: 100%;
  }

  .user-avatar-wrapper :deep(.el-avatar) {
    width: 60px;
    height: 60px;
  }

  .avatar-decoration {
    width: 70px;
    height: 70px;
  }
}
</style>