import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/modules/announcements/views/AnnouncementsList.vue'),
    meta: { title: '校园公告' }
  },
  {
    path: '/announcements/:id',
    name: 'AnnouncementDetail',
    component: () => import('@/modules/announcements/views/AnnouncementDetail.vue'),
    meta: { title: '公告详情' }
  }
]

export default routes
