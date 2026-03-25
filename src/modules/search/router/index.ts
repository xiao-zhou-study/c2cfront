import { RouteRecordRaw } from 'vue-router'

const searchRoutes: RouteRecordRaw[] = [
  {
    path: '/search',
    redirect: '/search/results'
  },
  {
    path: '/search/results',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue'),
    props: (route) => ({ query: route.query.q })
  },
  {
    path: '/search/advanced',
    name: 'AdvancedSearch',
    component: () => import('../views/AdvancedSearch.vue'),
    meta: {
      title: '高级搜索'
    }
  },
  {
    path: '/search/history',
    name: 'SearchHistory',
    component: () => import('../views/SearchHistory.vue'),
    meta: {
      title: '搜索历史'
    }
  }
]

export default searchRoutes