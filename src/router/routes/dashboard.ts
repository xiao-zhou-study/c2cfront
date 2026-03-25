import type { RouteRecordRaw } from 'vue-router'
import Dashboard from '@/modules/dashboard/views/Dashboard.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表板' }
  }
]

export default routes
