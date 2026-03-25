<template>
  <div class="profile-page">
    <!-- 个人信息卡片 - 使用拆分的组件 -->
    <ProfileHeader
      :user-info="{
        id: userInfo.id || '',
        name: userInfo.username,
        avatar: userInfo.avatarUrl || '',
        location: userInfo.school || '',
        phone: userInfo.phone,
        email: userInfo.email,
        bio: userInfo.bio,
        verified: userInfo.isVerified
      }"
      @edit-profile="editProfile"
      @change-password="changePassword"
      @view-activity="viewActivity"
    />

<!-- Tab：我发布的 / 我买到的 / 我卖出的 / 我评价的 -->
    <div ref="tabSectionRef" class="tab-section">
      <el-tabs
        v-model="activeTab"
        class="profile-tabs"
        type="card"
        stretch
        @tab-change="onTabChange"
      >
        <el-tab-pane
          v-for="tab in tabList"
          :key="tab.name"
          :name="tab.name"
          :lazy="tab.lazy"
        >
          <template #label>
            <div class="tab-label">
              <component :is="tab.icon" />
              <span>{{ tab.label }}</span>
            </div>
          </template>
          <component
            :is="tab.component"
            :ref="(el: any) => setTabRef(tab.name, el)"
            v-bind="tab.props"
            v-on="tab.events"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 个人设置组件（编辑资料和修改密码） -->
    <ProfileSettings
      ref="profileSettingsRef"
      :user-info="userInfo"
      @update-profile="updateUser"
    />

    <!-- 查看活跃度对话框 -->
    <el-dialog
      v-model="showActivityDialog"
      title="我的活跃度"
      width="700px"
      :close-on-click-modal="false"
      class="activity-dialog"
    >
      <RecentActivities
        :activities="activities"
        :loading="activityLoading"
        @refresh="refreshActivities"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, ShoppingBag, Sell, Star } from '@element-plus/icons-vue'

// 导入拆分的组件
import ProfileHeader from '../components/ProfileHeader.vue'
import ProfileSettings from '../components/ProfileSettings.vue'
import PublishedItems from '../components/PublishedItems.vue'
import BorrowRecords from '../components/BorrowRecords.vue'
import LendingRecords from '../components/LendingRecords.vue'
import ReviewRecords from '../components/ReviewRecords.vue'
import RecentActivities from '../components/RecentActivities.vue'

// 导入 composables
import { useUser } from '../../auth/composables/useUser'
import { usePublishedItems } from '../composables/usePublishedItems'
import { useReviewRecords } from '../composables/useReviewRecords'
import { useActivityRecords } from '../composables/useActivityRecords'

const router = useRouter()
const route = useRoute()

const PROFILE_TAB_NAMES = ['published', 'bought', 'sold', 'reviews'] as const

// 使用 composables
const { 
  userInfo, 
} = useUser()

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

const { 
  activities, 
  loading: activityLoading, 
  getActivityRecords 
} = useActivityRecords()

// 从 URL query 恢复 tab，便于从订单详情返回时停留在「我借用的」等
const initialTab = () => {
  const q = route.query.tab
  return (typeof q === 'string' && PROFILE_TAB_NAMES.includes(q as any)) ? q : 'published'
}
const activeTab = ref(initialTab())

const profileSettingsRef = ref()
const showActivityDialog = ref(false)
const tabRefs = ref<Record<string, any>>({})
const tabSectionRef = ref<HTMLElement | null>(null)

function setTabRef(name: string, el: any) {
  if (el) tabRefs.value[name] = el
}

