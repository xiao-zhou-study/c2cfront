import type { RouteRecordRaw } from 'vue-router'
import OrderDetail from '@/modules/orders/views/OrderDetail.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/orders',
    redirect: { path: '/profile', query: { tab: 'bought' } }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { title: '订单详情' }
  }
]

export default routes
