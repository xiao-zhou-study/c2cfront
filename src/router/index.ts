import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/shared/stores/user'
import { useAppStore } from '@/shared/stores/app'
import { ElMessage } from 'element-plus'
import Layout from '@/shared/components/Layout.vue'

// 导入模块化路由
import authRoutes from './routes/auth'
import dashboardRoutes from './routes/dashboard'
import itemsRoutes from './routes/items'
import blogRoutes from './routes/blog'
import announcementsRoutes from './routes/announcements'
import profileRoutes from './routes/profile'
import ordersRoutes from './routes/orders'
import searchRoutes from '../modules/search/router/index'

const routes: RouteRecordRaw[] = [
  // 认证路由
  ...authRoutes,
  
  // 应用主路由
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // 仪表盘路由
      ...dashboardRoutes,
      
      // 物品相关路由
      ...itemsRoutes,
      
      // 校园博客路由
      ...blogRoutes,
      
      // 校园公告路由
      ...announcementsRoutes,
      
      // 订单相关路由
      ...ordersRoutes,
      
      // 个人中心路由
      ...profileRoutes,
      
      // 搜索路由
      ...searchRoutes
    ]
  },
  
  // 帮助中心
  {
    path: '/help',
    name: 'Help',
    component: Layout,
    meta: { title: '帮助中心', requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/Help.vue')
      },
      {
        path: 'publish',
        component: () => import('@/modules/common/views/Help.vue'),
        meta: { title: '如何发布物品' }
      },
      {
        path: 'borrow',
        component: () => import('@/modules/common/views/Help.vue'),
        meta: { title: '借用流程指南' }
      },
      {
        path: 'safety',
        component: () => import('@/modules/common/views/Help.vue'),
        meta: { title: '安全交易提示' }
      },
      {
        path: 'faq',
        component: () => import('@/modules/common/views/Help.vue'),
        meta: { title: '常见问题解答' }
      }
    ]
  },
  
  // 智能助手
  {
    path: '/chat',
    name: 'ChatAssistant',
    component: Layout,
    meta: { title: '智能助手', requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/ChatAssistant.vue')
      }
    ]
  },
  
  // 关于我们
  {
    path: '/about',
    name: 'About',
    component: Layout,
    meta: { title: '关于我们', requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/About.vue')
      }
    ]
  },
  
  // 意见反馈
  {
    path: '/feedback',
    name: 'Feedback',
    component: Layout,
    meta: { title: '意见反馈', requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/Feedback.vue')
      }
    ]
  },

  // 用户协议
  {
    path: '/terms',
    name: 'Terms',
    component: Layout,
    meta: { title: '用户协议', requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/Terms.vue')
      }
    ]
  },

  // 隐私政策
  {
    path: '/privacy',
    name: 'Privacy',
    component: Layout,
    meta: { title: '隐私政策', requiresAuth: false },
    children: [
      {
        path: '',
        component: () => import('@/modules/common/views/Privacy.vue')
      }
    ]
  },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/modules/common/views/NotFound.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 白名单路由（不需要登录即可访问）
const whiteList = ['/login', '/register', '/terms', '/privacy', '/help', '/about']

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  const appStore = useAppStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '校园物品共享平台'}`
  } else {
    document.title = import.meta.env.VITE_APP_TITLE || '校园物品共享平台'
  }

  // 设置页面加载状态
  appStore.setPageLoading(true)

  // 白名单路由直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    console.log('路由守卫检查认证:', {
      path: to.path,
      token: userStore.token?.substring(0, 20) + '...',
      isLoggedIn: userStore.isLoggedIn
    });

    // 如果有token但已过期，尝试刷新token
    if (userStore.token && !userStore.isLoggedIn) {
      try {
        console.log('Token已过期，尝试刷新...')
        await userStore.refreshTokenAction(false) // 不自动跳转，由路由守卫处理
        console.log('Token刷新成功，继续访问')
      } catch (error) {
        console.error('Token刷新失败:', error)
        ElMessage.warning('登录已过期，请重新登录')
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 再次检查登录状态
    if (!userStore.isLoggedIn) {
      console.log('用户未登录，跳转到登录页');
      ElMessage.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查用户信息是否完整
    if (!userStore.userInfo.id) {
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 即使获取用户信息失败，也允许继续访问
        // 因为用户已经登录，只是用户信息获取失败
      }
    }
  }

  next()
})

// 路由后置守卫：仅 path 变化时滚动到顶部，query 变化（如 profile?tab=xxx）不滚动，避免打断当前页交互
router.afterEach((to, from) => {
  const appStore = useAppStore()
  appStore.setPageLoading(false)
  if (to.path !== from.path) {
    window.scrollTo(0, 0)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  ElMessage.error('路由加载失败，请刷新页面重试')
})

export default router
