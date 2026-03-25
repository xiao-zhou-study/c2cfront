import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyPublishedItems, batchUpdateItemStatus, deleteItem as deleteItemAPI } from '@/shared/api/modules/item'
import { getItemImage } from '@/shared/utils/images.js'

export function usePublishedItems() {
  const publishedItems = ref([])
  const loading = ref(false)
  const refreshLoading = ref(false)
  const statusFilter = ref('all')

  // 获取发布物品列表
  const getPublishedItems = async () => {
    try {
      loading.value = true
      // 调用真实API
      const data = await getMyPublishedItems()
      publishedItems.value = data
      return publishedItems.value
    } catch (error) {
      ElMessage.error('获取发布物品失败')
      console.error('获取发布物品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 刷新发布物品列表
  const refreshPublishedItems = async () => {
    return await getPublishedItems()
  }

  // 切换物品状态
  const toggleItemStatus = async (item) => {
    try {
      const status = item.status
      // 状态映射：1-可借用, 2-已借出, 3-已下架
      // 1 <-> 3 互相切换（上架/下架）
      const newStatus = status === 1 ? 3 : 1

      // 调用批量更新API（即使只有一个物品，也使用批量接口）
      await batchUpdateItemStatus([item.id], newStatus)

      // 更新本地数据
      item.status = newStatus

      ElMessage.success(newStatus === 1 ? '物品已上架' : '物品已下架')
      return newStatus
    } catch (error) {
      ElMessage.error('更新物品状态失败')
      console.error('更新物品状态失败:', error)
      throw error
    }
  }

  // 删除物品
  const deleteItem = async (itemId) => {
    try {
      // 确认删除
      await ElMessageBox.confirm(
        '确定要删除这个物品吗？删除后无法恢复。',
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 调用API删除物品
      await deleteItemAPI(itemId)

      // 从列表中移除
      const index = publishedItems.value.findIndex(item => item.id === itemId)
      if (index > -1) {
        publishedItems.value.splice(index, 1)
      }

      ElMessage.success('删除成功')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除物品失败')
        console.error('删除物品失败:', error)
      }
      throw error
    }
  }

  // 筛选后的物品
  const filteredItems = computed(() => {
    if (statusFilter.value === 'all') {
      return publishedItems.value
    }
    return publishedItems.value.filter(item => item.status === statusFilter.value)
  })

  // 获取物品状态文本
  const getItemStatusText = (status) => {
    const textMap = {
      1: '上架中',
      2: '已借出',
      3: '已下架'
    }
    return textMap[status] || '未知'
  }

  return {
    publishedItems,
    loading,
    refreshLoading,
    statusFilter,
    getPublishedItems,
    refreshPublishedItems,
    toggleItemStatus,
    deleteItem,
    filteredItems,
    getItemStatusText
  }
}