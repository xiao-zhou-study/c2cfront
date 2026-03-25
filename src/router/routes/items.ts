import type { RouteRecordRaw } from 'vue-router'
import ItemsNew from '@/modules/items/views/ItemsNew.vue'
import ItemDetail from '@/modules/items/views/ItemDetail.vue'
import Publish from '@/modules/items/views/Publish.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/items',
    name: 'Items',
    component: ItemsNew,
    meta: { title: '物品列表' }
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: ItemDetail,
    meta: { title: '物品详情' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: { title: '发布物品' }
  }
]

export default routes
