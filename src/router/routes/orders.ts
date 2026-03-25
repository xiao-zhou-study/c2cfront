import type { RouteRecordRaw } from 'vue-router'
import OrderDetail from '@/modules/orders/views/OrderDetail.vue'
import PaymentSuccess from '@/modules/orders/views/PaymentSuccess.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/orders',
    redirect: { path: '/profile', query: { tab: 'borrowing' } }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: { title: '订单详情' }
  },
  {
    path: '/pay/success',
    name: 'PaymentSuccess',
    component: PaymentSuccess,
    meta: { title: '支付成功' }
  }
]

export default routes
