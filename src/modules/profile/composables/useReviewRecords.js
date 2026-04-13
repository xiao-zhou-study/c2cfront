import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserAvatar } from '@/shared/utils/images.js'
import { reviewApi, itemApi } from '@/shared/api'

export function useReviewRecords() {
  const reviewRecords = ref([])
  const loading = ref(false)
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)

  // 获取评价记录
  const getReviewRecords = async () => {
    try {
      loading.value = true
      const res = await reviewApi.getMyReviews({
        pageNum: pageNum.value,
        pageSize: pageSize.value
      })
      const list = res?.list ?? []
      total.value = res?.total ?? 0

      // 批量查询物品信息
      const itemIds = [...new Set(list.map(r => r.itemId).filter(Boolean))]
      const itemMap = {}
      if (itemIds.length > 0) {
        const results = await Promise.allSettled(
          itemIds.map(id => itemApi.getItemDetail(id))
        )
        results.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value) {
            itemMap[itemIds[i]] = result.value
          }
        })
      }

      // 将物品信息注入评价记录
      reviewRecords.value = list.map(review => {
        const item = itemMap[review.itemId]
        return {
          ...review,
          itemName: item?.title || '未知物品',
          itemImage: item?.images?.[0] || ''
        }
      })

      return reviewRecords.value
    } catch (error) {
      console.error('获取评价记录失败:', error)
      reviewRecords.value = []
      total.value = 0
      throw error
    } finally {
      loading.value = false
    }
  }

  // 回复评价
  const replyReview = async (reviewId, content) => {
    try {
      const review = reviewRecords.value.find(r => r.id === reviewId)
      if (review) {
        review.replied = true
        review.reply = {
          content,
          created_at: new Date().toISOString()
        }
        // 这里应该调用API回复评价
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('回复成功')
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('回复失败')
      console.error('回复失败:', error)
      throw error
    }
  }

  // 删除评价
  const deleteReview = async (reviewId) => {
    try {
      const index = reviewRecords.value.findIndex(r => r.id === reviewId)
      if (index > -1) {
        reviewRecords.value.splice(index, 1)
        // 这里应该调用API删除评价
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('删除成功')
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
      throw error
    }
  }

  // 计算属性：平均评分
  const averageRating = computed(() => {
    if (reviewRecords.value.length === 0) return 0
    const totalRating = reviewRecords.value.reduce((sum, review) => sum + review.rating, 0)
    return (totalRating / reviewRecords.value.length).toFixed(1)
  })

  // 计算属性：各评分数量
  const ratingCounts = computed(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewRecords.value.forEach(review => {
      if (counts.hasOwnProperty(review.rating)) {
        counts[review.rating]++
      }
    })
    return counts
  })

  // 计算属性：已回复和未回复数量
  const replyStats = computed(() => {
    const replied = reviewRecords.value.filter(r => r.replied).length
    return {
      replied,
      unreplied: reviewRecords.value.length - replied
    }
  })

  // 刷新评价记录
  const refreshReviewRecords = async () => {
    return await getReviewRecords()
  }

  return {
    reviewRecords,
    loading,
    getReviewRecords,
    refreshReviewRecords,
    replyReview,
    deleteReview,
    averageRating,
    ratingCounts,
    replyStats
  }
}