import type { RouteRecordRaw } from 'vue-router'
import Login from '@/modules/auth/views/Login.vue'
import Register from '@/modules/auth/views/Register.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册' }
  }
]

export default routes
