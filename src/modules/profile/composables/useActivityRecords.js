import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getItemImage } from '@/shared/utils/images.js'

export function useActivityRecords() {
  const activities = ref([])
  const loading = ref(false)

  // 获取活动记录
  const getActivityRecords = async () => {
    try {
      loading.value = true
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟数据
      activities.value = [
        {
          id: '1',
          type: 'borrow_request',
          description: '您借用了 <strong>专业级单反相机</strong>',
          item_id: '101',
          item_image: getItemImage('相机', 150, 150),
          related_user_id: '2',
          related_user_name: '李四',
          created_at: '2023-12-01T08:30:00Z'
        },
        {
          id: '2',
          type: 'borrow_approved',
          description: '您的借用请求已被 <strong>赵六</strong> 批准',
          item_id: '103',
          item_image: getItemImage('净化器', 150, 150),
          related_user_id: '4',
          related_user_name: '赵六',
          created_at: '2023-11-30T16:00:00Z'
        },
        {
          id: '3',
          type: 'item_published',
          description: '您发布了新物品 <strong>便携式投影仪</strong>',
          item_id: '102',
          item_image: getItemImage('投影仪', 150, 150),
          created_at: '2023-11-25T10:00:00Z'
        },
        {
          id: '4',
          type: 'review_received',
          description: '您收到了 <strong>王五</strong> 对 <strong>折叠自行车</strong> 的评价',
          item_id: '104',
          item_image: getItemImage('自行车', 150, 150),
          related_user_id: '3',
          related_user_name: '王五',
          created_at: '2023-11-20T14:30:00Z'
        },
        {
          id: '5',
          type: 'item_returned',
          description: '您归还了 <strong>智能空气净化器</strong>',
          item_id: '103',
          item_image: getItemImage('净化器', 150, 150),
          related_user_id: '4',
          related_user_name: '赵六',
          created_at: '2023-11-15T11:00:00Z'
        }
      ]
      
      return activities.value
    } catch (error) {
      ElMessage.error('获取活动记录失败')
      console.error('获取活动记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 标记所有活动为已读
  const markAllAsRead = async () => {
    try {
      // 这里应该调用API标记所有活动为已读
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('所有活动已标记为已读')
      return true
    } catch (error) {
      ElMessage.error('标记失败')
      console.error('标记失败:', error)
      throw error
    }
  }

  // 清除所有活动记录
  const clearAllActivities = async () => {
    try {
      activities.value = []
      // 这里应该调用API清除所有活动记录
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('所有活动记录已清除')
      return true
    } catch (error) {
      ElMessage.error('清除失败')
      console.error('清除失败:', error)
      throw error
    }
  }

  // 格式化时间
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return '刚刚'
    }
  }

  // 获取活动类型的图标
  const getActivityIcon = (type) => {
    const iconMap = {
      borrow_request: 'el-icon-s-promotion',
      borrow_approved: 'el-icon-s-flag',
      item_published: 'el-icon-upload',
      review_received: 'el-icon-chat-dot-round',
      item_returned: 'el-icon-s-return'
    }
    return iconMap[type] || 'el-icon-info'
  }

  // 获取活动类型的颜色
  const getActivityColor = (type) => {
    const colorMap = {
      borrow_request: '#409EFF',
      borrow_approved: '#67C23A',
      item_published: '#E6A23C',
      review_received: '#909399',
      item_returned: '#F56C6C'
    }
    return colorMap[type] || '#909399'
  }

  return {
    activities,
    loading,
    getActivityRecords,
    markAllAsRead,
    clearAllActivities,
    formatTime,
    getActivityIcon,
    getActivityColor
  }
}