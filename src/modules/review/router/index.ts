import { RouteRecordRaw } from 'vue-router'

const reviewRoutes: RouteRecordRaw[] = [
  {
    path: '/items/:id/reviews',
    name: 'ItemReviews',
    component: () => import('../views/ItemReviews.vue'),
    props: true,
    meta: {
      title: '物品评价'
    }
  },
  {
    path: '/reviews/my',
    name: 'MyReviews',
    component: () => import('../views/MyReviews.vue'),
    meta: {
      title: '我的评价',
      requiresAuth: true
    }
  },
  {
    path: '/reviews/user/:userId',
    name: 'UserReviews',
    component: () => import('../views/UserReviews.vue'),
    props: true,
    meta: {
      title: '用户评价'
    }
  }
]

export default reviewRoutes