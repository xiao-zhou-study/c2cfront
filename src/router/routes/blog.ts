import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/modules/blog/views/BlogList.vue'),
    meta: { title: '校园博客' }
  },
  {
    path: '/blog/create',
    name: 'BlogCreate',
    component: () => import('@/modules/blog/views/BlogCreate.vue'),
    meta: { title: '发布话题' }
  },
  {
    path: '/blog/:id',
    name: 'BlogTopic',
    component: () => import('@/modules/blog/views/BlogTopic.vue'),
    meta: { title: '话题详情' }
  }
]

export default routes
