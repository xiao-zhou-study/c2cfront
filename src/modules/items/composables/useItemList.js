/**
 * 物品列表数据管理
 */

import { ref } from 'vue'
import { itemApi } from '@/shared/api'
import { ElMessage } from 'element-plus'
import { PAGE_SIZE } from '@/shared/utils/constants.js'

export function useItemList() {
  // 状态
  const loading = ref(false)
  const items = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(PAGE_SIZE)
  
  // 筛选条件
  const filters = ref({
    categoryId: null,
    status: null,
    keyword: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'newest',
    ownerId: null
  })

  /**
   * 获取物品列表
   */
  const fetchItems = async () => {
    try {
      loading.value = true
      
      const params = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filters.value
      }
      
      // 转换排序参数
      if (params.sortBy === 'newest') {
        params.sort = 'createdAt'
      } else if (params.sortBy === 'price_asc') {
        params.sort = 'price'
        params.order = 'asc'
      } else if (params.sortBy === 'price_desc') {
        params.sort = 'price'
        params.order = 'desc'
      } else if (params.sortBy === 'popularity') {
        params.sort = 'viewCount'
        params.order = 'desc'
      }
      
      // 移除前端特定的排序字段
      delete params.sortBy
      
      const response = await itemApi.getItemList(params)
      items.value = response.list || response.data || []
      total.value = response.total || items.value.length
      
    } catch (error) {
      console.error('获取物品列表失败:', error)
      ElMessage.error('加载失败，请重试')
      items.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 收藏/取消收藏
   */
  const toggleFavorite = async (item) => {
    try {
      if (item.isFavorite) {
        await itemApi.unfavoriteItem(item.id)
        item.isFavorite = false
        ElMessage.success('已取消收藏')
      } else {
        await itemApi.favoriteItem(item.id)
        item.isFavorite = true
        ElMessage.success('收藏成功')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }

  /**
   * 更新筛选条件
   */
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
    fetchItems()
  }

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    filters.value = {
      categoryId: null,
      status: null,
      keyword: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'newest'
    }
    currentPage.value = 1
    fetchItems()
  }

  /**
   * 分页变更
   */
  const handlePageChange = (page) => {
    currentPage.value = page
    fetchItems()
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * 分页大小变更
   */
  const handleSizeChange = (size) => {
    pageSize.value = size
    currentPage.value = 1
    fetchItems()
  }

  return {
    loading,
    items,
    total,
    currentPage,
    pageSize,
    filters,
    fetchItems,
    toggleFavorite,
    updateFilters,
    resetFilters,
    handlePageChange,
    handleSizeChange
  }
}
