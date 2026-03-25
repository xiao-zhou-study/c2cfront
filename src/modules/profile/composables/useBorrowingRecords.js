import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getItemImage } from '@/shared/utils/images.js'

export function useBorrowingRecords() {
  const borrowedItems = ref([])
  const borrowingItems = ref([])
  const loading = ref(false)

  // 获取借用记录
  const getBorrowingRecords = async () => {
    try {
      loading.value = true
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟数据
      borrowedItems.value = []
      borrowingItems.value = []
      
      return { borrowedItems: borrowedItems.value, borrowingItems: borrowingItems.value }
    } catch (error) {
      ElMessage.error('获取借用记录失败')
      console.error('获取借用记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 查看物品详情
  const viewItemDetail = (itemId) => {
    // 这里应该跳转到物品详情页
    console.log('查看物品详情:', itemId)
  }

  // 联系物品主人
  const contactOwner = (ownerId) => {
    // 这里应该跳转到聊天页面
    console.log('联系物品主人:', ownerId)
  }

  // 申请续借
  const requestExtension = async (recordId) => {
    try {
      // 这里应该调用API申请续借
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('续借申请已提交')
      return true
    } catch (error) {
      ElMessage.error('续借申请失败')
      console.error('续借申请失败:', error)
      throw error
    }
  }

  // 归还物品
  const returnItem = async (recordId) => {
    try {
      const index = borrowingItems.value.findIndex(item => item.id === recordId)
      if (index > -1) {
        const item = borrowingItems.value[index]
        item.status = 'completed'
        item.returned_at = new Date().toISOString()
        item.total_fee = item.daily_fee * parseInt(item.duration)
        borrowingItems.value.splice(index, 1)
        borrowedItems.value.push(item)
        // 这里应该调用API归还物品
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('物品归还成功')
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('物品归还失败')
      console.error('物品归还失败:', error)
      throw error
    }
  }

  // 计算属性：总借用天数
  const totalBorrowedDays = computed(() => {
    return borrowedItems.value.reduce((total, item) => {
      const days = parseInt(item.duration)
      return total + (isNaN(days) ? 0 : days)
    }, 0)
  })

  // 计算属性：总花费
  const totalSpent = computed(() => {
    return borrowedItems.value.reduce((total, item) => total + (item.total_fee || 0), 0)
  })

  // 刷新借用记录
  const refreshBorrowingRecords = async () => {
    return await getBorrowingRecords()
  }

  return {
    borrowedItems,
    borrowingItems,
    loading,
    getBorrowingRecords,
    refreshBorrowingRecords,
    viewItemDetail,
    contactOwner,
    requestExtension,
    returnItem,
    totalBorrowedDays,
    totalSpent
  }
}