/** 切换 tab 时让视口聚焦到 tab 内容区，避免页面往上抬 */
function onTabChange() {
  nextTick(() => {
    tabSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

// 方法
const editProfile = () => {
  profileSettingsRef.value?.openEditDialog()
}

const changePassword = () => {
  profileSettingsRef.value?.openPasswordDialog()
}

const viewActivity = async () => {
  showActivityDialog.value = true
  await getActivityRecords()
}

const refreshActivities = async () => {
  await getActivityRecords()
}

const updateUser = (updatedUser: any) => {
  Object.assign(userInfo, updatedUser)
}

const viewItem = (id: number) => {
  router.push(`/items/${id}`)
}

const editItem = (id: number) => {
  router.push(`/publish?edit=${id}`)
}

// 处理物品操作
const handleItemAction = async (command: any) => {
  try {
    const { action, item } = command
    switch (action) {
      case 'toggle':
        await toggleItemStatus(item)
        break
      case 'delete':
        await deleteItem(item.id)
        break
    }
  } catch (error) {
    console.error('处理物品操作失败:', error)
  }
}

// Tab 配置：我发布的 → 我买到的 → 我卖出的 → 我评价的
const tabList = computed(() => [
  {
    name: 'published',
    label: '我发布的',
    icon: Document,
    component: PublishedItems,
    lazy: true,
    props: {
      publishedItems: publishedItems.value,
      loading: publishedLoading.value
    },
    events: {
      'view-item': viewItem,
      'edit-item': editItem,
      refresh: refreshPublishedItems,
      'item-action': handleItemAction
    }
  },
  {
    name: 'bought',
    label: '我买到的',
    icon: ShoppingBag,
    component: BorrowRecords,
    lazy: true,
    props: {},
    events: {}
  },
  {
    name: 'sold',
    label: '我卖出的',
    icon: Sell,
    component: LendingRecords,
    lazy: true,
    props: {},
    events: {}
  },
  {
    name: 'reviews',
    label: '我评价的',
    icon: Star,
    component: ReviewRecords,
    lazy: true,
    props: {
      reviewRecords: reviewRecords.value,
      loading: reviewLoading.value
    },
    events: {
      'view-item': viewItem,
      refresh: refreshReviewRecords
    }
  }
])

// 切换 tab 时同步到 URL，从订单详情返回时可恢复当前 tab
watch(activeTab, (tab) => {
  const current = route.query.tab
  if (current === tab) return
  router.replace({
    path: route.path,
    query: { ...route.query, tab }
  })
})

// 从详情页跳回 profile?tab=... 时，同步 tab
watch(
  () => route.query.tab,
  (q) => {
    if (typeof q === 'string' && PROFILE_TAB_NAMES.includes(q as any)) {
      activeTab.value = q
    }
  },
  { immediate: true }
)

// 组件初始化
onMounted(async () => {
  // 进入页面时根据 URL 恢复 tab（如从订单详情返回）
  const q = route.query.tab
  if (typeof q === 'string' && PROFILE_TAB_NAMES.includes(q as any)) {
    activeTab.value = q
  }
  try {
    // 并行加载所有数据
    console.log('开始加载个人中心数据...')
    await Promise.all([
      getPublishedItems(),
      getReviewRecords()
    ])
    console.log('个人中心数据加载完成')
  } catch (error) {
    console.error('加载个人中心数据失败:', error)
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}



.tab-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.tab-section:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.profile-tabs {
  padding: 24px;
}

:deep(.el-tabs) {
  border: none;
}

:deep(.el-tabs__header) {
  margin: 0 0 24px 0;
  border: none;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px;
  border-radius: 12px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__nav) {
  border: none !important;
  display: flex;
  gap: 12px;
  width: 100%;
}

:deep(.el-tabs__item) {
  border: none !important;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin: 0 !important;
  background: transparent !important;
}

:deep(.el-tabs__item + .el-tabs__item) {
  margin-left: 0 !important;
}

:deep(.el-tabs__item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #03a688 0%, #04c9a6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
  z-index: -1;
}

:deep(.el-tabs__item:hover) {
  color: #03a688;
  background-color: rgba(3, 166, 136, 0.05);
  transform: translateY(-2px);
}

:deep(.el-tabs__item.is-active) {
  color: white !important;
  background: linear-gradient(135deg, #03a688 0%, #04c9a6 100%) !important;
  box-shadow: 0 4px 12px rgba(3, 166, 136, 0.3);
  font-weight: 600;
  border: none !important;
}

:deep(.el-tabs__item.is-active::before) {
  opacity: 1;
}

:deep(.el-tabs__content) {
  padding: 0;
}

:deep(.el-tab-pane) {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.tab-label .el-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

:deep(.el-tabs__item:hover .tab-label .el-icon) {
  transform: scale(1.1);
}

:deep(.el-tabs__item.is-active .tab-label .el-icon) {
  transform: scale(1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .profile-tabs {
    padding: 16px;
  }

  :deep(.el-tabs__header) {
    padding: 16px;
    background: #f8f9fa;
  }

  :deep(.el-tabs__item) {
    padding: 10px 16px;
    font-size: 14px;
  }

  :deep(.el-tabs__nav) {
    gap: 4px;
  }

  .tab-label {
    gap: 6px;
  }

  .tab-label .el-icon {
    font-size: 16px;
  }
}
</style>
