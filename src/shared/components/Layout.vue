<template>
  <div class="layout-container">
    <!-- 移动端顶部导航栏 -->
    <div
      v-if="isMobile"
      class="mobile-header"
    >
      <div
        class="header-left"
        @click="navigateTo('/dashboard')"
      >
        <img
          src="/logo.svg"
          alt="校园二手交易平台"
          class="logo-img"
        >
        <h1 class="app-title">
          校园二手交易
        </h1>
      </div>
      <div class="header-right">
        <el-dropdown
          class="notification-dropdown"
          @command="handleNotificationClick"
          @visible-change="onNotificationDropdownVisibleChange"
        >
          <div class="notification-trigger">
            <span class="notification-icon">🔔</span>
            <span
              v-if="unreadCount > 0"
              class="notification-badge"
            >{{ unreadCount }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="notification-header">
                <h3>通知中心</h3>
                <div class="notification-actions">
                  <el-button
                    v-if="unreadCount > 0"
                    type="text"
                    size="small"
                    @click="markAllAsRead"
                  >
                    全部已读
                  </el-button>
                </div>
              </div>
              <div class="notification-list">
                <div 
                  v-for="notification in displayedNotifications" 
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'unread': !notification.read }"
                  @click="openNotificationDetail(notification.id)"
                >
                  <span class="notification-title">{{ truncateText(notification.title, NOTIFICATION_TITLE_MAX) }}</span>
                  <span class="notification-message">{{ truncateText(notification.message, NOTIFICATION_MESSAGE_MAX) }}</span>
                  <span class="notification-time">{{ notification.time }}</span>
                </div>
                <div
                  v-if="hasMoreNotifications && !showAllNotifications"
                  class="notification-more"
                  @click.stop="showAllNotifications = true"
                >
                  <span class="notification-more-text">··· 查看更多（共 {{ notifications.length }} 条）</span>
                </div>
                <div
                  v-else-if="hasMoreNotifications && showAllNotifications"
                  class="notification-more"
                  @click.stop="showAllNotifications = false"
                >
                  <span class="notification-more-text">收起</span>
                </div>
                <div
                  v-if="notifications.length === 0"
                  class="notification-empty"
                >
                  暂无通知
                </div>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          class="header-btn"
          @click="toggleSideMenu"
        >
          菜单
        </el-button>
      </div>
    </div>

    <!-- 移动端侧边菜单 -->
    <div
      v-if="isMobile"
      class="side-menu"
      :class="{ 'open': sideMenuOpen }"
    >
      <div class="side-menu-header">
        <h2 class="side-menu-title">
          校园二手交易
        </h2>
        <el-button
          class="close-btn"
          @click="toggleSideMenu"
        >
          关闭
        </el-button>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="side-menu-content"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/items">
          <span>商品列表</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <span>关于我们</span>
        </el-menu-item>
      </el-menu>
      
      <!-- 移动端分类菜单 -->
      <div class="category-section">
        <h3 class="section-title">
          分类浏览
        </h3>
        <el-menu
          class="category-menu"
          @select="handleCategorySelect"
        >
          <el-menu-item 
            v-for="category in categories" 
            :key="category.id" 
            :index="category.id"
          >
            <span>{{ category.name }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="side-menu-footer">
        <div class="user-info">
          <el-avatar
            :size="48"
            :src="userAvatar"
          >
            {{ userName.charAt(0) }}
          </el-avatar>
          <div class="user-details">
            <h3 class="user-name">
              {{ userName }}
            </h3>
            <p class="user-id">
              {{ userStore.userInfo.studentId || userStore.userInfo.username || '' }}
            </p>
          </div>
        </div>
        <el-button
          type="primary"
          class="logout-btn"
          @click="handleLogout"
        >
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 桌面端布局 -->
    <div
      v-else
      class="desktop-layout"
    >
      <!-- 桌面端顶部导航栏 -->
      <div class="desktop-header">
        <div
          class="header-logo"
          @click="navigateTo('/dashboard')"
        >
          <img
            src="https://r2.zmwlovefmn.uk/logo2.png"
            alt="校园二手交易平台"
            class="logo-img"
          >
          <h1 class="app-title">
            校园二手交易平台
          </h1>
        </div>
        <div class="header-nav">
          <el-menu
            :default-active="activeMenu"
            class="nav-menu"
            mode="horizontal"
            :ellipsis="false"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/dashboard">
              <span class="nav-item-inner">首页</span>
            </el-menu-item>
            <el-menu-item index="/items">
              <span class="nav-item-inner">商品列表</span>
            </el-menu-item>
            <el-menu-item index="/blog">
              <span class="nav-item-inner">校园讨论</span>
            </el-menu-item>
            <el-menu-item index="/profile">
              <span class="nav-item-inner">个人中心</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="header-user">
          <el-dropdown
            class="notification-dropdown"
            @command="handleNotificationClick"
            @visible-change="onNotificationDropdownVisibleChange"
          >
            <div class="notification-trigger">
              <span class="notification-icon">🔔</span>
              <span
                v-if="unreadCount > 0"
                class="notification-badge"
              >{{ unreadCount }}</span>
            </div>
            <template #dropdown>
              <div class="modern-notification-dropdown">
                <div class="notification-header">
                  <div class="header-content">
                    <div class="header-title">
                      <h3>通知</h3>
                      <span class="badge-count">{{ unreadCount }}</span>
                    </div>
                    <div class="header-actions">
                      <el-button
                        v-if="unreadCount > 0"
                        type="text"
                        size="small"
                        @click="markAllAsRead"
                      >
                        全部已读
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <div class="notification-list">
                  <div
                    v-for="notification in displayedNotifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="[notification.read ? 'read' : 'unread', 'type-' + notification.type]"
                    @click="openNotificationDetail(notification.id)"
                  >
                    <div class="notification-icon-wrapper">
                      <span class="notification-type-icon">{{ getTypeIcon(notification.type) }}</span>
                    </div>
                    <div class="notification-content">
                      <div class="notification-header-item">
                        <span class="notification-title" :title="notification.title">{{ truncateText(notification.title, NOTIFICATION_TITLE_MAX) }}</span>
                        <span class="notification-meta">
                          <span v-if="notification.read" class="notification-read-tag">已读</span>
                          <span class="notification-time">{{ notification.time }}</span>
                        </span>
                      </div>
                      <span class="notification-message" :title="notification.message">{{ truncateText(notification.message, NOTIFICATION_MESSAGE_MAX) }}</span>
                    </div>
                  </div>
                  
                  <div
                    v-if="hasMoreNotifications && !showAllNotifications"
                    class="notification-more"
                    @click.stop="showAllNotifications = true"
                  >
                    <span class="notification-more-text">··· 查看更多（共 {{ notifications.length }} 条）</span>
                  </div>
                  <div
                    v-else-if="hasMoreNotifications && showAllNotifications"
                    class="notification-more"
                    @click.stop="showAllNotifications = false"
                  >
                    <span class="notification-more-text">收起</span>
                  </div>
                  
                  <div
                    v-if="notifications.length === 0"
                    class="notification-empty"
                  >
                    <div class="empty-content">
                      <span class="empty-icon">📭</span>
                      <p class="empty-text">
                        暂无通知
                      </p>
                      <p class="empty-subtext">
                        收到新通知时会在这里显示
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-dropdown>
          <el-dropdown @command="handleUserMenu">
            <div class="user-menu-trigger">
              <el-avatar
                :size="40"
                :src="userAvatar"
              >
                {{ userName.charAt(0) }}
              </el-avatar>
              <el-icon class="dropdown-arrow">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <span>个人资料</span>
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <span>我的收藏</span>
                </el-dropdown-item>
                <el-dropdown-item
                  command="/about"
                  divided
                >
                  <span>关于我们</span>
                </el-dropdown-item>
                <el-dropdown-item
                  command="logout"
                  divided
                >
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
           type="primary"
           class="publish-btn"
           @click="navigateTo('/publish')"
         >
           <span class="publish-btn-icon">+</span>
           <span class="publish-btn-text">发布物品</span>
         </el-button>
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="content-wrapper">
        <!-- 页面加载指示器 -->
        <div
          v-if="pageLoading"
          class="page-loader"
        >
          <div class="loader-spinner">
            <div class="spinner-ring" />
            <div class="spinner-text">
              正在加载...
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div
          class="main-content"
          :class="{ 'loading': pageLoading }"
        >
          <div class="page-content">
            <router-view v-slot="{ Component }">
              <transition
                name="page"
                mode="out-in"
              >
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端底部导航栏 -->
    <div
      v-if="isMobile"
      class="mobile-footer"
    >
      <div 
        v-for="item in footerItems" 
        :key="item.path" 
        class="footer-item"
        :class="{ 'active': currentPath === item.path }"
        @click="navigateTo(item.path)"
      >
        <span class="footer-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="isMobile"
      class="overlay"
      :class="{ 'show': sideMenuOpen }"
      @click="toggleSideMenu"
    />

    <!-- 通知详情弹窗 -->
    <el-dialog
      v-model="notificationDetailVisible"
      :title="notificationDetail?.title ?? '公告详情'"
      class="notification-detail-dialog"
      width="520px"
      destroy-on-close
      @close="notificationDetail = null"
    >
      <div
        v-loading="notificationDetailLoading"
        class="notification-detail-body"
      >
        <template v-if="notificationDetail && !notificationDetailLoading">
          <div class="notification-detail-meta">
            <span class="notification-detail-time">
              发布时间：{{ formatDetailTime(notificationDetail) }}
            </span>
          </div>
          <div class="notification-detail-content">
            {{ notificationDetail.content }}
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/shared/stores/user'
import { useAppStore } from '@/shared/stores/app'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { logout as logoutApi } from '@/shared/api/modules/auth'
import { getUserBroadcastList, markBroadcastsAsRead, getBroadcastDetail } from '@/shared/api/modules/notification'
import { formatTimeAgo, formatTimestamp } from '@/shared/utils/format'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

// 用户信息（从 store 获取）
const userName = computed(() => userStore.userName)
const userId = computed(() => userStore.userId)
const userAvatar = computed(() => userStore.userAvatar)

// 侧边菜单状态
const sideMenuOpen = ref(false)
const menuTransitioning = ref(false)

// 加载状态（从 store 获取）
const pageLoading = computed(() => appStore.pageLoading)
const dataLoading = ref(false)

// 响应式布局
const isMobile = ref(false)
const isTablet = ref(false)
const screenWidth = ref(0)

// 当前路径
const currentPath = computed(() => {
  return route.path
})

// 激活的菜单
const activeMenu = computed(() => {
  return currentPath.value || '/dashboard'
})



// 屏幕尺寸判断
const currentScreenSize = computed(() => {
  if (isMobile.value) return 'mobile'
  if (isTablet.value) return 'tablet'
  return 'desktop'
})

// 菜单展开状态
const isMenuExpanded = computed(() => {
  return sideMenuOpen.value && isMobile.value
})

// 底部导航项
const footerItems = [
  { path: '/dashboard', label: '首页' },
  { path: '/items', label: '商品' },
  { path: '/profile', label: '我的' },
  { path: '/about', label: '关于' }
]

// 分类数据
const categories = ref([
  { id: 'electronics', name: '电子产品' },
  { id: 'books', name: '图书教材' },
  { id: 'clothing', name: '服饰鞋包' },
  { id: 'phone', name: '手机数码' },
  { id: 'sports', name: '运动装备' },
  { id: 'daily', name: '生活用品' }
])

// 快速入口
const quickEntries = [
  { path: '/items?status=available', label: '在售商品' },
  { path: '/items?sort=newest', label: '最新发布' },
  { path: '/items?sort=price', label: '价格优惠' },
  { path: '/profile/favorites', label: '我的收藏' },
  { path: '/items/publish', label: '发布商品' }
]

// 通知中心数据
const notifications = ref([])

// 通知加载状态
const notificationsLoading = ref(false)

// 未读通知数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// 下拉内最多先展示条数，更多通过「查看更多」展开
const NOTIFICATION_DISPLAY_LIMIT = 5

// 列表展示字数限制（超出部分需点击查看详情）
const NOTIFICATION_TITLE_MAX = 16
const NOTIFICATION_MESSAGE_MAX = 40

// 是否展开显示全部通知（下拉内「查看更多」）
const showAllNotifications = ref(false)
const displayedNotifications = computed(() => {
  const list = notifications.value
  if (showAllNotifications.value || list.length <= NOTIFICATION_DISPLAY_LIMIT) {
    return list
  }
  return list.slice(0, NOTIFICATION_DISPLAY_LIMIT)
})
const hasMoreNotifications = computed(() => notifications.value.length > NOTIFICATION_DISPLAY_LIMIT)
const truncateText = (str, maxLen) => {
  if (str == null || str === '') return ''
  const s = String(str)
  return s.length <= maxLen ? s : s.slice(0, maxLen) + '...'
}

// 通知详情弹窗
const notificationDetailVisible = ref(false)
const notificationDetailLoading = ref(false)
const notificationDetail = ref(null)

/** 格式化详情时间：兼容 createdAt/created_at，以及秒/毫秒时间戳 */
const formatDetailTime = (detail) => {
  if (!detail) return '-'
  const ts = detail.createdAt ?? detail.created_at
  if (ts == null || ts === '') return '-'
  const ms = Number(ts) < 1e12 ? Number(ts) * 1000 : Number(ts)
  return formatTimestamp(ms)
}

// 获取通知列表
const fetchNotifications = async () => {
  // 如果用户未登录，不获取通知
  if (!userStore.token) {
    return
  }

  try {
    notificationsLoading.value = true
    const data = await getUserBroadcastList()
    
    // 转换数据格式：将后端返回的数据转换为组件需要的格式
    notifications.value = data.map(item => ({
      id: item.id,
      type: 'system', // 系统通知统一使用 system 类型
      title: item.title,
      message: item.content,
      time: formatTimeAgo(item.createdAt),
      read: item.isRead
    }))
  } catch (error) {
    console.error('获取通知列表失败:', error)
    // 静默失败，不影响主功能
  } finally {
    notificationsLoading.value = false
  }
}

// 方法
const toggleSideMenu = async () => {
  if (menuTransitioning.value) return
  
  menuTransitioning.value = true
  
  try {
    if (isMobile.value) {
      sideMenuOpen.value = !sideMenuOpen.value
      document.body.style.overflow = sideMenuOpen.value ? 'hidden' : 'auto'
      
      // 添加动画延迟
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  } finally {
    menuTransitioning.value = false
  }
}

const handleMenuSelect = async (key) => {
  if (pageLoading.value) return
  
  try {
    appStore.setPageLoading(true)
    await navigateTo(key)
    
    // 移动端自动关闭菜单
    if (isMobile.value && sideMenuOpen.value) {
      await toggleSideMenu()
    }
  } catch (error) {
    console.error('导航错误:', error)
    ElMessage.error('导航失败，请重试')
  } finally {
    appStore.setPageLoading(false)
  }
}

const navigateTo = async (path) => {
  if (currentPath.value === path) return
  
  try {
    // 添加页面加载动画
    appStore.setPageLoading(true)
    
    // 延迟导航以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await router.push(path)
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
  } catch (error) {
    console.error('路由错误:', error)
    throw error
  } finally {
    appStore.setPageLoading(false)
  }
}

const handleUserMenu = async (command) => {
  try {
    switch (command) {
      case 'profile':
        await navigateTo('/profile')
        break
      case 'favorites':
        await navigateTo('/profile/favorites')
        break
      case 'logout':
        await handleLogout()
        break
      default:
        // 处理帮助中心链接
        await navigateTo(command)
        break
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const handleLogout = async () => {
  try {
    dataLoading.value = true

    // 调用后端退出登录接口
    await logoutApi()

    // 调用 store 的登出方法，清理本地状态
    userStore.logout()

    ElMessage.success('已安全退出')
    await router.push('/login')
  } catch (error) {
    console.error('登出错误:', error)
    // 即使后端请求失败，也要清理本地状态
    userStore.logout()
    ElMessage.warning('已退出登录')
    await router.push('/login')
  } finally {
    dataLoading.value = false
  }
}

// 通知中心相关方法
const handleNotificationClick = (command) => {
  console.log('Notification command:', command)
}

let notificationClickTimer = null

const readNotification = async (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification && !notification.read) {
    try {
      await markBroadcastsAsRead([notificationId])
      notification.read = true
    } catch (error) {
      console.error('标记通知为已读失败:', error)
      notification.read = true
    }
  }
}

/** 打开通知详情：拉取详情接口并标记为已读 */
const openNotificationDetail = async (notificationId) => {
  if (notificationClickTimer) return
  notificationClickTimer = setTimeout(async () => {
    notificationDetailVisible.value = true
    notificationDetail.value = null
    readNotification(notificationId)
    notificationDetailLoading.value = true
    try {
      const data = await getBroadcastDetail(notificationId)
      notificationDetail.value = data
    } catch (error) {
      console.error('获取公告详情失败:', error)
      ElMessage.error('获取详情失败，请稍后重试')
      notificationDetailVisible.value = false
    } finally {
      notificationDetailLoading.value = false
    }
    notificationClickTimer = null
  }, 200)
}

const markAllAsRead = async () => {
  // 获取所有未读通知的ID列表
  const unreadIds = notifications.value
    .filter(n => !n.read)
    .map(n => n.id)
  
  if (unreadIds.length === 0) {
    ElMessage.info('没有未读通知')
    return
  }

  try {
    // 调用后端接口标记所有未读通知为已读
    await markBroadcastsAsRead(unreadIds)
    // 更新本地状态
    notifications.value.forEach(notification => {
      if (!notification.read) {
        notification.read = true
      }
    })
    ElMessage.success('所有通知已标记为已读')
  } catch (error) {
    console.error('标记所有通知为已读失败:', error)
    ElMessage.error('标记已读失败，请稍后重试')
  }
}

/** 通知下拉关闭时收起「查看更多」，下次打开仍只显示前 N 条 */
const onNotificationDropdownVisibleChange = (visible) => {
  if (!visible) {
    showAllNotifications.value = false
  }
}

// 获取通知类型图标
const getTypeIcon = (type) => {
  const icons = {
    system: '🔔',
    trade: '🛒',
    message: '💬',
    deal: '🤝'
  }
  return icons[type] || '📢'
}

// 分类选择
const handleCategorySelect = async (categoryId) => {
  try {
    dataLoading.value = true
    
    await navigateTo(`/items?category=${categoryId}`)
    
    if (isMobile.value && sideMenuOpen.value) {
      await toggleSideMenu()
    }
    
    ElMessage.success('分类筛选已应用')
    
  } catch (error) {
    console.error('分类选择错误:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    dataLoading.value = false
  }
}

// 快捷操作
const handleQuickEntry = async (path) => {
  try {
    dataLoading.value = true
    await navigateTo(path)
  } catch (error) {
    ElMessage.error('导航失败，请重试')
  } finally {
    dataLoading.value = false
  }
}

// 检测窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth
  
  // 更新响应式状态
  isMobile.value = screenWidth.value < 768
  isTablet.value = screenWidth.value >= 768 && screenWidth.value < 1024
  
  // 自动关闭移动端菜单（如果切换到桌面端）
  if (!isMobile.value && sideMenuOpen.value) {
    sideMenuOpen.value = false
    document.body.style.overflow = 'auto'
  }
}

// 防抖处理
let resizeTimer = null
const debounceResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(handleResize, 150)
}

// 键盘快捷键处理
const handleKeydown = (event) => {
  // ESC 关闭菜单
  if (event.key === 'Escape') {
    if (sideMenuOpen.value && isMobile.value) {
      toggleSideMenu()
    }
  }
}

// 监听用户登录状态，登录后自动获取通知
watch(() => userStore.token, (newToken) => {
  if (newToken) {
    // 用户登录后获取通知
    fetchNotifications()
  } else {
    // 用户退出后清空通知
    notifications.value = []
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 初始化响应式检测
  handleResize()
  window.addEventListener('resize', debounceResize)
  
  // 添加键盘快捷键监听
  document.addEventListener('keydown', handleKeydown)
  
  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && sideMenuOpen.value) {
      // 页面隐藏时关闭移动端菜单
      sideMenuOpen.value = false
      document.body.style.overflow = 'auto'
    } else if (!document.hidden && userStore.token) {
      // 页面重新可见时刷新通知
      fetchNotifications()
    }
  })
  
  // 预加载关键路由
  preloadRoutes()
  
  // 如果用户已登录，获取通知列表
  if (userStore.token) {
    fetchNotifications()
  }
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', debounceResize)
  document.removeEventListener('keydown', handleKeydown)
  
  // 清理定时器
  clearTimeout(resizeTimer)
  
  // 重置滚动
  document.body.style.overflow = 'auto'
})

// 预加载路由
const preloadRoutes = async () => {
  try {
    // 预加载常用页面组件
    const routes = ['/items', '/publish', '/profile']
    routes.forEach(async (route) => {
      try {
        await router.resolve(route)
      } catch (error) {
        // 静默失败，预加载失败不影响主功能
        console.debug(`预加载路由 ${route} 失败:`, error)
      }
    })
  } catch (error) {
    console.warn('路由预加载失败:', error)
  }
}
</script>

<style scoped>
/* 全局样式 */
.layout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

/* 移动端顶部导航栏 */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1500;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #03a688;
  margin: 0;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-btn {
  border: none;
  background: none;
  font-size: 24px;
  color: #333;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-btn:hover {
  background-color: #f5f7fa;
  color: #03a688;
}

/* 移动端侧边菜单 */
.side-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 320px;
  height: 100vh;
  background-color: white;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.side-menu.open {
  left: 0;
}

.side-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.side-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #03a688;
  margin: 0;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  color: #333;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f7fa;
  color: #03a688;
}

