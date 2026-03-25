import type { RouteRecordRaw } from 'vue-router'
import Profile from '@/modules/profile/views/Profile.vue'
import Favorites from '@/modules/common/views/Favorites.vue'
const routes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人中心' }
  },
  {
    path: '/profile/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { title: '我的收藏' }
  }
]

export default routes