.side-menu-content {
  flex: 1;
  padding: 20px 0;
}

/* 分类区域 */
.category-section {
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 20px 16px;
}

.category-menu {
  border-right: none;
}

.category-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  margin: 0 12px;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.category-menu .el-menu-item:hover {
  background-color: #e6f9f5;
  color: #03a688;
}

.category-menu .el-menu-item.is-active {
  background-color: #03a688;
  color: white;
}

.category-badge {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background-color: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.side-menu-footer {
  padding: 24px 20px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.user-id {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.logout-btn {
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  font-weight: 500;
}

/* 桌面端布局 */
.desktop-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 桌面端顶部导航栏 */
.desktop-header {
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 80px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1500;
}

.header-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

/* 页面加载指示器 */
.page-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loader-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top: 3px solid #52c41a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.main-content.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* 增强的过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.nav-menu {
  border-bottom: none !important;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: none !important;
}

.nav-menu .el-menu-item {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-menu::after {
  display: none !important;
}

.nav-menu > .el-menu-item {
  height: 60px;
  line-height: 60px;
  font-size: 16px;
  color: #333;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 0;
  padding: 0;
  font-weight: 500;
  background: none !important;
}

.nav-menu .nav-item-inner {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 10px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
}

.nav-menu .el-menu-item:hover {
  color: #03a688;
  background: none !important;
  transform: none;
}

.nav-menu .el-menu-item:hover .nav-item-inner {
  background-color: rgba(3, 166, 136, 0.08);
  transform: translateY(-1px);
}

.nav-menu .el-menu-item.is-active {
  color: #03a688;
  background: none !important;
  border-bottom: none !important;
  font-weight: 600;
  box-shadow: none !important;
}

.nav-menu .el-menu-item.is-active .nav-item-inner {
  background-color: rgba(3, 166, 136, 0.1);
}



/* 移动端导航样式 */
@media (max-width: 768px) {
  .nav-menu .el-menu-item {
    height: 56px;
    line-height: 56px;
    font-size: 15px;
    padding: 0 16px;
  }
}

.header-user {
  flex-shrink: 0;
  margin-left: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-dropdown {
  position: relative;
}

.notification-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.notification-trigger:hover {
  background-color: #f5f7fa;
}

.notification-icon {
  font-size: 20px;
  color: #666;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #F56C6C;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.publish-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  border: none;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 166, 136, 0.3);
}

.publish-btn-icon {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.publish-btn-text {
  line-height: 1;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.user-menu-trigger:hover {
  background-color: #f5f7fa;
}

.dropdown-arrow {
  font-size: 14px;
  color: #666;
  transition: transform 0.3s ease;
}

.el-dropdown.is-active .dropdown-arrow {
  transform: rotate(180deg);
}

/* 嵌套菜单项样式 */
.nested-menu-item {
  padding-left: 20px;
  display: block;
}

.dropdown-icon {
  font-size: 14px;
  color: #999;
}

/* 现代化通知下拉菜单样式 */
.modern-notification-dropdown {
  background: white;
  border-radius: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
}

.notification-header {
  background-color: #03a688;
  padding: 20px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.badge-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-actions .el-button {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: white;
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.header-actions .el-button--primary {
  background: white;
  color: #667eea;
  font-weight: 600;
}

.header-actions .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.notification-list {
  width: 380px;
  height: 400px;
  overflow-y: auto;
  padding: 0;
  border-radius: 0 0 16px 16px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #03a688;
}

.notification-item.read .notification-title,
.notification-item.read .notification-message {
  color: #999;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notification-read-tag {
  font-size: 12px;
  color: #999;
  padding: 0 6px;
  line-height: 20px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

/* 通知详情弹窗 */
.notification-detail-dialog .el-dialog__header {
  padding: 18px 24px 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
}

.notification-detail-dialog .el-dialog__title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.notification-detail-dialog .el-dialog__body {
  padding: 20px 24px 28px;
  background: linear-gradient(180deg, #fafbfc 0%, #fff 24px);
}

.notification-detail-body {
  min-height: 140px;
}

.notification-detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e8eaef;
}

.notification-detail-time {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.notification-detail-time::before {
  content: '🕐';
  margin-right: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.notification-detail-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 18px 20px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: #03a688;
  flex-shrink: 0;
  color: white;
  font-size: 16px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.notification-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-message {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.notification-more {
  padding: 10px 16px;
  text-align: center;
  cursor: pointer;
  color: var(--el-color-primary);
  font-size: 13px;
  border-top: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;
}

.notification-more:hover {
  background-color: var(--el-fill-color-light);
}

.notification-more-text {
  user-select: none;
}

.notification-empty {
  padding: 60px 40px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.empty-subtext {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

/* 不同类型的通知样式 */
.notification-item.type-system .notification-icon-wrapper {
  background-color: #03a688;
}

.notification-item.type-trade .notification-icon-wrapper {
  background-color: #73d13d;
}

.notification-item.type-message .notification-icon-wrapper {
  background-color: #95de64;
}

.notification-item.type-deal .notification-icon-wrapper {
  background-color: #389e0d;
}

/* 移动端通知样式 */
@media (max-width: 768px) {
  .header-user {
    margin-left: 16px;
    gap: 8px;
  }

  .publish-btn {
    height: 36px;
    padding: 0 16px;
    font-size: 13px;
  }

  .publish-btn-icon {
    font-size: 16px;
  }

  .publish-btn-text {
    display: none;
  }

  .notification-trigger {
    width: 36px;
    height: 36px;
  }

  .notification-icon {
    font-size: 18px;
  }

  .notification-badge {
    top: -2px;
    right: -2px;
    font-size: 11px;
    min-width: 18px;
    height: 18px;
  }

  .notification-list {
    min-width: 280px;
    max-height: 300px;
  }

  .modern-notification-dropdown {
    min-width: 280px;
    max-height: 320px;
  }

  .notification-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-title {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .notification-item {
    padding: 12px;
    gap: 10px;
  }

  .notification-icon-wrapper {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-message {
    font-size: 12px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

/* 内容包装器 */
.content-wrapper {
  display: flex;
  flex: 1;
  background: linear-gradient(to bottom, #e6f9f5 0%, #ffffff 40%);
}

/* 左侧分类菜单 */
.side-category-menu {
  width: 240px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  padding: 32px 0;
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.category-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 24px 24px;
}

.side-category-menu .category-menu {
  border-right: none;
}

.side-category-menu .category-menu .el-menu-item {
  height: 64px;
  line-height: 64px;
  margin: 0 16px;
  border-radius: 16px;
  font-size: 16px;
  padding-left: 24px;
  transition: all 0.3s ease;
}

.side-category-menu .category-menu .el-menu-item:hover {
  background-color: #e6f9f5;
  color: #03a688;
}

.side-category-menu .category-menu .el-menu-item.is-active {
  background-color: #03a688;
  color: white;
}

/* 快速入口 */
.quick-entry {
  margin-top: 40px;
  padding: 0 24px;
}

.entry-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px;
}

.entry-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background-color: #f5f7fa;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.entry-item:hover {
  background-color: #e6f9f5;
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.entry-item .el-icon {
  margin-bottom: 8px;
  color: #03a688;
}

.entry-item span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 32px 40px;
  transition: all 0.3s ease;
}

.page-content {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-content > * {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

/* 移动端底部导航栏 */
.mobile-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px 20px;
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.footer-item:hover {
  background-color: #f5f7fa;
}

.footer-item.active {
  color: #03a688;
  background-color: rgba(82, 196, 26, 0.1);
}

.footer-label {
  font-size: 12px;
  font-weight: 500;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.overlay.show {
  opacity: 1;
  visibility: visible;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .side-category-menu {
    width: 200px;
  }
  
  .main-content {
    padding: 32px 32px;
  }
}

@media (max-width: 1200px) {
  .desktop-header {
    padding: 0 32px;
  }

  .header-user {
    margin-left: 32px;
  }

  .side-category-menu {
    width: 180px;
  }

  .main-content {
    padding: 24px 24px;
  }
}

@media (max-width: 992px) {
  .desktop-header {
    padding: 0 24px;
  }
  
  .header-user {
    margin-left: 24px;
  }
  
  .nav-menu .el-menu-item {
    font-size: 14px;
  }
  
  .side-category-menu {
    width: 160px;
  }
  
  .entry-items {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 24px 20px;
  }

  .page-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 24px 16px 100px;
    min-height: calc(100vh - 64px);
  }

  .side-menu {
    width: 90%;
  }

  .user-menu-trigger {
    gap: 8px;
    padding: 8px 12px;
  }

  .user-name {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .mobile-header {
    padding: 16px 16px;
  }

  .app-title {
    font-size: 18px;
  }

  .side-menu-header {
    padding: 20px 16px;
  }

  .side-menu-content {
    padding: 16px 0;
  }

  .category-section {
    padding: 16px 0;
  }

  .section-title {
    margin: 0 16px 12px;
  }

  .category-menu .el-menu-item {
    height: 52px;
    line-height: 52px;
    margin: 0 12px;
    font-size: 14px;
  }

  .side-menu-footer {
    padding: 20px 16px;
  }

  .user-info {
    gap: 12px;
  }

  .user-name {
    font-size: 16px;
  }

  .main-content {
    padding: 20px 16px 92px;
  }

  .mobile-footer {
    padding: 12px 16px;
  }

  .footer-item {
    padding: 8px 12px;
  }
}
</style>
